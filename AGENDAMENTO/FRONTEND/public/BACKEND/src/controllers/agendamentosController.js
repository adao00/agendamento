const pool = require('../../DB');
const Joi = require('joi');

// Schema de validação
const agendamentoSchema = Joi.object({
  professor_id: Joi.number().integer().positive().required(),
  espaco_id: Joi.number().integer().positive().required(),
  data: Joi.date().iso().required(),
  hora_inicio: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required(),
  hora_fim: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required(),
  observacoes: Joi.string().max(255).optional().allow(null, ''),
});

// 🔹 Listar todos
const getAllAgendamentos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agendamentos ORDER BY data, hora_inicio');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// 🔹 Listar por professor (com nome do espaço)
const getAgendamentosByProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT a.*, e.nome AS nome_espaco
       FROM agendamentos a
       JOIN espacos e ON a.espaco_id = e.id
       WHERE a.professor_id = ?
       ORDER BY a.data, a.hora_inicio`,
      [id]
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar agendamentos do professor:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// 🔹 Listar por ID
const getAgendamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM agendamentos WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// 🔹 Criar
const createAgendamento = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { error, value } = agendamentoSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Dados inválidos', details: error.details });

    const { professor_id, espaco_id, data, hora_inicio, hora_fim, observacoes } = value;

    // Aceita 'equipamentos' do req.body mesmo não estando no Joi
    const equipamentos = req.body.equipamentos || [];

    // Verificações
    const [[professor]] = await conn.query('SELECT id FROM professores WHERE id = ?', [professor_id]);
    if (!professor) return res.status(400).json({ message: 'Professor não encontrado.' });

    const [[espaco]] = await conn.query('SELECT id FROM espacos WHERE id = ?', [espaco_id]);
    if (!espaco) return res.status(400).json({ message: 'Espaço não encontrado.' });

    if (hora_inicio >= hora_fim)
      return res.status(400).json({ message: 'hora_inicio deve ser antes de hora_fim.' });

    const [conflitos] = await conn.query(
      `SELECT * FROM agendamentos
       WHERE espaco_id = ? AND data = ? AND 
       ((hora_inicio < ? AND hora_fim > ?) OR 
        (hora_inicio < ? AND hora_fim > ?) OR 
        (hora_inicio >= ? AND hora_fim <= ?))`,
      [espaco_id, data, hora_fim, hora_fim, hora_inicio, hora_inicio, hora_inicio, hora_fim]
    );

    if (conflitos.length > 0)
      return res.status(409).json({ message: 'Conflito de horário no espaço selecionado.' });

    await conn.beginTransaction();

    // Insere agendamento
    const [result] = await conn.query(
      `INSERT INTO agendamentos 
        (professor_id, espaco_id, data, hora_inicio, hora_fim, observacoes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [professor_id, espaco_id, data, hora_inicio, hora_fim, observacoes]
    );
    const agendamentoId = result.insertId;

    // Equipamentos (se houver)
    for (const item of equipamentos) {
      const { equipamento_id, quantidade } = item;

      const [[equipamento]] = await conn.query(
        'SELECT quantidade_disponivel FROM equipamentos WHERE id = ?',
        [equipamento_id]
      );

      if (!equipamento)
        return res.status(400).json({ message: `Equipamento ID ${equipamento_id} não encontrado.` });

      if (equipamento.quantidade_disponivel < quantidade)
        return res.status(400).json({ message: `Equipamento ID ${equipamento_id} não possui estoque suficiente.` });

      // Insere na tabela equipamentos_agendados
      await conn.query(
        `INSERT INTO equipamentos_agendados (agendamento_id, equipamento_id, quantidade)
         VALUES (?, ?, ?)`,
        [agendamentoId, equipamento_id, quantidade]
      );

      // Atualiza estoque
      await conn.query(
        `UPDATE equipamentos SET quantidade_disponivel = quantidade_disponivel - ? WHERE id = ?`,
        [quantidade, equipamento_id]
      );
    }

    await conn.commit();

    return res.status(201).json({ message: 'Agendamento criado com sucesso.', id: agendamentoId });
  } catch (error) {
    await conn.rollback();
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ message: 'Erro ao criar o agendamento.', error: error.message });
  } finally {
    conn.release();
  }
};


// 🔹 Atualizar
const updateAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = agendamentoSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Dados inválidos', details: error.details });

    const { professor_id, espaco_id, data, hora_inicio, hora_fim, observacoes } = value;

    const [existe] = await pool.query('SELECT * FROM agendamentos WHERE id = ?', [id]);
    if (existe.length === 0) return res.status(404).json({ message: 'Agendamento não encontrado.' });

    if (hora_inicio >= hora_fim)
      return res.status(400).json({ message: 'hora_inicio deve ser antes de hora_fim.' });

    const [conflitos] = await pool.query(
      `SELECT * FROM agendamentos
       WHERE espaco_id = ? AND data = ? AND id != ? AND 
       ((hora_inicio < ? AND hora_fim > ?) OR 
        (hora_inicio < ? AND hora_fim > ?) OR 
        (hora_inicio >= ? AND hora_fim <= ?))`,
      [espaco_id, data, id, hora_fim, hora_fim, hora_inicio, hora_inicio, hora_inicio, hora_fim]
    );

    if (conflitos.length > 0)
      return res.status(409).json({ message: 'Conflito de horário no espaço selecionado.' });

    await pool.query(
      `UPDATE agendamentos SET 
        professor_id = ?, espaco_id = ?, data = ?, 
        hora_inicio = ?, hora_fim = ?, observacoes = ? 
       WHERE id = ?`,
      [professor_id, espaco_id, data, hora_inicio, hora_fim, observacoes, id]
    );

    return res.status(200).json({ message: 'Agendamento atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// 🔹 Deletar
const deleteAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM agendamentos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Agendamento não encontrado.' });

    await pool.query('DELETE FROM agendamentos WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Agendamento removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

module.exports = {
  getAllAgendamentos,
  getAgendamentosByProfessor, // ✅ nova função
  getAgendamentoById,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
};
