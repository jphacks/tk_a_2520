import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PostForm from './pages/PostForm';
import PostDetail from './pages/PostDetail';
import InfoMap from './pages/InfoMap'; // ★新しいページをインポート

function App() {
  return (
    <div>
      <nav style={{ padding: '10px', backgroundColor: '#eee', marginBottom: '20px' }}>
        <strong>ページ移動テスト:</strong>
        <Link to="/" style={{ marginLeft: '15px' }}>投稿フォーム</Link>
        <Link to="/post/1" style={{ marginLeft: '15px' }}>投稿詳細</Link>
        <Link to="/map" style={{ marginLeft: '15px' }}>情報マップ</Link> {/* ★新しいページへのリンクを追加 */}
      </nav>

      <Routes>
        <Route path="/" element={<PostForm />} />
        <Route path="/post/1" element={<PostDetail />} />
        <Route path="/map" element={<InfoMap />} /> {/* ★新しいページのルートを追加 */}
      </Routes>
    </div>
  );
}

export default App;