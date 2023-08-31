<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

if(!isset($_POST['login']))
{
    http_response_code(400);
    die();
}

$user = $baza->prepare("SELECT id FROM users WHERE login=?");

$user->bind_param("s", $_POST['login']);

$user->execute();

$user = $user->get_result();

if($user->num_rows < 1)
{
    http_response_code(404);
    die();
}
else
{
    $id = $user->fetch_assoc()['id'];
    if($baza->query("SELECT * FROM direct_conversations WHERE (user1_id=$_SESSION[id] OR user2_id=$_SESSION[id]) AND (user1_id=$id OR user2_id=$id)")->num_rows >= 1)
    {
        die("2");
    }

    $baza->query("INSERT INTO direct_conversations VALUES(NULL, $_SESSION[id], $id)");
    echo "1";
    die();
}