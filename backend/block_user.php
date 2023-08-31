<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

if (!isset($_POST['blocked_user_id'])) {
    die("not enough data");
}

$blocked = $baza->prepare("SELECT * FROM blocked_users WHERE blocking_user_id = $_SESSION[id] AND blocked_user_id = ?");
$blocked->bind_param("i", $_POST['blocked_user_id']);

$blocked->execute();

if ($blocked->get_result()->num_rows > 0) {
    die("exists");
} else {
    $block = $baza->prepare("INSERT INTO blocked_users VALUES(NULL, $_SESSION[id], ?)");
    $block->bind_param("i", $_POST['blocked_user_id']);
    $block->execute();
    echo "1";
}
