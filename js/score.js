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
        console.log(this)
        return this.scorePreambule.toStringABC() + '\n' + this.getStringABCStructure() + '\n' + this.getStringABCData();
    }


}

function strToArrayOfLines(str) {
    const measures = str.split("|");
    const A = [];
    while (measures.length > 0) {
        let B = [];
        for (let i = 0; i < 4; i++) {
            if (measures.length > 0)
                B.push(measures.shift());
        }
        A.push(B.join("|") + (measures.length > 0 ? "|" : ""))
    }
    return A;
}



class StringToBeAppended {
    constructor() {
        this.data = "";
    }

    append(newData) { this.data += newData; }
}



class Lyrics extends StringToBeAppended {
    toStringABC() { return "w: " + this.data; }
}


class Voice extends StringToBeAppended {
    constructor() {
        super();
        if (Voice.NEXTNUMBER == undefined)
            Voice.NEXTNUMBER = 0;

        this.voiceNumber = Voice.NEXTNUMBER;
        Voice.NEXTNUMBER++;
    }

    toStringABC() {
        const data = strToArrayOfLines(this.data);

        return `V:V${this.voiceNumber}\n` + this.instrumentToABC() + `[V:V${this.voiceNumber}]` + data;
    }


    instrumentToABC() {
        if (this.instrument)
            return "%%MIDI program " + instrumentToMIDITable[this.instrument] + "\n";
        else
            return "";
    }
}



class ScorePreambule {
    title;
    composer;

    toStringABC() {
        const abcLines = [];
        abcLines.push("X:1");
        abcLines.push("L:1/4");
        abcLines.push("I:linebreak <none>"); //no linebreak explicitely specified in the code 
        abcLines.push("%%propagate-accidentals not");
        abcLines.push("%%barnumbers 1");
        abcLines.push("T:" + this.title);//
        abcLines.push("C:" + this.composer);
        return abcLines.join("\n");
    }
}

