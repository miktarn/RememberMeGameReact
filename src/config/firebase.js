import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWsOZ8Q15SCfmLQ8KUOvYHp9kj6imyBrY",
  authDomain: "remembercardsgame.firebaseapp.com",
  projectId: "remembercardsgame",
  storageBucket: "remembercardsgame.firebasestorage.app",
  messagingSenderId: "798038717554",
  appId: "1:798038717554:web:f220cdd2ffab19b70dfeeb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);