<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

if (!isset($_POST['id'])) {
    die("No files");
}

$checkId = $baza->query("SELECT sender_id FROM messages WHERE id='$_POST[id]'")->fetch_assoc()['sender_id'];

if ($_SESSION['id'] != $checkId) {
    die("Not your message");
}

$recipientStatusQuery = $baza->query("SELECT users.id as 'id' FROM
(messages INNER JOIN direct_conversations ON direct_conversations.id = messages.dm_id)
INNER JOIN users ON users.id = direct_conversations.user1_id OR users.id = direct_conversations.user2_id WHERE messages.id = $_POST[id]");

$recipientStatus = $recipientStatusQuery->fetch_assoc()['id'];
if ($recipientStatus == $_SESSION['id']) {
    $recipientStatus = $recipientStatusQuery->fetch_assoc()['id'];
}

if (checkIfBlocked($baza, $_SESSION['id'], $recipientStatus)) {
    die(checkIfBlocked($baza, $_SESSION['id'], $recipientStatus));
}

$recipientStatus = $baza->query("SELECT last_online FROM users WHERE id=$recipientStatus")->fetch_assoc();

if (is_null($recipientStatus['last_online'])) {
    $baza->query("INSERT INTO deleted_messages VALUES(NULL, '$_POST[id]', '$checkId')");
}

$thisFileReferences = $baza->query("SELECT file_path from file_references WHERE file_path=(SELECT file_path FROM file_references WHERE message_id='$_POST[id]')");

// it this is the last reference, delete the file
if ($thisFileReferences->num_rows == 1) {
    $fPath = $thisFileReferences->fetch_assoc()['file_path'];
    $fileToDelete = "../$fPath";
    if (file_exists($fileToDelete)) {
        unlink($fileToDelete);
    }
}

$baza->query("DELETE FROM file_references WHERE message_id ='$_POST[id]'");
$baza->query("DELETE FROM messages WHERE id='$_POST[id]'");

echo "1";
