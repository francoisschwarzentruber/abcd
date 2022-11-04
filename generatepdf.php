<?php
    ini_set('default_charset', 'UTF-8');
    chdir("scores");
    $id = rand();
    unlink("*.pdf");
    $code = substr($_POST["code"], 1);
    file_put_contents("$id.ly", $code, 0);
    $command = escapeshellcmd("lilypond $id.ly");
    system($command);
    echo("scores/$id.pdf")
   
?>
