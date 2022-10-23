# abcd
A super simple ASCII format to represent music scores. Technically, this repository provides a program, that preprocesses the file to produce a Lilypond file, and then run the Lilypond engraver to produce a PDF.

# Example

A file containing 

        𝄞 <<e'8 g'8>> e'8 e'8 e'8 e'8 e'8 f'8 a'8 
        c'1

        𝄢 c2    g2

        |

        b'4 c''4 c''4 c''4

        g2  𝄞 g'2

        |

        
produces the score

![image](https://user-images.githubusercontent.com/43071857/197384365-93a91293-f9ff-465c-8b5c-5ff7b017e481.png)


 
# Syntax

- Each line that contains notes is the current voice in the current staff in the current measure. Notes are written in the Lilypond format.
- A new line means "next voice" (not working yet)
- Two new lines (i.e an empty line) means "next staff"
- A line containing "|" means "next measure"
