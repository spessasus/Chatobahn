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
    $block = $baza->prepare("DELETE FROM blocked_users WHERE blocking_user_id = $_SESSION[id] AND blocked_user_id = ?");
    $block->bind_param("i", $_POST['blocked_user_id']);
    $block->execute();
    echo "1";
} else {
    echo "not blocked";
}
