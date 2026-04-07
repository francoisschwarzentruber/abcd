const piano = document.getElementById('myPiano');

// Connect your listener here
piano.addEventListener('noteplay', (e) => {
    const rawPitch = Pitch.fromNameAccidentalOctave(e.detail.name, parseInt(e.detail.accidental), e.detail.octave - 3);
    const pitch = rawPitch2Pitch(rawPitch);
    if (editorContext.getAccidentals()(pitch.value) == pitch.accidental)
        pitch.accidental = undefined;
    console.log(editorContext.getAccidentals()(pitch.value))
    console.log(pitch)
    editor.write(pitch.toStringABCD() + " ");
    setTimeout(() => editor.focus(), 200);
    // This is where you'd trigger your AudioContext or Synth
});


// Connect your listener here
piano.addEventListener('notehover', (e) => {
    const rawPitch = Pitch.fromNameAccidentalOctave(e.detail.name, parseInt(e.detail.accidental), e.detail.octave - 3);
    const pitch = rawPitch2Pitch(rawPitch);

    const abc = editorContext.getCurrentClef().toStringABC() + " " + pitch.toStringABC();
console.log(abc)
    abcjs.renderAbc('notesnapshot', abc);
    // This is where you'd trigger your AudioContext or Synth
});