<?php

require_once "../connect.php";

if(!isset($_POST['login']) or !isset($_POST['password']) or !isset($_POST['repeat']) or !isset($_POST['nickname']))
{
    $_SESSION['login_msg'] = "Please fill out the fields.";
    header("Location: ../register.php");
}

if($_POST['password'] != $_POST['repeat'])
{
    $_SESSION['login_msg'] = "Passwords don't match.";
    header("Location: ../register.php");
}

$logins = $baza->query("SELECT login FROM users");
$free = true;
foreach($logins as $login)
{
    if($login['login'] == $_POST['login'])
    {
        $free = false;
        break;
    }
}
if(!$free)
{
    $_SESSION['login_msg'] = "Login taken. Please pick another.";
    header("Location ../register.php");
}

$hash = hash("sha256", $_POST['password']);

$query = $baza->prepare("INSERT INTO users VALUES (NULL, ?, ?, ?, NOW())");
$query->bind_param("sss", $_POST['login'], $hash, $_POST['nickname']);
$query->execute();

$_SESSION['logged'] = true;
$_SESSION['id'] = $baza->query("SELECT id FROM users ORDER BY id DESC LIMIT 1")->fetch_assoc()['id'];

header("Location: ../chat.php");