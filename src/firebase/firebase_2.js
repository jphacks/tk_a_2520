import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfigB = {
  apiKey: import.meta.env.VITE_PROJECT_B_API_KEY,
  authDomain: import.meta.env.VITE_PROJECT_B_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_PROJECT_B_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_B_PROJECT_ID,
  storageBucket: import.meta.env.VITE_PROJECT_B_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_PROJECT_B_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_PROJECT_B_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfigB);

// 各サービスへの参照をエクスポート
export const db = getFirestore(app);
export const storage = getStorage(app);