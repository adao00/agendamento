const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../DB'); // seu pool MySQL
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'seusegredoaqui';

// Login
async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha)
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM professores WHERE email = ? AND ativo = TRUE',
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: 'Credenciais inválidas' });

    const user = rows[0];

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida)
      return res.status(401).json({ error: 'Credenciais inválidas' });

    // Gerar token JWT válido por 4 horas
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    return res.json({
      token,
      usuario: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

// Solicitar recuperação de senha (envia e-mail com token)
async function solicitarRecuperacaoSenha(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

  try {
    const [rows] = await pool.query('SELECT * FROM professores WHERE email = ?', [
      email,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ error: 'Email não cadastrado' });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiraEm = new Date(Date.now() + 3600000); // 1 hora de validade

    // Atualiza o token e validade no banco
    await pool.query(
      'UPDATE professores SET token_reset_senha = ?, token_reset_expira = ? WHERE email = ?',
      [token, tokenExpiraEm, email]
    );

    // Configurações de email (exemplo com nodemailer)
    const transporter = nodemailer.createTransport({
      host: 'smtp.exemplo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'seuemail@exemplo.com',
        pass: 'suasenha',
      },
    });

    const mailOptions = {
      from: '"Suporte" <suporte@escola.com>',
      to: email,
      subject: 'Recuperação de senha',
      text: `Use o link para redefinir sua senha: http://seusite.com/resetar-senha?token=${token}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: 'Email de recuperação enviado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

// Redefinir senha com token
async function redefinirSenha(req, res) {
  const { token, novaSenha } = req.body;

  if (!token || !novaSenha)
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM professores WHERE token_reset_senha = ? AND token_reset_expira > NOW()',
      [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ error: 'Token inválido ou expirado' });

    const hashedSenha = await bcrypt.hash(novaSenha, 10);

    await pool.query(
      'UPDATE professores SET senha = ?, token_reset_senha = NULL, token_reset_expira = NULL WHERE id = ?',
      [hashedSenha, rows[0].id]
    );

    return res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = {
  login,
  solicitarRecuperacaoSenha,
  redefinirSenha,
};
