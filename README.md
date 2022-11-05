# abcd

A super simple ASCII format to represent music scores. Technically, this repository provides a program, that preprocesses the file to produce a Lilypond file, and then run the Lilypond engraver to produce a PDF.

# Motivation
Why? Because in wysiwyg software, you never know where to click. Among, textual langages, the abc notation is simple but  not sufficiently powerful. Otherwise Lilypond is awesome, but combersome to write. In particular, all the information concerning a single measure is spread out in the Lilypond source. The name abcd is a hint to the abc notation. So technically abcd files are just compiled into Lilypond!


# Basic example

A file containing

        𝄞 2/4    e'2   |  d'4  r4
        𝄢     r4 c4 |  c8 c8 c4

produces the score

![image](https://user-images.githubusercontent.com/43071857/197391690-8d0cba5b-d522-449d-b0ca-96fddb51d895.png)



 
# Features

| Feature           | How to do it in the .abcd language |
| ----------------- | --------------------------- |
| Notes and rests   | use of the Lilypond format  |
| Chords            | put notes between < and >   |
|  add a new voice  |    just write in a new line |
|  add a new staff  |  add an empty line or a line starting with 𝄞 or 𝄢          |
|  add treble clef  |    write 𝄞                  |
|  add bass clef    |   write 𝄢                   |
|  add lyrics       |  start a line with 💬 or 😀  | 

If your text lines are too long, add a new line contaning | or || (for double bars).

# Screeshot of the tool

![image](https://user-images.githubusercontent.com/43071857/198897652-cad34c1f-cf4b-40bc-886a-8fd02ca13483.png)



# Example

A file containing 

        𝄞    e''2.
        😀  ohh
        𝄞 3/4  c''4 d''8 d''8 e''4
        😀     la    vie est  très
        𝄞 <<e'8 g'8>> e'8 e'8 e'8 f'8. a'16 
        c'1
        𝄢 c4    r2

        |
        r2.

             f''2.
        😀  belle

        b'4 c''4 c''4

        a2  𝄞 g'4

        |


        
produces the score

![image](https://user-images.githubusercontent.com/43071857/197391020-418f9fc6-9396-4359-9333-ac7ee72bfd43.png)



