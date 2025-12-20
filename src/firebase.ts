
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

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
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);
const storage = getStorage(app);

export { db, auth, functions, storage };
