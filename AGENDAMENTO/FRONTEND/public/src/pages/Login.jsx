import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../index.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [modoEscuro, setModoEscuro] = useState(() => {
    return localStorage.getItem('modoEscuro') === 'true';
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', modoEscuro);
    localStorage.setItem('modoEscuro', modoEscuro);
  }, [modoEscuro]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      setMensagem('Preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      setMensagem('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      console.log('Resposta do login:', data);

      if (response.ok) {
        console.log('Token recebido:', data.token);
        setMensagem('✅ Login realizado com sucesso!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        setTimeout(() => {
          navigate('/painel');
        }, 1000);
      } else {
        setMensagem(data.error || 'Erro ao fazer login.');
      }
    } catch (error) {
      setMensagem('Erro de conexão com o servidor.');
      console.error(error);
    }
  };

  return (
    <div className={`login-container ${modoEscuro ? 'dark' : ''}`}>
      <div className="login-bg" />

      <header className="painel-header">
        <span>Login</span>
        <div className="painel-nav">
          <motion.div
            className="theme-toggle"
            onClick={() => setModoEscuro(!modoEscuro)}
            title={modoEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            <motion.div
              className="toggle-button"
              animate={{ x: modoEscuro ? 26 : 0 }}
              transition={{ type: 'spring', stiffness: 700, damping: 30 }}
            >
              {modoEscuro ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </motion.div>
          </motion.div>
        </div>
      </header>

      <img src="/img/ag.png" alt="Decoração" className="login-image" loading="lazy" />

      <div className="login-overlay" style={{ marginTop: '80px' }}>
        <div className="login-form">
          <h2>Bem Vindo!</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
            />
            <div className="remember-me">
              <input
                type="checkbox"
                id="lembrar"
                checked={lembrar}
                onChange={() => setLembrar(!lembrar)}
              />
              <label htmlFor="lembrar">Lembrar minha conta</label>
            </div>
            <button type="submit" className="btn-login">Entrar</button>
          </form>

          {mensagem && (
            <p className={`mensagem ${mensagem.includes('✅') ? 'sucesso' : 'erro'}`}>
              {mensagem}
            </p>
          )}

          <p className="link-cadastro">
            Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
