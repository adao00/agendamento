import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiTrash2, FiHome } from 'react-icons/fi';
import '../index.css';

function Sidebar({ professorNome, professorId }) {
  const navigate = useNavigate();

  function irParaPainel() {
    navigate('/painel');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  async function handleExcluirPerfil() {
    const confirmar = window.confirm('Tem certeza que deseja excluir seu perfil? Esta ação não pode ser desfeita.');

    if (!confirmar) return;

    try {
      const response = await fetch(`/api/professores/${professorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir perfil');
      }

      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      alert('Ocorreu um erro ao excluir seu perfil. Tente novamente.');
    }
  }

  return (
    <aside className="sidebar">
      <div className="profile-item">
        <div className="profile-info">
          <div>
            <div className="profile-name">{professorNome}</div>
            <div className="profile-role">Professor</div>
          </div>
        </div>
      </div>

      <ul className="sidebar-menu">
        <li>
          <button onClick={irParaPainel} className="sidebar-btn" type="button">
            <FiHome className="sidebar-icon" />
            Painel
          </button>
        </li>

        <li>
          <button onClick={handleLogout} className="sidebar-btn" type="button">
            <FiLogOut className="sidebar-icon" />
            Sair
          </button>
        </li>

        <li>
          <button onClick={handleExcluirPerfil} className="sidebar-btn excluir-btn" type="button">
            <FiTrash2 className="sidebar-icon" />
            Excluir Perfil
          </button>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
