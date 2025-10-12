import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Map from './pages/Map';
import PostDetail from './pages/PostDetail';
import Form from './pages/Form';
import './App.css'; // ← ここでCSSを読み込みます

function App() {
  return (
    <div>
      {/* 🌿 ページ移動ナビ */}
      <nav className="nav-bar">
        <div className="nav-title">🌼 道草ナビゲーション</div>
        <div className="nav-links">
          <Link to="/postform" className="nav-btn pink">投稿フォーム</Link>
          <Link to="/post/1" className="nav-btn blue">投稿詳細</Link>
          <Link to="/mapinfo" className="nav-btn green">情報マップ</Link>
        </div>
      </nav>

      {/* ページルート */}
      <Routes>
        <Route path="/postform" element={<Form />} />
        <Route path="/post/1" element={<PostDetail />} />
        <Route path="/mapinfo" element={<Map />} />
      </Routes>
    </div>
  );
}

export default App;
