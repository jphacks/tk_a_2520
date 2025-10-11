/*import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostForm.css';
// ★ 1. Firebaseの設定と、Firestore・Storageの関数をインポート
import { db, storage } from '..firebase/firebase_2';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function PostForm() {
    // フォームの各入力値の状態を管理する
    const [message, setMessage] = useState('');
    const [tag, setTag] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // ★ ローディング状態を追加
    const location = "東京都文京区から取得（仮）"; // 位置情報は固定

    const navigate = useNavigate();

    // 画像が選択されたときの処理
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file); // ファイル自体を保持
            setImagePreview(URL.createObjectURL(file)); // プレビュー用のURLを生成
        }
    };

    // 画像を削除する処理
    const handleClearImage = () => {
        setImagePreview(null);
        setImageFile(null);
        // inputの値をリセット
        document.getElementById('imageUpload').value = '';
    };

    // ★ 2. 送信処理をFirebaseにデータを保存する非同期処理に変更
    const handleSubmit = async (event) => {
        event.preventDefault(); // フォームのデフォルト送信をキャンセル

        if (!message || !tag) {
            alert("メッセージとタグは必須です。");
            return;
        }
        setIsLoading(true); // 送信処理の開始

        try {
            let imageUrl = ""; // 画像URLを格納する変数

            // 画像があればStorageにアップロード
            if (imageFile) {
                // ファイルへの参照を作成 (ファイル名が重複しないように日時を付与)
                const storageRef = ref(storage, `images/${imageFile.name + Date.now()}`);
                
                // ファイルをアップロード
                await uploadBytes(storageRef, imageFile);
                
                // アップロードしたファイルのURLを取得
                imageUrl = await getDownloadURL(storageRef);
            }

            // Firestoreに保存するデータオブジェクトを作成
            const postData = {
                message: message,
                location: location,
                tag: tag,
                imageUrl: imageUrl, // 画像がない場合は空文字が入る
                createdAt: new Date(), // 作成日時
            };

            // Firestoreの'posts'コレクションにデータを追加
            const docRef = await addDoc(collection(db, "posts"), postData);
            console.log("Document written with ID: ", docRef.id);

            alert('投稿が完了しました！');
            navigate('/map'); // マップページへ遷移

        } catch (error) {
            console.error("投稿中にエラーが発生しました: ", error);
            alert(`投稿に失敗しました。\nエラー: ${error.message}`);
        } finally {
            setIsLoading(false); // 送信処理の終了
        }
    };


    // ここで画面に表示する内容を記述（HTMLに似たJSXという記法）
    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                {/* メッセージセクション *//*}
                <div className="form-group">
                    <label htmlFor="message">メッセージ</label>
                    <div className="message-box-container">
                        <textarea
                            id="message"
                            name="message"
                            placeholder="メッセージを入力..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                        <label htmlFor="imageUpload" className="btn image-btn">＋画像</label>
                    </div>
                    {/* 画像プレビュー（imagePreviewがnullでない時だけ表示） *//*}
                    {imagePreview && (
                        <div id="imagePreviewContainer">
                            <img src={imagePreview} alt="Preview" />
                            <button type="button" onClick={handleClearImage} className="btn clear-btn">
                                画像を削除
                            </button>
                        </div>
                    )}
                </div>

                {/* 位置情報セクション *//*}
                <div className="form-group">
                    <label>位置情報</label>
                    <a href="map_page.html" className="btn map-btn">地図検索</a>
                    <input type="text" id="location" name="location" readOnly value={location} />
                </div>

                {/* タグセクション *//*}
                <div className="form-group">
                    <label htmlFor="tag">タグ</label>
                    <select id="tag" name="tag" value={tag} onChange={(e) => setTag(e.target.value)}>
                        <option value="">選択してください</option>
                        <option value="風景">風景</option>
                        <option value="危険情報">危険情報</option>
                        <option value="グルメ">グルメ</option>
                        <option value="気づき">気づき</option>
                        <option value="便利情報">便利情報</option>
                    </select>
                </div>

                {/* 送信ボタン *//*}
                <div className="form-group">
                    {/* ★ ローディング中はボタンを無効化し、テキストを変更 *//*}
                    <button type="submit" className="btn submit-btn" disabled={isLoading}>
                        {isLoading ? '送信中...' : '送信'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostForm;*/
// PostForm.js

