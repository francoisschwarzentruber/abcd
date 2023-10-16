
const synth = new Tone.Synth().toDestination();
const abcjs = window.ABCJS;
/**
 * reload the content from local storage
 */

buttonLoad.onclick = () => {
    const newid = prompt("Which music scores already stored in your browser do you want to load?");
    if (newid != null) {
        if (Save.exists(newid)) {
            Save.setId(newid);
            editor.text = Save.load();//editor.setValue(Save.load(), -1);
        }
        else {
            alert("No document with name '" + newid + "' found!")
        }
    }
}


buttonSave.onclick = () => {
    const newid = prompt("What name do you want to give to this score?", Save.getId());
    Save.setId(newid);
    Save.save();
}


buttonExportMIDI.onclick = () => {
    const abcd = editor.text;
    const abc = abcd2abc(abcd);
    const a = document.createElement("a");
    a.id = "downloadA";
    a.style.display = 'none';
    document.body.appendChild(a);
    const midi = ABCJS.synth.getMidiFile(abc, { midiOutputType: "encoded" })
    a.setAttribute("href", midi);
    a.setAttribute("download", "myfile.mid");

    a.click();
    document.body.removeChild(a);
}

buttonExportABC.onclick = () => {
    const abcd = editor.text;
    const abc = abcd2abc(abcd);
    const a = document.createElement("a");
    a.id = "downloadA";
    a.style.display = 'none';
    document.body.appendChild(a);
    const content = 'data:text/plain;charset=utf-8,' + encodeURIComponent(abc);
    a.setAttribute("href", content);
    a.setAttribute("download", "myfile.abc");
    a.click();
    document.body.removeChild(a);

}


let storedValue = Save.load();
if (storedValue == undefined)
    storedValue = Save.getId() + "\nMozart\n\n𝄞  ♯♯  3/4 a/ a/ (3 b♭ b♭ b♭ f#- | f#2  \n😀 Li fe is beau ti ful,      |  yes \n𝄞  ♯♯  3/4  r [c e♭']3 | d r  \n𝄢           A,4 |  ";

let lines = storedValue.split("\n");
storedValue = lines.join("\n");
editor.text = storedValue

setInterval(() => Save.save(editor.text), 5000);


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


let previousABCD = "";
function update() {

    const abcd = editor.text;
    if (abcd == previousABCD)
        return;

    previousABCD = abcd;
    const abc = abcd2abc(abcd);

    console.log(abc)
    const visualObj = abcjs.renderAbc('output', abc, {
        oneSvgPerLine: true
    })[0];
    const synthControl = new abcjs.synth.SynthController();
    synthControl.load("#audio", null, { displayRestart: true, displayPlay: true, displayProgress: true });
    synthControl.setTune(visualObj, false);
}
editor.onchange = update;
update();
/**
 * @description executed after the user types sth
 */

/*editor.commands.on('afterExec', eventData => {
    if (eventData.command.name === 'insertstring') {
        if (isSelection)
            return;
        const currline = editor.getSelectionRange().start.row;
        const wholelinetxt = editor.session.getLine(currline);
        if (!wholelinetxt.startsWith("😀"))
            if (['a', 'b', 'c', 'd', 'e', 'f', 'g'].indexOf(eventData.args) >= 0) {
                let h = 0;
                if (inputOctave.value.length > 0)
                    h += inputOctave.value.length * (inputOctave.value[0] == "'" ? 1 : -1);
                const pitch = lyToPitch(eventData.args);
                pitch.value += 7 * h;
                const realPitch = accidentalize(pitch, currentKey());

                const noteName = realPitch.toStringTone();

                console.log(noteName)
                synth.triggerAttackRelease(noteName, "32n");
                editor.session.insert(editor.getCursorPosition(), inputOctave.value + " ");
            }
    }
});*/


/**
 * clean the code, align the symbols |
 */
function clean() {
    const code = editor.text;

    function alignLines(lines, lbegin, lend) {
        const splits = [];
        const measureLength = [];

        for (let l = lbegin; l <= lend; l++) {
            splits[l] = lines[l].split("|").map((s, i) => (i == 0) ? s.trimRight() : s.trim());
            console.log(splits)
            for (let m = 0; m < splits[l].length; m++) {
                if (m > measureLength.length - 1)
                    measureLength.push(1);
                measureLength[m] = Math.max(measureLength[m], [...splits[l][m]].length);
            }
        }

        for (let l = lbegin; l <= lend; l++) {
            for (let m = 0; m < splits[l].length; m++) {
                const nbSpacesToAdd = measureLength[m] - [...splits[l][m]].length;
                splits[l][m] = splits[l][m] + " ".repeat(nbSpacesToAdd);
            }
            lines[l] = splits[l].join(" | ").replaceAll(" |   | ", " || ").replaceAll(" | ]", " |]")
                .replaceAll(": || :", ":||:").replaceAll(": |", ":|").replaceAll("| :", "|:")
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
    const lines = code.split("\n");
    editor.text = [lines[0], lines[1], ...reorganiseLines(lines.slice(2))].join("\n");
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
        editor.write(s)
        editor.focus();
    });
}






function editorInsert(str) {
    editor.write(str);
}

function action8upOrDown(f) {
    editor.focus();
    /* if (editor.getSelectedText() == "") {
         inputOctave.value = f("a" + inputOctave.value).substr(1);
     }
     else
         editorReplaceSelection(f);
 */
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
    editor("[]");
    editor.focus();
})




function currentKey() {
    function findKey() {
        const code = editor.text;

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



