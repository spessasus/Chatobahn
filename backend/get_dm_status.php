<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

if(!isset($_POST['user_id']))
{
    die("no id");
}

$user = $baza->prepare("SELECT last_online FROM users WHERE id = ?;");
$user->bind_param('s', $_POST['user_id']);
$user->execute();

$user = $user->get_result();
$user = $user->fetch_assoc();

if(!is_null($user['last_online']))
{
    $a = new DateTime($user['last_online'], new DateTimeZone("Europe/Warsaw"));
    $now = new DateTime('now', new DateTimeZone("Europe/Warsaw"));
    $b = $a->diff($now);
    echo timeFormat($b);
}
else
{
    echo "online";
}