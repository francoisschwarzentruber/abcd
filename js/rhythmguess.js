class RhythmGuess {
    static guess(abcdStr, signature = 1) {
        abcdStr = abcdStr.trimLeft();
        if (abcdStr == "") return "";
        try {
            const elements = [];
            let nbSpaces = 0;
            const nbSpacesArray = [];
            abcdStr.split(" ").map((str) => {
                nbSpaces++;
                if (str == "") {
                    if (elements.length > 0)
                        nbSpacesArray[elements.length - 1]++;
                }
                else {
                    let element = str;

                    try { element = new Element(str); } catch (e) { };
                    elements.push(element);
                    nbSpacesArray.push(1);
                }
            });
            console.log(abcdStr)
            console.log(elements)

            const possibleDurations = elements.map(
                (e, i) =>
                    ((elements[i] instanceof Element) ? getPossibleDurations(e, nbSpacesArray[i] / nbSpaces) : [0]));
            console.log(possibleDurations)
            const durations = solve(possibleDurations, signature);

            for (let i = 0; i < elements.length; i++) if (elements[i] instanceof Element) {
                const d = durations[i];
                elements[i].setDuration(d);
            }

            let t = 0;
            const output = elements.map((e, i) => {
                if (e instanceof Element) {
                    t += durations[i];
                    return e.toStringABCD() + (isEq(Math.floor(t*4), t*4) ? " " : "");
                }
                else
                    return "";
            }).join(" ");
            console.log("OUTPUT: " + output)
            return output;

        } catch (e) {
            console.log(e);
            return abcdStr;
        }
    }

}




function getPossibleDurations(element, ratio) {
    console.log("ratio = " + ratio)
    const A = [];
    let num = 1;
    let istart = 0;

    if (element.durationInformationStr == "4")
        return [1];

    if (element.durationInformationStr == "2")
        return [1 / 2];

    if (element.durationInformationStr == "1")
        return [1 / 4];

    if (element.durationInformationStr.startsWith("3"))
        num = 3;

    if (element.durationInformationStr == "/")
        istart = 3;

    if (element.durationInformationStr == "//")
        istart = 4;

    if (element.durationInformationStr == "///")
        istart = 5;

    for (let i = istart; i < 7; i++)
        A.push(num / (2 ** i));

    return A.sort((a, b) => Math.abs(a - ratio) - Math.abs(b - ratio));
}



function isEq(a, b) {
    return Math.abs(a - b) < 0.000001;
}



function solve(D, total) {
    const solution = [];
    function solveRec(D, i, subTotal) {
        if (i >= D.length && Math.abs(subTotal) < 0.000001)
            return true;

        if (i >= D.length)
            return false;

        for (const v of D[i]) {
            solution[i] = v;
            const a = solveRec(D, i + 1, subTotal - v);
            if (a)
                return true;
        }
        return false;
    }

    const a = solveRec(D, 0, total);
    if (a)
        return solution;
    else
        throw "impossible to solve";
}