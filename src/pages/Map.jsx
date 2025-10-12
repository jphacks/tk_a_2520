import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { collection, getDocs, orderBy, query, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const containerStyle = { width: '100%', height: '90vh' };
const defaultCenter = { lat: 35.681236, lng: 139.767125 }; // 東京駅

function PostMap() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedTag, setSelectedTag] = useState("すべて");
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [loadingLocation, setLoadingLocation] = useState(false); // ✅ ローディング状態追加

  const handleGood = async (postId) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { goodCount: increment(1) });
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

  // Firestoreから投稿取得
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

  // ✅ 現在地取得処理（ボタンから呼び出す）
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("このブラウザでは位置情報が利用できません。");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const position = { lat: latitude, lng: longitude };
        setCurrentPosition(position);
        setMapCenter(position);
        setLoadingLocation(false);
      },
      (err) => {
        console.warn("位置情報取得失敗:", err);
        alert("位置情報を取得できませんでした。許可を確認してください。");
        setLoadingLocation(false);
      }
    );
  };

  // ✅ 距離フィルタ
  const distance = (loc1, loc2) => {
    const R = 6371; // 地球半径(km)
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(loc1.lat * Math.PI / 180) *
        Math.cos(loc2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedTag !== "すべて" && post.tag !== selectedTag) return false;
    if (currentPosition && post.location) {
      return distance(currentPosition, post.location) <= 5;
    }
    return true;
  });

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* 🔹タグ＆ボタンエリア */}
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

        {/* ✅ 現在地を取得するボタン */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={loadingLocation}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            backgroundColor: loadingLocation ? "#aaa" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loadingLocation ? "default" : "pointer",
          }}
        >
          {loadingLocation ? "取得中..." : "📍 現在地を取得"}
        </button>

        {/* ✅ 現在地に戻るボタン */}
        {currentPosition && (
          <button
            onClick={() => setMapCenter(currentPosition)}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            🗺️ 現在地へ移動
          </button>
        )}
      </div>

      {/* 地図 */}
      <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={13}>
        {/* ✅ 現在地マーカー */}
        {currentPosition && (
          <>
            <Marker position={currentPosition} label="現在地" />
            <Circle
              center={currentPosition}
              radius={5000}
              options={{
                fillColor: "#007bff33",
                strokeColor: "#007bff",
                strokeWeight: 1,
              }}
            />
          </>
        )}

        {/* 投稿マーカー */}
        {filteredPosts.map(
          (post) =>
            post.location && (
              <Marker
                key={post.id}
                position={post.location}
                onClick={() => setSelectedPost(post)}
              />
            )
        )}

        {/* InfoWindow */}
        {selectedPost && (
          <InfoWindow
            position={selectedPost.location}
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
