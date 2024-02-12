const instrumentToMIDITable = {
    "piano": 1,
    "harpsichord": 7,
    "clavinet": 8,
    "celesta": 9,
    "glockenspiel": 10,
    "vibraphone": 12,
    "marimba": 13,
    "xylophone": 14,
    "guitar": 25,
    "violin": 41,
    "viola": 42,
    "cello": 43,
    "contrabass": 44,
    "trumpet": 57,
    "trombone": 58,
    "tuba": 59,
    "oboe": 69,
    "bassoon": 71,
    "clarinet": 72,
    "piccolo": 73,
    "flute": 74,
    "recorder": 75,
    "whistle": 79,
    "ocarina": 80
}

//if not present, by default it is 𝄞
const instrumentToStandardKey = {
    "cello": "𝄢"
}



function isTimeSignature(str) {
    return ["1/2", "1/4", "2/2", "2/4", "3/4", "5/4", "7/4", "3/8", "4/4", "6/4", "6/8", "12/8"].indexOf(str) >= 0;
}

class Staff {
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

class ScoreStructure {
    constructor() {
        this.staffs = [];
    }

    addVoice(i) {
        if (this.staffs.length == 0 || (!this.staffs[this.staffs.length - 1] instanceof Staff))
            newStaff();

        this.staffs[this.staffs.length - 1].addVoice(i);
    }

    /**
     * @description add a new staff if it does not finish with an empty staff
     */
    newStaff() {
        if (this.staffs.length == 0 ||
            !(this.staffs[this.staffs.length - 1] instanceof Staff)
            || this.staffs[this.staffs.length - 1].voices.length > 0)
            this.staffs.push(new Staff());
    }


    addStaffSymbol(symbol) {
        if (this.staffs.length == 0)
            this.staffs.push(symbol);
        else if (!(this.staffs[this.staffs.length - 1] instanceof Staff))
            this.staffs.push(symbol);

        else if (this.staffs[this.staffs.length - 1].voices.length == 0)
            this.staffs[this.staffs.length - 1] = symbol; //cancel the empty staff
        else
            this.staffs.push(symbol);
    }

