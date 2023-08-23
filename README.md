# ABCD Notation

A super simple textual language to represent **music scores**. The aim is to be natural to use like **markdown** for writing documents. The positions of the musical elements in the text is close to their real positions in the score. Technically, this repository provides a program, that preprocesses the file to produce an ABC string, and then produces the output with the library abc.js.  The name ABCD is a hint to the abc notation.

Try it here: https://francoisschwarzentruber.github.io/abcd/


# Motivation - Why?

## Why not graphical user interfaces?
In wysiwyg software, like Musescore, Finale, etc. you never know where to click.

## Why textual languages?
The only thing to learn with a textual language is the language. Everyone knows how to use a text editor. Existing textual langages (like abc and lilypond) are very powerful. 

## Why a new textual language?
Existing languages are difficult to use. The project aims at providing an easier to use textual language. Here are the main points:
- Both languages (ABC, Lilypond) have cryptic notations like `[K:bass]` or `\voice...`. In particular, adding a voice, a staff or lyrics is a bit tricky in both languages, while it is obvious in ABCD.
- Both in ABC and Lilypong, all the information concerning a single measure is spread out in the source.


# Basic example

A file containing

        𝄞 2/4    e'2   |  d'  r
        𝄢        r  c  |  c/ c/ c

produces the score

![image](https://user-images.githubusercontent.com/43071857/197391690-8d0cba5b-d522-449d-b0ca-96fddb51d895.png)



 
# Quick Language description

| Feature           | How to do it in the .abcd language |
| ----------------- | --------------------------- |
| Notes and rests   | like in ABC except that accidentals are written after the note like in Lilypond (e.g. `c#,`)  |
| Uplets            | Add `(3` like in ABC |
| Chords            | put notes between [ and ]  |
|  add a new voice  |    just write in a new line |
|  add a new staff  |  add an empty line or a line starting with 𝄞 or 𝄢          |
|  add treble clef  |    write 𝄞                  |
|  add bass clef    |   write 𝄢                   |
|  add lyrics       |  start a line with 💬 or 😀  | 


If your text lines are too long, add a new line contaning | or || (for double bars).






# Features of the editor

- real-time update of the score while modifying the code (like HedgeDoc for editing markdown)
- Listening to the audio (MIDI)
- Printing
- Loading/saving in the local storage of the browser
- Input from a MIDI device (in Chrome only) 
