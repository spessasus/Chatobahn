<?php

require_once "connect.php";

sprawdzCzyZalogowany();

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"> -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatobahn v1.0</title>
    <link rel="stylesheet" href="dark.css">
    <link rel="icon" href="icons/icon.png">
</head>
<body>
    <a href="backend/logout.php" class="logout icons"><img title="Log out" src="icons/exit.png"></a>
    <h1 id="logo"><img class="logo" src="icons/icon.png">Chatobahn</h1>
    <div class="content">
        <div id="chat">
            <h2>Please wait... your chats are loading</h2>
        </div>
    </div>
    <script src="frontend/utils.js"></script>
    <script src="frontend/main.js"></script>
</body>
</html>