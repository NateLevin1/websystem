<?php
$servername = "localhost";
$username = "USERNAME";
$password = "PASSWORD";
$dbname = "DBNAME";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

$getSql = "SELECT 1 FROM folders WHERE id='{$_POST['id']}'";
$exists = $conn->query($getSql);
if ($exists->num_rows > 0) {
    $update = "UPDATE folders SET json='{$_POST['json']}' WHERE id='{$_POST['id']}'";

    if ($conn->query($update) === TRUE) {
        echo "Record updated successfully";
    } else {
        echo "Error updating record: " . $conn->error;
        http_response_code(400);
    }
} else {
    $sql = "INSERT INTO folders (id, json)
VALUES ('{$_POST['id']}', '{$_POST['json']}')";

    if ($conn->query($sql) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
        http_response_code(400);
    }   
}

$conn->close();
?>