import React from 'react';
import { Link } from 'react-router-dom'; // Adicione para voltar à Home
import '../index.css'; // Estilos personalizados

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h1>404 - Página Não Encontrada</h1>
      <p>Hmmm, parece que a página que você está procurando não existe ou foi removida.</p>
      <Link to="/" className="home-link">Voltar para a Página Inicial</Link>
    </div>
  );
}