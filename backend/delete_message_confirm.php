<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

if(!isset($_POST['id']))
{
    die("No files");
}

// $checkId = $baza->query("SELECT sender_id FROM deleted_messages WHERE message_id='$_POST[id]'")->fetch_assoc()['sender_id'];

// if($_SESSION['id'] != $checkId)
// {
//     echo $_SESSION['id'] . ' ' . $checkId;
//     die("Not your message");
// }
$baza->query("DELETE FROM deleted_messages WHERE message_id='$_POST[id]'");

echo "1";