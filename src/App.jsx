// src/App.jsx

import React from 'react';
import MapContainer from './components/MapContainer';
import './App.css'; // あとでスタイルを適用するために読み込んでおく

function App() {
  // ★★★ ここにGoogle Maps Platformで取得したAPIキーを入力してください ★★★
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;// 例: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX

  return (
    <div className="App">
      <header className="App-header">
        <h1>地図に思い出をピン留めしよう 🗺️</h1>
        <p>地図上の好きな場所をクリックして、テキストを投稿してください。</p>
      </header>
      <main>
        <MapContainer googleMapsApiKey={apiKey} />
      </main>
    </div>
  );
}

export default App;