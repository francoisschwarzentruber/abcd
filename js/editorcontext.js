// @ts-check
import {editor} from "./editor.js";
import { clefsDictionnary } from "./abcddefinitions.js";
import { ElementClef, tokenToElement } from "./element.js";



/**
* Retrieve the array key corresponding to the largest element in the array.
*
* @param {Array.<number>} array Input array
* @return {number} Index of array element with largest value
*/
function argMax(array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}



/**
 * A class for getting the current context of the editor
 */
class EditorContext {
    /**
     * 
     * @param {Editor} editor 
     */
    constructor(editor) {
        this.editor = editor;
    }


    /**
     * 
     * @returns {ElementTonality} the current tonality in the document
     */
    getCurrentTonality() {
        const code = this.editor.text;
        const cursor = this.editor.getCursor();
        const line = code.split("\n")[cursor.iline - 1];

        const tonalityStrings = ["♮"];
        tonalityStrings.push(...[1, 2, 3, 4, 5, 6, 7].map((i) => "♯".repeat(i)));
        tonalityStrings.push(...[1, 2, 3, 4, 5, 6, 7].map((i) => "♭".repeat(i)));
        tonalityStrings.push(...[1, 2, 3, 4, 5, 6, 7].map((i) => "#".repeat(i)));
        tonalityStrings.push(...[2, 3, 4, 5, 6, 7].map((i) => "b".repeat(i)));

        const lastPositions = tonalityStrings.map((str) => line.lastIndexOf(" " + str + " ", cursor.icolumn));

        const tonalityIndex = argMax(lastPositions);
        if (lastPositions[tonalityIndex] < 0)
            return new ElementTonality("♮"); // by default
        else
            return new ElementTonality(tonalityStrings[tonalityIndex]);
    }



    /**
     * 
     * @returns {ElementClef} the current clef in the document
     */
    getCurrentClef() {
        const code = this.editor.text;
        const cursor = this.editor.getCursor();
        const line = code.split("\n")[cursor.iline - 1];
        const clefsStr = Object.keys(clefsDictionnary);
        const lastPositions = clefsStr.map((str) => line.lastIndexOf(str, cursor.icolumn));

        const clefIndex = argMax(lastPositions);
        if (lastPositions[clefIndex] < 0)
            return new ElementClef("𝄞"); // by default
        else
            return new ElementClef(clefsStr[clefIndex]);
    }


    /**
     * 
     * @returns a function that takes the value of a pitch and returns the accidental that pitch has if no accidental sign is given.
     * It uses the current tonality and the notes that are already present
     * @example if tonality is ♭♭♭ then for the value for e then the function outputs ♭.
     */
    getAccidentals() {
        const tonality = this.getCurrentTonality();
        const code = this.editor.text;
        const cursor = this.editor.getCursor();
        const line = code.split("\n")[cursor.iline - 1];

        const i = line.lastIndexOf("|", cursor.icolumn);
        const istart = i < 0 ? 0 : i;
        const measureStr = line.substr(istart, cursor.icolumn - istart);

        const /** @type {number[]} */  explicitAccidentals = [];

        mapToAllTokens(measureStr, (/** @type {string} */ tokenStr) => {
            const el = tokenToElement(tokenStr);
            if (el instanceof Chord)
                for (const pitch of el.pitchs) if (pitch.accidental != undefined)
                    explicitAccidentals[pitch.value] = pitch.accidental;
        });

        return (/** @type {number} */ value) => {
            if (explicitAccidentals[value] != undefined)
                return explicitAccidentals[value];
            return accidentalize(new Pitch(value, undefined), tonality.tonic).accidental;
        };
    }

}

export const editorContext = new EditorContext(editor);
