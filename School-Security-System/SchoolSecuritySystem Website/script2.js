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
            document.getElementById("enterID").innerHTML = this.responseText;
            tickMark();
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






openPopupButton.addEventListener("click", scanningCard);