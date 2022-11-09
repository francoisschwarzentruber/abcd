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
        if(is_file($file) && is_old_file($file) && (endsWith($file, ".ly") || endsWith($file, ".pdf") || endsWith($file, ".midi") )) {
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
        file_put_contents("$id.ly", $code, 0);
        $command = escapeshellcmd("lilypond $id.ly");
        system($command);
    
    } catch (Exception $e) {
        echo 'Exception: ',  $e->getMessage(), "\n";
    }
    echo("scores/$id")
   
?>
