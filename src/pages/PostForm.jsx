import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostForm.css';
import { db, storage } from '../firebase/firebase';
// ★ 修正点 1: serverTimestamp をインポート
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MapModal from './MapModal';

function PostForm() {
    // --- State定義 (変更なし) ---
    const [message, setMessage] = useState('');
    const [tag, setTag] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState('地図から位置を選択してください');
    const [showMapModal, setShowMapModal] = useState(false);
    const [riskLevel, setRiskLevel] = useState('');

    const navigate = useNavigate();

    // --- 各種ハンドラ関数 (変更なし) ---
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

    const handleTagChange = (event) => {
        const newTag = event.target.value;
        setTag(newTag);
        if (newTag !== '危険情報') {
            setRiskLevel('');
        }
    };

    // --- フォーム送信処理 ---
    const handleSubmit = async (event) => {
        event.preventDefault();

        // バリデーション (変更なし)
        if (!message || !tag) {
            alert("メッセージとタグは必須です。");
            return;
        }
        if (tag === '危険情報' && !riskLevel) {
            alert("危険度を選択してください。");
            return;
        }
        if (location === '地図から位置を選択してください') {
            alert("位置情報を設定してください。");
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
                location: location,
                tag: tag,
                imageUrl: imageUrl,
                // ★ 修正点 2: new Date() を serverTimestamp() に変更
                createdAt: serverTimestamp(),
                ...(riskLevel && { riskLevel: riskLevel }),
            };

            await addDoc(collection(db, "posts"), postData);

            alert('投稿が完了しました！');
            navigate('/map');

        } catch (error) {
            // ★ 修正点 3: エラーログを詳細化
            console.error("投稿中に詳細なエラーが発生しました: ", error);
            alert(`投稿に失敗しました。\nエラー: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- JSX (変更なし) ---
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
                    <button
                        type="button"
                        className="btn map-btn"
                        onClick={() => setShowMapModal(true)}
                    >
                        地図検索
                    </button>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        readOnly
                        value={location}
                    />
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

                {/* 危険度セクション */}
                {tag === '危険情報' && (
                    <div className="form-group">
                        <label htmlFor="riskLevel">危険度</label>
                        <select id="riskLevel" name="riskLevel" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                            <option value="">選択してください</option>
                            <option value="危険エリア">危険エリア</option>
                            <option value="スリ多発地域">スリ多発地域</option>
                            <option value="交通事故注意">交通事故注意</option>
                            <option value="安全ルート">安全ルート</option>
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

            {/* 地図モーダル */}
            {showMapModal && (
                <MapModal
                    onClose={() => setShowMapModal(false)}
                    onSelectLocation={(lat, lng) => {
                        setLocation(`緯度: ${lat.toFixed(5)}, 経度: ${lng.toFixed(5)}`);
                        setShowMapModal(false);
                    }}
                />
            )}
        </div>
    );
}

export default PostForm;