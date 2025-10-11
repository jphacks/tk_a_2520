import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // ページ遷移のためにインポート
import './InfoMap.css'; // CSSファイルをインポート

// 表示するデータはコンポーネントの外に定義しておくと見やすい
const infoData = {
    danger: {
        title: '危険情報',
        content: '現在の危険情報を表示します。道路封鎖、自然災害、緊急事態などの情報をご確認いただけます。'
    },
    scenery: {
        title: '風景情報',
        content: '美しい風景スポットや季節の見どころをご紹介します。桜の開花状況、紅葉の見頃などをお知らせします。'
    },
    traffic: {
        title: '交通情報',
        content: '道路状況、電車の運行情報、渋滞状況などの最新の交通情報をお届けします。'
    },
    event: {
        title: 'イベント情報',
        content: '地域のお祭り、コンサート、展示会などのイベント情報をご案内します。'
    }
};

function InfoMap() {
    // どの情報がアクティブかを管理するstate ('danger', 'scenery', nullなど)
    const [activeInfoType, setActiveInfoType] = useState(null);

    // DOM要素を参照するためのuseRef
    const navRef = useRef(null);
    const panelRef = useRef(null);

    // useNavigateフックを呼び出して、ページ遷移用の関数を取得
    const navigate = useNavigate();

    // ボタンがクリックされたときの処理
    const handleShowInfo = (type) => {
        // すでにアクティブなボタンを再度クリックしたら非表示にする
        setActiveInfoType(prevType => prevType === type ? null : type);
    };

    // 投稿ボタンがクリックされたときの処理
    const handleSubmitInfo = () => {
        // 投稿フォームのパス'/'に遷移する
        navigate('/');
    };

    // activeInfoTypeが変更されたときに副作用（タイマー）を実行する
    useEffect(() => {
        // activeInfoTypeに何かタイプが設定された場合のみタイマーをセット
        if (activeInfoType) {
            const timer = setTimeout(() => {
                setActiveInfoType(null); // 5秒後にパネルを非表示にする
            }, 5000);

            // クリーンアップ関数：コンポーネントが再描画される前やアンマウントされる前にタイマーを解除
            return () => clearTimeout(timer);
        }
    }, [activeInfoType]); // activeInfoTypeが変更されるたびにこのeffectが実行される

    // クリックで情報パネルを非表示にするためのeffect
    useEffect(() => {
        const handleClickOutside = (event) => {
            // navRefとpanelRefのどちらの要素内もクリックされていない場合
            if (
                navRef.current && !navRef.current.contains(event.target) &&
                panelRef.current && !panelRef.current.contains(event.target)
            ) {
                setActiveInfoType(null);
            }
        };
        // マウント時にイベントリスナーを追加
        document.addEventListener('mousedown', handleClickOutside);
        // アンマウント時にイベントリスナーを削除（メモリリーク防止）
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []); // 空の配列を渡すことで、このeffectは初回レンダリング時に一度だけ実行される


    return (
        <div className="container">
            <div className="top-nav" ref={navRef}>
                <button className={`circular-btn ${activeInfoType === 'danger' ? 'active' : ''}`} onClick={() => handleShowInfo('danger')}>
                    <div className="btn-icon">⚠️</div>
                    危険情報
                </button>
                <button className={`circular-btn ${activeInfoType === 'scenery' ? 'active' : ''}`} onClick={() => handleShowInfo('scenery')}>
                    <div className="btn-icon">🌸</div>
                    風景
                </button>
                <button className={`circular-btn ${activeInfoType === 'traffic' ? 'active' : ''}`} onClick={() => handleShowInfo('traffic')}>
                    <div className="btn-icon">🚗</div>
                    交通情報
                </button>
                <button className={`circular-btn ${activeInfoType === 'event' ? 'active' : ''}`} onClick={() => handleShowInfo('event')}>
                    <div className="btn-icon">🎉</div>
                    イベント
                </button>
            </div>

            <div className="map-area">
                <div className="map-placeholder">
                    地図エリア<br />
                    <small style={{ fontSize: '16px', color: '#999', marginTop: '10px' }}>
                        ここにGoogle Mapやその他の地図サービスを埋め込みます
                    </small>
                </div>

                <div id="info-panel" className={`info-panel ${activeInfoType ? 'active' : ''}`} ref={panelRef}>
                    {/* activeInfoTypeが存在する場合のみ中身を表示 */}
                    {activeInfoType && (
                        <>
                            <h3 id="info-title">{infoData[activeInfoType].title}</h3>
                            <p id="info-content">{infoData[activeInfoType].content}</p>
                        </>
                    )}
                </div>
            </div>

            <button className="map-submit-btn" onClick={handleSubmitInfo}>
                <div className="submit-icon">📝</div>
                投稿
            </button>
        </div>
    );
}

export default InfoMap;