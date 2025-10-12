// src/pages/PostMap.jsx
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
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

function PostMap() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedTag, setSelectedTag] = useState("すべて");

  // ✅ handleGood関数をコンポーネント内に移動
  const handleGood = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      goodCount: increment(1),
    });

    // 🔹 posts の更新
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, goodCount: (p.goodCount || 0) + 1 } : p
      )
    );

    // 🔹 selectedPost の更新も追加！
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
  const getMarkerIcon = (post) => {
    if (post.tag === "危険情報") {
      switch (post.riskLevel) {
        case "危険エリア":
          return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
        case "スリ多発地域":
          return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
        case "交通事故注意":
          return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        case "安全ルート":
          return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        default:
          return "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
      }
    } else if (post.tag === "風景") {
      return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    } else if (post.tag === "グルメ") {
      return "http://maps.google.com/mapfiles/ms/icons/pink-dot.png";
    } else if (post.tag === "豆知識") {
      return "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
    }
    return "http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png";
  };
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

  // タグでフィルタリング
  const filteredPosts =
    selectedTag === "すべて"
      ? posts
      : posts.filter((post) => post.tag === selectedTag);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* 🔹タグボタンエリア */}
      <div style={{ padding: "10px", textAlign: "center" }}>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
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

      {/* 🔹地図エリア */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
      >
        {/* 投稿マーカー */}
        {filteredPosts.map((post) => (
          post.location && (
            <Marker
              key={post.id}
              position={{
                lat: post.location.lat,
                lng: post.location.lng,
              }}
              onClick={() => setSelectedPost(post)}
              icon={{
                url: getMarkerIcon(post),
                scaledSize: new window.google.maps.Size(40, 40),
            }}
            />
          )
        ))}

        {/* InfoWindow */}
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

              {/* 👍 goodボタン */}
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <button
                  onClick={() => handleGood(selectedPost.id)}
                  style={{
                    backgroundColor: "#ffcc00",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
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
