// src/pages/InfoMap.jsx
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const containerStyle = {
  width: '100%',
  height: '90vh'
};

const center = {
  lat: 35.681236,
  lng: 139.767125
};

function InfoMap() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // Firestoreから投稿を取得
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(data);
      } catch (error) {
        console.error("データ取得エラー:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
    >
      {/* 投稿データをマーカーとして表示 */}
      {posts.map(post => (
        <Marker
          key={post.id}
          position={{ lat: post.location.lat, lng: post.location.lng }}
          onClick={() => setSelectedPost(post)}
        />
      ))}

      {/* マーカークリックで詳細表示 */}
      {selectedPost && (
        <InfoWindow
          position={{
            lat: selectedPost.location.lat,
            lng: selectedPost.location.lng
          }}
          onCloseClick={() => setSelectedPost(null)}
        >
          <div>
            <h4>{selectedPost.tag}</h4>
            <p>{selectedPost.message}</p>
            {selectedPost.imageUrl && (
              <img
                src={selectedPost.imageUrl}
                alt="投稿画像"
                style={{ width: "150px", borderRadius: "8px" }}
              />
            )}
            {selectedPost.riskLevel && (
              <p>⚠️ {selectedPost.riskLevel}</p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default InfoMap;
