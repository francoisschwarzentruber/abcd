filename = "example.abcd"
file = open(filename, "r")

lines = file.readlines()
file.close()


def toLilypond(lines):
     voice1 = lines[0]
     voice2 = lines[1]
     lilyLines = """upper = \\relative c'' {
  \\clef treble
  \\key c \\major
  \\time 4/4
""" + voice1 + """
}

lower = \\relative c {
  \\clef bass
  \\key c \\major
  \\time 4/4
""" + voice2 + """
}

\\score {
  \\new PianoStaff \\with { instrumentName = "Piano" }
  <<
    \\new Staff = "upper" \\upper
    \\new Staff = "lower" \\lower
  >>
  \\layout { }
  \\midi { }
}
"""
     return lilyLines
     

lilePondCode = toLilypond(lines)

lilyFile = open("tmp.ly", "w")
lilyFile.writelines(lilePondCode)
lilyFile.close()

import os
os.system("lilypond tmp.ly");
