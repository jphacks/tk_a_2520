import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ページ遷移のためにインポート
import './PostDetail.css';

// データベースから取得したという仮のデータ
const mockPost = {
    message: "これはデータベースから読み込んだメッセージです。\n休日に公園で撮影しました。天気が良くて気持ちよかったです。",
    imageUrl: "https://placehold.co/600x800/EFEFEF/AAAAAA?text=Post+Image", // 仮の画像URL
    goodCount: 15, // Goodの初期値
};

function PostDetail() {
    // useNavigateフックを使って、ページ遷移のための関数を取得
    const navigate = useNavigate();
    
    // Goodの数をstateとして管理
    const [goodCount, setGoodCount] = useState(mockPost.goodCount);

    // Goodボタンが押されたときの処理 (仮)
    const handleGoodClick = () => {
        // stateを更新して画面上の数値を1増やす
        setGoodCount(prevCount => prevCount + 1);
        // 実際にはここでデータベースの値を更新する
        console.log('データベースのGoodの値を+1しました (仮)');
        alert('「Good」しました！');
    };

    // 戻るボタンが押されたときの処理 (仮)
    const handleBackClick = () => {
        // 前のページに戻る
        navigate(-1); 
    };

    return (
        <div className="post-detail-container">
            {/* 投稿内容の表示エリア */}
            <div className="post-content">
                <p className="message-text">{mockPost.message}</p>
                <img src={mockPost.imageUrl} alt="投稿画像" />
            </div>

            {/* ボタンエリア */}
            <div className="button-area">
                <button onClick={handleGoodClick} className="btn good-btn">
                    Good👍 ({goodCount})
                </button>
                <button onClick={handleBackClick} className="btn back-btn">
                    戻る
                </button>
            </div>
        </div>
    );
}

export default PostDetail;