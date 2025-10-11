// src/components/MapContainer.jsx

import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  // InfoMapコンポーネントのレイアウトに合わせて高さを調整
  height: 'calc(100vh - 100px)' // top-navの高さを考慮した例
};

// 初期表示の中心（例：東京駅）
const center = {
  lat: 35.681236,
  lng: 139.767125
};

// ★ 1. 位置情報の文字列を緯度経度のオブジェクトに変換するヘルパー関数
const parseLocation = (locationString) => {
  // locationStringが不正な値の場合にエラーを防ぐ
  if (!locationString || typeof locationString !== 'string') {
    return null;
  }

  // 正規表現を使って "緯度: 35.xxx" と "経度: 139.xxx" から数値を抽出
  const latMatch = locationString.match(/緯度: ([\d.-]+)/);
  const lngMatch = locationString.match(/経度: ([\d.-]+)/);

  // 緯度と経度の両方が見つかった場合のみオブジェクトを返す
  if (latMatch && lngMatch) {
    return {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1])
    };
  }

  // 見つからなかった場合はnullを返す
  return null;
};


// ★ 2. propsとして `posts` を受け取るように変更
function MapContainer({ posts }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    // APIキーは環境変数から取得することを推奨
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // ★ 3. クリックされたマーカーの情報を保持するためのstate
  const [selectedPost, setSelectedPost] = useState(null);

  // ★ 4. 投稿機能に関連するstateや関数はすべて削除
  // (pins, tempPin, activePin, text, onMapClick, findMyLocation, handlePostSubmit, onSnapshotなど)

  if (!isLoaded) return <div>地図を読み込んでいます...</div>;

  return (
    // ★ 5. 投稿ボタンを削除
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
    >
      {/* ★ 6. propsで受け取った`posts`配列を元にマーカーを生成 */}
      {posts.map(post => {
        // location文字列を緯度経度オブジェクトに変換
        const position = parseLocation(post.location);

        // positionが正しく変換できた投稿のみマーカーを表示
        if (!position) return null;

        return (
          <Marker
            key={post.id}
            position={position}
            // マーカーがクリックされたら、その投稿情報をstateに保存
            onClick={() => {
              setSelectedPost(post);
            }}
          />
        );
      })}

      {/* ★ 7. 選択された投稿がある場合に情報ウィンドウを表示 */}
      {selectedPost && (
        <InfoWindow
          // 表示位置は選択された投稿の位置
          position={parseLocation(selectedPost.location)}
          // 閉じるボタンが押されたら、選択状態をリセット
          onCloseClick={() => {
            setSelectedPost(null);
          }}
        >
          {/* 情報ウィンドウの中に投稿の詳細を表示 */}
          <div className="info-window-content">
            <p><strong>{selectedPost.message}</strong></p>
            {selectedPost.riskLevel && <p className="risk-level">危険度: {selectedPost.riskLevel}</p>}
            {selectedPost.imageUrl && <img src={selectedPost.imageUrl} alt="投稿画像" style={{ maxWidth: '150px' }} />}
            <small>
              {new Date(selectedPost.createdAt.seconds * 1000).toLocaleString('ja-JP')}
            </small>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default React.memo(MapContainer);