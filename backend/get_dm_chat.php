<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

if (!isset($_POST['dm_id'])) {
    http_response_code(400);
    die("no data");
}
if (isset($_POST['get_messages_from'])) {
    $q = $baza->prepare("SELECT * FROM messages WHERE dm_id=? AND sent>=? ORDER BY sent ASC");
    $q->bind_param("is", $_POST['dm_id'], $_POST['get_messages_from']);
} else {
    $q = $baza->prepare("SELECT * FROM (SELECT * FROM messages WHERE dm_id=? ORDER BY sent DESC) msgs ORDER by msgs.id ASC");
    $q->bind_param("i", $_POST['dm_id']);
}

$conversation = $baza->query("SELECT * FROM direct_conversations WHERE id='$_POST[dm_id]'")->fetch_assoc();

if ($conversation['user1_id'] == $_SESSION['id']) {
    $user2 = $baza->query("SELECT * from users WHERE id='$conversation[user2_id]'")->fetch_assoc();
} else {
    $user2 = $baza->query("SELECT * from users WHERE id='$conversation[user1_id]'")->fetch_assoc();
}

$q->execute();
$conv = $q->get_result();

echo "<ul id='messages'>";
foreach ($conv as $message) {
    echo "<li id='msg_$message[id]'>";
    echo "<p class='sender'>";
    if ($message['sender_id'] == $_SESSION['id']) {
        echo "you";
    } else {
        echo "them";
    }
    echo "</p>";
    echo "<p class='time'>";
    echo date('m/d/Y G:i', strtotime($message['sent']));
    echo "</p>";
    echo "<p class='message'>";
    echo strip_tags($message['message']);
    echo "</p>";
    if (isset($message['response_id'])) {
        echo "<p class='reply_id'>$message[response_id]</p>";
    }
    echo "</li>";
}
echo "</ul>";
echo "<ul class='deleted_messages'>";
$dMessages = $baza->query("SELECT message_id FROM deleted_messages WHERE sender_id = '$user2[id]';");
foreach ($dMessages as $dMessage) {
    echo "<li>$dMessage[message_id]</li>";
}

echo "</ul>";
echo "<p class='messages_amount'>" . $conv->num_rows . "</p>";
echo "<p class='user_id'>$user2[id]</p>";
