/**
 * A note or a silence
 * 
 * Fields:
 * note: between 0 and 7 (c, d, e, f, g, a, b)
 * isRest: true or false
 */
class Element {
    constructor(s) {
        if (s == "")
            throw "empty string";

        if (!(["a", "b", "c", "d", "e", "f", "g", "r"].indexOf(s[0]) >= 0))
            throw "not a note or a rest";

        this.isRest = s[0] == "r";
        if (!this.isRest)
            this.note = lyNoteLetterToiNote7(s[0]);

        s = s.substr(1);

        this.accidental = 0;
        if (s.startsWith("♯♯")) {
            this.accidental = 2;
        }
        else if (s.startsWith("♯")) {
            this.accidental = 1;
        }
        else if (s.startsWith("♭♭")) {
            this.accidental = -2;
        }
        else if (s.startsWith("♭")) {
            this.accidental = -1;
        }

        s = s.substr(Math.abs(this.accidental));

        this.octave = 0; // by default
        for (let i = 4; i >= 1; i--)
            if (s.startsWith("'".repeat(i))) {
                this.octave = i;
                s = s.substr(i);
                break;
            }

        for (let i = 4; i >= 1; i--)
            if (s.startsWith(",".repeat(i))) {
                this.octave = -i;
                s = s.substr(i);
                break;
            }

        this.duration = s;
    }


    toString() {
        const letter = this.isRest ? "r" : iNote7ToLy(this.note);
        const accidentalString = (this.accidental > 0 ? "♯".repeat(this.accidental) : "♭".repeat(-this.accidental));
        const octaveString = ((this.isRest) ? "" : (this.octave > 0 ? "'".repeat(this.octave) : ",".repeat(-this.octave)))
        return letter + accidentalString + octaveString + this.duration;
    }
}


function mapToAllToken(str, f) {
    return str.replaceAll("<", " < ")
        .replaceAll(">", " > ").
        split(' ').map(f).join(' ').replaceAll(" < ", "<").replaceAll(" > ", ">");
}


function str8up(str) {
    function move8up(s) {
        if (s == "") return s;
        try {
            const note = new Element(s);
            note.octave++;
            return note.toString();
        }
        catch (e) {
            console.log(e)
            return s;
        }

    }
    return mapToAllToken(str, move8up);
}


function str8down(str) {
    function move8up(s) {
        if (s == "") return s;
        try {
            const note = new Element(s);
            note.octave--;
            return note.toString();
        }
        catch {
            console.log(s)
            return s;
        }

    }
    return mapToAllToken(str, move8up);
}


function lyNoteLetterToiNote7(iNote) {
    switch (iNote) {
        case "c": return 0;
        case "d": return 1;
        case "e": return 2;
        case "f": return 3;
        case "g": return 4;
        case "a": return 5;
        case "b": return 6;
    }
    throw "error";
}

function iNote7ToLy(iNote) {
    switch (iNote) {
        case 0: return "c";
        case 1: return "d";
        case 2: return "e";
        case 3: return "f";
        case 4: return "g";
        case 5: return "a";
        case 6: return "b";
    }
    throw "error";
}