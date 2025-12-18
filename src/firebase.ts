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
  storageBucket: "chiari-voices-blog-3e51b.appspot.com",
  messagingSenderId: "747657841430",
  appId: "1:747657841430:web:d6b7573ed39fe395c99e37",
  measurementId: "G-ZJ4B5GSZSF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Connect to the correct functions region
export const functions = getFunctions(app, 'us-central1');

// NOTE: The following line is for connecting to a local emulator.
// It should be commented out for production deployment.
// connectFunctionsEmulator(functions, "localhost", 5001);

export default app;
