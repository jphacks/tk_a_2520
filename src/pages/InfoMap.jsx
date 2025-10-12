//import React, { useState, useEffect, useRef } from 'react';
import './InfoMap.css';
// src/pages/InfoMap.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function InfoMap() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
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
    <div style={{ padding: '20px' }}>
      <h2>投稿一覧</h2>
      {posts.length === 0 ? (
        <p>投稿がまだありません。</p>
      ) : (
        posts.map(post => (
          <div
            key={post.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <p><strong>タグ:</strong> {post.tag}</p>
            <p><strong>メッセージ:</strong> {post.message}</p>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="投稿画像"
                style={{ width: "150px", borderRadius: "8px" }}
              />
            )}
            {post.riskLevel && (
              <p><strong>危険度:</strong> ⚠️ {post.riskLevel}</p>
            )}
            {post.location && (
              <p>
                <strong>位置情報:</strong> 緯度 {post.location.lat.toFixed(5)}, 経度 {post.location.lng.toFixed(5)}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default InfoMap;
