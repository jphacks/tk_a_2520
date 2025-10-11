import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '70vh'
};

// 初期表示の中心（例：東京駅）
const center = {
  lat: 35.681236,
  lng: 139.767125
};

function MapModal({ onClose, onSelectLocation }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // ★ 1. Mapインスタンスを保持するためのstate
  const [map, setMap] = useState(null);
  const [selected, setSelected] = useState(null);

  // ★ 2. Mapがロードされた時にインスタンスをstateに保存するコールバック
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  // ★ 3. コンポーネントがアンマウントされた時にインスタンスをクリアするコールバック
  const onUnmount = useCallback(function callback(_map) {
    setMap(null);
  }, []);

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelected({ lat, lng });
  }, []);

  // ★ 4. 現在地を取得してピンを立てる関数
  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // selected stateを更新してマーカーを表示
          setSelected(currentLocation);

          // 地図の中心を現在地に移動させる
          if (map) {
            map.panTo(currentLocation);
            map.setZoom(15); // 適切なズームレベルに設定
          }
        },
        (error) => {
          // エラーハンドリング
          console.error("Error getting user location: ", error);
          alert("現在地の取得に失敗しました。");
        }
      );
    } else {
      alert("お使いのブラウザは位置情報機能に対応していません。");
    }
  };


  return (
    <div className="map-modal-overlay">
      <div className="map-modal">
        <h3>地図から位置を選択</h3>
        {isLoaded ? (
          <>
            {/* ★ 5. 現在地取得ボタンを追加 */}
            <div style={{ marginBottom: '10px' }}>
              <button className="btn" onClick={findMyLocation}>
                現在地を取得する
              </button>
            </div>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
              onClick={onMapClick}
              onLoad={onLoad} // ★ onLoadコールバックを渡す
              onUnmount={onUnmount} // ★ onUnmountコールバックを渡す
            >
              {selected && <Marker position={selected} />}
            </GoogleMap>
          </>
        ) : (
          <p>地図を読み込み中...</p>
        )}
        <div className="map-modal-buttons">
          <button className="btn cancel-btn" onClick={onClose}>キャンセル</button>
          <button
            className="btn select-btn"
            disabled={!selected}
            onClick={() => {
              if (selected) { // selectedがnullでないことを確認
                onSelectLocation(selected.lat, selected.lng);
              }
            }}
          >
            この場所を選択
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapModal;