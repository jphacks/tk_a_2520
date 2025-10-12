// src/main.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api'; // LoadScriptをインポート
import App from './App';
//import './WebApp.css';

// アプリケーション全体で使用するライブラリ
const libraries = ["maps", "places"];

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoadScript
      // Viteでの環境変数の呼び出し
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LoadScript>
  </React.StrictMode>
);
