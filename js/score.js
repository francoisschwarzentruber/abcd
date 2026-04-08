/**
 * a cursor in the staffs and voices (i.e. a staff index & a voice index in that staff)
 */
class Cursor {
    istaff;
    ivoice;

    constructor() {
        this.reset();
    }

    nextStaff() {
        this.istaff++;
        this.ivoice = 0;

    }


    nextVoice() {
        this.ivoice++;
    }

    nextLyrics() { }

    reset() {
        this.istaff = -1;
        this.ivoice = 0;
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
        this.voices.push(new Voice());
        this.voices.push(new Voice());
        this.voices.push(new Voice());
        this.nbMeasureAddedLastTime = 0;
    }

    appendVoice(cursor, data, info) {
        this.nbMeasureAddedLastTime = abcToNbMeasures(data);
        if (cursor.ivoice >= this.voices.length)
            this.voices.push(new Voice());
        this.voices[cursor.ivoice].append(data);

        if (info.instrument)
            this.voices[cursor.ivoice].instrument = info.instrument;
        if (info.muted)
            this.voices[cursor.ivoice].muted = info.muted;

    }


    validate(cursor) {
        for (let i = cursor.ivoice; i < this.voices.length; i++)
            this.voices[i].appendWeak(emptyABCFromNbMeasures(this.nbMeasureAddedLastTime));
    }

    appendLyrics(cursor, lyricsStr) {
        this.voices[0].append("w:" + lyricsStr);
    }

    toStringABCStructure() {
        if (this.voices.length == 1)
            return "V" + this.voices[0].voiceNumber;
        else
            return "(" + this.voices.filter((voice) => !voice.isEmpty).map((voice) => "V" + voice.voiceNumber).join(" ") + ")";
    }
}

/**
 * 
 * @param {*} nbMeasures 
 * @returns a abcd string with empty measures
 * @example emptyABCFromNbMeasures(2) == "   |   |   "
 */
function emptyABCFromNbMeasures(nbMeasures) {
    return "   |  ".repeat(nbMeasures);
}


/**
 * 
 * @param {*} abcdString 
 * @returns the number of measures in abcdString
 * @example abcToNbMeasures("    |    |") == 2
 */
function abcToNbMeasures(abcdString) {
    const abcdString2 = abcdString.replaceAll("||", "|");
    return abcdString2.split("|").length;
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
    appendVoice(cursor, data, info) {
        this.ensureStaffExists(cursor.istaff);
        this.staffs[cursor.istaff].appendVoice(cursor, data, info);
        cursor.nextVoice();
    }


    /**
     * 
     * @param {*} cursor 
     * @param {*} lyricsStr 
     */
    appendLyrics(cursor, lyricsStr) {
        this.ensureStaffExists(cursor.istaff);
        this.staffs[cursor.istaff].appendLyrics(cursor, lyricsStr);
        cursor.nextLyrics();

    }


    validateStaff(cursor) {
        if (cursor.istaff >= 0)
            this.staffs[cursor.istaff].validate(cursor);
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
                if (!voice.isEmpty)
                    if (!voice.muted)
                        lines.push(voice.toStringABC());
        }

        return lines.join('\n');
    }


    toStringABC() {
        return this.scorePreambule.toStringABC() + '\n' + this.getStringABCStructure() + '\n' + this.getStringABCData();
    }


}




/**
 * This class represents a string in which we append a string as a new line at the end
 */
class StringToBeAppended {
    constructor() { this.data = ""; }

    /**
     * @description append newLineString at the end of the string
     * @param {string} newLineString 
     */
    append(newLineString) {
        if (this.data == "")
            this.data = newLineString;
        else this.data += "\n" + newLineString;
    }
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
        if (Voice.NEXTNUMBER == undefined) // internal numbering used in ABC
            Voice.NEXTNUMBER = 0;

        this.voiceNumber = Voice.NEXTNUMBER;
        this.instrument = 0;
        this.muted = false;
        this.isEmpty = true;

        Voice.NEXTNUMBER++;
    }

    /**
     * 
     * @param {*} newData 
     * @description append the data to the voice (the voice is then non-empty)
     */
    append(newData) {
        this.appendWeak(newData);
        this.isEmpty = false;
    }


    /**
     * 
     * @param {*} newData 
     * @description append the data to the voice (the voice is then non-empty)
     */
    appendWeak(newData) {
        if (isStartsWithClefs(newData)) {
            const lastClef = getLastClef(this.data);
            const clef = isStartsWithClefs(newData);
            if (lastClef == clef)
                newData = newData.substr(clef.length);

        }
        this.data += "\n" + newData;
    }

    /**
     * 
     * @returns the last signature in the voice
     * @example returns "4/4"
     */
    getLastTimeSignature() {
        const sign = getLastTimeSignature(this.data);
        if (sign == undefined)
            return undefined;
        return sign.trim();
    }

    toStringABC() {
        function replaceABCDtokensByABCtokens(inputString) {
            let string = inputString;

            string = string.replaceAll(/(?<=\S) /g, ""); //remove a space after a letter different from a space

            return string

        }
        return `V:V${this.voiceNumber}\n`
            + this.instrumentToABC()
            + `[V:V${this.voiceNumber}]`
            + this.data.split("\n").map((line) => {
                if (line.startsWith("w:")) // lyrics
                    return line; // are just rendered as they are
                else
                    return replaceABCDtokensByABCtokens(line);
            }).join('\n');
    }


    instrumentToABC() {
        if (this.instrument)
            return "%%MIDI program " + instrumentToMIDITable[this.instrument] + "\n";
        else
            return "";
    }
}


/**
 * Meta-data of a score (title + composer)
 */
class ScoreMetaData {
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

