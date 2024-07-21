<?php require 'connectDB.php';


if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["generate"])) {
    // Generate a random number between 1000000 and 999999999
    $min = 1000000;
    $max = 999999999;
    $randomNumber = rand($min, $max);

    // Insert the random number into the database
    $sql = "INSERT INTO data (value)
   VALUES ('$randomNumber')";
   
   if (mysqli_query($conn, $sql)) {
     echo "New record created successfully";
   } else {
     echo "Error: " . $sql . "<br>" . mysqli_error($conn);
   }
   mysqli_close($conn);
}



?>
<!DOCTYPE html>
<html>
<head>
  <title>Random Number Generator</title>
</head>
<body>
  <form method="post">
    <button type="submit" name="generate">Generate Random Number and Insert</button>
  </form>
</body>
</html>