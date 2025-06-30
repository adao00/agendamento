import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../src/App'; // Somente esta linha basta
import './index.css'; // Aqui você pode importar o CSS se quiser, ou qualquer outro arquivo de estilo

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
