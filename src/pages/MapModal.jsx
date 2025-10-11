import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '70vh'
};

const center = {
  lat: 35.681236,
  lng: 139.767125
};

function MapModal({ onClose, onSelectLocation }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // ★ 環境変数からキーを取得
  });

  const [selected, setSelected] = useState(null);

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelected({ lat, lng });
  }, []);

  return (
    <div className="map-modal-overlay">
      <div className="map-modal">
        <h3>地図から位置を選択</h3>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onClick={onMapClick}
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
            onClick={() => {
              onSelectLocation(selected.lat, selected.lng);
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
