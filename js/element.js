
/**
 * A note or a silence
 * 
 * Fields:
 * value: octave * 7 + note (between 0 and 6) (c, d, e, f, g, a, b)
 * isRest: true or false
 */
class Element {
    constructor(s) {
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


        function eatAccidental(s) {
            let accidental = undefined;
            if (s.startsWith("♯♯") || s.startsWith("##")) {
                accidental = 2;
            }
            else if (s.startsWith("♯") || s.startsWith("#")) {
                accidental = 1;
            }
            else if (s.startsWith("♭♭")) {
                accidental = -2;
            }
            else if (s.startsWith("♭")) {
                accidental = -1;
            }
            s = s.substr(Math.abs(accidental));
            return [s, accidental];
        }


        function eatLetterNote(s) {
            const letterNote = s[0];
            if (!(["a", "b", "c", "d", "e", "f", "g", "r", "x"].indexOf(letterNote.toLowerCase()) >= 0))
                return [s, undefined];
            return [s.substr(1), letterNote];
        }

        function eatOctaves(s) {
            let octave = 0; // by default
            for (let i = 4; i >= 1; i--)
                if (s.startsWith("'".repeat(i))) {
                    octave = i;
                    s = s.substr(i);
                    break;
                }

            for (let i = 4; i >= 1; i--)
                if (s.startsWith(",".repeat(i))) {
                    octave = -i;
                    s = s.substr(i);
                    break;
                }
            return [s, octave];
        }


        if (s == "")
            throw "empty string";

        let letter = undefined;
        let accidental = undefined;

        [s, accidental] = eatAccidental(s);
        [s, letter] = eatLetterNote(s);
        if (!(["a", "b", "c", "d", "e", "f", "g", "r", "x"].indexOf(letter.toLowerCase()) >= 0))
            throw "not a note or a rest";

        if (accidental == undefined)
            [s, accidental] = eatAccidental(s);

        this.isRest = (letter == "r") || (letter == "x");

        let value = 0;
        if (!this.isRest)
            value = lyNoteLetterToiNote7(letter.toLowerCase());

        if (s == ":")
            throw "not a note";

        let octave;
        [s, octave] = eatOctaves(s);

        //if lowercase
        if (letter == letter.toUpperCase())
            octave--;

        value += octave * 7;
        this.letter = letter;
        this.pitch = new Pitch(value, accidental);
        this.duration = new Duration(s);
    }

    setDuration(d) { this.duration = new Duration(d); }

    toStringLy() { return (this.isRest ? this.letter : this.pitch.toStringLy()) + this.duration.toString(); }
    toStringABC() { return (this.isRest ? (this.letter == "r" ? "z" : this.letter) : this.pitch.toStringABC()) + this.duration.toString(); }
    toStringABCD() { return (this.isRest ? this.letter : this.pitch.toStringABCD()) + this.duration.toString(); }
}




function lyToPitch(str) {
    const el = new Element(str);
    return el.pitch;
}