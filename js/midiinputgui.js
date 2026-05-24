// @ts-check

import { MidiInput } from "./midiinput.js";
import { PlayNote } from "./playnote.js";
import { Pitch } from "./pitch.js";
import { editorContext } from "./editorcontext.js";
import { enharmonic } from "./harmony.js";


let beginningTimeForAChord = Date.now();


/**
 * 
 * @param {number} midiNote 
 * @returns {Pitch} the lilypond string for the midi note midiNote
 */
function imidiNote2RawPitch(midiNote) {
    const iC = 0;
    const midiNotefromC = midiNote - iC;
    let octave = Math.floor(midiNotefromC / 12);
    let midi12 = midiNotefromC % 12;
    if (midi12 < 0) {
        midi12 = midi12 + 12;
    }


    /**
     * @param {number} midiPitchM(between 0 and 11)
     * @returns {number} the value of the pitch between 0 and 6 (0 = C, 1 = D, etc.)
     */
    function midi12ToPitch7(midiPitchM) {
        switch (midiPitchM) {
            case 0: case 1: return 0;
            case 2: case 3: return 1;
            case 4: return 2;
            case 5: case 6: return 3;
            case 7: case 8: return 4;
            case 9: case 10: return 5;
            case 11: return 6;
            default: throw "midi12ToPitch7: argument not between 0 and 11";
        }
    }

    /**
     * 
     * @param {number} midi12 (between 0 and 11)
     * @returns {number} 0 or 1 (0 means that the note is natural, 1 = sharp)
     * 
     */
    function midi12ToAccidental(midi12) { return [1, 3, 6, 8, 10].indexOf(midi12) >= 0 ? 1 : 0; }
    return new Pitch(midi12ToPitch7(midi12) + octave * 7,
        midi12ToAccidental(midi12));
}


/**
 * 
 * @param {number} midiNoteRelative 
 * @returns {Pitch} 
 */
function imidiNote2Pitch(midiNoteRelative) {
    const rawPitch = imidiNote2RawPitch(midiNoteRelative);
    return rawPitch2Pitch(rawPitch);
}

/**
 * 
 * @param {Pitch} rawPitch 
 * @returns {Pitch} the pitch that is same as rawPitch but possibly enharmonic because of the current tonality
 */
export function rawPitch2Pitch(rawPitch) {
    const currentTonality = editorContext.getCurrentTonality();
    const key = currentTonality.tonic;
    const pitchCorrected = enharmonic(rawPitch, key);
    return pitchCorrected;
}

/**
 * 
 * @param {number} dt 
 * @returns 
 */
function dtToNbSpaces(dt) {
    console.log(dt)
    if (dt > 1000)
        return 4;
    if (dt > 500)
        return 3;
    if (dt > 250)
        return 2;
    if (dt > 125)
        return 1;
    return 0;
}

/**
 * @type {string[]}
 */
let notes = [];
let nbnotes = 0;

MidiInput.setEventListenerNoteOff(
    /**
     * 
     * @param {number} inote 
     */
    (inote) => {
        nbnotes--;
        if (nbnotes == 0) {
            const dt = Date.now() - beginningTimeForAChord;
            const nbSpaces = dtToNbSpaces(dt);
            const spaces = " ".repeat(nbSpaces);
            editor.write(notes.join("") + spaces);

            PlayNote.play(notes);

            notes = [];
        }
    });



MidiInput.setEventListenerNoteOn(
    /**
     * 
     * @param {number} inote 
     */
    (inote) => {
        if (nbnotes == 0) {
            beginningTimeForAChord = Date.now();
        }
        console.log(inote); notes.push(imidiNote2Pitch(inote - 60).toStringLy()); nbnotes++;
    });
MidiInput.start();