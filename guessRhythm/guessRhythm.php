<?php
    $input = $_POST["input"];

    $command = escapeshellcmd("python main.py  '$input'");
    system($command);

?>