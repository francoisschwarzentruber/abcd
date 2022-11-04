class Voice {

    data = ""
    lyrics = ""

    add(data) { this.data += data; }
    addLyrics(lyrics) { this.lyrics += lyrics }
}



class Staff {
    voices = [];
    isStartGroup = false;
    isEndGroup = false;

    setStartGroup() {
        this.isStartGroup = true;
    }


    setEndGroup() {
        this.isEndGroup = true;
    }

}

class Score {
    staffs = [];
    /*
        :istaff the number of the staff in which we will add data
        :ivoice the number of the voice in that staff
        :data string in the Lilypond format
        */

    currentTimeSignature = { a: 4, b: 4 };


    getLilypondInvisibleRest() {
        if (this.currentTimeSignature.a / this.currentTimeSignature.b == 3 / 4)
            return "s2.";
        if (this.currentTimeSignature.a / this.currentTimeSignature.b == 1)
            return "s1";
        if (this.currentTimeSignature.a / this.currentTimeSignature.b == 2 / 4)
            return "s2";
        return "";
    }

    add(istaff, ivoice, data) {
        const ts = extractTimeSignature(data);
        if (ts) {
            this.currentTimeSignature = ts;
            console.log("time signature: " + ts.a + "/" + ts.b);
        }

        data = insertInvisibleRests(data, this.getLilypondInvisibleRest());

        if (this.staffs.length - 1 < istaff)
            this.staffs.push(new Staff())

        if (this.staffs[istaff].voices.length - 1 < ivoice)
            this.staffs[istaff].voices.push(new Voice())

        this.staffs[istaff].voices[ivoice].add(data)

    }


    addToAllVoices(data) {
        for (const staff of this.staffs)
            for (const voice of staff.voices)
                voice.add(data);
    }

    addLyrics(istaff, ivoice, lyrics) {
        this.staffs[istaff].voices[ivoice].addLyrics(lyrics)
    }

}



function insertInvisibleRests(s, lilypondInvisibleRest) {
    function isOnlySpaces(str) {
        return str.trim().length === 0;
    }
    return s.split("|").map(measure => isOnlySpaces(measure) ? lilypondInvisibleRest : measure).join("|")
}


/*  :param lines, the lines in the.abcd format(our format)
  : return an array that represents the score.That array is an array of measures.
  Each measure is an array of staffs.Each staffs is an array of voices.
*/
function toScore(lines) {

    const score = new Score()

    let istaff = 0
    let ivoice = 0
    let sthAdded = false;
    let istaffBeginGroup = false;

    for (const line of lines.map((s) => s.trim()))

        if (line == "") {
            if (sthAdded) {
                istaff += 1;
                ivoice = 0;
                sthAdded = false;
            }
        }
        else if (line == "|") {
            score.addToAllVoices("|");
            sthAdded = false;
            istaff = 0
            ivoice = 0
        }
        else if (line == "||") {
            score.addToAllVoices(' \\bar "||" ');
            sthAdded = false;
            istaff = 0
            ivoice = 0
        }
        else if (line == "{") {
            istaffBeginGroup = true;
        }
        else if (line == "}") {
            score.staffs[istaff].setEndGroup();
        }
        else if (line.startsWith("💬") || line.startsWith("😀"))
            score.addLyrics(istaff, ivoice - 1, line.substr(2))
        else {
            if (line.startsWith("𝄞") || line.startsWith("𝄢")) {
                if (sthAdded) {
                    istaff += 1
                    ivoice = 0
                }
            }

            score.add(istaff, ivoice, line)
            if (istaffBeginGroup) {
                score.staffs[istaff].setStartGroup();
                istaffBeginGroup = false;
            }
            sthAdded = true;
            ivoice += 1

        }

    return score

}


function extractTimeSignature(s) {
    for (const a of [1, 2, 3, 4, 5, 6, 7, 8, 9, 12])
        for (const b of [2, 4, 8, 16])
            if (s.indexOf(`${a}/${b}`) >= 0)
                return { a, b };
    return undefined;
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

    function toLilypondStaff(istaff, staff) {
        let s = `\\new Staff = "staff${istaff}" <<\n`
        for (const voice of staff.voices)
            s += toLilypondVoice(voice) + "\n"
        s += ">>\n"

        return s
    }

    function toLilypondScore(score) {
        let s = '\n\\version "2.23.4"\n \\new Score <<\n';

        for (let istaff = 0; istaff < score.staffs.length; istaff++) {
            const staff = score.staffs[istaff];

            if (staff.isStartGroup)
                s += '\\new PianoStaff <<\n'
            s += toLilypondStaff(istaff, staff) + "\n";
            if (staff.isEndGroup)
                s += ">>\n"; //end new PianoStaff

        }

        s += ">>\n"; //end score
        return s
    }

    score = toScore(lines)

    return toLilypondScore(score)

}


function abcd2ly(s) {
    return toLilypond(s.split("\n"))
}