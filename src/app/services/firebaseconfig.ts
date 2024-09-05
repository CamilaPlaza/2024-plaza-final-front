// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnminI50dI1egZyoQGVyGIAL6u8nYuwxU",
  authDomain: "candvbar.firebaseapp.com",
  projectId: "candvbar",
  storageBucket: "candvbar.appspot.com",
  messagingSenderId: "498376300039",
  appId: "1:498376300039:web:daadf86a26178425ea7ca2",
  measurementId: "G-06H5RS8HXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);