const pool = require('../../DB');
const Joi = require('joi');

// Schema de validação com Joi
const espacoAgendadoSchema = Joi.object({
  agendamento_id: Joi.number().integer().required(),
  espaco_id: Joi.number().integer().required()
});

// 🔹 GET - Todos os espaços agendados
exports.getAllEspacosAgendados = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ea.*, e.nome AS nome_espaco, a.data, a.hora_inicio, a.hora_fim, p.nome AS nome_professor
      FROM espacos_agendados ea
      JOIN espacos e ON ea.espaco_id = e.id
      JOIN agendamentos a ON ea.agendamento_id = a.id
      JOIN professores p ON a.professor_id = p.id
      ORDER BY a.data DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar espaços agendados:', error);
    res.status(500).json({ error: 'Erro ao buscar espaços agendados.' });
  }
};

// 🔹 GET - Espaço agendado por ID
exports.getEspacoAgendadoById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM espacos_agendados WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Espaço agendado não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar espaço agendado:', error);
    res.status(500).json({ error: 'Erro ao buscar o espaço agendado.' });
  }
};

// 🔹 POST - Criar novo espaço agendado
exports.createEspacoAgendado = async (req, res) => {
  try {
    const { error } = espacoAgendadoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { agendamento_id, espaco_id } = req.body;

    // Verificar existência de agendamento e espaço
    const [[agendamento]] = await pool.query('SELECT id FROM agendamentos WHERE id = ?', [agendamento_id]);
    if (!agendamento) return res.status(400).json({ error: 'Agendamento não encontrado.' });

    const [[espaco]] = await pool.query('SELECT id FROM espacos WHERE id = ?', [espaco_id]);
    if (!espaco) return res.status(400).json({ error: 'Espaço não encontrado.' });

    const [result] = await pool.query(
      'INSERT INTO espacos_agendados (agendamento_id, espaco_id) VALUES (?, ?)',
      [agendamento_id, espaco_id]
    );

    res.status(201).json({ message: 'Espaço agendado com sucesso.', id: result.insertId });
  } catch (error) {
    console.error('Erro ao criar espaço agendado:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar o espaço agendado.' });
  }
};

// 🔹 PUT - Atualizar espaço agendado
exports.updateEspacoAgendado = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = espacoAgendadoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { agendamento_id, espaco_id } = req.body;

    const [[existe]] = await pool.query('SELECT * FROM espacos_agendados WHERE id = ?', [id]);
    if (!existe) return res.status(404).json({ error: 'Espaço agendado não encontrado.' });

    await pool.query(
      'UPDATE espacos_agendados SET agendamento_id = ?, espaco_id = ? WHERE id = ?',
      [agendamento_id, espaco_id, id]
    );

    res.json({ message: 'Espaço agendado atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar espaço agendado:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar o espaço agendado.' });
  }
};

// 🔹 DELETE - Remover espaço agendado
exports.deleteEspacoAgendado = async (req, res) => {
  try {
    const { id } = req.params;

    const [[registro]] = await pool.query('SELECT * FROM espacos_agendados WHERE id = ?', [id]);
    if (!registro) return res.status(404).json({ error: 'Espaço agendado não encontrado.' });

    await pool.query('DELETE FROM espacos_agendados WHERE id = ?', [id]);

    res.json({ message: 'Espaço agendado excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir espaço agendado:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir o espaço agendado.' });
  }
};
