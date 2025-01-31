import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUj7ODPZzRbNU17KVO3DmAY5R43X5wPXQ",
  authDomain: "portfolio-f9c03.firebaseapp.com",
  projectId: "portfolio-f9c03",
  storageBucket: "portfolio-f9c03.firebasestorage.app",
  messagingSenderId: "920375923735",
  appId: "1:920375923735:web:b4ad2b9343dfec52de7852",
  measurementId: "G-K4VBTS64CT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };