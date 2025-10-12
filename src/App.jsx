import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Map from './pages/Map'; // pagesフォルダからインポート
import PostDetail from './pages/PostDetail'; // pagesフォルダからインポート
import Form from './pages/Form'; // pagesフォルダからインポート
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
        <Link to="/postform" style={{ marginLeft: '15px' }}>投稿フォーム</Link>
        <Link to="/post/1" style={{ marginLeft: '15px' }}>投稿詳細</Link>
        <Link to="/mapinfo" style={{ marginLeft: '15px' }}>情報マップ</Link>
      </nav>

      {/* URLに応じて表示するコンポーネントを切り替える設定 */}
      <Routes>
        <Route path="/postform" element={<Form />} />
        <Route path="/post/1" element={<PostDetail />} />
        <Route path="/mapinfo" element={<Map />} />
      </Routes>
    </div>
  );
}

export default App;
