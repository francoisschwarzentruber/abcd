# ABCD - 🎵 The Markdown Notation for Music 🎵 

A super simple textual language, called ABCD, to represent **music scores**. The aim is to be natural to use like **markdown** for writing documents. The positions of the musical elements in the text is close to their real positions in the score. It makes easy to add instruments, change keys, add voices, add lyrics. Its main feature is **rhythm inference**: you do not need to tediously specify the duration of each note; the system tries to guess the most natural rhythm from the specification.  The name ABCD is a hint to the abc notation. 




# Features

The ABCD language enables to write scores with:
- notes, rests, chords
- multiple voice
- multi-instruments
- lyrics
- guess the rhythm
- ties, slurs, dynamics etc. (actually almost all the features from the language ABC)

This repository also comes with an **music score editor** with real-time update of the score while modifying the ABCD code (like HedgeDoc for editing markdown) and enables to:
- listen to the audio (MIDI)
- print
- Load/save in the local storage of the browser
- Input from a MIDI device (in Chrome only) 
- Export in MIDI and ABC formats

<img src="https://github.com/user-attachments/assets/16215691-cbf2-41f8-b299-81037da43a00" height="600px"/>

On the top of the screen, the user can write the score in code. The output is automatically updated at the bottom of the screen.
Try it here: https://francoisschwarzentruber.github.io/abcd/


# Videos

- First video: https://youtu.be/LbuEGCJSX0U
- Guessing the rhythm: https://youtu.be/ubqu0Pkwsnc
- Changing instruments: https://youtu.be/eb8vtVFGyhk
- Writing the two first measures of the theme of the sonata K.~545 from W.A. Mozart: https://youtu.be/fur0cubEubo


 
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
| Dynamics         | `!mp!` etc. |
| Appoggiatura      | put notes between { and }  |  
|  add a new voice  |    just write in a new line |
|  add a new staff  |  add an empty line or a line starting with 𝄞 or 𝄢          |
| Lyrics       |  start a line with 💬 or 😀  | 
| specify an instrument | start the line with the name of an instrument (e.g. `piano`, `flute`, `violin`, `cello`) |
| Change tempo   | write `♩=120`   |



# Basic example

A file containing

        𝄞 2/4    e'2   |  d'  r
        𝄢        r  c  |  c/ c/ c

produces the score

![image](https://user-images.githubusercontent.com/43071857/197391690-8d0cba5b-d522-449d-b0ca-96fddb51d895.png)



# FAQ

## Why not graphical user interfaces?
In wysiwyg software, like Musescore, Finale, etc. you need to have a high knowledge about the graphical user interface. We found easier to only have to focus on having knowledge about a language. Also it does not mean that a simple graphical user interface exists for the most common features (adding a note, etc.).

## Why textual languages?
The only thing to learn with a textual language is the language itself. Everyone knows how to use a text editor. Existing textual langages (like ABC and lilypond) are very expressive. 

## Why a new textual language?
Existing languages are somehow difficult to learn. The project aims at providing an easier to use textual language. Here are the main points:
- Both languages (ABC, Lilypond) have cryptic notations like `[K:bass]` or `\voice...`. In particular, adding a voice, a staff or lyrics is a bit tricky in both languages, while it is obvious in ABCD.
- Both in ABC and Lilypond, all the information concerning a single measure is spread out in the source.
This project is to be compared with Markdown. Markdown is easier to learn than LaTEX or typst.

## How does it work behind the scene?
Technically, this repository provides a program, that preprocesses an input in ABCD to produce an ABC string, and then produces the output with the library abc.js. Meanwhile it calls a linear programming solver for solving rhythm inference.  

# Reference

François Schwarzentruber. **Rhythm Inference Helping Writing Music Scores.** IJCAI 2024 (demonstration track)
