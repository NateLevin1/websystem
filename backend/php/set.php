<?php
require_once __DIR__.'/vendor/autoload.php';

$servername = "localhost";
$username = "USERNAME";
$password = "PASSWORD";
$dbname = "DBNAME";


$client = new Google_Client(['client_id' => "321811210964-jcb9c7kbtrf53ghv2ugvj82a47shm5hg.apps.googleusercontent.com"]);
$payload = $client->verifyIdToken($_POST['id_token']);
if ($payload) { // if token is valid
    $id = $payload['sub'];
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    $getSql = "SELECT 1 FROM folders WHERE id='{$id}'";
    $exists = $conn->query($getSql);
    if ($exists->num_rows > 0) {
        $update = "UPDATE folders SET json='{$_POST['json']}' WHERE id='{$id}'";

        if ($conn->query($update) === TRUE) {
            echo "Record updated successfully";
        } else {
            echo "Error updating record: " . $conn->error . ". Did you update the username, password, and DB names?";
            http_response_code(400);
        }
    } else {
        $sql = "INSERT INTO folders (id, json)
    VALUES ('{$id}', '{$_POST['json']}')";

        if ($conn->query($sql) === TRUE) {
            echo "New record created successfully";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error . ". Did you update the username, password, and DB names?";
            http_response_code(400);
        }   
    }

    $conn->close();
} else {
    echo "Error: Invalid ID Token";
    http_response_code(400);
}
?>