class Voice {

    data = ""
    lyrics = ""

    add(data) { this.data += data; }
    addLyrics(lyrics) { this.lyrics += lyrics }
}


class Score {
    staffs = [];
    /*
        :istaff the number of the staff in which we will add data
        :ivoice the number of the voice in that staff
        :data string in the Lilypond format
        */

    add(istaff, ivoice, data) {

        if (this.staffs.length - 1 < istaff)
            this.staffs.push([])

        if (this.staffs[istaff].length - 1 < ivoice)
            this.staffs[istaff].push(new Voice())

        this.staffs[istaff][ivoice].add(data)

    }


    addLyrics(istaff, ivoice, lyrics) {
        this.staffs[istaff][ivoice].addLyrics(lyrics)
    }

}


/*  :param lines, the lines in the.abcd format(our format)
  : return an array that represents the score.That array is an array of measures.
  Each measure is an array of staffs.Each staffs is an array of voices.
*/
function toScore(lines) {

    const score = new Score()

    let istaff = 0
    let ivoice = 0
    let sthAdded = false

    for (const line of lines.map((s) => s.trim()))

        if (line == "") {
            if (sthAdded) {
                istaff += 1
                ivoice = 0
            }
        }
        else if (line == "|") {
            sthAdded = false
            istaff = 0
            ivoice = 0
        }
        else if (line.startsWith("💬") || line.startsWith("😀"))
            score.addLyrics(istaff, ivoice - 1, line.substr(2))
        else {
            score.add(istaff, ivoice, line)
            sthAdded = true
            ivoice += 1

        }

    return score

}





/*
:param lines in the.abcd format
: return strings in the lilypond format
*/
function toLilypond(lines) {

    let voiceNumber = 0;


    function replaceForLilypond(text) {
        s = text
        s = s.replaceAll(" ♯ ", " \\key g \\major ");
        s = s.replaceAll(" ♯♯ ", " \\key d \\major ");
        s = s.replaceAll(" ♯♯♯ ", " \\key a \\major ");
        s = s.replaceAll(" ♯♯♯♯ ", " \\key e \\major ");
        s = s.replaceAll(" ♯♯♯♯♯ ", " \\key b \\major ");
        s = s.replaceAll(" ♯♯♯♯♯♯ ", " \\key fis \\major ");
        s = s.replaceAll(" ♯♯♯♯♯♯♯ ", " \\key cis \\major ");
        s = s.replaceAll(" ♭ ", " \\key f \\major ");
        s = s.replaceAll(" ♭♭ ", " \\key bes \\major ");
        s = s.replaceAll(" ♭♭♭ ", " \\key ees \\major ");
        s = s.replaceAll(" ♭♭♭♭ ", " \\key aes \\major ");
        s = s.replaceAll(" ♭♭♭♭♭ ", " \\key des \\major ");
        s = s.replaceAll(" ♭♭♭♭♭♭ ", " \\key ges \\major ");
        s = s.replaceAll(" ♭♭♭♭♭♭♭ ", " \\key ces \\major ");




        s = s.replaceAll("♭", "es")
        s = s.replaceAll("#", "is")
        s = s.replaceAll("♯", "is")
        s = s.replaceAll("𝄢", "\\clef bass")
        s = s.replaceAll("𝄞", "\\clef treble")
        s = s.replaceAll("3/4", "\\time 3/4")
        s = s.replaceAll("2/4", "\\time 2/4")
        s = s.replaceAll("4/4", "\\time 4/4")
        s = s.replaceAll("6/8", "\\time 6/8")

        return s
    }

    function toLilypondVoice(voice) {
        voiceNumber += 1
        voiceName = "v" + voiceNumber
        s = '\\new Voice  = "' + voiceName + '" { ' + replaceForLilypond(voice.data) + "} \n"

        if (voice.lyrics != "")
            s += '\\new Lyrics \\lyricsto "' + voiceName + '" {\n ' + voice.lyrics + "\n}"

        return s

    }

    function toLilypondStaff(staff) {
        let s = "\\new Staff <<\n"
        for (const voice of staff)
            s += toLilypondVoice(voice) + "\n"
        s += ">>\n"

        return s
    }

    function toLilypondScore(score) {
        let s = "\\new Score <<\n"
        for (const staff of score.staffs)
            s += toLilypondStaff(staff) + "\n"
        s += ">>"
        return s
    }

    score = toScore(lines)
    console.log(score.staffs)

    return toLilypondScore(score)

}


function abcd2ly(s) {
    return toLilypond(s.split("\n"))
}