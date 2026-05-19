import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getDatabase} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAWsOZ8Q15SCfmLQ8KUOvYHp9kj6imyBrY",
    authDomain: "remembercardsgame.firebaseapp.com",
    projectId: "remembercardsgame",
    storageBucket: "remembercardsgame.firebasestorage.app",
    messagingSenderId: "798038717554",
    appId: "1:798038717554:web:f220cdd2ffab19b70dfeeb",
    databaseURL: "https://remembercardsgame-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const rtdb = getDatabase(app);

