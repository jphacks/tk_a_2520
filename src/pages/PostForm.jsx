import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostForm.css'; // スタイルシートは適宜作成してください
import { db, storage } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MapModal from './MapModal';

function PostForm() {
    const [message, setMessage] = useState('');
    const [tag, setTag] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState('地図から位置を選択してください');
    const [showMapModal, setShowMapModal] = useState(false);
    const [riskLevel, setRiskLevel] = useState('');
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

    const handleTagChange = (event) => {
        const newTag = event.target.value;
        setTag(newTag);
        if (newTag !== '危険情報') {
            setRiskLevel('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!message || !tag || location === '地図から位置を選択してください') {
            alert("メッセージ、タグ、位置情報は必須です。");
            return;
        }
        if (tag === '危険情報' && !riskLevel) {
            alert("危険度を選択してください。");
            return;
        }

        setIsLoading(true);
        try {
            let imageUrl = "";
            if (imageFile) {
                const storageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const postData = {
                message,
                location,
                tag,
                imageUrl,
                createdAt: serverTimestamp(),
                ...(riskLevel && { riskLevel }),
            };

            await addDoc(collection(db, "posts"), postData);
            alert('投稿が完了しました！');
            navigate('/map'); // 地図ページへ遷移
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
                <div className="form-group">
                    <label htmlFor="message">メッセージ</label>
                    <div className="message-box-container">
                        <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="メッセージを入力..."/>
                        <input type="file" id="imageUpload" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                        <label htmlFor="imageUpload" className="btn image-btn">＋画像</label>
                    </div>
                    {imagePreview && (
                        <div id="imagePreviewContainer">
                            <img src={imagePreview} alt="Preview" />
                            <button type="button" onClick={handleClearImage} className="btn clear-btn">削除</button>
                        </div>
                    )}
                </div>
                <div className="form-group">
                    <label>位置情報</label>
                    <button type="button" className="btn map-btn" onClick={() => setShowMapModal(true)}>地図検索</button>
                    <input type="text" id="location" value={location} readOnly />
                </div>
                <div className="form-group">
                    <label htmlFor="tag">タグ</label>
                    <select id="tag" value={tag} onChange={handleTagChange}>
                        <option value="">選択してください</option>
                        <option value="風景">風景</option>
                        <option value="危険情報">危険情報</option>
                        <option value="グルメ">グルメ</option>
                        <option value="気づき">気づき</option>
                        <option value="便利情報">便利情報</option>
                    </select>
                </div>
                {tag === '危険情報' && (
                    <div className="form-group">
                        <label htmlFor="riskLevel">危険度</label>
                        <select id="riskLevel" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                            <option value="">選択してください</option>
                            <option value="危険エリア">危険エリア</option>
                            <option value="スリ多発地域">スリ多発地域</option>
                            <option value="交通事故注意">交通事故注意</option>
                            <option value="安全ルート">安全ルート</option>
                        </select>
                    </div>
                )}
                <div className="form-group">
                    <button type="submit" className="btn submit-btn" disabled={isLoading}>
                        {isLoading ? '送信中...' : '送信'}
                    </button>
                </div>
            </form>
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