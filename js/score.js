/**
 * information about a staff, i.e. five lines to write music on it
 * 
 * --------
 * --------
 * --------
 * --------
 * --------
 * 
 * This class just stores the information about the structure of the contents (number of voices in that staff)
 */
class StaffStructure {
    constructor() {
        this.isStartGroup = false;
        this.isEndGroup = false;
        this.voices = [];
    }

    addVoice(i) { this.voices.push(i); }

    toStringABC() {
        if (this.voices.length == 1)
            return "V" + this.voices[0];
        else return "(" + this.voices.map((i) => "V" + i).join(" ") + ")";
    }
}


/**
 * information about the structure of the score, i.e. the number of staffs + the stru
 */
class ScoreStructure {
    constructor() { this.staffs = []; }

    addVoice(i) {
        if (this.staffs.length == 0 || (!this.staffs[this.staffs.length - 1] instanceof StaffStructure))
            newStaff();

        this.staffs[this.staffs.length - 1].addVoice(i);
    }

    /**
     * @description add a new staff if it does not finish with an empty staff
     */
    newStaff() {
        if (this.staffs.length == 0 ||
            !(this.staffs[this.staffs.length - 1] instanceof StaffStructure)
            || this.staffs[this.staffs.length - 1].voices.length > 0)
            this.staffs.push(new StaffStructure());
    }

    /**
     * 
     * @param symbol 
     * @effect add a "symbol", e.g.'{' = beginning of a group, '}' = end of a group
     */
    addStaffSymbol(symbol) {
        if (this.staffs.length == 0)
            this.staffs.push(symbol);
        else if (!(this.staffs[this.staffs.length - 1] instanceof StaffStructure))
            this.staffs.push(symbol);

        else if (this.staffs[this.staffs.length - 1].voices.length == 0)
            this.staffs[this.staffs.length - 1] = symbol; //cancel the empty staff
        else
            this.staffs.push(symbol);
    }

    toStringABC() {
        let scoreExpression = "%%score ";

        for (const staff of this.staffs) {
            if (staff instanceof StaffStructure)
                scoreExpression += staff.toStringABC() + " ";
            else
                scoreExpression += staff; //symbol like '{' or '}'
        }
        return scoreExpression;
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

class VoiceData {

    constructor(i, data, instrument) {
        this.i = i;
        this.data = data;
        this.instrument = instrument;
        this.lyrics = [];
    }


    addLyrics(lyric) { this.lyrics.push(lyric); }

    toStringABC() {
        const data = strToArrayOfLines(this.data);
        const lyrics = this.lyrics.map(strToArrayOfLines);

        let A = [];
        while (!(data.length == 0 && lyrics.every((l) => l.length == 0))) {
            if (data.length > 0) A.push(data.shift());
            for (const l of lyrics) if (l.length > 0) A.push("w:" + l.shift());
        }

        return `V:V${this.i}\n` + this.instrumentToABC() + `[V:V${this.i}]` + A.join("\n");
    }


    instrumentToABC() {
        if (this.instrument)
            return "%%MIDI program " + instrumentToMIDITable[this.instrument] + "\n";
        else
            return "";
    }
}


class ScoreData {
    constructor() {
        this.voices = [];
        this.currentVoice = undefined;
    }
    addVoice(i, data, instrument) { this.currentVoice = new VoiceData(i, data, instrument); this.voices.push(this.currentVoice); }
    addLyrics(lyrics) { this.currentVoice.addLyrics(lyrics); }

    toStringABC() { return this.voices.map((v) => v.toStringABC()).join("\n"); }
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
        return abcLines.join("/n");
    }
}

class Score {
    scoreData;
    scoreStructure;
    scorePreambule;


    toStringABC() {
        return this.scorePreambule.toStringABC() + '\n' + this.scoreStructure.toStringABC() + '\n' + this.scoreData.toStringABC();
    }
}