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
        return  document.getElementById("editor");
    }
    setSelectedText(txt) {
        this.write(txt);
        const pos = this.DOMelement.selectionStart;
        this.DOMelement.setSelectionRange(pos - txt.length, pos);
    }
}

let editor = new Editor;