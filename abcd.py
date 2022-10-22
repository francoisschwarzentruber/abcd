filename = "example.abcd"


def toScore(lines):
  """
  :param lines, the lines in the .abcd format (our format)
  :return an array that represents the score. That array is an array of measures.
  Each measure is an array of staffs. Each staffs is an array of voices.
  """
  measures = []
  measure = []
  staff = []
  for line in lines:
    if line == "\n" or line == "":
      if len(staff) > 0:
       measure.append(staff)
      staff = []
    elif line == "|\n":
      if len(staff) > 0:
        measure.append(staff)
        staff = []
      measures.append(measure)
      measure = []
    else:
      staff.append(line)
  
  if len(staff) > 0:
    measure.append(staff)
    staff = []
  if len(measure) > 0:
    measures.append(measure)
    measure = []
  return measures


def toLilypond(lines):
     """
     :param lines in the .abcd format
     :return lines in the lilypond format
     """
     measures = toScore(lines)
     #print(measures)
     voice1 = ' '.join(map(lambda m: m[0][0],measures))
     voice2 = ' '.join(map(lambda m: m[1][0],measures))
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
     




def abcdFileToPdf(filename):
  """
  :param filename of the file in the .abcd to produce
  :effect create a pdf
  """
  file = open(filename, "r")

  lines = file.readlines()
  file.close()


  lilePondCode = toLilypond(lines)

  lilyFile = open("tmp.ly", "w")
  lilyFile.writelines(lilePondCode)
  lilyFile.close()

  import os
  os.system("lilypond tmp.ly")


abcdFileToPdf(filename)