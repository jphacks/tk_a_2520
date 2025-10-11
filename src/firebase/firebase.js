// /src/firebase/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // 認証機能を追加する場合
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
// ★★★ ここにFirebaseプロジェクトの設定情報を貼り付けてください ★★★
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestoreインスタンスを取得
export const db = getFirestore(app);
export const storage = getStorage(app);

// 認証機能を追加する場合はこちらもエクスポートします
// export const auth = getAuth(app);