var editor = ace.edit("editor");

const synth = new Tone.Synth().toDestination();



editor.setValue("𝄞  ♯♯  3/4  e''2.", -1); //-1 means cursor at the beginning

editor.commands.on('afterExec', eventData => {
    if (eventData.command.name === 'insertstring') {
        const currline = editor.getSelectionRange().start.row;
        const wholelinetxt = editor.session.getLine(currline);
        if (!wholelinetxt.startsWith("😀"))
            if (['a', 'b', 'c', 'd', 'e', 'f', 'g'].indexOf(eventData.args) >= 0) {
                let h = 3
                if (inputOctave.value.length > 0)
                    h += inputOctave.value.length * (inputOctave.value[0] == "'" ? 1 : -1);

                const noteName = eventData.args + h;
                synth.triggerAttackRelease(noteName, "32n");
                editor.session.insert(editor.getCursorPosition(), inputOctave.value + " ");
            }
    }
});


function buttonInsert(s) {
    const b = document.createElement("button");
    b.innerHTML = s;
    b.title = "insert " + s;
    b.onclick = () => {
        editor.session.insert(editor.getCursorPosition(), s);
        editor.focus();
    }
    toolbarInsert.append(b);

}


function actionOnSelection(f) {
    let r = editor.selection.getRange();

    const end = editor.session.replace(r, f(editor.getSelectedText()));
    editor.selection.setRange({
        start: r.start, end: end
    });
}


function action8upOrDown(f) {
    if (editor.getSelectedText() == "") {
        inputOctave.value = f("a" + inputOctave.value).substr(1);
    }
    else
        actionOnSelection(f);
}
button8up.onclick = () => action8upOrDown(str8up);
button8down.onclick = () => action8upOrDown(str8down);


["𝄞 ", "𝄢 ", "♭", "♯", "😀 "].map(buttonInsert);



downloadPDF.onclick = async () => {
    const fd = new FormData();
    const abcd = editor.getValue();
    const ly = abcd2ly(abcd);
    fd.append("code", ly);
    const response = await fetch("generatepdf.php", {
        method: 'post',
        type: 'application/pdf',
        body: fd
    });
    if (response.ok) {
        const b = await response.blob();
        const fileURL = URL.createObjectURL(b);

        /*  const a = document.createElement("a");
          a.href = URL.createObjectURL(b);
          a.setAttribute("download", "output.pdf");
          a.click();
  */
        output.src = "./tmp.pdf"
    }
}


