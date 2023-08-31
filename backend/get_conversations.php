<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

if (!isset($_SESSION['id'])) {
    http_response_code(403);
    die();
}
$id = $_SESSION['id'];


// what the hell is this shit
$msgs = $baza->query(
    // okay let's do this:
    "SELECT convos.id,

    IF(convos.name = 'direct', CASE
    WHEN
        last_sender.id = $id
    THEN
        (SELECT users.nickname FROM users INNER JOIN conversation_members ON users.id = conversation_members.user_id
        WHERE conversation_members.conversation_id = convos.id AND users.id != $id LIMIT 1)
    ELSE
        last_sender.nickname
    END, convos.name
    ) as name,

    
    -- if name is 'direct' then select the other users name
    CONCAT(
        IF(convos.name = 'direct', CASE
    WHEN
        last_sender.id = $id
    THEN
        'You'
    ELSE
        last_sender.nickname
    END, convos.name
    ), ': ', lm.message) as message, lm.sent, conv_status.last_online AS last_online
    FROM conversations convos
    -- select conversation id and name and stuff, last message sent (text and time) in the conversation,
    -- last time someone is online (if there is any NULL in users of conversation then return 'online')
-- pick the last time someone sent a message
LEFT OUTER JOIN (
    SELECT conversation_id, MAX(sent) as latest_time
    FROM messages
    GROUP BY conversation_id
) msgs ON convos.id = msgs.conversation_id


-- get the last message
LEFT OUTER JOIN messages lm ON convos.id = lm.conversation_id and msgs.latest_time = lm.sent

-- oh boy...
-- pick the conversation member status
LEFT OUTER JOIN (
    -- if there arent any nulls, return newest last_online
    SELECT DISTINCT conversation_id, COALESCE(MAX(last_online), 'online') as last_online
    FROM conversation_members
    WHERE last_online IS NOT NULL
    AND
    conversation_id NOT IN
    (SELECT conversation_id FROM conversation_members WHERE last_online IS NULL)
    AND
    NOT user_id = $id

    GROUP BY conversation_id

    UNION

    -- if there are any nulls, return 'online'
    SELECT DISTINCT conversation_id, 'online'
    FROM conversation_members
    WHERE last_online IS NULL
    GROUP BY conversation_id
) conv_status ON convos.id = conv_status.conversation_id

-- get the last sender
LEFT OUTER JOIN users last_sender ON last_sender.id = lm.sender_id

-- make sure that those are your conversations
WHERE convos.id IN 
(SELECT conversation_id FROM conversation_members WHERE user_id = $id)

-- and order by latest message
ORDER BY msgs.latest_time DESC;
"
) or die(mysqli_error($baza));
// what the hell was that

die("403 forbidden (in construction)");
$userMessages = array();

$you = $baza->query("SELECT * FROM users WHERE id='$id'")->fetch_assoc();

echo "<ul>";
foreach ($msgs as $msg) {
    echo "<li>";
    echo "<p class='username'>$msg[name]</p>";
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
