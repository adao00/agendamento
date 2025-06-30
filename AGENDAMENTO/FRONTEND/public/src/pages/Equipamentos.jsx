import React, { useEffect, useState } from 'react';
import '../index.css';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import { useNavigate } from 'react-router-dom';

function Equipamentos() {
  const [modoEscuro, setModoEscuro] = useState(() => localStorage.getItem('modoEscuro') === 'true');
  const [menuAberto, setMenuAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('disponiveis');
  const [equipamentos, setEquipamentos] = useState([]);
  const [agendados, setAgendados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    tipo: '',
    quantidade_total: 1,
    quantidade_disponivel: 1,
    ativo: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('modoEscuro', modoEscuro);
    document.body.classList.toggle('dark', modoEscuro);
  }, [modoEscuro]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    setErro(null);
    setLoading(true);

    if (abaAtiva === 'disponiveis' || abaAtiva === 'acrescentar') {
      axios.get('/api/equipamentos', { headers })
        .then(res => setEquipamentos(res.data))
        .catch(() => setErro('Erro ao buscar equipamentos.'))
        .finally(() => setLoading(false));
    } else if (abaAtiva === 'agendados') {
      axios.get('/api/equipamentoagendado', { headers })
        .then(async res => {
          const agendadosCompletos = await Promise.all(
            res.data.map(async item => {
              try {
                const [equipamentoRes, agendamentoRes] = await Promise.all([
                  axios.get(`/api/equipamentos/${item.equipamento_id}`, { headers }),
                  axios.get(`/api/agendamentos/${item.agendamento_id}`, { headers }),
                ]);
                const professorId = agendamentoRes.data.professor_id;
                const professorRes = await axios.get(`/api/professores/${professorId}`, { headers });
                return {
                  ...item,
                  nome_equipamento: equipamentoRes.data.nome,
                  nome_professor: professorRes.data.nome,
                  dia: agendamentoRes.data.dia,
                  hora_inicio: agendamentoRes.data.hora_inicio,
                  hora_fim: agendamentoRes.data.hora_fim,
                };
              } catch {
                return {
                  ...item,
                  nome_equipamento: 'Erro',
                  nome_professor: 'Erro',
                  dia: '',
                  hora_inicio: '',
                  hora_fim: '',
                };
              }
            })
          );
          setAgendados(agendadosCompletos);
        })
        .catch(() => setErro('Erro ao buscar equipamentos agendados.'))
        .finally(() => setLoading(false));
    }
  }, [abaAtiva]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    try {
      const payload = { ...formData, quantidade_disponivel: formData.quantidade_total };
      await axios.post('/api/equipamentos', payload, { headers });
      setFormData({
        codigo: '',
        nome: '',
        tipo: '',
        quantidade_total: 1,
        quantidade_disponivel: 1,
        ativo: true,
      });
      setAbaAtiva('disponiveis');
    } catch (error) {
      if (error.response?.data?.error) {
        setErro(error.response.data.error);
      } else {
        setErro('Erro ao cadastrar equipamento.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEquipamento(id) {
    if (!window.confirm('Ao excluir, o Banco eliminará o equipamento e não poderá ser mais agendado. Deseja continuar?')) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    try {
      await axios.delete(`/api/equipamentos/${id}`, { headers });
      setEquipamentos(prev => prev.filter(eq => eq.id !== id));
    } catch {
      setErro('Erro ao excluir equipamento.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAgendado(id) {
    if (!window.confirm('Tem certeza que deseja excluir este equipamento agendado?')) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    try {
      await axios.delete(`/api/equipamentoagendado/${id}`, { headers });
      setAgendados(prev => prev.filter(item => item.id !== id));
    } catch {
      setErro('Erro ao excluir equipamento agendado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`painel-container ${modoEscuro ? 'dark' : ''}`}>
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: modoEscuro ? '#121212' : '#1f8f4c',
          zIndex: 0,
          transition: 'background-color 0.3s ease',
        }}
      />

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
          <button
            className="menu-toggle"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuAberto ? (
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="var(--icon-color)" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path strokeWidth="1.5" d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="var(--icon-color)" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path strokeWidth="1.5" d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
          <span className="professor-nome">Equipamentos</span>
        </div>

        <div className="painel-nav">
          <button className="btn-header" onClick={() => navigate('/painel')}>Voltar</button>
          <button className="btn-header" onClick={() => navigate('/espacos')}>Espaços</button>
          <button className="btn-header" onClick={() => navigate('/agendamentos')}>Agendamentos</button>

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
                // Ícone Lua igual ao Painel
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                // Ícone Sol igual ao Painel
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  stroke="#333"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
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
        </div>
      </header>

      <div className="painel-overlay">
        <div className="equipamentos-header">
          <button
            onClick={() => setAbaAtiva('disponiveis')}
            className={abaAtiva === 'disponiveis' ? 'active' : ''}
          >
            Equipamentos Disponíveis
          </button>
          <button
            onClick={() => setAbaAtiva('agendados')}
            className={abaAtiva === 'agendados' ? 'active' : ''}
          >
            Equipamentos Agendados
          </button>
          <button
            onClick={() => setAbaAtiva('acrescentar')}
            className={abaAtiva === 'acrescentar' ? 'active' : ''}
          >
            Acrescentar Equipamento
          </button>
        </div>

        <div className="equipamentos-conteudo">
          {loading && <p>Carregando...</p>}
          {erro && <p style={{ color: 'red' }}>{erro}</p>}

          {abaAtiva === 'disponiveis' && (
            <div>
              <h2 className="equipamentos-section-title">Equipamentos Disponíveis</h2>
              <div className="equipamentos-list">
                {equipamentos.length > 0 ? (
                  equipamentos.map(eq => (
                    <div key={eq.id} className="equipamento-card">
                      <h4>{eq.nome}</h4>
                      <p>Tipo: {eq.tipo}</p>
                      <p>Disponíveis: {eq.quantidade_disponivel}</p>
                      <div className="equipamento-botoes">
                        <button
                          className="btn-excluir"
                          onClick={() => handleDeleteEquipamento(eq.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum equipamento disponível.</p>
                )}
              </div>
            </div>
          )}

          {abaAtiva === 'agendados' && (
            <div>
              <h2 className="equipamentos-section-title">Equipamentos Agendados</h2>
              <div className="equipamentos-list">
                {agendados.length > 0 ? (
                  agendados.map(item => (
                    <div key={item.id} className="equipamento-card">
                      <h4>{item.nome_equipamento}</h4>
                      <p>Quantidade: {item.quantidade}</p>
                      <p>Professor: {item.nome_professor}</p>
                      <p>Data: {new Date(item.dia).toLocaleDateString()}</p>
                      <p>
                        Horário: {item.hora_inicio} - {item.hora_fim}
                      </p>
                      <button
                        className="btn-excluir"
                        onClick={() => handleDeleteAgendado(item.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Nenhum equipamento agendado.</p>
                )}
              </div>
            </div>
          )}

          {abaAtiva === 'acrescentar' && (
            <div>
              <h2 className="equipamentos-section-title">Adicionar Novo Equipamento</h2>
              <form onSubmit={handleSubmit} className="form-equipamento">
                <label>
                  Código:
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    required
                    maxLength={20}
                  />
                </label>
                <label>
                  Nome:
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    maxLength={150}
                  />
                </label>
                <label>
                  Tipo:
                  <input
                    type="text"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    maxLength={50}
                  />
                </label>
                <label>
                  Quantidade Total:
                  <input
                    type="number"
                    name="quantidade_total"
                    value={formData.quantidade_total}
                    onChange={handleChange}
                    min={1}
                    required
                  />
                </label>
                <button type="submit" disabled={loading}>
                  Cadastrar
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Equipamentos;
