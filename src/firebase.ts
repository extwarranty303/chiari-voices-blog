import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBkFOLAnMoBdmdoA6pjAchTOYskkqKuUuU",
  authDomain: "chiari-voices-blog-3e51b.firebaseapp.com",
  projectId: "chiari-voices-blog-3e51b",
  storageBucket: "chiari-voices-blog-3e51b.firebasestorage.app",
  messagingSenderId: "747657841430",
  appId: "1:747657841430:web:d6b7573ed39fe395c99e37",
  measurementId: "G-ZJ4B5GSZSF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

export default app;
