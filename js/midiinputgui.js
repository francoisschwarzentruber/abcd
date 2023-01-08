

/**
 * 
 * @param {*} midiNote 
 * @returns the lilypond string for the midi note midiNote
 */
function imidiNote2Pitch(midiNote) {
    const iC = 12;
    const midiNotefromC = midiNote - iC;

    let midi12 = midiNotefromC % 12;
    if (midi12 < 0) midi12 = midi12 + 12;


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


    return new Pitch(midi12ToPitch7(midi12), midi12ToAccidental(midi12));
}



function imidiNote2Ly(midiNote) {
    const pitch = imidiNote2Pitch(midiNote);
    const key = currentKey();
    console.log(pitch.toString())

    console.log(key.toString())
    const pitchCorrected = enharmonic(pitch, key);
    return pitchCorrected.toString();
}






let notes = [];
let nbnotes = 0;

MidiInput.setEventListenerNoteOff((inote) => {
    nbnotes--;
    if (nbnotes == 0) {
        if (notes.length == 1) {
            editorInsert(" " + notes[0]);
        }
        else {
            editorInsert(" <" + notes.join(" ") + ">");
        }
        notes = [];
    }
});

MidiInput.setEventListenerNoteOn((inote) => { notes.push(imidiNote2Ly(inote)); nbnotes++; });
MidiInput.start();