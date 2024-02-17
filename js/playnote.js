/**
 * 
 * @param {*} note 
 * @example 'a,' => "A3"
 */
function noteABCDToToneJS(note) {
    const pitch = lyToPitch(note);
    const noteName = pitch.toStringTone();
    return noteName;
}

class PlayNote {
    /**
     * 
     * @param {*} notes
     *  @exemple notes = ['a', 'c#,']
     */
    static play(notes) {
        console.log(notes)
        const notesToneJS = notes.map(noteABCDToToneJS);
        console.log(notesToneJS)
        var polySynth = new Tone.PolySynth(Tone.AMSynth).toMaster();
        polySynth.triggerAttackRelease(notesToneJS, '8n');
       
    }
}



