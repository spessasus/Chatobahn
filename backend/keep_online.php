<?php

require_once "../connect.php";

sprawdzCzyZalogowany();

$id = $_SESSION['id'];

$status = $baza->query("SELECT COALESCE(last_online, 'online') as s FROM users WHERE id = $id;")->fetch_assoc()['s'];

$qs = [
    "DROP EVENT IF EXISTS `go_offline_$id`;",
    "SET GLOBAL event_scheduler='ON';",
    "CREATE EVENT `go_offline_$id`
    ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 20 SECOND
    COMMENT 'set the user $id to offline'
    DO
    UPDATE chatobahn.users SET last_online = NOW() WHERE id = '$id';",
    "UPDATE chatobahn.users SET last_online = NULL WHERE id = '$id';"
];


foreach ($qs as $query) {
    $baza->query($query);
}

echo "1";
if ($status != 'online') {
    $_SESSION['last_online'] = $status;
}
