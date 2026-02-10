// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCAr0OGGig1hDY_4DlBgCmZaq76nIL4OPQ",
  authDomain: "vive-le-tech-dummy.firebaseapp.com",
  projectId: "vive-le-tech-dummy",
  storageBucket: "vive-le-tech-dummy.firebasestorage.app",
  messagingSenderId: "2005640360",
  appId: "1:2005640360:web:568f987e5f1d5650a74e9d",
  measurementId: "G-DQYQ85EN1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;