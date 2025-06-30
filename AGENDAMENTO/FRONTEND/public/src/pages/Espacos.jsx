// components/Espacos.jsx
import React, { useEffect, useState } from 'react';
import '../index.css';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import { useNavigate } from 'react-router-dom';

function Espacos() {
  const [modoEscuro, setModoEscuro] = useState(() => localStorage.getItem('modoEscuro') === 'true');
  const [menuAberto, setMenuAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('disponiveis');
  const [espacos, setEspacos] = useState([]);
  const [agendados, setAgendados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    tipo: '',
    capacidade: 1,
    descricao: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('modoEscuro', modoEscuro);
    document.body.classList.toggle('dark', modoEscuro);
  }, [modoEscuro]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    setErro(null);
    setLoading(true);

    const buscarEspacos = async () => {
      try {
        const res = await axios.get('/api/espacos', { headers });
        setEspacos(res.data);
      } catch {
        setErro('Erro ao buscar espaços.');
      } finally {
        setLoading(false);
      }
    };

    const buscarAgendados = async () => {
      try {
        const res = await axios.get('/api/agendamentos', { headers });
        const completos = await Promise.all(res.data.map(async ag => {
          try {
            const espaco = await axios.get(`/api/espacos/${ag.espaco_id}`, { headers });
            const prof = await axios.get(`/api/professores/${ag.professor_id}`, { headers });
            return { ...ag, nome_espaco: espaco.data.nome, nome_professor: prof.data.nome };
          } catch {
            return { ...ag, nome_espaco: 'Erro', nome_professor: 'Erro' };
          }
        }));
        setAgendados(completos);
      } catch {
        setErro('Erro ao buscar agendamentos.');
      } finally {
        setLoading(false);
      }
    };

    if (abaAtiva === 'disponiveis' || abaAtiva === 'criar') buscarEspacos();
    else if (abaAtiva === 'agendados') buscarAgendados();

  }, [abaAtiva]);

  function handleChange(e) {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      setLoading(true);
      await axios.post('/api/espacos', formData, { headers });
      setFormData({ codigo: '', nome: '', tipo: '', capacidade: 1, descricao: '' });
      setAbaAtiva('disponiveis');
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao cadastrar espaço.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEspaco(id) {
    if (!window.confirm('O espaço será excluido do Banco e não poderá ser mais agendado. Deseja continuar?')) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      setLoading(true);
      await axios.delete(`/api/espacos/${id}`, { headers });
      setEspacos(prev => prev.filter(e => e.id !== id));
    } catch {
      setErro('Erro ao excluir espaço.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`painel-container ${modoEscuro ? 'dark' : ''}`}>
      <div className="painel-bg" style={{ backgroundColor: modoEscuro ? '#121212' : '#1f8f4c' }} />

      <AnimatePresence>
        {menuAberto && (
          <motion.div
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 100 }}
          >
            <Sidebar modoEscuro={modoEscuro} menuAberto={menuAberto} setMenuAberto={setMenuAberto} />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="painel-header">
        <div className="left-group">
          <button className="menu-toggle" onClick={() => setMenuAberto(!menuAberto)}>
            {menuAberto ? (
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="var(--icon-color)" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path strokeWidth="1.5" d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="var(--icon-color)" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path strokeWidth="1.5" d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
          <span className={`professor-nome ${modoEscuro ? 'dark-text' : ''}`}>Espaços</span>
        </div>

        <div className="painel-nav">
          <button className="btn-header" onClick={() => navigate('/painel')}>Voltar</button>
          <button className="btn-header" onClick={() => navigate('/equipamentos')}>Equipamentos</button>
          <button className="btn-header" onClick={() => navigate('/agendamentos')}>Agendamentos</button>
          <div className="theme-toggle" onClick={() => setModoEscuro(!modoEscuro)} role="button" tabIndex={0} aria-pressed={modoEscuro}>
            <motion.div className="toggle-button" animate={{ x: modoEscuro ? 26 : 0 }} transition={{ type: 'spring', stiffness: 700, damping: 30 }}>
              {modoEscuro ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
                  <path strokeWidth="1.5" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round">
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
          </div>
        </div>
      </header>

      <div className="painel-overlay">
        <div className="equipamentos-header">
          <button onClick={() => setAbaAtiva('disponiveis')} className={abaAtiva === 'disponiveis' ? 'active' : ''}>Espaços Disponíveis</button>
          <button onClick={() => setAbaAtiva('agendados')} className={abaAtiva === 'agendados' ? 'active' : ''}>Espaços Agendados</button>
          <button onClick={() => setAbaAtiva('criar')} className={abaAtiva === 'criar' ? 'active' : ''}>Criar Espaço</button>
        </div>

        <div className="equipamentos-conteudo" style={{ color: modoEscuro ? '#eee' : '#000' }}>
          {loading && <p>Carregando...</p>}
          {erro && <p style={{ color: 'red' }}>{erro}</p>}

          {abaAtiva === 'disponiveis' && (
            <div>
              <h2 className="equipamentos-section-title">Espaços Disponíveis</h2>
              <div className="equipamentos-list">
                {espacos.length > 0 ? (
                  espacos.map(e => (
                    <div key={e.id} className="equipamento-card">
                      <h4>{e.nome}</h4>
                      <p><strong>Código:</strong> {e.codigo}</p>
                      <p><strong>Tipo:</strong> {e.tipo}</p>
                      <p><strong>Capacidade:</strong> {e.capacidade}</p>
                      {e.descricao && <p><strong>Descrição:</strong> {e.descricao}</p>}
                      <div className="equipamento-botoes">
                        <button className="btn-excluir" onClick={() => handleDeleteEspaco(e.id)}>Excluir</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum espaço disponível.</p>
                )}
              </div>
            </div>
          )}

          {abaAtiva === 'agendados' && (
            <div>
              <h2 className="equipamentos-section-title">Espaços Agendados</h2>
              <div className="equipamentos-list">
                {agendados.length > 0 ? (
                  agendados.map(a => (
                    <div key={a.id} className="equipamento-card">
                      <h4>{a.nome_espaco}</h4>
                      <p><strong>Professor:</strong> {a.nome_professor}</p>
                      <p><strong>Data:</strong> {new Date(a.dia).toLocaleDateString()}</p>
                      <p><strong>Horário:</strong> {a.hora_inicio} - {a.hora_fim}</p>
                    </div>
                  ))
                ) : (
                  <p>Nenhum espaço agendado.</p>
                )}
              </div>
            </div>
          )}

          {abaAtiva === 'criar' && (
            <div>
              <h2 className="equipamentos-section-title">Criar Novo Espaço</h2>
              <form onSubmit={handleSubmit} className="form-equipamento">
                <label>Código:
                  <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} required />
                </label>
                <label>Nome:
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
                </label>
                <label>Tipo:
                  <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} placeholder="Digite o tipo do espaço" required />
                </label>
                <label>Capacidade:
                  <input type="number" name="capacidade" value={formData.capacidade} onChange={handleChange} min={1} required />
                </label>
                <label>Descrição:
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descrição (Opcional)"
                    rows={3}
                    style={{ resize: 'none', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                </label>
                <button type="submit" disabled={loading}>Cadastrar</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Espacos;
