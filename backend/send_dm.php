<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

if (!isset($_POST['dm_id']) or !isset($_POST['message'])) {
    echo "not enough data";
    die();
}

// get recipient id
$recipientId = $baza->prepare("SELECT * FROM direct_conversations WHERE id = ?");
$recipientId->bind_param("i", $_POST['dm_id']);
$recipientId->execute();
$recipientId = $recipientId->get_result()->fetch_assoc();
if ($recipientId['user1_id'] == $_SESSION['id']) {
    $recipientId = $recipientId['user2_id'];
} else {
    $recipientId = $recipientId['user1_id'];
}

// check if user is blocked
$blockedCheck = $baza->prepare("SELECT * FROM blocked_users WHERE blocked_user_id = ? AND blocking_user_id = ?");
$blockedCheck->bind_param("ii", $_SESSION['id'], $recipientId);
$blockedCheck->execute();
if ($blockedCheck->get_result()->num_rows > 0) {
    echo "blocked";
    die();
}

// check if user has blocked the recipient
$blockedCheck = $baza->prepare("SELECT * FROM blocked_users WHERE blocking_user_id = ? AND blocked_user_id = ?");
$blockedCheck->bind_param("ii", $_SESSION['id'], $recipientId);
$blockedCheck->execute();
if ($blockedCheck->get_result()->num_rows > 0) {
    echo "you blocked";
    die();
}

if (isset($_POST['reply_id'])) {
    $query = $baza->prepare("INSERT INTO messages VALUES(null, ?, NOW(), ?, null, ?, ?)");
    $query->bind_param("siii", $_POST['message'], $_POST['dm_id'], $_SESSION['id'], $_POST['reply_id']);
} else {
    $query = $baza->prepare("INSERT INTO messages VALUES(null, ?, NOW(), ?, null, ?, null)");
    $query->bind_param("sii", $_POST['message'], $_POST['dm_id'], $_SESSION['id']);
}


if ($query->execute()) {
    $newMessageId =  $baza->query("SELECT id FROM messages WHERE sender_id='$_SESSION[id]' ORDER BY id DESC LIMIT 1")->fetch_assoc()['id'];
    if (isset($_POST['filename_reference'])) {
        if (file_exists("../$_POST[filename_reference]")) {
            $file_reference = $baza->prepare("INSERT INTO file_references VALUES(NULL, ?, ?)");
            $file_reference->bind_param("is", $newMessageId, $_POST['filename_reference']);
            $file_reference->execute();
        }
    }
    echo "g"; // success
    echo $newMessageId;
} else {
    echo "0";
}
