<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

$baza->query("DROP EVENT IF EXISTS `keep_online_$_SESSION[id]`");
$baza->query("UPDATE users SET last_online=NOW() WHERE id=$_SESSION[id]");

$_SESSION['logged'] = false;
unset($_SESSION['id']);
unset($_SESSION['last_online']);
$_SESSION['login_msg'] = "<span style='color: lime;'>Logged out succesfully.</span>";
header("Location: ../index.php");
