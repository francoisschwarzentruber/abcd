# abcd
A super simple ASCII format to represent music scores. It compiles to a Lilypond file and then run the Lilypond engraver.

# Example

A file containing 

        c4 d4 e2
        
        c2    g2
        
produces the score

![image](https://user-images.githubusercontent.com/43071857/197363869-fbe713cb-f3e3-4ec0-9f05-6310b4e76518.png)


 
# Syntax

- Each line that contains notes is the current voice in the current staff in the current measure
- A new line means "next voice" (not working yet)
- Two new lines (i.e an empty line) means "next staff"
- A line containing "|" means "next measure"
