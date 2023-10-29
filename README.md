# ABCD - 🎵 The Markdown Notation for Music 🎵 

A super simple textual language to represent **music scores**. The aim is to be natural to use like **markdown** for writing documents. The positions of the musical elements in the text is close to their real positions in the score. Technically, this repository provides a program, that preprocesses the file to produce an ABC string, and then produces the output with the library abc.js.  The name ABCD is a hint to the abc notation. This repository also comes with an **music score editor**.

Try it here: https://francoisschwarzentruber.github.io/abcd/


# Videos

- First video: https://youtu.be/LbuEGCJSX0U
- Guessing the rhythm: https://youtu.be/ubqu0Pkwsnc
- Changing instruments: https://youtu.be/eb8vtVFGyhk


 
# Quick Language description

The syntax is highly inspired from ABC and Lilypond.

| Feature           | How to do it in ABCD |
| ----------------- | --------------------------- |
|  add treble clef  |    write 𝄞                  |
|  add bass clef    |   write 𝄢                   |
| Notes and rests   | write letters `a`, `b`, `c`, Add `'` or `,` for changing the octavia  |
| Accidentals       |  write `#`, `♭`, `##`, `♭♭`  |
| Rests             | write `r`                 |
| Measures separations |  write `\|`, `\|\|`, `\|:`, `:\|`, `:\|:`, `\|]`  |
| Rhythm             | It is guessed from whitespaces, but you can mention with `2`, `1`, `/`, `.`, `..`, etc. |
 | Uplets            | Add `(3` like in the ABC notation |
| Chords            | put notes between [ and ]  |
| Appoggiatura      | put notes between { and }  |  
|  add a new voice  |    just write in a new line |
|  add a new staff  |  add an empty line or a line starting with 𝄞 or 𝄢          |
| Lyrics       |  start a line with 💬 or 😀  | 
| specify an instrument | start the line with the name of an instrument (e.g. `piano`, `flute`, `violin`, `cello`) |


# Features of the editor

- real-time update of the score while modifying the code (like HedgeDoc for editing markdown)
- Listening to the audio (MIDI)
- Printing
- Loading/saving in the local storage of the browser
- Input from a MIDI device (in Chrome only) 
- Export in MIDI and ABC


# Basic example

A file containing

        𝄞 2/4    e'2   |  d'  r
        𝄢        r  c  |  c/ c/ c

produces the score

![image](https://user-images.githubusercontent.com/43071857/197391690-8d0cba5b-d522-449d-b0ca-96fddb51d895.png)






# Motivation - Why?

## Why not graphical user interfaces?
In wysiwyg software, like Musescore, Finale, etc. you never know where to click.

## Why textual languages?
The only thing to learn with a textual language is the language. Everyone knows how to use a text editor. Existing textual langages (like ABC and lilypond) are very expressive. 

## Why a new textual language?
Existing languages are difficult to learn. The project aims at providing an easier to use textual language. Here are the main points:
- Both languages (ABC, Lilypond) have cryptic notations like `[K:bass]` or `\voice...`. In particular, adding a voice, a staff or lyrics is a bit tricky in both languages, while it is obvious in ABCD.
- Both in ABC and Lilypond, all the information concerning a single measure is spread out in the source.



