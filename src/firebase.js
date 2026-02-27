import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ============================================================
// FIREBASE CONFIG — Replace with your own keys
// Go to: https://console.firebase.google.com
// 1. Create project "dreshnik"
// 2. Add Web App
// 3. Copy config below
// 4. Enable Authentication > Google + Email/Password
// 5. Create Firestore Database (production mode)
// 6. Create Storage bucket
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDWqEytOr6dpTEHaak7u8Pmy8Bpk-bgx5Q",
  authDomain: "dreshnikbg.firebaseapp.com",
  projectId: "dreshnikbg",
  storageBucket: "dreshnikbg.firebasestorage.app",
  messagingSenderId: "711316703348",
  appId: "1:711316703348:web:f99ab50a8a061c9de26921",
  measurementId: "G-RJ8MGBQVVG",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
