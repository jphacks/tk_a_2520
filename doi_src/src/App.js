import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PostForm from './pages/PostForm';
import PostDetail from './pages/PostDetail';
import InfoMap from './pages/InfoMap';

// ★ App.css のインポートは不要なので削除 (もしあれば)

function App() {
  return (
    // ★ 全体をdivではなく、React Fragment <> で囲む
    <>
      <nav style={{ padding: '10px', backgroundColor: '#eee', marginBottom: '20px', textAlign: 'center' }}>
        <strong>ページ移動テスト:</strong>
        <Link to="/" style={{ marginLeft: '15px' }}>投稿フォーム</Link>
        <Link to="/post/1" style={{ marginLeft: '15px' }}>投稿詳細</Link>
        <Link to="/map" style={{ marginLeft: '15px' }}>情報マップ</Link>
      </nav>

      <main> {/* ★ <main>タグでページの主要な内容を囲む */}
        <Routes>
          <Route path="/" element={<PostForm />} />
          <Route path="/post/1" element={<PostDetail />} />
          <Route path="/map" element={<InfoMap />} />
        </Routes>
      </main>
    </>
  );
}

export default App;