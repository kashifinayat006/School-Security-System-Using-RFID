// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-analytics.js";
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
import { getAuth, signInWithEmailAndPassword, deleteUser as deleteUserAccount, updateEmail, updatePassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
const db = getDatabase();




document.addEventListener("DOMContentLoaded", function () {
    const queryParams = new URLSearchParams(window.location.search);
    // Get references to the HTML elements
    const showEmailPopupButton = document.getElementById("emailPOP");
    const emailPopup = document.getElementById("email-popup");
    const overlay = document.getElementById("overlay");
    const closeEmailButton = document.getElementById("close-email-button");
    const newEmail = document.getElementById("email-input");
    const submitEmailbtn = document.getElementById("submit-email-button");
    const currentEmail = document.getElementById("updateEmail");
    var emailError = document.getElementById("email-error");
    var passwordError = document.getElementById("password-error");






    const showPasswordPopupButton = document.getElementById("passwordPOP");
    const passwordPopup = document.getElementById("password-popup");
    const closePasswordButton = document.getElementById("close-password-button");
    const newPassword = document.getElementById("password-input");
    const submitPasswordbtn = document.getElementById("submit-password-button");
    const currentPassword = document.getElementById("updatePassword");


    const previousEmail = queryParams.get("email");
    const previousPassword = queryParams.get('password');

    // Show the popup when the "Show Email Popup" button is clicked
    showEmailPopupButton.addEventListener("click", function () {
        emailPopup.style.display = "block";
        overlay.style.display = "block";
    });

    // Close the popup when the "Close" button is clicked
    closeEmailButton.addEventListener("click", function () {
        emailPopup.style.display = "none";
        overlay.style.display = "none";
    });

    showPasswordPopupButton.addEventListener("click", function () {
        passwordPopup.style.display = "block";
        overlay.style.display = "block";
    });

    // Close the popup when the "Close" button is clicked
    closePasswordButton.addEventListener("click", function () {
        passwordPopup.style.display = "none";
        overlay.style.display = "none";
    });

    function updateEm() {


        if (currentEmail.value != newEmail.value && newEmail.value != "") {
            const email = currentEmail.value;
            const password = currentPassword.value;

            signInWithEmailAndPassword(getAuth(), email, password)
                .then((userCredential) => {

                    console.log("Sign In Successful!");
                    const user = getAuth().currentUser;

                    updateEmail(user, newEmail.value).then(() => {

                        console.log("Email Change Successfully");

                        currentEmail.value = newEmail.value;
                        emailPopup.style.display = "none";
                        overlay.style.display = "none";
                        sendVerificationOfEmail();


                    }).catch((error) => {
                        var errorCode = error.code;
                        emailError.innerHTML = errorCode;
                        console.error("Sign In Error:", errorCode);

                    });

                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.error("Sign In Error:", errorCode, errorMessage);
                    emailError.innerHTML = errorCode;
                });


        }

        function sendVerificationOfEmail() {
           
            const email = currentEmail.value;
            const password = currentPassword.value;

            signInWithEmailAndPassword(getAuth(), email, password)
                .then((userCredential) => {
                    // console.log("Sign In Successful!");
                    const user = getAuth().currentUser;
                    sendEmailVerification(user)
                    .then(() => {
                        // console.log("verifying");
                    });
                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.error("Sign In Error:", errorCode, errorMessage);
                });


           

        }





    }
    function updatePass() {

        if (currentPassword.value != newPassword.value && newPassword.value != "") {
            const email = currentEmail.value;
            const password = currentPassword.value;
            signInWithEmailAndPassword(getAuth(), email, password)
                .then((userCredential) => {
                    // Signed in
                    // var user = userCredential.user;
                    console.log("Sign In Successful!");
                    const user = getAuth().currentUser;

                    updatePassword(user, newPassword.value).then(() => {
                        console.log("Password Change Successfully");
                        currentPassword.value = newPassword.value;
                        passwordPopup.style.display = "none";
                        overlay.style.display = "none";
                    }).catch((error) => {
                        var errorCode = error.code;
                        passwordError.innerHTML = errorCode;
                        console.error("Sign In Error:", errorCode);


                    });



                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.error("Sign In Error:", errorCode, errorMessage);
                    passwordError.innerHTML = errorCode;
                });


        }


    }

    function isValidEmail(email) {
        // Use a regular expression to check if the email is valid
        const emailRegex = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
        return emailRegex.match(email);
    }






    submitEmailbtn.addEventListener("click", updateEm);
    submitPasswordbtn.addEventListener("click", updatePass);
});