import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-analytics.js";

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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
const db = getDatabase();


const openPopupButton = document.getElementById("openPopup");
const popup = document.getElementById("popup");
const closePopupButton = document.getElementById('closePopup');

closePopupButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    popup.style.display = 'none';
});



function scanningCard() {

    deleteRecord();
    overlay.style.display = 'block';
    popup.style.display = "block";





    function updateContent() {

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // document.getElementById("recordCount").innerHTML = this.responseText;
                var n = this.responseText;
                if (n > 0) {
                    clearInterval(intervalId);
                    overlay.style.display = 'none';
                    popup.style.display = 'none';
                    cardScanned();
                }
            }
        };
        xhr.open("GET", "phpcode/check_record.php", true);
        xhr.send();
    }
    var intervalId = setInterval(updateContent, 100);

}

function cardScanned() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var id = this.responseText;

            checkExistingID(id)
                .then((exists) => {
                    if (exists) {
                        alert("ID already exists. Please try another one.");
                    } else {
                        document.getElementById("enterID").innerHTML = id;
                        tickMark();

                    }
                })
                .catch((error) => {
                    alert(error);
                });



        }
    };
    xhr.open("GET", "phpcode/execute_php_code.php", true);
    xhr.send();
}

function deleteRecord() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {


        }
    };
    xhr.open("GET", "phpcode/deleteRecord.php", true);
    xhr.send();

}

function tickMark() {

    const popup = document.getElementById("tick");


    // Show the popup
    function showtick() {

        tick.style.display = "block";
        setTimeout(hidetick, 2000); // Hide after 2 seconds
    }

    // Hide the animation
    function hidetick() {
        tick.style.display = "none";
    }

    // Trigger the  animation
    showtick();
}

function checkExistingID(id) {
    /*peopleRef and teacherRef are created for the "People" and "TeacherData" tables*/
    const peopleRef = ref(db, "allowed-card-ids/" + id);
    
    const teacherRef = ref(db, "TeacherData/" + id);
   
    /*get to check if the ID exists in each table*/
    const peoplePromise = get(peopleRef).then((snapshot) => snapshot.exists());
    /*peopleRef is a reference to the location in the Firebase Realtime Database where the "People or TeacherData" table is located, 
    with the specific ID appended to the path.*/
    const teacherPromise = get(teacherRef).then((snapshot) => snapshot.exists());
    /*The Promise.all method is used to wait for both promises to resolve, and then 
    it returns a combined result indicating if the ID exists in either table.*/
    return Promise.all([peoplePromise, teacherPromise]).then(([peopleExists, teacherExists]) => {//destructuring used
        return peopleExists || teacherExists;
        /* return Promise.all([peoplePromise, teacherPromise]).then(([peopleExists, teacherExists]) => {
        return peopleExists || teacherExists;
    });*/
    });
}






openPopupButton.addEventListener("click", scanningCard);