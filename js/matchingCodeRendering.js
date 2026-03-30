class MatchingCodeRendering {

    static install() {
        const renderedSystems = document.getElementById("output").children;
        for (let isystem = 0; isystem < renderedSystems.length; isystem++) {
            MatchingCodeRendering.installSystem(isystem, renderedSystems[isystem]);

            if (isystem == 0)
                renderedSystems[isystem].onclick = () => {
                    const lines = editor.text.split("\n");
                    const lineBeginningSystem = systemNumberToLineNumber(lines, isystem);
                    editor.gotoLine(lineBeginningSystem);
                }
        }
    }


    static installSystem(isystem, systemElement) {
        const GsystemElement = systemElement.querySelector("svg g");
        let istaff = -1;
        let bars = [];
        function isElementStaff(el) { return el.querySelector(".abcjs-top-line"); }
        function isElementBar(el) { return el.dataset.name == "bar" };
        for (const el of GsystemElement.children) {
            if (isElementStaff(el)) {
                istaff++;
                bars = [];
                const currentStaffNumber = istaff;
                const currentBars = bars;
                systemElement.addEventListener("click", (evt) => {
                    const systemRect = systemElement.getBoundingClientRect();
                    const staffRect = el.getBoundingClientRect();
                    const staffRectTop = staffRect.top - systemRect.top;
                    const staffRectBottom = staffRect.bottom - systemRect.top;
                    const y = evt.clientY - systemRect.top;
                    const x = evt.clientX - systemRect.left;
                    if (!(staffRectTop <= y && y < staffRectBottom))
                        return;

                    let imeasure = 0;
                    for (const bar of bars) {
                        const barRectLeft = bar.getBoundingClientRect().left - systemRect.left;
                        if (x < barRectLeft)
                            break;
                        imeasure++;
                    }

                    editorGoTo({ isystem, istaff: currentStaffNumber, imeasure });
                });

            }
            else if (isElementBar(el)) {
                bars.push(el);
            }
        }
    }

}


/**
 * 
 * @param {*} fullABCDCode 
 * @param {*} isystem 
 * @returns the first line number that corresponds to the system isystem
 */
function systemNumberToLineNumber(fullABCDCodeLines, isystem) {
    let currentStaffNumber = 0;
    let nbConsecutiveEmptyLines = 0;
    for (let i = 0; i < fullABCDCodeLines.length; i++) {
        if (fullABCDCodeLines[i].trim() == "")
            nbConsecutiveEmptyLines++;
        else if (nbConsecutiveEmptyLines > 1) {
            nbConsecutiveEmptyLines = 0;
            currentStaffNumber++;
        }

        if (currentStaffNumber == isystem)
            return i + 1;
    }
    return -1;
}




/**
 * 
 * @param {*} musicalInformation 
 * @description move the cursor in the code according to the musical information. 
 * musicalInformation.isystem = the number of the current system (isystem = 0 means the title, isystem = 1 is the first system)
 * musicalInformation.istaff = the number of staff (the first one is 0)
 * musicalInformation.ibar = the number of the measure
 */
function editorGoTo(musicalInformation) {
    console.log(musicalInformation)
    const lines = editor.text.split("\n");
    const ilineBeginningSystem = systemNumberToLineNumber(lines, musicalInformation.isystem);
    const iline = ilineBeginningSystem + musicalInformation.istaff;
    const line = lines[iline - 1];
    const icolumn = getColumnBeginningMeasure(line, musicalInformation.imeasure);
    console.log(icolumn)
    editor.gotoLine(iline, icolumn);
}



function getColumnBeginningMeasure(line, imeasure) {
    const cleanedLine = line.replace(/g||/, "| ");
    console.log(cleanedLine)
    let pos = 0;
    for (let i = 0; i < imeasure; i++)
        pos = cleanedLine.indexOf("|", pos + 1);
    return pos + 1;
}