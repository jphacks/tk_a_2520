import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostForm.css';
// ★ 1. Firebaseの設定と、Firestore・Storageの関数をインポート
import { db, storage } from '../firebase';
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
                {/* メッセージセクション */}
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
                    {/* 画像プレビュー（imagePreviewがnullでない時だけ表示） */}
                    {imagePreview && (
                        <div id="imagePreviewContainer">
                            <img src={imagePreview} alt="Preview" />
                            <button type="button" onClick={handleClearImage} className="btn clear-btn">
                                画像を削除
                            </button>
                        </div>
                    )}
                </div>

                {/* 位置情報セクション */}
                <div className="form-group">
                    <label>位置情報</label>
                    <a href="map_page.html" className="btn map-btn">地図検索</a>
                    <input type="text" id="location" name="location" readOnly value={location} />
                </div>

                {/* タグセクション */}
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

                {/* 送信ボタン */}
                <div className="form-group">
                    {/* ★ ローディング中はボタンを無効化し、テキストを変更 */}
                    <button type="submit" className="btn submit-btn" disabled={isLoading}>
                        {isLoading ? '送信中...' : '送信'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostForm;