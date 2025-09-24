// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBwWoghZL1e6IqPdgN9dzoN6ay3Rlhp-fU",
  authDomain: "smarttestcenter1.firebaseapp.com",
  projectId: "smarttestcenter1",
  storageBucket: "smarttestcenter1.firebasestorage.app",
  messagingSenderId: "889898890300",
  appId: "1:889898890300:web:51abde90aea1565bebbf39"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginWithFacebook = () => signInWithPopup(auth, facebookProvider);
