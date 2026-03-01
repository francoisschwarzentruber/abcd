//const editor = ace.edit("editor");

class Editor {
    get text() {
        return this.DOMelement.value;
    }

    set text(txt) {
        this.DOMelement.value = txt;
    }


    write(textToInsert) {
        const textarea = document.getElementById("editor");
        // Get the current cursor position
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Split the current value and sandwich the new text in the middle
        const oldValue = textarea.value;
        textarea.value = oldValue.substring(0, start) +
            textToInsert +
            oldValue.substring(end);

        // Put the cursor back in a logical place (right after the new text)
        textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;

        // Refocus the textarea so the user can keep typing immediately
        textarea.focus();

        this.onchangecallback();
    }



    focus() {
        this.DOMelement.focus();
    }


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







    gotoLine(lineNumber) {
        const textarea = document.getElementById("editor");

        const text = textarea.value;
        // Split by lines to find the character index of the target line
        const lines = text.split("\n");

        // Ensure the line number is within bounds (1-based indexing)
        const targetLine = Math.max(1, Math.min(lineNumber, lines.length));

        // Calculate the index by joining previous lines and adding their length
        const charIndex = lines.slice(0, targetLine - 1).join("\n").length + (targetLine > 1 ? 1 : 0);

        // Set the cursor position
        textarea.focus();
        textarea.setSelectionRange(charIndex, charIndex);

        // Scroll the textarea so the line is visible
        let lineHeight = parseFloat(style.lineHeight);

        if (isNaN(lineHeight)) {
            // Fallback: Use 1.2 * fontSize if lineHeight is "normal"
            const fontSize = parseFloat(style.fontSize);
            lineHeight = fontSize * 1.2;
        }
        textarea.scrollTop = (targetLine - 1) * lineHeight;
    }
}

let editor = new Editor;