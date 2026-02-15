/**
 * a cursor in the staffs and voices (i.e. a staff index & a voice index in that staff)
 */
class Cursor {
    istaff;
    ivoice;
    ilyrics;

    constructor() {
        this.reset();
    }

    nextStaff() {
        this.istaff++;
        this.ivoice = 0;
        this.ilyrics = 0;

    }


    nextVoice() {
        this.ivoice++;
    }

    nextLyrics() {
        this.ilyrics++;
    }

    reset() {
        this.istaff = -1;
        this.ivoice = 0;
        this.ilyrics = 0;
    }
}


/**
 * information about a staff, i.e. five lines to write music on it
 * 
 * --------
 * --------
 * --------
 * --------
 * --------
 * 
 * This class stores information about the staff + its content
 */
class Staff {
    constructor() {
        this.symbolBeginning = "";
        this.symbolEnding = "";
        this.voices = [];
        this.voices.push(new Voice());
        this.lyrics = [];
    }

    appendVoice(cursor, data) {
        if (cursor.ivoice >= this.voices.length)
            this.voices.push(new Voice());

        this.voices[cursor.ivoice].append(data);

    }

    appendLyrics(cursor, data) {
        if (cursor.ilyrics >= this.lyrics.length)
            this.lyrics.push(new Lyrics());

        this.lyrics[cursor.ilyrics].append(data);

    }

    toStringABCStructure() {
        if (this.voices.length == 1)
            return "V" + this.voices[0].voiceNumber;
        else return "(" + this.voices.map((voice) => "V" + voice.voiceNumber).join(" ") + ")";
    }
}


/**
 * content of the score (structure + data)
 */
class Score {

    scorePreambule;

    constructor() { this.staffs = []; }


    ensureStaffExists(istaff) {
        if (istaff >= this.staffs.length)
            this.staffs.push(new Staff());
    }
    appendVoice(cursor, data) {
        this.ensureStaffExists(cursor.istaff);
        this.staffs[cursor.istaff].appendVoice(cursor, data);
        cursor.nextVoice();
    }

    appendLyrics(cursor, data) {
        this.ensureStaffExists(cursor.istaff);
        this.staffs[cursor.istaff].appendLyrics(cursor, data);
        cursor.nextLyrics();

    }


    getLastTimeSignature(cursor) {
        this.ensureStaffExists(cursor.istaff);
        return this.staffs[cursor.istaff].voices[0].getLastTimeSignature();
    }

    /**
     * 
     * @param symbol 
     * @effect add a "symbol", e.g.'{' = beginning of a group, '}' = end of a group
     */
    setStaffSymbol(cursor, symbol) {
        if (symbol == '{' || symbol == '[') {
            this.ensureStaffExists(cursor.istaff + 1);
            this.staffs[cursor.istaff + 1].symbolBeginning = symbol;
        }
        else
            this.staffs[cursor.istaff].symbolEnding = symbol;
    }

    getStringABCStructure() {
        let scoreExpression = "%%score ";

        for (const staff of this.staffs)
            scoreExpression += staff.symbolBeginning + " " + staff.toStringABCStructure() + " " + staff.symbolEnding;

        return scoreExpression;
    }



    getStringABCData() {
        const lines = [];

        for (const staff of this.staffs) {
            for (const voice of staff.voices)
                lines.push(voice.toStringABC());
            for (const lyrics of staff.lyrics)
                lines.push(lyrics.toStringABC());
        }

        return lines.join('\n');
    }


    toStringABC() {
        return this.scorePreambule.toStringABC() + '\n' + this.getStringABCStructure() + '\n' + this.getStringABCData();
    }


}





class StringToBeAppended {
    constructor() {
        this.data = "";
    }

    append(newData) { this.data += "\n" + newData; }
}



class Lyrics extends StringToBeAppended {
    toStringABC() { return "w: " + this.data; }
}


/**
 * @param {*} abcdString
 * @returns the last thing from array appearing in the abcdString 
 * @example getLastClef("𝄞 a a 𝄢 a", ["𝄞", "𝄢"]) == "𝄢"
 * @example getLastClef("𝄞 a a a", ["𝄞", "𝄢"]) == "𝄞"
 */
function getLastThing(abcdString, array) {
    const positions = array.map((clef) => abcdString.lastIndexOf(clef));
    const pos = Math.max(...positions);
    if (pos == -1)
        return undefined;

    const i = positions.indexOf(pos);
    return array[i];
}



