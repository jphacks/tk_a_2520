import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '100%' };
const center = { lat: 35.681236, lng: 139.767125 };

const parseLocation = (locationString) => {
  if (!locationString || typeof locationString !== 'string') return null;
  const latMatch = locationString.match(/緯度: ([\d.-]+)/);
  const lngMatch = locationString.match(/経度: ([\d.-]+)/);
  if (latMatch && lngMatch) {
    return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
  }
  return null;
};

function MapContainer({ posts }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_MY_GOOGLE_MAPS_API_KEY, // あなたのAPIキー
  });

  const [selectedPost, setSelectedPost] = useState(null);

  if (!isLoaded) return <div>地図を読み込んでいます...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {posts.map(post => {
        const position = parseLocation(post.location);
        if (!position) return null;
        return (
          <Marker
            key={post.id}
            position={position}
            onClick={() => setSelectedPost(post)}
          />
        );
      })}
      {selectedPost && (
        <InfoWindow
          position={parseLocation(selectedPost.location)}
          onCloseClick={() => setSelectedPost(null)}
        >
          <div className="info-window-content">
            <p><strong>{selectedPost.message}</strong></p>
            {selectedPost.riskLevel && <p>危険度: {selectedPost.riskLevel}</p>}
            {selectedPost.imageUrl && <img src={selectedPost.imageUrl} alt="投稿画像" style={{ maxWidth: '150px' }} />}
            <small>{selectedPost.createdAt?.toDate().toLocaleString('ja-JP')}</small>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default React.memo(MapContainer);