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

    $c = new mysqli($servername, $username, $password, $dbname);
    // set max_allowed_packet
    $setPacket = "SET GLOBAL max_allowed_packet=1073741824";
    if ($c->query($setPacket) === TRUE) {
        echo "Max packet global updated successfully";
    } else {
        echo "Error updating max packet global: " . $c->error . ".";
        http_response_code(500);
    }
    $c->close();


    
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    $getSql = "SELECT 1 FROM files WHERE id='{$id}'";
    $exists = $conn->query($getSql);
    if ($exists->num_rows > 0) {
        $update2 = "UPDATE files SET files='{$_POST['files']}' WHERE id='{$id}'";

        if ($conn->query($update2) === TRUE) {
            echo "Files record updated successfully";
        } else {
            echo "Error updating record: " . $conn->error . ". Did you update the username, password, and DB names?";
            http_response_code(400);
        }
    } else {
        $sql2 = "INSERT INTO files (id, files)
    VALUES ('{$id}', '{$_POST['files']}')";

        if ($conn->query($sql2) === TRUE) {
            echo "New files record created successfully";
        } else {
            echo "Error: " . $sql2 . "<br>" . $conn->error . ". Did you update the username, password, and DB names?";
            http_response_code(400);
        }
    }

    $conn->close();
} else {
    echo "Error: Invalid ID Token";
    http_response_code(400);
}
?>