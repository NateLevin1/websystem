<?php
$servername = "localhost";
$username = "USERNAME";
$password = "PASSWORD";
$dbname = "DBNAME";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

$sql = "SELECT json FROM folders WHERE id={$_GET['id']}";


// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
  http_response_code(400);
} 

$result = $conn->query($sql);

if ($result->num_rows > 0) {
  // output data of each row
  while($row = $result->fetch_assoc()) {
    echo $row["json"];
  }
}


$conn->close();
?>