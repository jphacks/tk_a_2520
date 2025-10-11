// src/components/MapContainer.jsx

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

const containerStyle = {
  width: '100%',
  height: '70vh'
};

const center = {
  lat: 35.681236,
  lng: 139.767125
};

function MapContainer({ googleMapsApiKey }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
  });

  const [pins, setPins] = useState([]);
  const [tempPin, setTempPin] = useState(null);
  const [activePin, setActivePin] = useState(null);
  const [text, setText] = useState('');
  const [map, setMap] = useState(null); // ★ 変更点: 地図インスタンスを保持するstate

  // ★ 変更点: 地図が読み込まれたときにインスタンスをstateに保存
  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  // ★ 変更点: コンポーネントがアンマウントされるときにインスタンスをクリア
  const onUnmount = useCallback(function callback(_map) {
    setMap(null);
  }, []);

  // Firestoreからピンのデータをリアルタイムで取得 (ここは変更なし)
  useState(() => {
    const pinsCollectionRef = collection(db, 'pins');
    const unsubscribe = onSnapshot(pinsCollectionRef, (querySnapshot) => {
      const pinsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPins(pinsData);
    });
    return () => unsubscribe();
  }, []);

  // 地図をクリックしたときの処理 (ここは変更なし)
  const onMapClick = useCallback((event) => {
    setTempPin({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
    setActivePin(null);
    setText('');
  }, []);

  // ★ 変更点: 現在地を取得する新しい関数
  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // 地図の中心を現在地に移動させる
          if (map) {
            map.panTo(currentLocation);
            map.setZoom(15); // 少しズームする
          }

          // 現在地に新しいピンを立てる
          setTempPin(currentLocation);
          setActivePin(null);
          setText('');
        },
        (error) => {
          // エラーハンドリング
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("位置情報の利用が許可されていません。ブラウザの設定を確認してください。");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("位置情報が取得できませんでした。");
              break;
            case error.TIMEOUT:
              alert("位置情報の取得がタイムアウトしました。");
              break;
            default:
              alert("不明なエラーが発生しました。");
              break;
          }
        }
      );
    } else {
      alert("お使いのブラウザは位置情報機能に対応していません。");
    }
  };

  // 投稿を保存する処理 (ここは変更なし)
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !tempPin) return;
    try {
      await addDoc(collection(db, 'pins'), {
        lat: tempPin.lat,
        lng: tempPin.lng,
        text: text,
        createdAt: serverTimestamp()
      });
      setTempPin(null);
      setText('');
    } catch (error) {
      console.error("投稿の保存中にエラーが発生しました: ", error);
    }
  };

  if (!isLoaded) return <div>地図を読み込んでいます...</div>;

  return (
    <div>
      {/* ★ 変更点: 現在地取得ボタンを追加 */}
      <button onClick={findMyLocation} style={{ marginBottom: '10px', padding: '10px 15px', fontSize: '16px', cursor: 'pointer' }}>
        📍 現在地から投稿する
      </button>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onClick={onMapClick}
        onLoad={onLoad} // ★ 変更点
        onUnmount={onUnmount} // ★ 変更点
      >
        {/* Firestoreから取得した既存のピンを表示 */}
        {pins.map(pin => (
          <Marker
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => {
              setActivePin(pin);
              setTempPin(null);
            }}
          />
        ))}

        {/* 既存のピンをクリックしたときに表示する情報ウィンドウ */}
        {activePin && (
          <InfoWindow
            position={{ lat: activePin.lat, lng: activePin.lng }}
            onCloseClick={() => setActivePin(null)}
          >
            <div>
              <p>{activePin.text}</p>
              <small>投稿日時: {activePin.createdAt?.toDate().toLocaleString('ja-JP')}</small>
            </div>
          </InfoWindow>
        )}

        {/* 新規投稿用のピン（一時的）*/}
        {tempPin && (
          <Marker position={{ lat: tempPin.lat, lng: tempPin.lng }} />
        )}

        {/* 新規投稿用のフォーム（InfoWindow内）*/}
        {tempPin && (
          <InfoWindow
            position={{ lat: tempPin.lat, lng: tempPin.lng }}
            onCloseClick={() => setTempPin(null)}
          >
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="テキストを入力..."
                rows="4"
                cols="30"
                required
                style={{ display: 'block', marginBottom: '10px' }}
              />
              <button type="submit">投稿する</button>
            </form>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default React.memo(MapContainer);