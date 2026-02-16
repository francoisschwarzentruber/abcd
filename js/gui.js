

const abcjs = window.ABCJS;
/**
 * reload the content from local storage
 */

dialogOpenButtonOpen.onclick = () => {
    console.log("azeaze")
    dialogOpen.close();
    newid = selectFilename.value;
    if (newid != null) {
        if (Save.exists(newid)) {
            Save.setId(newid);
            editor.text = Save.load();//editor.setValue(Save.load(), -1);
        }
        else {
            alert("No document with id name '" + newid + "' found!")
        }
    }

}


dialogOpenButtonCancel.onclick = () => {
    dialogOpen.close();
}

buttonDialogOpen.onclick = () => {
    selectFilename.innerHTML = "";

    for (const key in localStorage) if (key.startsWith("save:")) {
        const filename = key.substring("save:".length + 1)
        const option = document.createElement("option");
        option.value = filename;
        option.text = filename;
        selectFilename.add(option);
    }


    dialogOpen.showModal();

}


buttonSave.onclick = () => {
    const newid = prompt("What id name do you want to give to this score?", Save.getId());
    Save.setId(newid);
    Save.save();
}


buttonExportMIDI.onclick = async () => {
    const abcd = editor.text;
    const abc = await abcd2abc(abcd);
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

buttonExportABC.onclick = async () => {
    const abcd = editor.text;
    const abc = await abcd2abc(abcd);
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


let previousABCDString = "";
async function update() {

    const abcdString = editor.text;
    if (abcdString == previousABCDString)
        return;

    previousABCDString = abcdString;
    const abc = await abcd2abc(abcdString);

    function clickListener(abcelem, tuneNumber, classes, analysis, drag, mouseEvent) {
        console.log(abcelem);
        console.log(analysis);
    }
    const visualObj = abcjs.renderAbc('output', abc, {
        oneSvgPerLine: true,
        clickListener: clickListener
    })[0];
    const synthControl = new abcjs.synth.SynthController();
    synthControl.load("#audio", null, { displayRestart: true, displayPlay: true, displayProgress: true });
    synthControl.setTune(visualObj, false);
}

editor.onchange = update;
update();




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
    addButton(s, hint, (evt) => {
        evt.srcElement.blur();
        editor.write(s)
        editor.focus();
    });
}






function editorInsert(str) {
    editor.write(str);
}

function performActionOnSelection(f) {
    editor.focus();
    editor.setSelectedText(f(editor.getSelectedText()));
}


button8up.onclick = () => performActionOnSelection(str8up);
button8down.onclick = () => performActionOnSelection(str8down);

buttonInsert("𝄞 ", "add a treble key");
buttonInsert("𝄢 ", "add a treble key");
buttonInsert("♭", "add flat");
buttonInsert("♮", "add normal");
buttonInsert("♯", "add sharp");
buttonInsert("😀 ", "start a line of lyrics");
buttonInsert("♩=120 ", "add tempo indication");


addButton("chord", "write/transform into chord", () => {
    if (editor.getSelectedText() == "")
        editor.write("[c e g]");
    else {
        editor.setSelectedText("[" + editor.getSelectedText() + "]");
    }
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



