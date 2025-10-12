// src/components/MapModal.js

import React, { useState, useRef, useCallback } from 'react';
// useJsApiLoader は不要。AutocompleteとStandaloneSearchBoxを追加
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import './MapModal.css'; // ← モーダル用のCSSをインポート

// --- スタイル定義 ---
const containerStyle = {
  width: '100%',
  height: '400px', // モーダル内の地図の高さ
};

// --- 初期中心座標（東京駅） ---
const initialCenter = {
  lat: 35.681236,
  lng: 139.767125,
};

function MapModal({ onClose, onSelectLocation }) {
  // --- StateとRefの定義 ---
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(initialCenter);
  const [markerPosition, setMarkerPosition] = useState(null);
  const autocompleteRef = useRef(null);

  // --- 地図の読み込み完了時に呼ばれる関数 ---
  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  // --- 地図の読み込みが解除された時に呼ばれる関数 ---
  const onUnmount = useCallback(function callback(_mapInstance) {
    setMap(null);
  }, []);

  // --- 地図クリック時の処理 ---
  const onMapClick = (e) => {
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkerPosition(newPosition);
  };
  
  // --- 場所検索で場所が選択された時の処理 ---
  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      const newPosition = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCenter(newPosition);
      setMarkerPosition(newPosition);
      map.panTo(newPosition); // 地図をその場所に移動
      map.setZoom(15);
    }
  };

  // --- 「この場所を決定」ボタンの処理 ---
  const handleConfirmLocation = () => {
    if (markerPosition) {
      onSelectLocation(markerPosition.lat, markerPosition.lng);
    } else {
      alert('地図をクリックして場所を選択してください。');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>地図から場所を選択</h3>
        <p>検索するか、地図上をクリックしてピンを立ててください。</p>

        {/* 場所検索ボックス */}
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="住所や場所を検索..."
            className="map-search-input"
          />
        </Autocomplete>

        {/* Google Map 本体 */}
        <div className="map-wrapper">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={onMapClick}
          >
            {/* 選択された場所にマーカーを表示 */}
            {markerPosition && <Marker position={markerPosition} />}
          </GoogleMap>
        </div>

        {/* 操作ボタン */}
        <div className="modal-actions">
          <button
            onClick={handleConfirmLocation}
            className="btn confirm-btn"
            disabled={!markerPosition} // マーカーがないと押せない
          >
            この場所を決定
          </button>
          <button onClick={onClose} className="btn close-btn">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapModal;