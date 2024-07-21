

function validateInput(inputId) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(inputId + "-error");
    var regexAlphabet = /^[a-zA-Z ]+$/; // Regular expression to match alphabets only
    var regexNumber = /^[0-9]+$/; // Regular expression to match numbers only
    var enterFirstName = document.getElementById("enterFirstName");
    var enterFatherName = document.getElementById("enterFatherName");
    var enterClass = document.getElementById("enterClass");
    var submitButton = document.getElementById("submit-button");

    if (inputId === "enterClass") {
      if (!regexNumber.test(input.value)) {
        error.innerHTML = "Only numbers are allowed!";
        submitButton.disabled = true;
      } 
    //   if (input.value === "") {


    //     error.innerHTML = "Fill!";
    //     submitButton.disabled = true;
    // }
      else  {
        error.innerHTML = "";
        enableSubmitButton();
      }
    } else {
      if (!regexAlphabet.test(input.value)) {
        error.innerHTML = "Only alphabets are allowed!";
        submitButton.disabled = true;
      } else {
        error.innerHTML = "";
        enableSubmitButton();
        
      }
    }
 
  }


  function enableSubmitButton() {
    var enterFirstName = document.getElementById("enterFirstName");
     var enterLastName = document.getElementById("enterLastName");
    var enterFatherName = document.getElementById("enterFatherName");
    var enterClass = document.getElementById("enterClass");
    var submitButton = document.getElementById("submit-button");

    if (enterFirstName.value.match(/^[a-zA-Z ]+$/) && enterFatherName.value.match(/^[a-zA-Z ]+$/) && enterLastName.value.match(/^[a-zA-Z ]+$/) &&  enterClass.value.match(/^[0-9]+$/)) {
      submitButton.disabled = false;
    }
 
    
    
  }
  

