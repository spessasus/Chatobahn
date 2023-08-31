<?php

if (isset($_SESSION['logged'])) {
    if ($_SESSION['logged'] != true) {
        die('0');
    } else {
        die('1');
    }
} else {
    die('0');
}
