<?php
require 'connectDB.php';
$sql = "SELECT value FROM data ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
  // Output data of the last entry
  $row = $result->fetch_assoc();
  $lastEntry = $row["value"];
   
  echo $lastEntry;
  // SQL query to delete all records from the table


} 

$conn->close();
?>