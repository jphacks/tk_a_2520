import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostForm.css';
import { db, storage } from '../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MapModal from './MapModal'; // ★ モーダルコンポーネントをインポート

function PostForm() {
    const [message, setMessage] = useState('');
    const [tag, setTag] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState('東京都文京区から取得（仮）'); // 初期値
    const [showMapModal, setShowMapModal] = useState(false); // ★ モーダル表示状態

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!message || !tag) {
            alert("メッセージとタグは必須です。");
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
                message,
                location,
                tag,
                imageUrl,
                createdAt: new Date(),
            };

            await addDoc(collection(db, "posts"), postData);
            alert('投稿が完了しました！');
            navigate('/map');
        } catch (error) {
            console.error("投稿中にエラー: ", error);
            alert(`投稿に失敗しました。\n${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                {/* メッセージ */}
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

                {/* 位置情報 */}
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

                {/* タグ */}
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
                    <button type="submit" className="btn submit-btn" disabled={isLoading}>
                        {isLoading ? '送信中...' : '送信'}
                    </button>
                </div>
            </form>

            {/* ★ モーダルを表示 */}
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
