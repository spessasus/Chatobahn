<?php

// CHANGE THESE
$baza = mysqli_connect("localhost", "root", "", "chatobahn") or die("Internal database error!");

session_start();
// startujemy sesje

function sprawdzCzyZalogowany()
{
    if (isset($_SESSION['logged'])) {
        if (!$_SESSION['logged']) {
            http_response_code(403);
            die("<h1>403 Forbidden</h1>");
        }
    } else {
        http_response_code(403);
        die("<h1>403 Forbidden</h1>");
    }
}
// inaczej przepuszczamy;

function timeFormat($datetime)
{
    $text = "Last online ";
    if ((int)($datetime->format("%d")) > 0) {
        $text .= $datetime->format("%d days ");
    }

    if ((int)($datetime->format("%h")) > 0) {
        $text .= $datetime->format("%h hours ");
    }

    if ((int)($datetime->format("%i")) > 0) {
        $text .= $datetime->format("%i minutes and ");
    }

    $text .= $datetime->format("%s seconds ago");

    return $text;
}

function checkIfBlocked($baza, $checkingUserId, $checkedUserId)
{
    // check if user is blocked
    $blockedCheck = $baza->prepare("SELECT * FROM blocked_users WHERE blocked_user_id = ? AND blocking_user_id = ?");
    $blockedCheck->bind_param("ii", $checkingUserId, $checkedUserId);
    $blockedCheck->execute();
    if ($blockedCheck->get_result()->num_rows > 0) {
        return "blocked";
    }

    // check if user has blocked the recipient
    $blockedCheck = $baza->prepare("SELECT * FROM blocked_users WHERE blocking_user_id = ? AND blocked_user_id = ?");
    $blockedCheck->bind_param("ii", $checkingUserId, $checkedUserId);
    $blockedCheck->execute();
    if ($blockedCheck->get_result()->num_rows > 0) {
        return "you blocked";
    }

    return false;
}