    toStringABC() {
        let scoreExpression = "%%score ";

        for (const staff of this.staffs) {
            if (staff instanceof Staff)
                scoreExpression += staff.toStringABC() + " ";
            else
                scoreExpression += staff; //symbol
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

class Voice {

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
    addVoice(i, data, instrument) { this.currentVoice = new Voice(i, data, instrument); this.voices.push(this.currentVoice); }
    addLyrics(lyrics) { this.currentVoice.addLyrics(lyrics); }

    toStringABC() { return this.voices.map((v) => v.toStringABC()).join("\n"); }
}

function isStaffLine(line) {
    if (line.startsWith("𝄞") || line.startsWith("𝄢"))
        return { content: line };

    const words = line.split(" ");
    const firstWord = words[0].toLowerCase();
    let content = words.splice(1).join(" ").trim();

    if (instrumentToMIDITable[firstWord] != undefined) {
        if (!(content.startsWith("𝄞") || content.startsWith("𝄢")))
            content = (instrumentToStandardKey[firstWord] ? instrumentToStandardKey[firstWord] : "𝄞") + " " + content;
        return { instrument: firstWord, content };
    }
    return false;
}


/**
 * 
 * @returns true if line is of the form "flute {" or "piano   {   "
 */
function isStaffInstrumentAndOpenCurlyBracket(line) {
    const words = line.split(" ");
    const firstWord = words[0].toLowerCase();
    const content = words.splice(1).join(" ").trim();

    if (content == "{" && instrumentToMIDITable[firstWord] != undefined)
        return { instrument: firstWord };

    return false;
}

async function abcd2abc(abcd) {
    const abc = [];
    abc.push("X:1");
    abc.push("L:1/4");
    abc.push("I:linebreak <none>"); //no linebreak explicitely specified in the code 
    abc.push("%%propagate-accidentals not");

    abc.push("%%score "); // to be modified after the abcd code has been analyzed
    const iScoreInABC = abc.length - 1;

    const lines = abcd.split("\n");

    let i = 0;
    for (; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line != "") {
            if (isStaffLine(line))
                break;
            if (i == 0)
                abc.push("T:" + line);//title
            else {
                abc.push("C:" + line);//composer
                i++;
                break;
            }
        }
    }

    let scoreStructure = new ScoreStructure();
    let scoreData = new ScoreData();
    let currentInstrument = undefined;

    for (; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line.split("|").every((m) => m.trim() == "")) {
            scoreStructure.newStaff();
        }
        else if (isStaffInstrumentAndOpenCurlyBracket(line)) {
            const infoStaff = isStaffInstrumentAndOpenCurlyBracket(line);
            currentInstrument = infoStaff.instrument;
            scoreStructure.addStaffSymbol("{");
        }
        else if (["[", "]", "{", "}"].indexOf(line) >= 0) {
            scoreStructure.addStaffSymbol(line);
        }
        else if (line.startsWith("💬") || line.startsWith("😀")) {
            scoreData.addLyrics(line.substr(2));
        }
        else {

            if (isStaffLine(line)) {
                scoreStructure.newStaff();
                const infoStaff = isStaffLine(line);
                line = infoStaff.content;
                if (infoStaff.instrument)
                    currentInstrument = infoStaff.instrument;
            }




            function strToTonalityNumber(str) {
                function accidentalsSurroundedBySpace(accident, n) { return accident.repeat(n); }

                for (const sharp of ["#", "♯", "♭", "b"]) {
                    for (let i = 7; i > 0; i--) {
                        if (!(i == 1 && sharp == "b"))
                            if (str == accidentalsSurroundedBySpace(sharp, i))
                                return i * (((sharp == "#") || sharp == "♯") ? 1 : -1);
                    }
                }
                return undefined;
            }

            function tonalityNumberToTonicMajor(tonalityNumber) {
                return lyToPitch(["c♭", "g♭", "d♭", "a♭", "e♭", "b♭", "f", "c", "g", "d", "a", "e", "b", "f#", "c#"][7 + tonalityNumber]);
            }

            let measures = line.split("|");
            let currentTonalityTonicMaj = new Pitch(0, 0);
            let currentTimeSignature = 1; // bydefaut

            measures = await Promise.all(measures.map(async (measureStr) => {
                let accidentals = {};

                const getCurrentAccidental = (pitch) => {
                    const ppure = new Pitch(pitch.value, 0);
                    if (accidentals[ppure.toStringABC()]) { 
                        console.log(accidentals)
                        return accidentals[ppure.toStringABC()];
                    }
                    else {
                        const p = accidentalize(ppure, currentTonalityTonicMaj);
                       // console.log("looking for the tonality")
                        return p.accidental;
                    }
                }

                let timeSignatureRead = undefined;
                let alreadyOneNote = false;

                const abcdToken2abcToken = (token) => {
                    if (token == "") return token;

                    if (isTimeSignature(token)) {
                        timeSignatureRead = token;
                        if (!alreadyOneNote) {
                            currentTimeSignature = timeSignatureRead;
                        }
                        return "[M: " + token + "]";

                    }

                    switch (token) {
                        case "𝄢", "f:": return "[K:bass]";
                        case "𝄞", "g:": return "[K:treble]";
                    }

                    if (token.startsWith("♩="))
                        return "[Q:1/4=" + token.substr(2) + "]";
                    if (strToTonalityNumber(token)) {
                        currentTonalityTonicMaj = tonalityNumberToTonicMajor(strToTonalityNumber(token));
                        console.log("TONALITY: " + currentTonalityTonicMaj)
                        return token;
                    }
                    else {
                        let note;
                        try {
                            note = new Element(token);
                        }
                        catch {
                            //                            console.log("TOKEN LEAVED AS IT IS: " + token)
                            return token;
                        }

                        alreadyOneNote = true;
                        const currentA = getCurrentAccidental(note.pitch);
                        const noteAccidental = note.pitch.accidental;
                        note.pitch.accidental = 0;
                        const ppure = new Pitch(note.pitch.value, 0);
                        accidentals[ppure.toStringABC()] = noteAccidental;

                        console.log(noteAccidental)

                        console.log((currentA == noteAccidental))
                        if (currentA == noteAccidental)
                            return note.toStringABC();
                        else {
                            note.pitch.accidental = noteAccidental;
                            return ((noteAccidental == 0) ? "=" : "") + note.toStringABC();
                        }

                    }
                };


                /**
                 * 
                 * @param {*} measureStr
                 * @description read in advance the signature for eventually update currentTimeSignature before the full 
                 */
                function readSignature(measureStr) {
                    measureStr.split(" ").map(abcdToken2abcToken);
                }

                readSignature(measureStr);
                accidentals = {}; //reintialize accidentals because of side effect of readSignature

                const result = (await RhythmGuess.getRhythm(measureStr, currentTimeSignature)).split(" ")
                    .map((A) => A.split("[")
                        .map((B) => B.split("]")
                            .map((C) => C.split("{")
                                .map((D) => D.split("}")
                                    .map(abcdToken2abcToken)
                                    .join("}")).join("{")).join("]")).join("[")).join(" ")

                if (timeSignatureRead != undefined)
                    currentTimeSignature = timeSignatureRead;

                return result;
            }));



            let s = measures.join("|");
            s = s.replaceAll("𝄢", "[K:bass]");
            s = s.replaceAll("𝄞", "[K:treble]");
            s = s.replaceAll("/ ", "/");


            function accidentalsSurroundedBySpace(accident, n) { return " " + accident.repeat(n) + " "; }

            for (const sharp of ["#", "♯"]) {
                s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 1), " [K:Gmaj]");
                s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 2), " [K:D]");
                s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 3), " [K:A]");
                s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 4), " [K:E]");
                s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 5), " [K:B]");
                s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 6), " [K:F#maj]");
                s = s.replaceAll(accidentalsSurroundedBySpace(sharp, 7), " [K:C#maj]");
            }
            for (const flat of ["♭", "b"]) {
                if (flat == "♭")
                    s = s.replaceAll(accidentalsSurroundedBySpace(flat, 1), " [K:F] ");
                s = s.replaceAll(accidentalsSurroundedBySpace(flat, 2), "[K:Bb]");
                s = s.replaceAll(accidentalsSurroundedBySpace(flat, 3), " [K:Eb] ");
                s = s.replaceAll(accidentalsSurroundedBySpace(flat, 4), " [K:Ab] ");
                s = s.replaceAll(accidentalsSurroundedBySpace(flat, 5), " [K:Db] ");
                s = s.replaceAll(accidentalsSurroundedBySpace(flat, 6), " [K:Gb] ");
                s = s.replaceAll(accidentalsSurroundedBySpace(flat, 7), " [K:Cb] ");
            }
            scoreStructure.addVoice(i);
            scoreData.addVoice(i, s, currentInstrument);

        }
    } //endfor
    abc[iScoreInABC] = (scoreStructure.toStringABC());
    return abc.join("\n") + "\n" + scoreData.toStringABC();
}