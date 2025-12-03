
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD65XFFliSTsmqITCjskrXlZj8ZMmzw2E4",
    authDomain: "doodlekeep-vercel.firebaseapp.com",
    projectId: "doodlekeep-vercel",
    storageBucket: "doodlekeep-vercel.firebasestorage.app",
    messagingSenderId: "1070913521625",
    appId: "1:1070913521625:web:af4811ac0778d8f3953bc8",
    measurementId: "G-EYFH09D7VD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
