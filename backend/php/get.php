<?php
require_once __DIR__.'/vendor/autoload.php';

$servername = "localhost";
$username = "USERNAME";
$password = "PASSWORD";
$dbname = "DBNAME";

if(gettype($_GET['id_token']) != "string") {
  echo "Invalid Token Type.";
}

$client = new Google_Client(['client_id' => "321811210964-jcb9c7kbtrf53ghv2ugvj82a47shm5hg.apps.googleusercontent.com"]);
$payload = $client->verifyIdToken($_GET['id_token']);

if ($payload) { // if token is valid
  $id = $payload['sub'];

  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);



  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
    http_response_code(400);
  } 


  $sql = "SELECT json FROM folders WHERE id={$id}";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
      echo "{\"folders\":";
      echo $row["json"];
    }
  }


  $sql2 = "SELECT files FROM files WHERE id={$id}";
  $result2 = $conn->query($sql2);

  if ($result2->num_rows > 0) {
    // output data of each row
    while($row = $result2->fetch_assoc()) {
      echo ",\"files\":";
      echo $row["files"];
      echo "}";
    }
  }

  $conn->close();
} else {
  echo "Error: Invalid ID Token";
  http_response_code(400);
}
?>