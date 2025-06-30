const pool = require('../../DB');
const Joi = require('joi');

// Validação com Joi para entrada esperada
const equipamentoAgendadoSchema = Joi.object({
  agendamento_id: Joi.number().integer().required(),
  equipamento_id: Joi.number().integer().required(),
  quantidade: Joi.number().integer().min(1).required(),
});

// GET - Buscar todos os equipamentos agendados (dados crus)
exports.getAllEquipamentosAgendados = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipamentos_agendados');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar equipamentos agendados:', error);
    res.status(500).json({ error: 'Erro ao buscar equipamentos agendados.' });
  }
};

// GET - Buscar equipamento agendado por ID (dados crus)
exports.getEquipamentoAgendadoById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipamentos_agendados WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Equipamento agendado não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar equipamento agendado:', error);
    res.status(500).json({ error: 'Erro ao buscar o equipamento agendado.' });
  }
};

// GET - Buscar equipamentos agendados com detalhes completos (JOIN)
exports.getEquipamentosAgendadosDetalhes = async (req, res) => {
  try {
    const query = `
      SELECT ea.id, ea.quantidade, 
             e.nome AS nome_equipamento, e.codigo AS codigo_equipamento, e.tipo AS tipo_equipamento,
             a.dia, a.hora_inicio, a.hora_fim,
             p.nome AS nome_professor,
             esp.nome AS nome_espaco, esp.tipo AS tipo_espaco
      FROM equipamentos_agendados ea
      JOIN equipamentos e ON ea.equipamento_id = e.id
      JOIN agendamentos a ON ea.agendamento_id = a.id
      JOIN professores p ON a.professor_id = p.id
      JOIN espacos esp ON a.espaco_id = esp.id
      ORDER BY a.dia DESC, a.hora_inicio DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar equipamentos agendados com detalhes:', error);
    res.status(500).json({ error: 'Erro ao buscar equipamentos agendados com detalhes.' });
  }
};

// POST - Criar novo equipamento agendado
exports.createEquipamentoAgendado = async (req, res) => {
  try {
    const { error } = equipamentoAgendadoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { agendamento_id, equipamento_id, quantidade } = req.body;

    // Verificar existência do agendamento
    const [[agendamentoExistente]] = await pool.query('SELECT id FROM agendamentos WHERE id = ?', [agendamento_id]);
    if (!agendamentoExistente) return res.status(400).json({ error: 'Agendamento não encontrado.' });

    // Verificar existência e disponibilidade do equipamento
    const [[equipamentoExistente]] = await pool.query('SELECT id, quantidade_disponivel FROM equipamentos WHERE id = ?', [equipamento_id]);
    if (!equipamentoExistente) return res.status(400).json({ error: 'Equipamento não encontrado.' });

    if (equipamentoExistente.quantidade_disponivel < quantidade) {
      return res.status(400).json({ error: 'Quantidade solicitada maior que a disponível.' });
    }

    // Inserir registro
    const [result] = await pool.query(
      'INSERT INTO equipamentos_agendados (agendamento_id, equipamento_id, quantidade) VALUES (?, ?, ?)',
      [agendamento_id, equipamento_id, quantidade]
    );

    // Caso o banco não tenha trigger para descontar estoque, faça aqui:
    await pool.query(
      'UPDATE equipamentos SET quantidade_disponivel = quantidade_disponivel - ? WHERE id = ?',
      [quantidade, equipamento_id]
    );

    res.status(201).json({ message: 'Equipamento agendado criado com sucesso.', id: result.insertId });
  } catch (error) {
    console.error('Erro ao criar equipamento agendado:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar o equipamento agendado.' });
  }
};

// PUT - Atualizar equipamento agendado
exports.updateEquipamentoAgendado = async (req, res) => {
  try {
    const { error } = equipamentoAgendadoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { agendamento_id, equipamento_id, quantidade } = req.body;
    const { id } = req.params;

    // Buscar registro atual
    const [[registroAtual]] = await pool.query('SELECT * FROM equipamentos_agendados WHERE id = ?', [id]);
    if (!registroAtual) return res.status(404).json({ error: 'Equipamento agendado não encontrado.' });

    // Buscar equipamento novo para verificar estoque
    const [[equipamentoNovo]] = await pool.query('SELECT quantidade_disponivel FROM equipamentos WHERE id = ?', [equipamento_id]);
    if (!equipamentoNovo) return res.status(400).json({ error: 'Equipamento não encontrado.' });

    // Calcular estoque considerando reposição do antigo e retirada do novo
    const estoqueDisponivelAjustado = equipamentoNovo.quantidade_disponivel + registroAtual.quantidade;

    if (estoqueDisponivelAjustado < quantidade) {
      return res.status(400).json({ error: 'Quantidade solicitada maior que a disponível.' });
    }

    // Repor a quantidade antiga no estoque antigo
    await pool.query(
      'UPDATE equipamentos SET quantidade_disponivel = quantidade_disponivel + ? WHERE id = ?',
      [registroAtual.quantidade, registroAtual.equipamento_id]
    );

    // Atualizar o registro
    await pool.query(
      'UPDATE equipamentos_agendados SET agendamento_id = ?, equipamento_id = ?, quantidade = ? WHERE id = ?',
      [agendamento_id, equipamento_id, quantidade, id]
    );

    // Descontar a nova quantidade no equipamento novo
    await pool.query(
      'UPDATE equipamentos SET quantidade_disponivel = quantidade_disponivel - ? WHERE id = ?',
      [quantidade, equipamento_id]
    );

    res.json({ message: 'Equipamento agendado atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar equipamento agendado:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar o equipamento agendado.' });
  }
};

// DELETE - Remover equipamento agendado e repor estoque
exports.deleteEquipamentoAgendado = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar registro para repor estoque
    const [[registroAtual]] = await pool.query('SELECT * FROM equipamentos_agendados WHERE id = ?', [id]);
    if (!registroAtual) return res.status(404).json({ error: 'Equipamento agendado não encontrado.' });

    // Repor quantidade no estoque
    await pool.query(
      'UPDATE equipamentos SET quantidade_disponivel = quantidade_disponivel + ? WHERE id = ?',
      [registroAtual.quantidade, registroAtual.equipamento_id]
    );

    // Deletar registro
    await pool.query('DELETE FROM equipamentos_agendados WHERE id = ?', [id]);

    res.json({ message: 'Equipamento agendado excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir equipamento agendado:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir o equipamento agendado.' });
  }
};