import React, { useState, useEffect, useRef } from 'react'; // ★ useEffect と useRef をインポート
import { useNavigate } from 'react-router-dom';
import './PostForm.css';
import { db, storage } from '../firebase/firebase_2';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function PostForm() {
    // フォームの各入力値の状態を管理する
    const [message, setMessage] = useState('');
    const [tag, setTag] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // ★ 1. 位置情報をStateで管理し、モーダルの表示状態を追加
    const [location, setLocation] = useState(''); // 位置情報をStateに
    const [isMapModalOpen, setIsMapModalOpen] = useState(false); // モーダルの開閉状態

    // ★ 2. Google Maps関連のオブジェクトをuseRefで管理
    const mapRef = useRef(null); // 地図を表示するDOM要素への参照
    const mapInstance = useRef(null); // Mapインスタンス
    const markerInstance = useRef(null); // Markerインスタンス
    const geocoderInstance = useRef(null); // Geocoderインスタンス
    const selectedLocationRef = useRef(null); // 選択された緯度経度

    const navigate = useNavigate();

    // 画像が選択されたときの処理
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // 画像を削除する処理
    const handleClearImage = () => {
        setImagePreview(null);
        setImageFile(null);
        document.getElementById('imageUpload').value = '';
    };

    // 送信処理 (変更なし)
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!message || !tag || !location) { // ★ 位置情報も必須チェックに追加
            alert("メッセージ、位置情報、タグは必須です。");
            return;
        }
        setIsLoading(true); 

        try {
            let imageUrl = "";
            if (imageFile) {
                const storageRef = ref(storage, `images/${imageFile.name + Date.now()}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const postData = {
                message: message,
                location: location, // ★ Stateのlocationを使用
                tag: tag,
                imageUrl: imageUrl,
                createdAt: new Date(),
            };

            await addDoc(collection(db, "posts"), postData);

            alert('投稿が完了しました！');
            navigate('/map');

        } catch (error) {
            console.error("投稿中にエラーが発生しました: ", error);
            alert(`投稿に失敗しました。\nエラー: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // ★ 3. 地図を初期化する関数
    const initMap = () => {
        if (!window.google || !mapRef.current) return;

        const initialCenter = { lat: 35.681236, lng: 139.767125 }; // 東京駅
        geocoderInstance.current = new window.google.maps.Geocoder();
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            zoom: 15,
            center: initialCenter,
        });

        markerInstance.current = new window.google.maps.Marker({
            position: initialCenter,
            map: mapInstance.current,
            draggable: true,
        });

        // 選択された位置情報を更新
        selectedLocationRef.current = initialCenter;

        // 地図クリック時のイベントリスナー
        mapInstance.current.addListener('click', (e) => {
            placeMarker(e.latLng);
        });

        // マーカードラッグ終了時のイベントリスナー
        markerInstance.current.addListener('dragend', (e) => {
            placeMarker(e.latLng);
        });
    };
    
    // ★ 4. マーカーを配置する関数
    const placeMarker = (latLng) => {
        markerInstance.current.setPosition(latLng);
        mapInstance.current.panTo(latLng);
        selectedLocationRef.current = {
            lat: latLng.lat(),
            lng: latLng.lng()
        };
    };

    // ★ 5. 「この場所にする」ボタンの処理
    const handleConfirmLocation = () => {
        if (selectedLocationRef.current && geocoderInstance.current) {
            geocoderInstance.current.geocode({ 'location': selectedLocationRef.current }, (results, status) => {
                if (status === 'OK') {
                    if (results[0]) {
                        setLocation(results[0].formatted_address); // 住所をStateにセット
                    } else {
                        alert('住所が見つかりませんでした。');
                    }
                } else {
                    alert('住所の取得に失敗しました: ' + status);
                }
            });
        }
        setIsMapModalOpen(false); // モーダルを閉じる
    };

    // ★ 6. モーダルが開かれたときに地図を初期化する
    useEffect(() => {
        // モーダルが開き、かつ地図がまだ初期化されていない場合のみ実行
        if (isMapModalOpen && !mapInstance.current) {
            initMap();
        }
    }, [isMapModalOpen]);


    // JSX (画面に表示する内容)
    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                {/* ... (メッセージと画像選択の部分は変更なし) ... */}
                <div className="form-group">
                    <label htmlFor="message">メッセージ</label>
                    <div className="message-box-container">
                        <textarea id="message" name="message" placeholder="メッセージを入力..." value={message} onChange={(e) => setMessage(e.target.value)} />
                        <input type="file" id="imageUpload" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                        <label htmlFor="imageUpload" className="btn image-btn">＋画像</label>
                    </div>
                    {imagePreview && (
                        <div id="imagePreviewContainer">
                            <img src={imagePreview} alt="Preview" />
                            <button type="button" onClick={handleClearImage} className="btn clear-btn">画像を削除</button>
                        </div>
                    )}
                </div>

                {/* ★ 7. 位置情報セクションのボタンを変更 */}
                <div className="form-group">
                    <label>位置情報</label>
                    {/* `a`タグを`button`に変更し、モーダルを開く関数を呼ぶ */}
                    <button type="button" onClick={() => setIsMapModalOpen(true)} className="btn map-btn">
                        地図検索
                    </button>
                    <input type="text" id="location" name="location" readOnly value={location} placeholder="地図から場所を選択してください" />
                </div>

                {/* ... (タグと送信ボタンの部分は変更なし) ... */}
                <div className="form-group">
                    <label htmlFor="tag">タグ</label>
                    <select id="tag" name="tag" value={tag} onChange={(e) => setTag(e.target.value)}>
                        <option value="">選択してください</option>
                        <option value="風景">風景</option>
                        <option value="危険情報">危険情報</option>
                        <option value="グルメ">グルメ</option>
                        <option value="気づき">気づき</option>
                        <option value="便利情報">便利情報</option>
                    </select>
                </div>

                <div className="form-group">
                    <button type="submit" className="btn submit-btn" disabled={isLoading}>
                        {isLoading ? '送信中...' : '送信'}
                    </button>
                </div>
            </form>

            {/* ★ 8. 地図モーダルのJSXを追加 (isMapModalOpenがtrueの時だけ表示) */}
            {isMapModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {/* このdivに地図が描画される */}
                        <div ref={mapRef} style={{ height: '400px', width: '100%', marginBottom: '15px' }}></div>
                        <div className="modal-actions">
                            <button onClick={handleConfirmLocation} className="btn">この場所にする</button>
                            <button onClick={() => setIsMapModalOpen(false)} className="btn btn-secondary">閉じる</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostForm;