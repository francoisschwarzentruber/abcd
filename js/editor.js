// @ts-check

import { EditorView, basicSetup } from "https://esm.sh/codemirror@6.0.1";
import { EditorState } from "https://esm.sh/@codemirror/state";
import { StreamLanguage, HighlightStyle, syntaxHighlighting } from "https://esm.sh/@codemirror/language@6.0.0";
import { tags as t, Tag } from "https://esm.sh/@lezer/highlight@1.0.0";
import { abcdStringClefs } from "./abcddefinitions.js";




const clefTag = Tag.define();
const signatureTag = Tag.define();
const barTag = Tag.define();
const alterationTag = Tag.define();



const abcdGrammar = StreamLanguage.define({
    token(stream) {
        for (const clef of abcdStringClefs)
            if (stream.match(clef)) return "clef";

        for (const alteration of ["#", "♯", "♭", "♮"])
            if (stream.match(alteration)) return "alteration";

        if (stream.match("|")) return "bar";
        if (stream.match(/^\d+\/\d+/)) return "signature";

        // IMPORTANT: Move stream forward if no match found to avoid infinite loops
        stream.next();
        return null;
    },
    tokenTable: {
        "bar": barTag,
        "clef": clefTag,
        "signature": signatureTag,
        "alteration": alterationTag,
    }
});



// --- 2. Define the Visual Style (The Colors) ---
const abcdHighlightStyle = HighlightStyle.define([
    { tag: barTag, color: "black", background: "lightgray", fontWeight: "bold" },
    { tag: signatureTag, color: "black", background: "#ffa657", fontWeight: "bold", padding: "1px" },
    { tag: clefTag, color: "brown", background: "lightyellow", fontWeight: "bold", padding: "1px" },
    { tag: alterationTag, color: "darkgreen", fontWeight: "bold", padding: "1px" },


]);




/**
 * A wrapper class for the text editor where the code is written 
 */
class Editor {
    constructor() {
        // 2. Initialize the Editor

        const onUpdate = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                this.onchangecallback();
            }
        });

        this.extensions = [
            basicSetup,
            abcdGrammar,
            onUpdate,
            syntaxHighlighting(abcdHighlightStyle)
        ];

        this.view = new EditorView({
            doc: 'SELECT * FROM users WHERE id = 123 AND name = "$admin"',
            extensions: this.extensions,
            parent: document.getElementById("editor-panel"),
        });
    }
    /**
     * return {string} the full code
     */
    get text() {
        return this.view.state.doc.toString();
    }
    set text(newText) {
        this.view.setState(EditorState.create({
            doc: newText,
            extensions: this.extensions
        }));
    }

    /**
     * 
     * @param {string} textToInsert 
     */
    write(textToInsert) {
        this.view.dispatch(this.view.state.replaceSelection(textToInsert));
        this.onchangecallback();
    }



    focus() {
        this.view.focus();
    }


    set onchange(callback) {
        this.onchangecallback = callback;
    }




    getSelectedText() {
        return window.getSelection().toString();
    }

    get DOMelement() {
        return document.getElementById("editor-panel");
    }
    setSelectedText(txt) {
        this.write(txt);
        const pos = this.DOMelement.selectionStart;
        this.DOMelement.setSelectionRange(pos - txt.length, pos);
    }


    gotoLine(lineNumber, columnNumber = 0) {
        // 1. Ensure the line number is within bounds
        const lineCount = this.view.state.doc.lines;
        const targetLine = Math.max(1, Math.min(lineNumber, lineCount));

        // 2. Get the line object (CM6 lines are 1-indexed)
        const lineInfo = this.view.state.doc.line(targetLine);

        // 3. Calculate the character offset
        // Column is usually 1-indexed in UI, but 0-indexed in character count
        // We constrain the column to the length of the line
        const pos = lineInfo.from + Math.min(columnNumber - 1, lineInfo.length);

        // 4. Update the cursor position and scroll it into view
        this.view.dispatch({
            selection: { anchor: pos, head: pos },
            scrollIntoView: true
        });

        // 5. Focus the editor so the cursor is visible/blinking
        this.view.focus();
    }


    /**
     * 
     * @returns {{iline: number, icolumn: number, ipos: number}}
     */
    getCursor() {
        const textarea = this.DOMelement;
        const code = this.text;
        const lines = code.split("\n");
        const ipos = textarea.selectionStart;
        function getLineNumber() {
            return textarea.value.substr(0, textarea.selectionStart).split("\n").length;
        }
        const iline = getLineNumber();
        const icolumn = code.lastIndexOf("\n", ipos);
        return { iline, icolumn, ipos };
    }
}

export let editor = new Editor();
