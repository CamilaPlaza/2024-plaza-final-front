// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAB2djnrQYcilY1qf2O1b-0qPXUpK0-QZo",
  authDomain: "candv-final-plaza.firebaseapp.com",
  projectId: "candv-final-plaza",
  storageBucket: "candv-final-plaza.appspot.com",  // OJO: faltaba el ".appspot.com" al final
  messagingSenderId: "131069040597",
  appId: "1:131069040597:web:cd1edb9fa089eb9cb80f5c",
  measurementId: "G-DQREDK14L7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
