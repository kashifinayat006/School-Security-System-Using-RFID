<?php

include("connectDB.php"); 
// SQL query to delete all records from the table
$sql = "DELETE FROM data";

if ($conn->query($sql) === TRUE) {
    
} else {
    
}

// Close the connection
$conn->close();
?>
