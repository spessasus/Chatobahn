<?php

require_once "../connect.php";
function clean($string) {
    $string = str_replace(' ', '_', $string);
 
    return preg_replace('/[^A-Za-z0-9\-\_\.]/', '', $string);
 }

sprawdzCzyZalogowany();

echo "<p class='response'>";

if(!isset($_FILES['file']))
{
    die("No files");
}

$username = $_SESSION['id'];

$path = "../files/users/$username/";

if (!file_exists($path)) {
    mkdir($path, 0777, true);
}

$file = $_FILES['file'];
$fName = explode('.', clean($file['name']))[0];
$fType = strtolower(pathinfo($file['name'],PATHINFO_EXTENSION));

$fNameNumber = 1;

while(file_exists("$path$fName"."_$fNameNumber.$fType"))
{
    $fNameNumber++;
}
$path .= "$fName" . "_$fNameNumber.$fType";

$files = glob("../files/users/$_SESSION[id]/*");

$fData = file_get_contents($file['tmp_name']);

$hash = hash("sha1", $fData);

$exits = false;
foreach($files as $uploadedFile)
{
    if(hash("sha1", file_get_contents($uploadedFile)) == $hash)
    {
        $exits = true;
        $path = $uploadedFile;
        break;
    }
}

if (!$exits) {;
    file_put_contents($path, $fData);
}

$fullName = explode('/', $path);
$fullName = end($fullName);

echo "uploaded</p>";

echo "<p class='file_path'>";
echo substr($path, 3);
echo "</p>";
echo "<p class='full_name'>$fullName</p>";