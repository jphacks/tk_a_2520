import React, { useState, useEffect, useRef } from 'react';
import './InfoMap.css';
import MapContainer from '../components/MapContainer';
// ★ 1. Firestoreからデータを取得するために必要な関数をインポートします
import { db } from '../firebase/firebase'; // firebase設定ファイルのパスは適宜調整してください
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// ★ 2. ボタンの種類を配列で定義します。投稿フォームのタグと名前を一致させましょう。
const tagButtons = [
    { type: '危険情報', icon: '⚠️' },
    { type: '風景',     icon: '🌸' },
    { type: 'グルメ',   icon: '🍴' }, // アイコンをより適切なものに変更しました
    { type: '気づき',   icon: '✨' }, // アイコンをより適切なものに変更しました
    { type: '便利情報', icon: '💡' }
];

function InfoMap() {
    const [activeTag, setActiveTag] = useState(null);
    const [posts, setPosts] = useState([]); // ★ 3. 取得した投稿データを保持するためのstate
    const [isLoading, setIsLoading] = useState(false); // ★ データ取得中のローディング状態を管理

    const topNavRef = useRef(null);
    const panelRef = useRef(null);

    // ★ 4. タグボタンがクリックされたときの処理
    const handleTagClick = (tag) => {
        // 同じボタンをクリックしたら選択解除（トグル機能）
        setActiveTag(prevTag => prevTag === tag ? null : tag);
    };

    // ★ 5. activeTagが変更されたら、Firestoreからデータを取得するuseEffect
    useEffect(() => {
        // データを取得する非同期関数を定義
        const fetchPosts = async () => {
            // タグが選択されていない場合は、投稿リストを空にして処理を終了
            if (!activeTag) {
                setPosts([]);
                return;
            }

            setIsLoading(true); // ローディング開始
            try {
                // 'posts'コレクションから、選択されたタグ('activeTag')に一致するデータを取得するクエリを作成
                // createdAtで降順ソートして新しい投稿から表示
                const postsCollection = collection(db, "posts");
                const q = query(postsCollection, where("tag", "==", activeTag), orderBy("createdAt", "desc"));
                
                const querySnapshot = await getDocs(q);

                // 取得したデータをstateで利用しやすい形に変換
                const postsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setPosts(postsData); // 取得したデータでstateを更新

            } catch (error) {
                console.error("データの取得に失敗しました: ", error);
                alert("データの取得中にエラーが発生しました。");
            } finally {
                setIsLoading(false); // ローディング終了
            }
        };

        fetchPosts(); // 関数を実行
    }, [activeTag]); // activeTagが変更されるたびにこのeffectが再実行される

    // パネル外をクリックしたらパネルを閉じる処理 (useEffect)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                topNavRef.current && !topNavRef.current.contains(event.target) &&
                panelRef.current && !panelRef.current.contains(event.target)
            ) {
                setActiveTag(null); // タグの選択を解除
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="container">
            {/* ★ 6. ボタンを配列データから動的に生成 */}
            <div className="top-nav" ref={topNavRef}>
                {tagButtons.map((button) => (
                    <button
                        key={button.type}
                        className={`circular-btn ${activeTag === button.type ? 'active' : ''}`}
                        onClick={() => handleTagClick(button.type)}
                    >
                        <div className="btn-icon">{button.icon}</div>
                        {button.type}
                    </button>
                ))}
            </div>

            <div className="map-area">
                {/* ★ 7. MapContainerに取得した投稿データをpropsとして渡す */}
                <MapContainer posts={posts} />

                {/* ★ 8. 情報パネルの表示内容を動的に変更 */}
                <div id="info-panel" className={`info-panel ${activeTag ? 'active' : ''}`} ref={panelRef}>
                    {activeTag && <h3>{activeTag}</h3>}
                    
                    {isLoading ? (
                        <p>読み込み中...</p>
                    ) : posts.length > 0 ? (
                        <ul className="info-list">
                            {posts.map(post => (
                                <li key={post.id} className="info-item">
                                    <p>{post.message}</p>
                                    {/* 画像があれば表示 */}
                                    {post.imageUrl && <img src={post.imageUrl} alt="投稿画像" />}
                                    {/* 危険度情報があれば表示 */}
                                    {post.riskLevel && <span className="risk-level">{post.riskLevel}</span>}
                                    <small>{new Date(post.createdAt.seconds * 1000).toLocaleString('ja-JP')}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        // データがない場合のメッセージ
                        activeTag && <p>このタグの投稿はまだありません。</p>
                    )}
                </div>
            </div>

            {/* ★ 9. 不要になった投稿ボタンは削除しました */}
        </div>
    );
}

export default InfoMap;