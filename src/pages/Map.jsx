// src/pages/PostMap.jsx
import React, { useEffect, useState } from 'react';
// 📍 修正点 1: useLoadScriptをインポート
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { doc, updateDoc, increment } from "firebase/firestore";

const containerStyle = {
  width: '100%',
  height: '90vh',
};

const defaultCenter = {
  lat: 35.681236, // 東京駅あたり
  lng: 139.767125,
};

// Google Maps APIを読み込むためのライブラリ設定
const libraries = ["places"];

// 📍「危険情報」タグ専用のマーカーアイコンを返す関数
const getMarkerIcon = (riskLevel) => {
  let color = 'red';

  switch (riskLevel) {
    case '危険エリア':
      color = 'red';
      break;
    case 'スリ多発地域':
      color = 'orange';
      break;
    case '交通事故注意':
      color = 'yellow';
      break;
    case '安全ルート':
      color = 'green';
      break;
    default:
      color = 'grey';
  }
  
  // 📍 修正点 2: 正しいURL形式に修正
  return {
    url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
    scaledSize: new window.google.maps.Size(32, 32),
  };
};

function PostMap() {
  // 📍 修正点 3: Google Mapsスクリプトの読み込み状態を管理
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // 🚨 必ずご自身のAPIキーに置き換えてください！
    libraries,
  });

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedTag, setSelectedTag] = useState("すべて");

  const handleGood = async (postId) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        goodCount: increment(1),
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, goodCount: (p.goodCount || 0) + 1 } : p
        )
      );

      setSelectedPost((prev) =>
        prev && prev.id === postId
          ? { ...prev, goodCount: (prev.goodCount || 0) + 1 }
          : prev
      );
    } catch (error) {
      console.error("いいねの更新エラー:", error);
    }
  };

  const tags = ["すべて", "風景", "危険情報", "グルメ", "豆知識"];

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

  const filteredPosts =
    selectedTag === "すべて"
      ? posts
      : posts.filter((post) => post.tag === selectedTag);

  // 📍 修正点 4: FirestoreのGeoPointを安全に取得するためのヘルパー関数
  const getPosition = (location) => {
    if (!location) return null;
    const lat = location.latitude;
    const lng = location.longitude;
    if (lat == null || lng == null) return null;
    return { lat, lng };
  };

  // 読み込み中とエラーの表示
  if (loadError) return "地図の読み込み中にエラーが発生しました。";
  if (!isLoaded) return "地図を読み込み中です...";

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div style={{ padding: "10px", textAlign: "center" }}>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedPost(null) || setSelectedTag(tag)}
            style={{
              margin: "5px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: selectedTag === tag ? "#007bff" : "#e0e0e0",
              color: selectedTag === tag ? "white" : "black",
              fontWeight: selectedTag === tag ? "bold" : "normal",
              transition: "0.2s",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        // マップクリックでInfoWindowを閉じる
        onClick={() => setSelectedPost(null)}
      >
        {filteredPosts.map((post) => {
          const position = getPosition(post.location);
          if (!position) return null;

          return (
            <Marker
              key={post.id}
              position={position}
              onClick={() => setSelectedPost(post)}
              // 📍 修正点 5: マーカーアイコンのロジックを修正
              icon={
                post.tag === '危険情報' && post.riskLevel
                  ? getMarkerIcon(post.riskLevel)
                  : undefined // undefinedにするとデフォルトの赤いピンになる
              }
            />
          );
        })}

        {selectedPost && (
          <InfoWindow
            // 📍 修正点 6: InfoWindowの位置取得もヘルパー関数経由に
            position={getPosition(selectedPost.location)}
            onCloseClick={() => setSelectedPost(null)}
          >
            <div style={{ maxWidth: "200px" }}>
              <h4>{selectedPost.tag}</h4>
              <p>{selectedPost.message}</p>
              {selectedPost.imageUrl && (
                <img
                  src={selectedPost.imageUrl}
                  alt="投稿画像"
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              )}
              {selectedPost.riskLevel && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                  ⚠️ {selectedPost.riskLevel}
                </p>
              )}
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <button onClick={() => handleGood(selectedPost.id)} >
                  👍 Good ({selectedPost.goodCount || 0})
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default PostMap;