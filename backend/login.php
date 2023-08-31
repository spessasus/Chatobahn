<?php

require_once "../connect.php";

if (!isset($_POST['login']) or !isset($_POST['password'])) {
    header("Location: index.php");
}

$hash = hash("sha256", $_POST['password']);

$log = $baza->prepare("SELECT id, last_online as 'last_online' FROM users WHERE login=? AND password=?");
$log->bind_param("ss", $_POST['login'], $hash);
$log->execute();
$log = $log->get_result();
if ($log->num_rows == 1) {
    $user = $log->fetch_assoc();

    // if(is_null($user['last_online']))
    // {
    //     $_SESSION['logged'] = false;
    //     unset($_SESSION['id']);
    //     $_SESSION['login_msg'] = "<span style='color: red;'>You are already logged in on another device.</span>";
    //     header("Location: ../index.php");
    //     die();
    // }

    $_SESSION['logged'] = true;
    $_SESSION['id'] = $user['id'];
    $_SESSION['last_online'] = $user['last_online'];
    if (isset($_POST['text_response'])) {
        echo "logged";
        die();
    } else {
        header("Location: ../chat.php");
    }
} else {
    $_SESSION['logged'] = false;
    unset($_SESSION['id']);
    $_SESSION['login_msg'] = "<span style='color: red;'>Incorrect login or password!</span>";
    if (isset($_POST['text_response'])) {
        echo "incorrect";
        die();
    } else {
        header("Location: ../index.php");
    }
}
