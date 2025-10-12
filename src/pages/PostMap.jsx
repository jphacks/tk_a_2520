// src/pages/InfoMap.jsx
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const containerStyle = {
  width: '100%',
  height: '90vh',
};

const defaultCenter = {
  lat: 35.681236, // 東京駅あたり
  lng: 139.767125,
};

function PostMap() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // Firestoreから投稿を取得
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(data);
      } catch (error) {
        console.error("データ取得エラー:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
      >
        {/* 🔹投稿をMarkerとして表示 */}
        {posts.map((post) => (
          post.location && (
            <Marker
              key={post.id}
              position={{
                lat: post.location.lat,
                lng: post.location.lng,
              }}
              onClick={() => setSelectedPost(post)}
            />
          )
        ))}

        {/* 🔹クリックしたマーカーの詳細をInfoWindowで表示 */}
        {selectedPost && (
          <InfoWindow
            position={{
              lat: selectedPost.location.lat,
              lng: selectedPost.location.lng,
            }}
            onCloseClick={() => setSelectedPost(null)}
          >
            <div style={{ maxWidth: "200px" }}>
              <h4 style={{ margin: 0 }}>{selectedPost.tag}</h4>
              <p style={{ margin: "4px 0" }}>{selectedPost.message}</p>
              {selectedPost.imageUrl && (
                <img
                  src={selectedPost.imageUrl}
                  alt="投稿画像"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    marginBottom: "4px",
                  }}
                />
              )}
              {selectedPost.riskLevel && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                  ⚠️ {selectedPost.riskLevel}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default PostMap;
