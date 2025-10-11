import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import InfoMap from './pages/InfoMap'; // pagesフォルダからインポート
import PostDetail from './pages/PostDetail'; // pagesフォルダからインポート
import PostForm from './pages/PostForm'; // pagesフォルダからインポート
// PostFormコンポーネントのファイルがまだないので、仮で作成します
/*function PostForm() {
  return <h1>投稿フォームページ（仮）</h1>;
}*/

function App() {
  return (
    <div>
      {/* ページ移動用のテストナビゲーション */}
      <nav style={{ padding: '10px', backgroundColor: '#eee', marginBottom: '20px' }}>
        <strong>ページ移動テスト:</strong>
        <Link to="/post" style={{ marginLeft: '15px' }}>投稿フォーム</Link>
        <Link to="/post/1" style={{ marginLeft: '15px' }}>投稿詳細</Link>
        <Link to="/map" style={{ marginLeft: '15px' }}>情報マップ</Link>
      </nav>

      {/* URLに応じて表示するコンポーネントを切り替える設定 */}
      <Routes>
        <Route path="/post" element={<PostForm />} />
        <Route path="/post/1" element={<PostDetail />} />
        <Route path="/map" element={<InfoMap />} />
      </Routes>
    </div>
  );
}

export default App;