
/**
 * A note or a silence
 * 
 * Fields:
 * value: octave * 7 + note (between 0 and 6) (c, d, e, f, g, a, b)
 * isRest: true or false
 */
class Element {
    constructor(string) {
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

        /**
         * 
         * @param {*} str 
         * @returns [ the rest of the string, value of the accidental read] or [str, undefined]
         */
        function eatAccidental(str) {
            if (str.startsWith("♮"))
                return [str.substr(1), 0];

            let accidental = undefined;
            if (str.startsWith("♯♯") || str.startsWith("##")) {
                accidental = 2;
            }
            else if (str.startsWith("♯") || str.startsWith("#")) {
                accidental = 1;
            }
            else if (str.startsWith("♭♭")) {
                accidental = -2;
            }
            else if (str.startsWith("♭")) {
                accidental = -1;
            }

            str = str.substr(Math.abs(accidental));
            return [str, accidental];
        }


        /**
         * 
         * @param {*} str 
         * @returns [the rest to be parsed, the letter] or [str, undefined]
         */
        function eatLetterNote(str) {
            if (str.startsWith("do"))
                return [str.substr(2), "c"];
            if (str.startsWith("ré"))
                return [str.substr(2), "d"];
            if (str.startsWith("mi"))
                return [str.substr(2), "e"];
            if (str.startsWith("fa"))
                return [str.substr(2), "f"];
            if (str.startsWith("sol"))
                return [str.substr(3), "g"];
            if (str.startsWith("la"))
                return [str.substr(2), "a"];
            if (str.startsWith("si"))
                return [str.substr(2), "b"];
            if (str.startsWith("_"))
                return [str.substr(1), "r"];

            const letterNote = str[0];
            if (!(["a", "b", "c", "d", "e", "f", "g", "r", "x"].indexOf(letterNote.toLowerCase()) >= 0))
                return [str, undefined];
            return [str.substr(1), letterNote];
        }

        function eatOctaves(str) {
            let octave = 0; // by default
            for (let i = 4; i >= 1; i--)
                if (str.startsWith("'".repeat(i))) {
                    octave = i;
                    str = str.substr(i);
                    break;
                }

            for (let i = 4; i >= 1; i--)
                if (str.startsWith(",".repeat(i))) {
                    octave = -i;
                    str = str.substr(i);
                    break;
                }
            return [str, octave];
        }


        if (string == "")
            throw "empty string";

        let letter = undefined;
        let accidental = undefined;

        [string, accidental] = eatAccidental(string);
        [string, letter] = eatLetterNote(string);
        if (!(["a", "b", "c", "d", "e", "f", "g", "r", "x"].indexOf(letter.toLowerCase()) >= 0))
            throw "not a note or a rest";

        if (accidental == undefined)
            [string, accidental] = eatAccidental(string);

        this.isRest = (letter == "r") || (letter == "x");

        let value = 0;
        if (!this.isRest)
            value = lyNoteLetterToiNote7(letter.toLowerCase());

        if (string == ":")
            throw "not a note";

        let octave;
        [string, octave] = eatOctaves(string);

        //if lowercase
        if (letter == letter.toUpperCase())
            octave--;

        value += octave * 7;
        this.letter = letter;
        this.value = value;
        this.accidental = accidental;
        this.duration = new Duration(string);
    }

    get pitch() {
        return new Pitch(this.value, this.accidental)
    }
    setDuration(d) { this.duration = new Duration(d); }

    toStringLy() { return (this.isRest ? this.letter : this.pitch.toStringLy()) + this.duration.toString(); }
    toStringABC() {
        if (this.isRest)
            return (this.letter == "r" ? "z" : this.letter) + this.duration.toString();
        else {
            const accidentalString = (this.accidental == 0) ? "=" : (this.accidental > 0 ? "^".repeat(this.accidental) : "_".repeat(-this.accidental));
            const octaveString = (this.isRest) ? "" : octaveToString(this.pitch.octave - 1);
            return accidentalString + iNote7ToLy(this.pitch.value7) + octaveString + this.duration.toString();
        }
    }
    toStringABCD() {
        if (this.isRest)
            return (this.letter == "r" ? "z" : this.letter) + this.duration.toString();
        else {
            const accidentalString = (this.accidental == 0) ? "♮" : (this.accidental > 0 ? "♯".repeat(this.accidental) : "♭".repeat(-this.accidental));
            const octaveString = (this.isRest) ? "" : octaveToString(this.pitch.octave);
            return iNote7ToLy(this.pitch.value7) + accidentalString + octaveString + this.duration.toString();
        }
    }
}




function lyToPitch(str) {
    const el = new Element(str);
    return el.pitch;
}