// @ts-check

// Direct imports from esm.sh CDN
import { EditorView, basicSetup } from "https://esm.sh/codemirror@6.0.1";
import { StreamLanguage } from "https://esm.sh/@codemirror/language@6.0.0";
import { tags as t } from "https://esm.sh/@lezer/highlight@1.0.0";

// 1. Define your custom grammar using regex
const myCustomGrammar = StreamLanguage.define({
    token(stream) {
        // Highlighting logic:

        // Match variables (e.g., $foo)
        if (stream.match(/^\$[a-zA-Z_]\w*/)) return "variableName";

        // Match numbers
        if (stream.match(/^\d+/)) return "number";

        // Match strings in quotes
        if (stream.match(/^"[^"]*"/)) return "string";

        // Match specific keywords
        if (stream.match(/^(?:SELECT|FROM|WHERE)\b/i)) return "keyword";

        // IMPORTANT: Move stream forward if no match found to avoid infinite loops
        stream.next();
        return null;
    }
});



/**
 * A wrapper class for the text editor where the code is written 
 */
class Editor {


    constructor() {
        // 2. Initialize the Editor
        new EditorView({
            doc: 'SELECT * FROM users WHERE id = 123 AND name = "$admin"',
            extensions: [
                basicSetup,
                myCustomGrammar
            ],
            parent: document.getElementById("editor")
        });
    }
    /**
     * return {string} the full code
     */
    get text() { return this.DOMelement.value; }
    set text(txt) { this.DOMelement.value = txt; }

    /**
     * 
     * @param {string} textToInsert 
     */
    write(textToInsert) {
        const textarea = document.getElementById("editor");
        textarea.focus();
        const success = document.execCommand('insertText', false, textToInsert);

        this.onchangecallback();
    }



    focus() { this.DOMelement.focus(); }


    set onchange(callback) {
        this.DOMelement.onchange = callback;
        this.DOMelement.oninput = callback;
        this.onchangecallback = callback;
    }




    getSelectedText() {
        return window.getSelection().toString();
    }

    get DOMelement() {
        return document.getElementById("editor");
    }
    setSelectedText(txt) {
        this.write(txt);
        const pos = this.DOMelement.selectionStart;
        this.DOMelement.setSelectionRange(pos - txt.length, pos);
    }


    gotoLine(lineNumber, columnNumber = 0) {
        const textarea = document.getElementById("editor");

        const text = textarea.value;
        // Split by lines to find the character index of the target line
        const lines = text.split("\n");

        // Ensure the line number is within bounds (1-based indexing)
        const targetLine = Math.max(1, Math.min(lineNumber, lines.length));

        // Calculate the index by joining previous lines and adding their length
        const charIndex = lines.slice(0, targetLine - 1).join("\n").length + (targetLine > 1 ? 1 : 0) + columnNumber;

        // Set the cursor position
        textarea.focus();
        textarea.setSelectionRange(charIndex, charIndex);

        // Scroll the textarea so the line is visible
        let lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);

        if (isNaN(lineHeight)) {
            // Fallback: Use 1.2 * fontSize if lineHeight is "normal"
            const fontSize = parseFloat(getComputedStyle(textarea).fontSize);
            lineHeight = fontSize * 1.2;
        }
        textarea.scrollTop = (targetLine - 1) * lineHeight;
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

let editor = new Editor();

window.editor = editor;