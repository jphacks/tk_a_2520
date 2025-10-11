// /src/firebase/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // 認証機能を追加する場合


// Your web app's Firebase configuration
// ★★★ ここにFirebaseプロジェクトの設定情報を貼り付けてください ★★★
const firebaseConfigA = {
  apiKey: import.meta.env.VITE_PROJECT_A_API_KEY,
  authDomain: import.meta.env.VITE_PROJECT_A_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_PROJECT_A_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_A_PROJECT_ID,
  storageBucket: import.meta.env.VITE_PROJECT_A_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_PROJECT_A_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_PROJECT_A_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfigA);

// Firestoreインスタンスを取得
export const db = getFirestore(app);

// 認証機能を追加する場合はこちらもエクスポートします
// export const auth = getAuth(app);