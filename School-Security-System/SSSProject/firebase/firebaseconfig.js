// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from 'firebase/auth'
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCXvbE44rMmYlkSLMIsramC6tiBcLBNH4",
      authDomain: "schoolsecuritysystemusin-4c8fa.firebaseapp.com",
      databaseURL: "https://schoolsecuritysystemusin-4c8fa-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "schoolsecuritysystemusin-4c8fa",
      storageBucket: "schoolsecuritysystemusin-4c8fa.appspot.com",
      messagingSenderId: "58102931592",
      appId: "1:58102931592:web:8b2a5aee4664b3df023f3d",
      measurementId: "G-KTK6CHM7EF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
export { auth, database ,storage };