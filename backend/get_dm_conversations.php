<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

if (!isset($_SESSION['id'])) {
    http_response_code(403);
    die();
}
$id = $_SESSION['id'];

$msgs = $baza->query("SELECT c.*
FROM direct_conversations c
LEFT OUTER JOIN (
    SELECT dm_id, MAX(sent) as latest_time
    FROM messages
    GROUP BY dm_id
) m ON c.id = m.dm_id
LEFT OUTER JOIN messages lm ON c.id = lm.dm_id and m.latest_time = lm.sent
WHERE (c.user2_id = $id OR
c.user1_id = $id)
ORDER BY m.latest_time DESC;
") or die(mysqli_error($baza));

$userMessages = array();

$you = $baza->query("SELECT * FROM users WHERE id='$id'")->fetch_assoc();

echo "<ul>";
foreach ($msgs as $msg) {

    if ($msg['user1_id'] == $id) {
        $user2 = $baza->query("SELECT * from users WHERE id='$msg[user2_id]'")->fetch_assoc();
    } else {
        $user2 = $baza->query("SELECT * from users WHERE id='$msg[user1_id]'")->fetch_assoc();
    }
    $lastMsg = $baza->query("SELECT message, sent as 'time', sender_id from messages WHERE dm_id='$msg[id]' ORDER BY sent DESC LIMIT 1;")->fetch_assoc();
    echo "<li>";
    echo "<p class='username'>$user2[nickname]</p>";
    echo "<p class='user_id'>$user2[id]</p>";
    echo "<p class='last_message'>";
    if (isset($lastMsg['message'])) {
        if ($lastMsg['sender_id'] == $_SESSION['id']) {
            echo "You: ";
        } else {
            echo "$user2[nickname]: ";
        }
        if (strlen($lastMsg['message']) > 50) {
            echo substr($lastMsg['message'], 0, 47) . "...";
        } else {
            echo $lastMsg['message'];
        }
    } else {
        echo "No messages to show...";
    }
    echo "</p>";

    // check if you blocked
    if ($baza->query("SELECT * FROM blocked_users WHERE (blocking_user_id = $_SESSION[id] AND blocked_user_id = $user2[id])")->num_rows > 0) {
        echo "<p class='blocked'>you blocked</p>";
        echo "<p class='user_status'>You have blocked $user2[nickname]</p>";
    } else if ($baza->query("SELECT * FROM blocked_users WHERE (blocked_user_id = $_SESSION[id] AND blocking_user_id = $user2[id])")->num_rows > 0) {
        echo "<p class='blocked'>blocked</p>";
        echo "<p class='user_status'>$user2[nickname] has blocked you</p>";
    } else {
        if (isset($lastMsg['time'])) {
            if ($lastMsg['time'] > $_SESSION['last_online']) {
                echo "<p class='unread'>unread</p>";
            }
        }

        echo "<p class='user_status'>";

        if (!is_null($user2['last_online'])) {
            $a = new DateTime('@' . strtotime($user2['last_online']));
            $b = $a->diff(new DateTime('now'));
            echo timeFormat($b);
        } else {
            echo "online";
        }

        echo "</p>";
    }
    echo "<p class='last_message_time'>";
    if (isset($lastMsg['time'])) {
        echo date('G:i', strtotime($lastMsg['time']));
    } else {
        echo "";
    }
    echo "</p>";
    echo "<p class='dm_id'>$msg[id]</p>";
    echo "</li>";
}
echo "</ul>";


echo "<h1 class='username'>$you[nickname]</h1>";
