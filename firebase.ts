import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCBSBvpTm7JeFYIqH0dwyiynnPJQqF9ock",
    authDomain: "chatpdf-a0581.firebaseapp.com",
    projectId: "chatpdf-a0581",
    storageBucket: "chatpdf-a0581.appspot.com",
    messagingSenderId: "168334407615",
    appId: "1:168334407615:web:2403b9f3b13a3a9afbd30a",
    measurementId: "G-1QQF7XNJY8"
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  const db = getFirestore(app);
  const storage = getStorage(app);

export {db, storage}