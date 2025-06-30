const pool = require('../../DB');
const Joi = require('joi');
const bcrypt = require('bcrypt');

// Schema final com apenas os campos exigidos pelo front
const professorSchema = Joi.object({
  email: Joi.string().email().max(100).required(),
  nome: Joi.string().max(100).required(),
  senha: Joi.string().min(6).max(255).required(),
  tipo: Joi.string().valid('admin', 'professor').default('professor'),
});

// GET - Todos os professores
exports.getAllProfessores = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, nome, tipo, created_at, updated_at FROM professores'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professores.' });
  }
};

// GET - Professor por ID
exports.getProfessorById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, nome, tipo, created_at, updated_at FROM professores WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Professor não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professor.' });
  }
};

// POST - Criar professor
exports.createProfessor = async (req, res) => {
  try {
    const { error, value } = professorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, nome, senha, tipo } = value;

    // Verifica email duplicado antes do insert
    const [existentes] = await pool.query('SELECT id FROM professores WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      `INSERT INTO professores (email, nome, senha, tipo) VALUES (?, ?, ?, ?)`,
      [email, nome, hashedPassword, tipo]
    );

    return res.status(201).json({ message: 'Professor criado com sucesso.', id: result.insertId });
  } catch (error) {
    console.error('Erro no createProfessor:', error);
    return res.status(500).json({ error: 'Erro ao criar professor.' });
  }
};

// PUT - Atualizar professor
exports.updateProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM professores WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Professor não encontrado.' });

    const schemaUpdate = Joi.object({
      email: Joi.string().email().max(100),
      nome: Joi.string().max(100),
      senha: Joi.string().min(6).max(255).allow(null, ''),
      tipo: Joi.string().valid('admin', 'professor'),
    });

    const { error } = schemaUpdate.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, nome, senha, tipo } = req.body;

    let hashedPassword = existing[0].senha;
    if (senha) hashedPassword = await bcrypt.hash(senha, 10);

    await pool.query(
      `UPDATE professores SET
        email = COALESCE(?, email),
        nome = COALESCE(?, nome),
        senha = ?,
        tipo = COALESCE(?, tipo),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [email, nome, hashedPassword, tipo, id]
    );

    res.json({ message: 'Professor atualizado com sucesso.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email já cadastrado.' });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar professor.' });
    }
  }
};

// DELETE - Remover professor
exports.deleteProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM professores WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Professor não encontrado.' });

    await pool.query('DELETE FROM professores WHERE id = ?', [id]);

    res.json({ message: 'Professor excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir professor.' });
  }
};
