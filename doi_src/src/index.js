// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
// ↓↓↓ この行を必ずインポートする ↓↓↓
import { BrowserRouter } from 'react-router-dom'; 
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ↓↓↓ ここで <App /> 全体を囲むことが最も重要 ↓↓↓ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);