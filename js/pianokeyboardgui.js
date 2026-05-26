// @ts-check
/// <reference path="pitch.js" />
import { Pitch } from "./pitch.js";
import { editorContext } from "./editorcontext.js";
import { rawPitch2Pitch } from "./midiinputgui.js";
import { editor } from "./editor.js";

const abcjs = window.ABCJS;
const piano = document.getElementById('myPiano');

/**
 * when the user clicks on a piano key
 */
piano.addEventListener('noteplay', (e) => {
    const rawPitch = Pitch.fromNameAccidentalOctave(e.detail.name, parseInt(e.detail.accidental), e.detail.octave - 3);
    const pitch = rawPitch2Pitch(rawPitch);
    if (editorContext.getAccidentals()(pitch.value) == pitch.accidental)
        pitch.accidental = undefined;
    console.log(editorContext.getAccidentals()(pitch.value))
    console.log(pitch)
    editor.write(pitch.toStringABCD() + " ");
    setTimeout(() => editor.focus(), 200);
});

/**
 * when the user move the mouse on a piano key
 */
piano.addEventListener('notehover', (e) => {
    const rawPitch = Pitch.fromNameAccidentalOctave(e.detail.name, parseInt(e.detail.accidental), e.detail.octave - 3);
    const pitch = rawPitch2Pitch(rawPitch);

    const abc = editorContext.getCurrentClef().toStringABC() + " " + pitch.toStringABC();
    abcjs.renderAbc('notesnapshot', abc);
});