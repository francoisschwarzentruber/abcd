function noteABCDToToneJS(note) {
    const pitch = lyToPitch(note);
    const noteName = pitch.toStringTone();
    return noteName;
}

class PlayNote {
    static play(notes) {
        console.log(notes)
        const notesToneJS = notes.map(noteABCDToToneJS);
        console.log(notesToneJS)
        var polySynth = new Tone.PolySynth(Tone.AMSynth).toMaster();
        polySynth.triggerAttackRelease(notesToneJS, '8n');
       
    }
}



