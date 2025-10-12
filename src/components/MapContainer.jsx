import React, { useState } from 'react';
// useJsApiLoader をインポートから削除します
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '100%' };

// デフォルトの地図の中心（例：東京駅）
const center = { lat: 35.681236, lng: 139.767125 };

// propsで渡されるlocationオブジェクトの形式が異なる場合に対応する関数
// 修正：Firestoreから受け取るlocationは既に {lat: ..., lng: ...} のオブジェクト形式のはずなので、
// 文字列をパースする処理は不要かもしれません。元のデータ形式に合わせて調整してください。
// ここでは、万が一文字列で渡された場合も想定して残しておきます。
const parseLocation = (location) => {
  // すでに正しいオブジェクト形式ならそのまま返す
  if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
    return location;
  }
  // 文字列形式の場合のフォールバック（この部分は不要な可能性あり）
  if (typeof location === 'string') {
      const latMatch = location.match(/緯度: ([\d.-]+)/);
      const lngMatch = location.match(/経度: ([\d.-]+)/);
      if (latMatch && lngMatch) {
          return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
      }
  }
  return null; // 不正な形式の場合はnullを返す
};

function MapContainer({ posts }) {
  // API読み込み（useJsApiLoader）と isLoaded のチェックを完全に削除
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
    >
      {/* posts 配列をループしてマーカーを設置 */}
      {posts.map(post => {
        const position = parseLocation(post.location);
        // post.locationが不正な形式の場合はマーカーを表示しない
        if (!position) {
          console.warn("Invalid location data for post:", post); // 開発用に警告を出すと便利
          return null;
        }

        return (
          <Marker
            key={post.id}
            position={position}
            onClick={() => setSelectedPost(post)}
          />
        );
      })}

      {/* 選択された投稿（selectedPost）があれば情報ウィンドウを表示 */}
      {selectedPost && (
        <InfoWindow
          position={parseLocation(selectedPost.location)}
          onCloseClick={() => setSelectedPost(null)}
        >
          <div className="info-window-content">
            <p><strong>{selectedPost.message}</strong></p>
            {selectedPost.riskLevel && <span className="risk-level">{selectedPost.riskLevel}</span>}
            {selectedPost.imageUrl && <img src={selectedPost.imageUrl} alt="投稿画像" style={{ width: '100%', maxWidth: '150px' }} />}
            <small>{selectedPost.createdAt?.toDate().toLocaleString('ja-JP')}</small>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default React.memo(MapContainer);