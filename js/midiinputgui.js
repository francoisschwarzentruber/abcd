
let beginningTimeForAChord;


/**
 * 
 * @param {*} midiNote 
 * @returns the lilypond string for the midi note midiNote
 */
function imidiNote2Pitch(midiNote) {
    const iC = 0;
    const midiNotefromC = midiNote - iC;
    let octave = Math.floor(midiNotefromC / 12);
    console.log(octave)
    let midi12 = midiNotefromC % 12;
    if (midi12 < 0) {
        midi12 = midi12 + 12;
    }


    /**
     * @param midiPitchM(between 0 and 11)
        * @returns the value of the pitch between 0 and 6(0 = C, 1 = D, etc.)
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
            default: throw "midi12ToPitch7: argument not between 0 and 11"
        }
    }

    /**
     * 
     * @param midi12 (between 0 and 11)
     * @returns 0 or 1 (0 means that the note is natural, 1 = sharp)
     * 
     */
    function midi12ToAccidental(midi12) { return [1, 3, 6, 8, 10].indexOf(midi12) >= 0 ? 1 : 0; }
    console.log(midi12ToPitch7(midi12) + octave * 7)
    return new Pitch(midi12ToPitch7(midi12) + octave * 7,
        midi12ToAccidental(midi12));
}



function imidiNote2Ly(midiNoteRelative) {
    const pitch = imidiNote2Pitch(midiNoteRelative);
    const key = currentKey();
    console.log(pitch.toStringLy())

    console.log(key.toStringLy())
    const pitchCorrected = enharmonic(pitch, key);
    console.log(pitchCorrected.toStringLy())
    return pitchCorrected.toStringLy();
}



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

let notes = [];
let nbnotes = 0;

MidiInput.setEventListenerNoteOff((inote) => {
    nbnotes--;
    if (nbnotes == 0) {
        const dt = Date.now() - beginningTimeForAChord;
        const nbSpaces = dtToNbSpaces(dt);
        const spaces = " ".repeat(nbSpaces);
        if (notes.length == 1) {
            editorInsert(" " + notes[0] + spaces);
        }
        else {
            editorInsert(" [" + notes.join(" ") + "]" + spaces);
        }

        PlayNote.play(notes);

        notes = [];
    }
});



MidiInput.setEventListenerNoteOn((inote) => {
    if (nbnotes == 0) {
        beginningTimeForAChord = Date.now();
    }
    console.log(inote); notes.push(imidiNote2Ly(inote - 60)); nbnotes++;
});
MidiInput.start();