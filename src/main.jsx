import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ← これを追記
import App from './App';
import './App.css'; // App.cssやindex.cssなど、グローバルなCSSをインポート

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ↓ アプリ全体をBrowserRouterで囲みます ↓ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);