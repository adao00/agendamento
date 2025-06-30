import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../index.css';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('professor');
  const [mensagem, setMensagem] = useState('');
  const [modoEscuro, setModoEscuro] = useState(() => {
    return localStorage.getItem('modoEscuro') === 'true';
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', modoEscuro);
    localStorage.setItem('modoEscuro', modoEscuro);
  }, [modoEscuro]);

const fazerLoginAutomatico = async (emailLogin, senhaLogin) => {
  try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailLogin, senha: senhaLogin }),
      });

      const data = await response.json();

    // Verifica se a resposta está OK e se os campos esperados existem
      if (response.ok && data?.token && data?.usuario) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        navigate('/painel');
      } else {
        console.warn('Resposta inesperada do backend:', data);
        setMensagem(data?.error || 'Erro ao fazer login automático.');
      }
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor no login automático.');
    }
  };


  const handleCadastro = async (e) => {
    e.preventDefault();

    if (!nome || !email || !senha) {
      setMensagem('Preencha os campos obrigatórios: nome, email e senha.');
      return;
    }

    if (senha.length < 6) {
      setMensagem('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/professores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipo }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('✅ Cadastro realizado com sucesso! Fazendo login...');
        await fazerLoginAutomatico(email, senha);
      } else {
        setMensagem(data.error || 'Erro ao cadastrar.');
      }
    } catch (error) {
      console.error(error);
      setMensagem('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className={`login-container ${modoEscuro ? 'dark' : ''}`}>
      <div className="login-bg" />

      <header className="painel-header">
        <span>Iniciar uma nova conta</span>
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

      <img
        src="/img/calendario.png"
        alt="Decoração"
        className="login-image"
        loading="lazy"
      />

      <div className="login-overlay" style={{ marginTop: '80px' }}>
        <div className="login-form">
          <h2>Cadastro</h2>
          <form onSubmit={handleCadastro}>
            <div className="input-group">
              <label>Nome completo *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Senha (mínimo 6 caracteres) *</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="input-group">
              <label>Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="professor">Professor</option>
                <option value="coordenador">Coordenador</option>
              </select>
            </div>

            <button type="submit" className="btn-login">Cadastrar</button>
          </form>

          {mensagem && (
            <p className={`mensagem ${mensagem.includes('✅') ? 'sucesso' : 'erro'}`}>
              {mensagem}
            </p>
          )}

          <div className="divider" />
          <p className="link-login">
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;
