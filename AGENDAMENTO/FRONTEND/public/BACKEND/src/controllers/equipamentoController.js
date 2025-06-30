const pool = require('../../DB'); 
const Joi = require('joi');

// Validação com Joi, default 1 para quantidades
const equipamentoSchema = Joi.object({
  codigo: Joi.string().max(20).required(),
  nome: Joi.string().max(150).required(),
  tipo: Joi.string().max(50).default('outro'),
  quantidade_total: Joi.number().integer().min(1).default(1),
  quantidade_disponivel: Joi.number().integer().min(0).default(1),
  ativo: Joi.boolean().default(true),
});

// GET - Buscar todos equipamentos
exports.getAllEquipamentos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipamentos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os equipamentos.' });
  }
};

// GET - Buscar por ID
exports.getEquipamentoById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipamentos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o equipamento.' });
  }
};

// POST - Criar novo equipamento
exports.createEquipamento = async (req, res) => {
  try {
    const { error } = equipamentoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { codigo, nome, tipo, quantidade_total, quantidade_disponivel, ativo } = req.body;

    const [result] = await pool.query(
      `INSERT INTO equipamentos (codigo, nome, tipo, quantidade_total, quantidade_disponivel, ativo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo, nome, tipo, quantidade_total, quantidade_disponivel, ativo]
    );

    res.status(201).json({ message: 'Equipamento criado com sucesso.', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Código já existente.' });
    } else {
      res.status(500).json({ error: 'Erro ao criar o equipamento.' });
    }
  }
};

// PUT - Atualizar equipamento
exports.updateEquipamento = async (req, res) => {
  try {
    const { error } = equipamentoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { codigo, nome, tipo, quantidade_total, quantidade_disponivel, ativo } = req.body;
    const { id } = req.params;

    const [existente] = await pool.query('SELECT * FROM equipamentos WHERE id = ?', [id]);
    if (existente.length === 0) return res.status(404).json({ error: 'Equipamento não encontrado.' });

    await pool.query(
      `UPDATE equipamentos SET codigo = ?, nome = ?, tipo = ?, quantidade_total = ?, 
       quantidade_disponivel = ?, ativo = ? WHERE id = ?`,
      [codigo, nome, tipo, quantidade_total, quantidade_disponivel, ativo, id]
    );

    res.json({ message: 'Equipamento atualizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o equipamento.' });
  }
};

// DELETE - Remover equipamento
exports.deleteEquipamento = async (req, res) => {
  try {
    const { id } = req.params;

    const [registro] = await pool.query('SELECT * FROM equipamentos WHERE id = ?', [id]);
    if (registro.length === 0) return res.status(404).json({ error: 'Equipamento não encontrado.' });

    await pool.query('DELETE FROM equipamentos WHERE id = ?', [id]);

    res.json({ message: 'Equipamento excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir o equipamento.' });
  }
};
