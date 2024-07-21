function validateInput(inputId) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(inputId + "-error");
    var regexAlphabet = /^[a-zA-Z ]+$/; // Regular expression to match alphabets only
    var regexEmail =/^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
    
    // var regexNumber = /^[0-9]+$/; // Regular expression to match numbers only
    // var enterFirstName = document.getElementById("enterFirstName");
    // var enterFatherName = document.getElementById("enterEmail");
    // var enterEmail = document.getElementById("enterClass");
    var submitButton = document.getElementById("submit-button");    
    

    if (inputId === "enterFirstName") {
      if (!regexAlphabet.test(input.value)) {
        error.innerHTML = "Only alphabets are allowed!";
        submitButton.disabled = true;
      } 
   
      else  {
        error.innerHTML = "";
        enableSubmitButton();
        
      }
    } 
    if (inputId === "enterLastName") {
        if (!regexAlphabet.test(input.value)) {
          error.innerHTML = "Only alphabets are allowed!";
          submitButton.disabled = true;
        } 
     
        else  {
          error.innerHTML = "";
          enableSubmitButton();
          
        }
      } 
    if (inputId === "enterEmail") {
        if (!regexEmail.test(input.value)) {
          error.innerHTML = "Not a Valid format";
          submitButton.disabled = true;
        } 
     
        else  {
          error.innerHTML = "";
          enableSubmitButton();
          
        }
     } 
 
  }

  function enableSubmitButton() {
    
    var enterFirstName = document.getElementById("enterFirstName");
     var enterLastName = document.getElementById("enterLastName");
    var enterEmail = document.getElementById("enterEmail");
   
    var submitButton = document.getElementById("submit-button");

    if (enterFirstName.value.match(/^[a-zA-Z ]+$/) && enterLastName.value.match(/^[a-zA-Z ]+$/) && enterEmail.value.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      submitButton.disabled = false;
    }
 
    
    
  }
  const enterEmail = document.querySelector("#enterEmail");

// Add an input event listener to trigger email validation as the user types
enterEmail.addEventListener("input", function () {
    validateEmailInput();
});