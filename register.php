<?php
session_start();

if (isset($_SESSION['logged'])) {
    if ($_SESSION['logged'] == true) {
        header("Location: chat.php");
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatobahn</title>
    <link rel="stylesheet" href="dark.css">
    <link rel="icon" href="icons/icon.png">
</head>
<body>
    <h1><img class="logo" src="icons/icon.png">Chatobahn</h1>
    <h2><?php
    if(isset($_SESSION['login_msg']))
    {
        echo $_SESSION['login_msg'];
        unset($_SESSION['login_msg']);
    }
    ?></h2>
    <h3>Register</h3>
    <form method="POST" action="backend/register.php">
        <p>Login</p>
        <input name="login" required>
        <p>Password</p>
        <input type="password" name="password" required>
        <p>Repeat password</p>
        <input type="password" name="repeat" required>
        <p>Nickname</p>
        <input type="text" name="nickname" required>
        <br>
        <button>Register</button>    
    </form>
</body>
</html>