import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '70vh'
};

const defaultCenter = {
  lat: 35.681236,
  lng: 139.767125
};

function MapModal({ onClose, onSelectLocation }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [selected, setSelected] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // 地図ロード時に参照を保持
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // 地図クリックでピンを更新
  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelected({ lat, lng });
  }, []);

  // 現在地取得ボタンの処理
  const findMyLocation = () => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザは位置情報に対応していません。");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const loc = { lat: latitude, lng: longitude };
        setCurrentLocation(loc);
        setSelected(loc); // 現在地を選択済みにする

        // 地図の中心を現在地に移動
        if (mapRef.current) {
          mapRef.current.panTo(loc);
          mapRef.current.setZoom(15);
        }
        setError(null);
      },
      (err) => {
        console.error("位置情報取得エラー:", err);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("位置情報の利用が許可されていません。");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("位置情報が取得できませんでした。");
            break;
          case err.TIMEOUT:
            setError("位置情報の取得がタイムアウトしました。");
            break;
          default:
            setError("不明なエラーが発生しました。");
        }
      }
    );
  };

  return (
    <div className="map-modal-overlay">
      <div className="map-modal">
        <h3>地図から位置を選択</h3>

        {/* 現在地ボタン */}
        <button className="btn location-btn" onClick={findMyLocation}>
          📍 現在地を取得
        </button>

        {error && <p className="error-message">{error}</p>}

        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation || defaultCenter}
            zoom={13}
            onClick={onMapClick}
            onLoad={onLoad}
          >
            {selected && <Marker position={selected} />}
          </GoogleMap>
        ) : (
          <p>地図を読み込み中...</p>
        )}

        <div className="map-modal-buttons">
          <button className="btn cancel-btn" onClick={onClose}>キャンセル</button>
          <button
            className="btn select-btn"
            disabled={!selected}
            onClick={() => onSelectLocation(selected.lat, selected.lng)}
          >
            この場所を選択
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapModal;
