const editor = ace.edit("editor");

const synth = new Tone.Synth().toDestination();

editor.setValue(localStorage.getItem("save") ? localStorage.getItem("save") : "𝄞  ♯♯  3/4  e''2.", -1); //-1 means cursor at the beginning
setInterval(() => localStorage.setItem("save", editor.getValue()), 5000);


let isSelection = false;
setInterval(() => { isSelection = (editor.getSelectedText() != "") }, 200);


editor.commands.on('afterExec', eventData => {
    if (eventData.command.name === 'insertstring') {
        if (isSelection)
            return;
        const currline = editor.getSelectionRange().start.row;
        const wholelinetxt = editor.session.getLine(currline);
        if (!wholelinetxt.startsWith("😀"))
            if (['a', 'b', 'c', 'd', 'e', 'f', 'g'].indexOf(eventData.args) >= 0) {
                let h = 3;
                if (inputOctave.value.length > 0)
                    h += inputOctave.value.length * (inputOctave.value[0] == "'" ? 1 : -1);

                const noteName = eventData.args + h;
                synth.triggerAttackRelease(noteName, "32n");
                editor.session.insert(editor.getCursorPosition(), inputOctave.value + " ");
            }
    }
});


/**
 * clean the code, align the |
 */
function clean() {
    const code = editor.getValue();

    function alignLines(lines, ibegin, iend) {
        console.log(ibegin, iend)
        const splits = [];
        const measureLength = [];

        for (let i = ibegin; i <= iend; i++) {
            splits[i] = lines[i].split("|").map((s) => s.trim());

            for (let j = 0; j < splits[i].length; j++) {
                if (j > measureLength.length - 1)
                    measureLength.push(1);
                measureLength[j] = Math.max(measureLength[j], splits[i][j].length);
            }
        }

        for (let i = ibegin; i <= iend; i++) {
            for (let j = 0; j < splits[i].length; j++) {
                splits[i][j] = splits[i][j].padEnd(measureLength[j], " ");
            }
            lines[i] = splits[i].join(" | ");
        }
    }

    function reorganiseLines(lines) {
        let ibegin = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line == "|" || line == "||") {
                iend = i - 1;
                alignLines(lines, ibegin, iend);
                ibegin = i + 1;
            }
        }
        alignLines(lines, ibegin, lines.length - 1);
        return lines;
    }
    editor.setValue(reorganiseLines(code.split("\n")).join("\n"), -1);
}



buttonClean.onclick = clean;



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



buttonUpdatePDF.onclick = async () => {
    const fd = new FormData();
    const abcd = editor.getValue();
    const ly = abcd2ly(abcd);
    fd.append("code", ly);
    const response = await fetch("generatepdf.php", {
        method: 'post',
        body: fd
    });
    if (response.ok) {
        const pdfFilename = await response.text();
        output.src = pdfFilename
    }
}


