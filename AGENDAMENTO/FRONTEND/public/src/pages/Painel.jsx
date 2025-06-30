import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/sidebar';
import '../index.css';

function Painel() {
  const [modoEscuro, setModoEscuro] = useState(() => localStorage.getItem('modoEscuro') === 'true');
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState({ nome: '', tipo: '', id: null });
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('usuario');

    if (!token || !userJson) {
      navigate('/login');
      return;
    }

    let userData;
    try {
      userData = JSON.parse(userJson);
    } catch {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    setUsuario(userData);
    localStorage.setItem('modoEscuro', modoEscuro);
    document.body.classList.toggle('dark', modoEscuro);

    fetch(`http://localhost:3000/api/agendamentos/professor/${userData.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar agendamentos');
        return res.json();
      })
      .then(data => setAgendamentos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [modoEscuro, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const estaNaPaginaInicial = location.pathname === '/painel';

  return (
    <div className={`painel-container ${modoEscuro ? 'dark' : ''}`}>
      <div className="painel-bg" />
      <img src="/img/rel.png" alt="Painel decorativo" className="painel-image" loading="lazy" />

      {/* HEADER FIXO */}
      <header className="painel-header">
        <div className="left-group">
          <button
            className="menu-toggle"
            onClick={() => setMenuAberto(prev => !prev)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuAberto ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke="var(--icon-color)"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke="var(--icon-color)"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
          <span className="professor-nome">Olá, {usuario.nome}</span>
        </div>

        <nav className="painel-nav right-group" aria-label="Navegação principal">
          {['equipamentos', 'espacos', 'agendamentos'].map((rota) => (
            <button
              key={rota}
              className="btn-header"
              onClick={() => navigate(`/${rota}`)}
              aria-label={`Ver ${rota.charAt(0).toUpperCase() + rota.slice(1)}`}
            >
              {rota.charAt(0).toUpperCase() + rota.slice(1)}
            </button>
          ))}

          <motion.div
            className="theme-toggle"
            onClick={() => setModoEscuro(prev => !prev)}
            role="button"
            tabIndex={0}
            title={modoEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
            aria-pressed={modoEscuro}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setModoEscuro(prev => !prev);
              }
            }}
          >
            <motion.div
              className="toggle-button"
              animate={{ x: modoEscuro ? 26 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              {modoEscuro ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  aria-label="Modo escuro ativo"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  stroke="#333"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  aria-label="Modo claro ativo"
                >
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
        </nav>
      </header>

      {/* Sidebar animado */}
      <AnimatePresence>
        {menuAberto && (
          <motion.div
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 100 }}
          >
            <Sidebar
              modoEscuro={modoEscuro}
              menuAberto={menuAberto}
              setMenuAberto={setMenuAberto}
              usuario={usuario}
              handleLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`painel-overlay ${menuAberto ? 'active' : ''}`}>
        <div className="painel-conteudo">
          {estaNaPaginaInicial ? (
            loading ? (
              <p
                style={{
                  textAlign: 'center',
                  marginTop: 60,
                  color: modoEscuro ? '#eee' : '#333',
                }}
              >
                Carregando agendamentos...
              </p>
            ) : agendamentos.length === 0 ? (
              <motion.div
                className="box-agendamentos-vazio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: modoEscuro ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  padding: 40,
                  borderRadius: 20,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  maxWidth: 460,
                  margin: '60px auto 0',
                  textAlign: 'center',
                  color: modoEscuro ? '#eee' : '#333',
                }}
              >
                <h2 style={{ fontSize: 24, marginBottom: 12 }}>
                  Sem agendamentos previstos
                </h2>
                <p style={{ fontSize: 16, marginBottom: 24 }}>
                  Parece que não existe nenhum agendamento por enquanto.
                </p>
                <button
                  onClick={() => navigate('/painel/agendamentos')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1f8f4c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  Começar agendamento
                </button>
              </motion.div>
            ) : (
              <motion.div
                className="lista-agendamentos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  maxWidth: 600,
                  margin: '40px auto',
                  color: modoEscuro ? '#eee' : '#333',
                }}
              >
                {agendamentos.map(({ id, data, hora_inicio, hora_fim, espaco_id, observacoes }) => (
                  <div
                    key={id}
                    className="card-agendamento"
                    style={{
                      background: modoEscuro ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      padding: '15px 20px',
                      borderRadius: 12,
                      boxShadow: '0 0 10px rgba(0,0,0,0.15)',
                      marginBottom: 16,
                      color: modoEscuro ? '#eee' : '#333',
                    }}
                  >
                    <p><strong>Data:</strong> {new Date(data).toLocaleDateString()}</p>
                    <p><strong>Hora:</strong> {hora_inicio} - {hora_fim}</p>
                    <p><strong>Espaço ID:</strong> {espaco_id}</p>
                    <p><strong>Observações:</strong> {observacoes || 'Nenhuma'}</p>
                  </div>
                ))}
              </motion.div>
            )
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}

export default Painel;
