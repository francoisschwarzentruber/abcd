<?php
    ini_set('default_charset', 'UTF-8');
    unlink("tmp.pdf");
    $code = substr($_POST["code"], 1);
    file_put_contents("tmp.ly", $code, 0);
    $result = escapeshellcmd("lilypond tmp.ly");
    system($result);
    echo(file_get_contents("tmp.pdf"));
?>