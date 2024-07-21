 // Firebase configuration
   
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
 import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";



 const firebaseConfig = {
     // Your Firebase config here...
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

 // Reference to your Firebase Realtime Database
 const database = getDatabase(app);

 // Reference to the dropdown container
 const dropdown = document.getElementById("myDropdown");
 const bellIconContainer = document.getElementById("bell-icon-container");
 const notificationCount = document.getElementById("notification-count");
 const dataRef = ref(database, 'Unauthorized Card Scanned/');


 // Function to update the notification count
 function updateNotificationCount(count) {
     notificationCount.textContent = count;
    
 }

 // Function to fetch data from Firebase, sort by date and time, and populate the dropdown
 function populateDropdown(limit) {
    
    
    
     console.log('ggggggg');
     get(dataRef)
         .then((snapshot) => {
             dropdown.innerHTML = ""; // Clear existing items
             if (snapshot.exists()) {
                 const data = snapshot.val();

                 // Convert data to an array for sorting
                 const dataArray = Object.keys(data).map((key) => ({
                     key,
                     ...data[key]
                 }));

                 // Sort the array by date and time
                 dataArray.sort((a, b) => {
                     const dateA = a.date + ' ' + a.time;
                     const dateB = b.date + ' ' + b.time;
                     return new Date(dateB) - new Date(dateA);
                 });

                 // Limit the number of items to display
                 const itemsToDisplay = dataArray.slice(0, limit);

                 // Populate the dropdown with limited data
                 itemsToDisplay.forEach((item) => {
                     const option = document.createElement("a");
                     option.href = "#";
                     option.className = "dropdown-item";
                     option.textContent = `Unauthorized card scan at ${item.time}, ${item.date}`;
                     dropdown.appendChild(option);
                 });

                 // Update the notification count
                 updateNotificationCount(dataArray.length);
              
                

                 // Show the "See All" button at the end of the dropdown
                 if (dataArray.length > limit) {
                     const seeAllButton = document.createElement("button");
                     seeAllButton.id = "see-all-button";
                     seeAllButton.textContent = "See All";
                     seeAllButton.addEventListener("click", () => {
                         
                         populateDropdown(dataArray.length); 
                         seeAllButton.style.display = "none"; 
                     });
                     dropdown.appendChild(seeAllButton);
                     
                 }
             } else {
                 console.log("No data available.");
             }
         })
         .catch((error) => {
             console.error("Error fetching data: ", error);
         });
 }

 

 window.addEventListener('load', () => {
     populateDropdown(4);
 });






 let notificationCountValue = 0;

bellIconContainer.addEventListener("click", function () {
    
    

    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
});

// Function to refresh the notification count from Firebase
function refreshNotificationCount() {
    get(dataRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const count = Object.keys(data).length;

                // Update the notification count only if it's greater than the current count
                if (count !== notificationCountValue) {
                    notificationCountValue = count;
                    updateNotificationCount(notificationCountValue);
                }
            }
        })
        .catch((error) => {
            console.error("Error fetching data: ", error);
        });
}

// Call the refreshNotificationCount function at regular intervals (e.g., every 2 seconds)
setInterval(refreshNotificationCount, 2000);