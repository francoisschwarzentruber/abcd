//const editor = ace.edit("editor");

class Editor {
    get text() {
        return document.getElementById("editor").value;
    }

    set text(txt) {
        document.getElementById("editor").value = txt;
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
    }



    focus() {
        document.getElementById("editor").focus();
    }


    set onchange(callback) {
         document.getElementById("editor").onchange = callback;
         document.getElementById("editor").oninput = callback;
    }
}

let editor = new Editor;