import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  //apiKey: "AIzaSy...YOUR_API_KEY",
  //authDomain: "your-project-id.firebaseapp.com",
  //projectId: "your-project-id",
  //storageBucket: "your-project-id.appspot.com",
  //messagingSenderId: "1234567890",
  //appId: "1:1234567890:web:abcdef123456"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 各サービスへの参照をエクスポート
export const db = getFirestore(app);
export const storage = getStorage(app);