/**
 * @param {*} abcdString
 * @returns the last clef appearing in the voice 
 * @example getLastClef("𝄞 a a 𝄢 a") == "𝄢"
 * @example getLastClef("𝄞 a a a") == "𝄞"
 */
function getLastClef(abcdString) { return getLastThing(abcdString, abcdStringClefs); }
function getLastTimeSignature(abcdString) { return getLastThing(abcdString, abcdStringTimeSignature.map(sign => " " + sign)); }


class Voice extends StringToBeAppended {
    constructor() {
        super();
        if (Voice.NEXTNUMBER == undefined)
            Voice.NEXTNUMBER = 0;

        this.voiceNumber = Voice.NEXTNUMBER;
        Voice.NEXTNUMBER++;
    }


    append(newData) {
        if (isStartsWithClefs(newData)) {
            const lastClef = getLastClef(this.data);
            const clef = isStartsWithClefs(newData);
            if (lastClef == clef)
                newData = newData.substr(clef.length);

        }
        this.data += "\n" + newData;
    }

    getLastTimeSignature() {
        const sign = getLastTimeSignature(this.data);
        if (sign == undefined)
            return undefined;
        return sign.trim();
    }

    toStringABC() {

        function replaceABCDtokensByABCtokens(string) {
            string = string.replaceAll("𝄢", "[K:bass]");
            string = string.replaceAll("𝄞8", "[K:treble-8]");
            string = string.replaceAll("𝄞-8", "[K:treble-8]");
            string = string.replaceAll("𝄞+8", "[K:treble+8]");
            string = string.replaceAll("𝄞", "[K:treble]");
            string = string.replaceAll("/ ", "/");


            function accidentalsSurroundedBySpace(accident, n) { return " " + accident.repeat(n) + " "; }

            string = string.replaceAll(" ♮ ", " [K:Cmaj]");

            for (const sharp of ["#", "♯"]) {
                string = string.replaceAll(accidentalsSurroundedBySpace(sharp, 1), " [K:Gmaj]");
                string = string.replaceAll(accidentalsSurroundedBySpace(sharp, 2), " [K:D]");
                string = string.replaceAll(accidentalsSurroundedBySpace(sharp, 3), " [K:A]");
                string = string.replaceAll(accidentalsSurroundedBySpace(sharp, 4), " [K:E]");
                string = string.replaceAll(accidentalsSurroundedBySpace(sharp, 5), " [K:B]");
                string = string.replaceAll(accidentalsSurroundedBySpace(sharp, 6), " [K:F#maj]");
                string = string.replaceAll(accidentalsSurroundedBySpace(sharp, 7), " [K:C#maj]");
            }
            for (const flat of ["♭", "b"]) {
                if (flat == "♭")
                    string = string.replaceAll(accidentalsSurroundedBySpace(flat, 1), " [K:F] ");
                string = string.replaceAll(accidentalsSurroundedBySpace(flat, 2), "[K:Bb]");
                string = string.replaceAll(accidentalsSurroundedBySpace(flat, 3), " [K:Eb] ");
                string = string.replaceAll(accidentalsSurroundedBySpace(flat, 4), " [K:Ab] ");
                string = string.replaceAll(accidentalsSurroundedBySpace(flat, 5), " [K:Db] ");
                string = string.replaceAll(accidentalsSurroundedBySpace(flat, 6), " [K:Gb] ");
                string = string.replaceAll(accidentalsSurroundedBySpace(flat, 7), " [K:Cb] ");
            }

            return string
        }
        return `V:V${this.voiceNumber}\n` + this.instrumentToABC() + `[V:V${this.voiceNumber}]` + replaceABCDtokensByABCtokens(this.data);
    }


    instrumentToABC() {
        if (this.instrument)
            return "%%MIDI program " + instrumentToMIDITable[this.instrument] + "\n";
        else
            return "";
    }
}



class ScorePreambule {
    constructor() {
        this.title = "Write the title at the top of the code";
        this.composer = "Composer follows the title";
    }

    toStringABC() {
        const abcLines = [];
        abcLines.push("X:1");
        abcLines.push("L:1/4");
        abcLines.push("I:linebreak <none>"); //no linebreak explicitely specified in the code 
        abcLines.push("%%propagate-accidentals pitch");
        abcLines.push("%%writeout-accidentals none");
        abcLines.push("%%barnumbers 1");
        abcLines.push("T:" + this.title);//
        abcLines.push("C:" + this.composer);
        return abcLines.join("\n");
    }
}

