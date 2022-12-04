


function imidiNote2Ly(i) {
    const iC = 12;
    const fromC = i - iC;

    function decorationOctave(octave) {
        const mid = 5;
        if (octave)
            return ",".repeat(mid + 1 - octave);
        else
            return ".".repeat(octave - mid)

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

    return imidiNote082Ly(fromC % 12) + decorationOctave(fromC / 12);
}

MidiInput.setEventListenerNoteOff((inote) => { editorInsert(" " + imidiNote2Ly(inote)) });
MidiInput.setEventListenerNoteOn((inote) => { });
MidiInput.start();