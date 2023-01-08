class Voice {

    data = "";
    lyrics = "";
    empty = false;

    add(data) { this.data += data; this.empty = false; }

    get isEmpty() { return this.empty }
    addEmptyData(data) { this.data += data; }
    addLyrics(lyrics) { this.lyrics += lyrics }
}



class Staff {
    voices = [new Voice(), new Voice(), new Voice(), new Voice()];
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
                voice.addEmptyData(data);
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

    const score = new Score();

    let istaff = 0
    let ivoice = 0
    let sthAdded = false;
    let istaffBeginGroup = false;

    /**
     * 
     * @param {*} str
     * @description add str to all voices 
     */
    function addToAllVoices(str) {
        score.addToAllVoices(str);
        sthAdded = false;
        istaff = 0
        ivoice = 0
    }

    /**
     * @description pass to the next staff
     */
    function nextStaff() {

        for (let iv = ivoice; iv < score.staffs[istaff].voices.length; iv++)
            score.staffs[istaff].voices[iv].addEmptyData(score.getLilypondInvisibleRest());

        istaff += 1;
        ivoice = 0;
    }

    for (const line of lines.map((s) => s.trim()))
        if (line == "") {
            if (sthAdded) {
                nextStaff();
                sthAdded = false;
            }
        }
        else if (line == "|")
            addToAllVoices("|");
        else if (line == "||")
            addToAllVoices(' \\bar "||" ');
        else if (line == "||:" || line == "|:")
            addToAllVoices(' \\bar ".|:" ');
        else if (line == ":||" || line == ":|")
            addToAllVoices(' \\bar ":|." ');
        else if (line == ":||:" || line == ":|:")
            addToAllVoices(' \\bar ":..:" ');
        else if (line == "{")
            istaffBeginGroup = true;
        else if (line == "}") {
            score.staffs[istaff].setEndGroup();
        }
        else if (line.startsWith("💬") || line.startsWith("😀"))
            score.addLyrics(istaff, ivoice - 1, line.substr(2))
        else if (line.startsWith("♩=")) {
            const tempo = parseInt(line.substr(2));
            score.add(istaff, ivoice, `\\tempo 4 = ${tempo}\n`);
        }
        else {
            if (line.startsWith("𝄞") || line.startsWith("𝄢")) {
                if (sthAdded)
                    nextStaff();
            }

            score.add(istaff, ivoice, line)
            if (istaffBeginGroup) {
                score.staffs[istaff].setStartGroup();
                istaffBeginGroup = false;
            }
            sthAdded = true;
            ivoice += 1

        }

    addToAllVoices(' \\bar "|."');
    return score;

}

/**
 * 
 * @param {*} str 
 * @returns the time signature written in str (or undefined if there is no time signature in it)
 */
function extractTimeSignature(str) {
    for (const a of [1, 2, 3, 4, 5, 6, 7, 8, 9, 12])
        for (const b of [2, 4, 8, 16])
            if (str.indexOf(`${a}/${b}`) >= 0)
                return { a, b };
    return undefined;
}


/*
:param lines in the.abcd format
: return strings in the lilypond format
*/
function toLilypond(lines) {

    let voiceNumber = 0; //current index of a voice

    function replaceForLilypond(text) {
        s = text

        function accidentalsSurroundedBySpace(accident, n) { return " " + accident.repeat(n) + " "; }

        for (const sharp of ["#", "♯"]) {
            s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 1), " \\key g \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 2), " \\key d \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 3), " \\key a \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 4), " \\key e \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 5), " \\key b \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 6), " \\key fis \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 7), " \\key cis \\major ");

        }
        for (const flat of ["♭", "b"]) {
            s = s.replaceAll(accidentalsSurroundedBySpace(flat, 1), " \\key f \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(flat, 1), " \\key bes \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(flat, 1), " \\key ees \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(flat, 1), " \\key aes \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(flat, 1), " \\key des \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(flat, 1), " \\key ges \\major ");
            s = s.replaceAll(accidentalsSurroundedBySpace(flat, 1), " \\key ces \\major ");
        }


        s = s.replaceAll("♭", "es")
        s = s.replaceAll("#", "is")
        s = s.replaceAll("♯", "is")
        s = s.replaceAll("𝄢", "\\clef bass")
        s = s.replaceAll("𝄞", "\\clef treble")

        for (const timeSignature of ["2/2", "2/4", "3/4", "3/8", "4/4", "6/4", "6/8"])
            s = s.replaceAll(timeSignature, "\\time " + timeSignature);

        return s
    }


    /**
     * 
     * @param {*} voice 
     * @returns the code of the voice
     */
    function toLilypondVoice(voice) {
        voiceNumber += 1
        voiceName = "v" + voiceNumber;
        s = '\\new Voice  = "' + voiceName + `"  { ` + replaceForLilypond(voice.data) + "} \n"

        if (voice.lyrics != "")
            s += '\\new Lyrics \\lyricsto "' + voiceName + '" {\n ' + voice.lyrics + "\n}"

        return s

    }

    /**
     * 
     * @param {*} istaff 
     * @param {*} staff 
     * @returns the lilypond code of the staff
     */
    function toLilypondStaff(istaff, staff) {
        let s = `\\new Staff = "staff${istaff}" <<\n`
        for (const voice of staff.voices)
            if (!voice.isEmpty)
                s += toLilypondVoice(voice) + "\n"
        s += ">>\n"

        return s
    }

    /**
     * 
     * @param {*} score 
     * @returns the lilypond code for the score
     */
    function toLilypondScore(score) {
        console.log("number of staffs: " + score.staffs.length);
        let s = '\n\\version "2.23.4"\n \\score {\n <<';
        for (let istaff = 0; istaff < score.staffs.length; istaff++) {
            const staff = score.staffs[istaff];

            if (staff.isStartGroup)
                s += '\\new PianoStaff <<\n'
            s += toLilypondStaff(istaff, staff) + "\n";
            if (staff.isEndGroup)
                s += ">>\n"; //end new PianoStaff

        }
        s += ">>\n \\layout{} \n \\midi{} \n";
        s += "}\n"; //end score
        return s
    }

    const score = toScore(lines)

    return toLilypondScore(score)

}


function abcd2ly(s) { return toLilypond(s.split("\n")) }