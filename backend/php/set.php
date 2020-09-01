<?php
require_once __DIR__.'/vendor/autoload.php';

$servername = "localhost";
$username = "USERNAME";
$password = "PASSWORD";
$dbname = "DBNAME";

if(gettype($_POST['id_token']) != "string") {
    echo "Invalid Token Type.";
}

$client = new Google_Client(['client_id' => "321811210964-jcb9c7kbtrf53ghv2ugvj82a47shm5hg.apps.googleusercontent.com"]);
$payload = $client->verifyIdToken($_POST['id_token']);
if ($payload) { // if token is valid
    $id = $payload['sub'];
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    $sql = "INSERT or REPLACE INTO folders (id, json)
    VALUES ('{$id}', '{$_POST['json']}')";

    if ($conn->query($sql) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error . ". Did you update the username, password, and DB names?";
        http_response_code(400);
    }   

    $conn->close();
} else {
    echo "Error: Invalid ID Token";
    http_response_code(400);
}
?>