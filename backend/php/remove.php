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

    $delete = "DELETE FROM folders WHERE id='{$id}'";
    if ($conn->query($delete) === TRUE) {
        echo "Folders record deleted successfully...";
    } else {
        echo "Error deleting record: " . $conn->error . ". Did you update the username, password, and DB names?";
        http_response_code(400);
    }

    $delete2 = "DELETE FROM files WHERE id='{$id}'";
    if ($conn->query($delete2) === TRUE) {
        echo "Files record deleted successfully";
    } else {
        echo "Error deleting record: " . $conn->error . ". Did you update the username, password, and DB names?";
        http_response_code(400);
    }

    $conn->close();
} else {
    echo "Error: Invalid ID Token";
    http_response_code(400);
}
?>