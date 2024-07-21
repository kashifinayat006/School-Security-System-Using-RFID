<?php
// This is check_records.php
include("connectDB.php"); // Include the database connection




$query = "SELECT COUNT(*) AS record_count FROM data";
$result = $conn->query($query);


    $row = $result->fetch_assoc();
    $recordCount = $row["record_count"];

    
 
if ($recordCount < 1) 
{
    echo 0;
}
else 
{
    echo $recordCount ;
}


$conn->close();
?>
