class Staff {
    constructor() {
        this.isStartGroup = false;
        this.isEndGroup = false;
        this.voices = [];
    }

    addVoice(i) {
        this.voices.push(i);
    }

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


function startsWithKey(line) {
    return line.startsWith("𝄞") || line.startsWith("𝄢")
}

function abcd2abc(abcd) {
    const abc = [];
    abc.push("X:1");
    abc.push("L:1/4");
    abc.push("K:c");
    abc.push("%%propagate-accidentals not");

    const iScoreInABC = abc.length - 1;
    abc.push("%%score "); // to be modified after the abcd code has been analyzed
    const lines = abcd.split("\n");

    let i = 0;
    for (; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line != "") {
            if (startsWithKey(line))
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

    for (; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line.split("|").every((m) => m.trim() == "")) {
            scoreStructure.newStaff();
        }

        else if (["[", "]", "{", "}"].indexOf(line) >= 0) {
            scoreStructure.addStaffSymbol(line);
        }
        else if (line.startsWith("💬") || line.startsWith("😀")) {
            abc.push("w: " + line.substr(2));
        }
        else {
            if (startsWithKey(line))
                scoreStructure.newStaff();

            const key = currentKey();

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
            measures = measures.map((M) => {
                let accidentals = {};

                const getCurrentAccidental = (pitch) => {
                    const ppure = new Pitch(pitch.value, 0);
                    if (accidentals[ppure.toStringABC()]) {
                        return accidentals[ppure.toStringABC()];
                    }
                    else {
                        const p = accidentalize(ppure, currentTonalityTonicMaj);
                        return p.accidental;
                    }
                }


                const transformToken = (token) => {
                    if (token == "") return token;
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

                        const currentA = getCurrentAccidental(note.pitch);
                        const noteA = note.pitch.accidental;
                        note.pitch.accidental = 0;
                        const ppure = new Pitch(note.pitch.value, 0);
                        accidentals[ppure.toStringABC()] = noteA;

                        if (currentA == noteA)
                            return note.toStringABC();
                        else {
                            note.pitch.accidental = noteA;
                            return ((noteA == 0) ? "=" : "") + note.toStringABC();
                        }

                    }
                };

                return M.split(" ").map((A) => A.split("[").map((B) => B.split("]").map(transformToken).join("]"))
                    .join("[")).join(" ")
            })


            for (let im = 4; im < measures.length; im += 4) {
                measures[im] = "\n" + measures[im];
            }

            let lineOutput = measures.join("|");

            let s = lineOutput;
            s = s.replaceAll("𝄢", "[K:F bass]");
            s = s.replaceAll("𝄞", "[K:treble]");
            s = s.replaceAll("/ ", "/");

            for (const timeSignature of ["2/2", "2/4", "3/4", "3/8", "4/4", "6/4", "6/8"])
                s = s.replaceAll(timeSignature, "[M: " + timeSignature + "]");

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
            abc.push(`V:V${i}`);
            abc.push(`[V:V${i}]` + s);
        }
    } //endfor
    abc[iScoreInABC] = (scoreStructure.toStringABC());
    return abc.join("\n");
}