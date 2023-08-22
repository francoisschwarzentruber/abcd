const editor = ace.edit("editor");
const synth = new Tone.Synth().toDestination();
const abcjs = window.ABCJS;
/**
 * reload the content from local storage
 */
editor.setValue(localStorage.getItem("save") ? localStorage.getItem("save") : "𝄞  ♯♯  3/4  e''2.", -1); //-1 means cursor at the beginning
setInterval(() => localStorage.setItem("save", editor.getValue()), 5000);

/**
 * we store whether there is (was) a selection
 */
let isSelection = false;
setInterval(() => { isSelection = (editor.getSelectedText() != "") }, 200);


/**
 * 
 * @param {*} event 
 * @description close the insert menu
 */


window.onclick = (event) => {
    if (!event.target.matches('#buttonInsert')) {
        toolbarInsert.classList.remove("show");
    }
}


editor.getSession().on('change', () => {
    const abc = abcd2abc(editor.getValue());
    /*abcjs.renderAbc("output", abc);
    abcjs.renderMidi("midiPlayer", abc, {}, { generateInline: true }, {});*/
    const visualObj = abcjs.renderAbc('output', abc)[0];
    const synthControl = new abcjs.synth.SynthController();
    synthControl.load("#audio", null, { displayRestart: true, displayPlay: true, displayProgress: true });
    synthControl.setTune(visualObj, false);

});
/**
 * @description executed after the user types sth
 */
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

                    const realPitch = accidentalize(lyToPitch(eventData.args), currentKey());
                    
                    const noteName = realPitch.toStringTone() + h;
                synth.triggerAttackRelease(noteName, "32n");
                editor.session.insert(editor.getCursorPosition(), inputOctave.value + " ");
            }
    }
});


/**
 * clean the code, align the symbols |
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



/**
 * 
 * @param {*} text 
 * @param {*} event
 * @description add a button in the list of buttons 
 */
function addButton(text, hint, event) {
    const b = document.createElement("button");
    b.innerHTML = text;
    b.title = hint;
    b.onclick = event;
    toolbarInsert.append(b);
}

function buttonInsert(s, hint) {
    console.log("add button " + s)
    addButton(s, hint, () => {
        editorInsert(s)
        editor.focus();
    });
}




/**
 * 
 * @param {*} f
 * @description replace the selection by f(selection) 
 */
function editorReplaceSelection(f) {
    const r = editor.selection.getRange();

    const end = editor.session.replace(r, f(editor.getSelectedText()));
    editor.selection.setRange({
        start: r.start, end: end
    });
}



function editorInsert(str) {
    const r = editor.selection.getRange();
    editor.session.replace(r, str);
}

function action8upOrDown(f) {
    if (editor.getSelectedText() == "") {
        inputOctave.value = f("a" + inputOctave.value).substr(1);
    }
    else
        editorReplaceSelection(f);
}

button8up.onclick = () => action8upOrDown(str8up);
button8down.onclick = () => action8upOrDown(str8down);

buttonInsert("𝄞 ", "add a treble key");
buttonInsert("𝄢 ", "add a treble key");
buttonInsert("♭", "add flat");
//buttonInsert("♮", "add normal");
buttonInsert("♯", "add sharp");
buttonInsert("😀 ", "add lyrics");
buttonInsert("♩=120 ", "add tempo indication");


addButton("chord", "write/transform into chord", () => {
    if (editor.getSelectedText() != "")
        editorReplaceSelection((selection) => "<" + selection + ">");
    else {
        let pos = editor.getCursorPosition();
        editor.session.insert(pos, "<>");
        editor.gotoLine(pos.row + 1, pos.column + 1);
    }
    editor.focus();
})


/*editor.getSession().on('change', function () {
    abcd2Vexflow(editor.getValue());
});*/



async function compile(format) {
    const fd = new FormData();
    const abcd = editor.getValue();
    const ly = abcd2ly(abcd);
    fd.append("format", format);
    fd.append("code", ly);

    const response = await fetch("generate.php", {
        method: 'post',
        body: fd
    });
    if (response.ok) {
        const filenameID = await response.text();
        console.log(filenameID)
        return filenameID;
    }
    else {
        console.log("error: ")
        console.log(response);

    }
}

function download(filename) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.download = name;
    a.href = filename;
    a.target = "_blank";
    a.click();
    a.remove();
}
buttonDownload.onclick = async () => {
    const filename = await compile("pdf");
    download(window.location.href + filename);

}





function currentKey() {
    function findKey() {
        const code = editor.getValue();

        function accidentalsSurroundedBySpace(accident, n) { return " " + accident.repeat(n) + " "; }

        for (const sharp of ["#", "♯", "♭", "b"]) {
            for (let i = 7; i > 0; i--) {
                if (code.indexOf(accidentalsSurroundedBySpace(sharp, i)) >= 0)
                    return i * (((sharp == "#") || sharp == "♯") ? 1 : -1);
            }
        }
        return 0;
    }

    const accidentals = findKey();

    return lyToPitch(["c♭", "g♭", "d♭", "a♭", "e♭", "b♭", "f", "c", "g", "d", "a", "e", "b", "f#", "c#"][7 + accidentals]);
}



