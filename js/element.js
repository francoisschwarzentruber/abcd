
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

        if (s == "")
            throw "empty string";

        const letterNote = s[0];
        if (!(["a", "b", "c", "d", "e", "f", "g", "r"].indexOf(letterNote.toLowerCase()) >= 0))
            throw "not a note or a rest";

        this.isRest = (letterNote == "r");

        let value = 0;
        if (!this.isRest)
            value = lyNoteLetterToiNote7(letterNote.toLowerCase());

        s = s.substr(1);

        let accidental = 0;
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

        //if lowercase
        if (letterNote == letterNote.toUpperCase())
            octave--;

        value += octave * 7;
        this.pitch = new Pitch(value, accidental);
        this.duration = new Duration(s);
    }

    setDuration(d) {         this.duration = new Duration(d);}

    toStringLy() { return (this.isRest ? "r" : this.pitch.toStringLy()) + this.duration.toString(); }
    toStringABC() { return (this.isRest ? "z" : this.pitch.toStringABC()) + this.duration.toString(); }
    toStringABCD() { return (this.isRest ? "z" : this.pitch.toStringABCD()) + this.duration.toString(); }
}




function lyToPitch(str) {
    const el = new Element(str);
    return el.pitch;
}