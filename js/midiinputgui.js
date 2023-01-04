

/**
 * 
 * @param {*} i 
 * @returns the lilypond string for the midi note i
 */
function imidiNote2Ly(i) {
    const iC = 12;
    const fromC = i - iC;

    function decorationOctave(octave) {
        const mid = 3;
        if (octave < mid)
            return ",".repeat(mid - octave);
        else
            return "'".repeat(octave - mid)

    }


    function imidiNote082Ly(fromC) {
        switch (fromC % 12) {
            case 0: return "c";
            case 1: return "c#";
            case 2: return "d";
            case 3: return "d#";
            case 4: return "e";
            case 5: return "f";
            case 6: return "f#";
            case 7: return "g";
            case 8: return "g#";
            case 9: return "a";
            case 10: return "a#";
            case 11: return "b";
            default:
                throw "no no no";
        }
    }

    console.log(fromC)
    return imidiNote082Ly(fromC % 12) + decorationOctave(Math.floor(fromC / 12));
}


let notes = [];
let nbnotes = 0;

MidiInput.setEventListenerNoteOff((inote) => { 
    nbnotes--;
    if(nbnotes == 0) {
        if(notes.length == 1) {
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