import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Painel from './pages/Painel';
import Equipamentos from './pages/Equipamentos';
import Espacos from './pages/Espacos';
import Agendamentos from './pages/Agendamentos'; // 👈 nova importação
import './index.css';

// Protege rotas que exigem login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [modoEscuro, setModoEscuro] = useState(() => {
    return localStorage.getItem('modoEscuro') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('modoEscuro', modoEscuro);
    document.body.classList.toggle('dark', modoEscuro);
  }, [modoEscuro]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona a raiz "/" para "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rotas públicas */}
        <Route 
          path="/login" 
          element={<Login modoEscuro={modoEscuro} setModoEscuro={setModoEscuro} />} 
        />
        <Route 
          path="/cadastro" 
          element={<Cadastro modoEscuro={modoEscuro} setModoEscuro={setModoEscuro} />} 
        />

        {/* Rotas protegidas */}
        <Route 
          path="/painel" 
          element={
            <ProtectedRoute>
              <Painel modoEscuro={modoEscuro} setModoEscuro={setModoEscuro} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/equipamentos" 
          element={
            <ProtectedRoute>
              <Equipamentos modoEscuro={modoEscuro} setModoEscuro={setModoEscuro} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/espacos" 
          element={
            <ProtectedRoute>
              <Espacos modoEscuro={modoEscuro} setModoEscuro={setModoEscuro} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/agendamentos" 
          element={
            <ProtectedRoute>
              <Agendamentos modoEscuro={modoEscuro} setModoEscuro={setModoEscuro} />
            </ProtectedRoute>
          } 
        />

        {/* Redirecionamento para login em caso de rota inválida */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
