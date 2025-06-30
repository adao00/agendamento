import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../index.css';

function Agendamentos() {
  const [modoEscuro, setModoEscuro] = useState(() => localStorage.getItem('modoEscuro') === 'true');
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('modoEscuro', modoEscuro);
    document.body.classList.toggle('dark', modoEscuro);
  }, [modoEscuro]);

  return (
    <div className={`painel-container ${modoEscuro ? 'dark' : ''}`}>
      <div className="painel-bg"></div>

      <img src="/img/lupa.png" alt="Painel decorativo" className="painel-image" loading="lazy" />

      <header className="painel-header">
        <div className="left-group">
          <button
            className="menu-toggle"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuAberto ? (
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="var(--icon-color)" fill="none"
                strokeLinecap="round" strokeLinejoin="round">
                <path strokeWidth="1.5" d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="var(--icon-color)" fill="none"
                strokeLinecap="round" strokeLinejoin="round">
                <path strokeWidth="1.5" d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
          <span className={`professor-nome ${modoEscuro ? 'dark-text' : ''}`}>Agendamentos</span>
        </div>

        <div className="painel-nav right-group">
          <button className="btn-header" onClick={() => navigate('/painel')}>Voltar</button>
          <button className="btn-header" onClick={() => navigate('/espacos')}>Espaços</button>
          <button className="btn-header" onClick={() => navigate('/equipamentos')}>Equipamentos</button>

          <motion.div
            className="theme-toggle"
            onClick={() => setModoEscuro(!modoEscuro)}
            title={modoEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setModoEscuro(!modoEscuro);
                e.preventDefault();
              }
            }}
            aria-pressed={modoEscuro}
          >
            <motion.div
              className="toggle-button"
              animate={{ x: modoEscuro ? 26 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              {modoEscuro ? (
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path strokeWidth="1.5" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="#333" fill="none"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle strokeWidth="1.5" cx="12" cy="12" r="5" />
                  <line strokeWidth="1.5" x1="12" y1="1" x2="12" y2="3" />
                  <line strokeWidth="1.5" x1="12" y1="21" x2="12" y2="23" />
                  <line strokeWidth="1.5" x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line strokeWidth="1.5" x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line strokeWidth="1.5" x1="1" y1="12" x2="3" y2="12" />
                  <line strokeWidth="1.5" x1="21" y1="12" x2="23" y2="12" />
                  <line strokeWidth="1.5" x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line strokeWidth="1.5" x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </motion.div>
          </motion.div>
        </div>
      </header>

      <AnimatePresence>
        {menuAberto && (
          <motion.div
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 100 }}
          >
            <Sidebar modoEscuro={modoEscuro} setMenuAberto={setMenuAberto} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`painel-overlay ${menuAberto ? 'active' : ''}`}>
        <div className="painel-conteudo">
          <div className="agendamento-opcoes-container">
            {[{
              titulo: 'Agendar Espaço',
              descricao: 'Verificar disponibilidade e reservar salas, laboratórios, etc.',
              img: modoEscuro ? '/icons/casa.png' : '/icons/casaClaro.png',
              rota: '/agendamentos/espacos'
            }, {
              titulo: 'Agendar Equipamento',
              descricao: 'Reservar equipamentos disponíveis para uso em sala.',
              img: modoEscuro ? '/icons/projetor.png' : '/icons/projetorClaro.png',
              rota: '/agendamentos/equipamentos'
            }].map((opcao, idx) => (
              <motion.div
                key={idx}
                className="agendamento-box horizontal"
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(opcao.rota)}
              >
                <img src={opcao.img} alt={`Ícone ${opcao.titulo}`} className="icone-card" />
                <div className="texto-card">
                  <h2>{opcao.titulo}</h2>
                  <p>{opcao.descricao}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Agendamentos;
