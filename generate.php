<?php

    /**
     * @returns true if $haystack finishes with $needle
     */
    function endsWith( $haystack, $needle ) {
        $length = strlen( $needle );
        if( !$length ) {
            return true;
        }
        return substr( $haystack, -$length ) === $needle;
    }


    /**
     * @returns whether a file is old, i.e. more than 20sec!
     */
    function is_old_file($file) {
        return filemtime($file) < time() - 20;
    }

    /**
     * remove too old files
     */
    function clean() {
        $files = glob('*'); // get all file names
        foreach($files as $file) { // iterate files
        if(is_file($file) && is_old_file($file) && (endsWith($file, ".ly") || endsWith($file, ".pdf") ||
        endsWith($file, ".png") || endsWith($file, ".svg") || endsWith($file, ".midi") )) {
            unlink($file); // delete file
        }
    }

    }

    try {
        ini_set('default_charset', 'UTF-8');
        if(!chdir("scores")) 
            throw new Exception("folder scores not found in " + getcwd());
        

        clean();

        $id = rand();
        $code = substr($_POST["code"], 1);
        $format = $_POST["format"];
        file_put_contents("$id.ly", $code, 0);
   

        if($format == "png") {
            $command = escapeshellcmd("lilypond -l=ERROR  $id.ly");
            //$command = escapeshellcmd("lilypond -fpng $id.ly"); //does not work if several pages
            system($command);
            $command = escapeshellcmd("convert $id.pdf $id.png");
        }
        else if($format == "svg")
            $command = escapeshellcmd("lilypond -l=ERROR -fsvg $id.ly");
        else
           $command = escapeshellcmd("lilypond -l=ERROR  $id.ly");
        system($command);
      
    
    } catch (Exception $e) {
        echo 'Exception: ',  $e->getMessage(), "\n";
    }

    if($format == "pdf") {
        echo("scores/$id.pdf");
    }
    else if($format == "png") {
        $s = "";
        $i = 0;
        if(is_file("$id.png"))
            $s = "scores/$id.png,";

        while(is_file("$id-$i.png")) {
            $s = "$s,scores/$id-$i.png,";
            $i = $i + 1;
        }
        echo($s);
        echo("scores/$id.midi");

    }
