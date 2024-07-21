





import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    // Add your Firebase configuration here
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
const analytics = getAnalytics(app);
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

const db = getDatabase();


const enterID = document.querySelector("#enterID");
const enterFirstName = document.querySelector("#enterFirstName");
const enterLastName = document.querySelector("#enterLastName");
const enterEmail = document.querySelector("#enterEmail");
const insertBtn = document.querySelector("#submit-button");

export {app, analytics,db} ;
