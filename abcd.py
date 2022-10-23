from re import S


filename = "example.abcd"


class Score:
  def __init__(self):
    self.staffs = []

  def add(self, istaff, ivoice, data):
    """
    :istaff the number of the staff in which we will add data
    :ivoice the number of the voice in that staff
    :data string in the Lilypond format
    """
    if len(self.staffs) - 1 < istaff:
      self.staffs.append([])

    if len(self.staffs[istaff]) - 1 < ivoice:
      self.staffs[istaff].append("")

    self.staffs[istaff][ivoice] += data



def toScore(lines):
  """
  :param lines, the lines in the .abcd format (our format)
  :return an array that represents the score. That array is an array of measures.
  Each measure is an array of staffs. Each staffs is an array of voices.
  """

  score = Score()

  istaff = 0
  ivoice = 0
  sthAdded = False

  for line in lines:
    if line == "":
      if sthAdded:
          istaff += 1
          ivoice = 0
    elif line == "|":
      sthAdded = False
      istaff = 0
      ivoice = 0
    else:
      score.add(istaff, ivoice, line)
      sthAdded = True
      ivoice += 1

  return score



def toLilypond(lines):
     """
     :param lines in the .abcd format
     :return lines in the lilypond format
     """



     def toLilypondVoice(voice):
          return '\\new Voice  = "miaou" { ' + voice.replace("𝄢", "\\clef bass").replace("𝄞", "\\clef treble") + "} \n"


     def toLilypondStaff(staff):
      s = "\\new Staff <<\n"
      for voice in staff:
            s += toLilypondVoice(voice) + "\n"
      s += ">>\n"

      return s

     def toLilypondScore(score):
      s = "\\new Score <<\n"
      for staff in score.staffs:
            s += toLilypondStaff(staff) + "\n"
      s += ">>"
      return s


     score = toScore(lines)
     print(score.staffs)

     return toLilypondScore(score)
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
  lines = map(lambda line: line.replace("\n", "") , file.readlines())
  file.close()

  lilePondCode = toLilypond(lines)

  lilyFile = open("tmp.ly", "w")
  lilyFile.writelines(lilePondCode)
  lilyFile.close()

  import os
  os.system("lilypond tmp.ly")


abcdFileToPdf(filename)