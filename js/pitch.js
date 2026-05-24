// @ts-check

import { lyNoteLetterToiNote7 } from "./element.js";


export class Pitch {

    /**
     * 
     * @param {number} value 
     * @param {number|undefined} accidental 
     */
    constructor(value, accidental) { this.value = value; this.accidental = accidental; }

    /**
     * @returns the value between 0 and 6 (0 = c, 1 = d, 2 = e, 3 = f, 4 = g, 5 = a, 6 = b)
     */
    get value7() {
        let x = this.value % 7;
        if (x < 0) x += 7;
        return x;
    }

    /**
     * @returns midi value
     */
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
                default: return 0;
            }
        }
        const a = this.accidental == undefined ? 0 : this.accidental;
        return 12 * this.octave + f() + a;
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

        let a = () => (this.accidental == undefined) ? "" : (this.accidental > 0 ? "♯".repeat(this.accidental) : "♭".repeat(-this.accidental))

        let octave = this.octave;
        return f() + a() + ((octave >= 0) ? "'".repeat(octave) : ",".repeat(-octave));
    }

    get octave() { return Math.floor(this.value / 7); }



    toStringLy() {
        const accidentalString = (this.accidental == undefined) ? "" : (this.accidental > 0 ? "♯".repeat(this.accidental) : "♭".repeat(-this.accidental));
        const octaveString = octaveToString(this.octave);
        return iNote7ToLy(this.value7) + accidentalString + octaveString;
    }

    toStringABCD() {
        const accidentalString = (this.accidental == undefined) ? "" : (this.accidental == 0) ? "♮" : (this.accidental > 0 ? "♯".repeat(this.accidental) : "♭".repeat(-this.accidental));
        const octaveString = octaveToString(this.octave);
        return accidentalString + iNote7ToLy(this.value7) + octaveString;
    }

    toStringABC() {
        const accidentalString = (this.accidental == undefined) ? "" : (this.accidental == 0) ? "=" : (this.accidental > 0 ? "^".repeat(this.accidental) : "_".repeat(-this.accidental));
        const octaveString = octaveToString(this.octave - 1);
        return accidentalString + iNote7ToLy(this.value7) + octaveString;
    }

    toStringTone() {
        const accidentalString = (this.accidental == undefined) ? "" : (this.accidental > 0 ?
            "#".repeat(this.accidental) : "b".repeat(-this.accidental));
        const octaveString = this.octave + 4;
        return iNote7ToLy(this.value7).toUpperCase() + accidentalString + octaveString;
    }


    /**
     * 
     * @param {string} name 
     * @param {number} accidental 
     * @param {number} octave 
     * @returns 
     */
    static fromNameAccidentalOctave(name, accidental, octave) {
        return new Pitch(lyNoteLetterToiNote7(name) + 7 * octave, accidental);
    }

}

/**
 * 
 * @param {number} octave 
 * @returns 
 */
function octaveToString(octave) { return (octave > 0 ? "'".repeat(octave) : ",".repeat(-octave)); }



/**
 * 
 * @param {number} iNote 
 * @returns {string}
 */
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