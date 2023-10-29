class Pitch {
    constructor(value, accidental) { this.value = value; this.accidental = accidental ? accidental : 0; }

    get value7() {
        let x = this.value % 7;
        if (x < 0) x += 7;
        return x;
    }

    get midiPitch() { return 60 + this.nbHalfTones; }

    get nbHalfTones() {
        let f = () => {
            switch (this.value7) {
                case 0: return 0;
                case 1: return 2;
                case 2: return 4;
                case 3: return 5;
                case 4: return 7;
                case 5: return 9;
                case 6: return 11;
            }
        }
        return 12 * this.octave + f() + this.accidental;
    }


    get lilypondName() {
        let f = () => {
            const i = this.value7;
            switch (i) {
                case 0: return "c";
                case 1: return "d";
                case 2: return "e";
                case 3: return "f";
                case 4: return "g";
                case 5: return "a";
                case 6: return "b";
            }
            throw "value % 7 out of scope";
        }


        let a = () => (this.accidental > 0 ? "♯".repeat(this.accidental) : "♭".repeat(-this.accidental))

        let octave = this.octave;
        return f() + a() + ((octave >= 0) ? "'".repeat(octave) : ",".repeat(-octave));
    }

    get octave() { return Math.floor(this.value / 7); }



    toStringLy() {
        const accidentalString = (this.accidental > 0 ? "♯".repeat(this.accidental) : "♭".repeat(-this.accidental));
        const octaveString = (this.isRest) ? "" : octaveToString(this.octave);
        return iNote7ToLy(this.value7) + accidentalString + octaveString;
    }

    toStringABCD() {
        const accidentalString = (this.accidental > 0 ? "♯".repeat(this.accidental) : "♭".repeat(-this.accidental));
        const octaveString = (this.isRest) ? "" : octaveToString(this.octave);
        return iNote7ToLy(this.value7) + accidentalString + octaveString;
    }

    toStringABC() {
        const accidentalString = (this.accidental > 0 ? "^".repeat(this.accidental) : "_".repeat(-this.accidental));
        const octaveString = (this.isRest) ? "" : octaveToString(this.octave - 1);
        return accidentalString + iNote7ToLy(this.value7) + octaveString;
    }

    toStringTone() {
        const accidentalString = (this.accidental > 0 ?
            "#".repeat(this.accidental) : "b".repeat(-this.accidental));
        const octaveString = this.octave + 4;
        return iNote7ToLy(this.value7).toUpperCase() + accidentalString + octaveString;
    }

}


function octaveToString(octave) { return (octave > 0 ? "'".repeat(octave) : ",".repeat(-octave)); }

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