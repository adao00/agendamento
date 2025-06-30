const pool = require('../../DB');
const Joi = require('joi');

// Esquema de validação
const espacoSchema = Joi.object({
  codigo: Joi.string().max(20).required(),
  nome: Joi.string().max(70).required(),
  tipo: Joi.string().valid('sala', 'laboratorio', 'auditorio', 'outro').required(),
  capacidade: Joi.number().integer().min(1).required(),
  descricao: Joi.string().allow('', null)
});

// GET - Todos os espaços
exports.getAllEspacos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM espacos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar espaços.' });
  }
};

// GET - Espaço por ID
exports.getEspacoById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM espacos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Espaço não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar espaço.' });
  }
};

// POST - Criar espaço
exports.createEspaco = async (req, res) => {
  try {
    const { error } = espacoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { codigo, nome, tipo, capacidade, descricao } = req.body;

    const [result] = await pool.query(
      `INSERT INTO espacos (codigo, nome, tipo, capacidade, descricao)
       VALUES (?, ?, ?, ?, ?)`,
      [codigo, nome, tipo, capacidade, descricao]
    );

    res.status(201).json({ message: 'Espaço criado com sucesso.', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Código já existente.' });
    } else {
      res.status(500).json({ error: 'Erro ao criar espaço.' });
    }
  }
};

// PUT - Atualizar espaço
exports.updateEspaco = async (req, res) => {
  try {
    const { error } = espacoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { codigo, nome, tipo, capacidade, descricao } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM espacos WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Espaço não encontrado.' });

    await pool.query(
      `UPDATE espacos SET codigo = ?, nome = ?, tipo = ?, capacidade = ?, descricao = ? WHERE id = ?`,
      [codigo, nome, tipo, capacidade, descricao, id]
    );

    res.json({ message: 'Espaço atualizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar espaço.' });
  }
};

// DELETE - Remover espaço
exports.deleteEspaco = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM espacos WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Espaço não encontrado.' });

    await pool.query('DELETE FROM espacos WHERE id = ?', [id]);

    res.json({ message: 'Espaço excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir espaço.' });
  }
};
