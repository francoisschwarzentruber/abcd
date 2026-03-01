class MatchingCodeRendering {

    static install() {
        const renderedStaffs = document.getElementById("output").children;
        for (let staffNumber = 0; staffNumber < renderedStaffs.length; staffNumber++)
            renderedStaffs[staffNumber].onclick = () => {
                const lineNumber = staffNumberToLineNumber(editor.text, staffNumber);
                editor.gotoLine(lineNumber);
            }
    }



}



function staffNumberToLineNumber(abcdStr, staffNumber) {
    const lines = abcdStr.split("\n");

    let currentStaffNumber = 0;
    let nbConsecutiveEmptyLines = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() == "")
            nbConsecutiveEmptyLines++;
        else if (nbConsecutiveEmptyLines > 1) {
            nbConsecutiveEmptyLines = 0;
            currentStaffNumber++;
        }

        if (currentStaffNumber == staffNumber)
            return i+1;
    }
    return -1;
}