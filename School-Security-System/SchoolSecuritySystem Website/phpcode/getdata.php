<!-- <?php  
//Connect to database
require 'connectDB.php';
if (isset($_GET['card_uid'])) {
    
    $card_uid = $_GET['card_uid'];
   

   $sql = "INSERT INTO data (value)
   VALUES ('$card_uid')";
   
   if (mysqli_query($conn, $sql)) {
     echo "New record created successfully";
   } else {
     echo "Error: " . $sql . "<br>" . mysqli_error($conn);
   }
   mysqli_close($conn);
      
}
?> -->


