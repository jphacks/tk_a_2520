import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← 正しいライブラリ名
import './PostForm.css';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function PostForm() {
    // フォームの各入力値の状態を管理する
    const [message, setMessage] = useState('');
    const [tag, setTag] = useState('');
    const [riskLevel, setRiskLevel] = useState(''); // ★ 1. 危険度を管理するstateを追加
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const location = "東京都文京区から取得（仮）";

    const navigate = useNavigate();

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleClearImage = () => {
        setImagePreview(null);
        setImageFile(null);
        document.getElementById('imageUpload').value = '';
    };

    // ★ タグが変更されたときの処理を分離
    const handleTagChange = (event) => {
        const newTag = event.target.value;
        setTag(newTag);
        // もしタグが「危険情報」以外に変更されたら、危険度の選択をリセット
        if (newTag !== '危険情報') {
            setRiskLevel('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!message || !tag) {
            alert("メッセージとタグは必須です。");
            return;
        }
        // ★ 「危険情報」が選択されているのに「危険度」が未選択の場合のエラーチェック
        if (tag === '危険情報' && !riskLevel) {
            alert("危険度を選択してください。");
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

            // ★ 保存するデータにriskLevelを追加
            const postData = {
                message: message,
                location: location,
                tag: tag,
                // riskLevelが選択されている場合のみ、その値を保存
                ...(riskLevel && { riskLevel: riskLevel }),
                imageUrl: imageUrl,
                createdAt: new Date(),
            };

            const docRef = await addDoc(collection(db, "posts"), postData);
            console.log("Document written with ID: ", docRef.id);

            alert('投稿が完了しました！');
            navigate('/map');

        } catch (error) {
            console.error("投稿中にエラーが発生しました: ", error);
            alert(`投稿に失敗しました。\nエラー: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

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
                    <select id="tag" name="tag" value={tag} onChange={handleTagChange}>
                        <option value="">選択してください</option>
                        <option value="風景">風景</option>
                        <option value="危険情報">危険情報</option>
                        <option value="グルメ">グルメ</option>
                        <option value="気づき">気づき</option>
                        <option value="便利情報">便利情報</option>
                    </select>
                </div>

                {/* ★ 2. 「危険情報」タグが選択された時だけ表示される危険度セクション */}
                {tag === '危険情報' && (
                    <div className="form-group">
                        <label htmlFor="riskLevel">危険度</label>
                        <select id="riskLevel" name="riskLevel" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                            <option value="">選択してください</option>
                            <option value="危険エリア">危険エリア</option>
                            <option value="スリ多発地域">スリ多発地域</option>
                            <option value="交通事故注意">交通事故注意</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>
                )}

                {/* 送信ボタン */}
                <div className="form-group">
                    <button type="submit" className="btn submit-btn" disabled={isLoading}>
                        {isLoading ? '送信中...' : '送信'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostForm;