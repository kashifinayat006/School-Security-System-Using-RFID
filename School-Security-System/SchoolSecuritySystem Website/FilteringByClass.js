// Event listener for the search button
// const searchButton = document.querySelector("#searchButton");
// searchButton.addEventListener("click", () => {
//     const classToSearch = document.querySelector("#classSearch").value;
//     console.log("Class to search:", classToSearch); // Debug statement
//     // Redirect to the view page with the filtered class parameter
//     window.location.href = `ViewStudentsByClass.html?class=${encodeURIComponent(classToSearch)}`;
// });


const searchButton = document.querySelector("#searchButton");
const classSearchInput = document.querySelector("#classSearch");
const classErrorMessage = document.querySelector("#classErrorMessage");

// Add event listener to the search button
searchButton.addEventListener("click", function() {
    // Validate class input
    const classToSearch = parseInt(classSearchInput.value);
    if (isNaN(classToSearch) || classToSearch < 0 || classToSearch > 10) {
        classErrorMessage.style.display = "block";
       window.alert("Please enter a class between 0 and 10 for filtering")
    } else {
        classErrorMessage.style.display = "none";
        
        // Class input is valid, perform search
        console.log("Class to search:", classToSearch); // Debug statement
        
        // Redirect to the view page with the filtered class parameter
        window.location.href = `ViewStudentsByClass.html?class=${encodeURIComponent(classToSearch)}`;
    }
});
