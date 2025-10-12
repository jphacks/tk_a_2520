import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { collection, getDocs, orderBy, query, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const containerStyle = { width: '100%', height: '90vh', position: 'relative' }; 
const defaultCenter = { lat: 35.681236, lng: 139.767125 }; // 東京駅

const getMarkerIcon = (riskLevel) => {
  let color = "#808080"; // デフォルトは灰色

  switch (riskLevel) {
    case "危険エリア":
      color = "#E60012"; // 赤
      break;
    case "スリ多発地域":
      color = "#F39800"; // オレンジ
      break;
    case "交通事故注意":
      color = "#FFF100"; // 黄色
      break;
    case "比較的安全":
      color = "#007BFF"; // 青
      break;
    default:
      break;
  }
  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: "#ffffff",
    rotation: 0,
    scale: 1.5,
    anchor: new window.google.maps.Point(12, 24),
  };
};


const legendStyle = {
  position: 'absolute',
  bottom: '20px',
  left: '10px',
  backgroundColor: 'white',
  padding: '10px',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  zIndex: 1,
  fontSize: '14px',
};

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '5px',
};

const legendColorBoxStyle = (color) => ({
  width: '16px',
  height: '16px',
  marginRight: '8px',
  border: '1px solid #ccc',
  backgroundColor: color,
  borderRadius: '4px',
});


function PostMap() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedTag, setSelectedTag] = useState("すべて");
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [zoom, setZoom] = useState(13);

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
        setZoom(15);
        setLoadingLocation(false);
      },
      (err) => {
        console.warn("位置情報取得失敗:", err);
        alert("位置情報を取得できませんでした。許可を確認してください。");
        setLoadingLocation(false);
      }
    );
  };

  const distance = (loc1, loc2) => {
    const R = 6371;
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
      return distance(currentPosition, post.location) <= 1;
    }
    return true;
  });

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* タグ＆ボタンエリア */}
      <div style={{ padding: "10px", textAlign: "center" }}>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              margin: "5px", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
              backgroundColor: selectedTag === tag ? "#007bff" : "#e0e0e0",
              color: selectedTag === tag ? "white" : "black",
              fontWeight: selectedTag === tag ? "bold" : "normal",
              transition: "0.2s",
            }}
          >
            {tag}
          </button>
        ))}
        <button
          onClick={handleGetCurrentLocation}
          disabled={loadingLocation}
          style={{
            marginLeft: "10px", padding: "8px 16px", color: "white", border: "none", borderRadius: "8px",
            backgroundColor: loadingLocation ? "#aaa" : "#28a745",
            cursor: loadingLocation ? "default" : "pointer",
          }}
        >
          {loadingLocation ? "取得中..." : "📍 現在地を取得"}
        </button>
        {currentPosition && (
          <button
            onClick={() => {
              setMapCenter(currentPosition);
              setZoom(15);
            }}
            style={{
              marginLeft: "10px", padding: "8px 16px", backgroundColor: "#17a2b8",
              color: "white", border: "none", borderRadius: "8px", cursor: "pointer",
            }}
          >
            🗺️ 現在地へ移動
          </button>
        )}
      </div>

      {/* 地図 */}
      <div style={containerStyle}> {/* 地図と凡例を囲むコンテナ */}
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }} 
          center={mapCenter}
          zoom={zoom}
        >
          {/* 現在地マーカーと範囲サークル */}
          {currentPosition && (
            <>
              <Circle
                center={currentPosition}
                radius={25}
                options={{
                  fillColor: "#4285F4", fillOpacity: 1, strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
              />
              <Circle
                center={currentPosition}
                radius={1000}
                options={{
                  fillColor: "#007bff33", strokeColor: "#007bff",
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
                  icon={getMarkerIcon(post.riskLevel)} // iconプロパティを追加
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
                  <img src={selectedPost.imageUrl} alt="投稿画像" style={{ width: "100%", borderRadius: "8px" }}/>
                )}
                <div style={{ textAlign: "center", marginTop: "8px" }}>
                  <button
                    onClick={() => handleGood(selectedPost.id)}
                    style={{
                      backgroundColor: "#ffcc00", border: "none", borderRadius: "8px",
                      padding: "6px 12px", cursor: "pointer", fontWeight: "bold",
                    }}
                  >
                    👍 Good ({selectedPost.goodCount || 0})
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
        
        {/*凡例の表示 */}
        <div style={legendStyle}>
          <div style={{fontWeight: 'bold', marginBottom: '8px'}}>凡例</div>
          <div style={legendItemStyle}><span style={legendColorBoxStyle("#E60012")}></span>危険エリア</div>
          <div style={legendItemStyle}><span style={legendColorBoxStyle("#F39800")}></span>スリ多発地域</div>
          <div style={legendItemStyle}><span style={legendColorBoxStyle("#FFF100")}></span>交通事故注意</div>
          <div style={legendItemStyle}><span style={legendColorBoxStyle("#007BFF")}></span>比較的安全</div>
          
        </div>
      </div>
    </div>
  );
}

export default PostMap;
