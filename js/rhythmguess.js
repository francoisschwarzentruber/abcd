class RhythmGuess {
    static guess(abcdStr, signature = 1) {
        abcdStr = abcdStr.trimLeft();
        if (abcdStr == "") return "";
        try {
            const elements = []; //array of Element, Chord or string :)
            let nbSpaces = 0;
            let isElement = false;
            const nbSpacesArray = [];
            tokenize(abcdStr).map((str) => {
                if (str == "") {
                    if (isElement) {
                        nbSpacesArray[elements.length - 1]++;
                    }
                    nbSpaces++;
                }
                else {
                    let element = str;
                    isElement = true;
                    if (str.startsWith("["))
                        try { element = new Chord(str); } catch (e) { isElement = false; }
                    else
                        try { element = new Element(str); } catch (e) { isElement = false; };
                    elements.push(element);
                    if (isElement) nbSpaces++;
                    nbSpacesArray.push(isElement ? 1 : 0);
                }
            });
            console.log(abcdStr)
            console.log(elements)

            function isNupletSymbol(e) {
                if (e.startsWith("(")) {
                    return parseInt(e.substr(1));
                }
                else
                    undefined;
            }

            let nupletValue = undefined;
            let nupletCount = undefined;


            function solveMain() {
                for (let precision = 5; precision < 7; precision++) {
                    const possibleDurations = elements.map(
                        (e, i) => {
                            if (typeof (elements[i]) != "string") {
                                let factor = 1;
                                if (nupletCount) {
                                    factor = 1 / nupletValue;
                                    nupletCount--;
                                }
                                const proportion = Math.log2(nbSpacesArray[i]) / Math.log2(factor * nbSpaces);
                                console.log("PROPORTION: " + proportion)
                                return getPossibleDurations(e, proportion, precision).map((x) => x * factor);
                            }
                            else {
                                if (isNupletSymbol(e)) {
                                    nupletValue = isNupletSymbol(e);
                                    nupletCount = nupletValue;
                                }
                                return [0];
                            }
                        });

                    try {
                        console.log(possibleDurations)
                        return solve(possibleDurations, signature);
                    }
                    catch (e) {

                    }
                }
                throw "impossible to solve";
            }



            const durations = solveMain();
            for (let i = 0; i < elements.length; i++) {
                const e = elements[i]
                if (typeof (e) == "string") {
                    if (isNupletSymbol(e)) {
                        nupletValue = isNupletSymbol(e);
                        nupletCount = nupletValue;
                    }
                }
                else {
                    const d = durations[i]; //real duration
                    let factor = 1;

                    function lowerpoweroftwo(x) {
                        return 2 ** Math.floor(Math.log2(x));
                    }

                    if (nupletCount) {
                        factor = lowerpoweroftwo(nupletValue) / nupletValue;
                        nupletCount--;
                    }
                    e.duration = new Duration(d / factor); //fake duration inside a nuplet for instance
                }
            }

            let t = 0;
            const output = elements.map((e, i) => {
                if (typeof (e) == "string")
                    return e;
                else {
                    t += durations[i];
                    return e.toStringABCD() + (isEq(Math.floor(t * 4), t * 4) ? " " : "");
                }
            }).join(" ");
            console.log("OUTPUT: " + output)
            return output;

        } catch (e) {
            console.log(e);
            return abcdStr;
        }
    }

}


function tokenize(abcdStr) {
    const tokens = [];
    let isBracket = false;
    let bracketType = "[";
    let bracketToken = "";


    const L = abcdStr.split(" ");
    console.log(L)

    for (const chunk of L) {
        if (!isBracket) {
            if (chunk.startsWith("[") && chunk.endsWith("]"))
                tokens.push(chunk);
            else if (chunk.startsWith("{") && chunk.endsWith("}"))
                tokens.push(chunk);
            else if (chunk.startsWith("[") || chunk.startsWith("{")) {
                bracketType = chunk[0];
                bracketToken = chunk + " ";
                isBracket = true;
            }
            else
                tokens.push(chunk);
        }
        else {
            const getClosedBracket = (openBracket) => (openBracket == "[") ? "]" : "}" ;
            if (chunk.indexOf(getClosedBracket(bracketType)) >= 0) {
                bracketToken += chunk;
                tokens.push(bracketToken);
                isBracket = false;
            }
            else
                bracketToken += chunk + " ";
        }
    }
    console.log(tokens)
    return tokens;
}


class Chord {
    constructor(str) {
        this.notesStr = str.substr(0, str.indexOf("]") + 1);
        this.duration = new Duration(str.substr(str.indexOf("]") + 1));
    }

    toStringABCD() {
        return this.notesStr + this.duration.toString();
    }
}


function getPossibleDurations(element, ratio, precision) {
    let A = [];
    let num = 1;
    let istart = 0;

    let durationStr = element.duration.toString();

    if (durationStr == "4")
        return [1];

    if (durationStr == "2")
        return [1 / 2];

    if (durationStr == "2.")
        return [3 / 4];

    if (durationStr == "1")
        return [1 / 4];

    if (durationStr == "1.")
        return [3 / 8];

    if (durationStr == "/.")
    return [3 / 16];

    if (durationStr.startsWith("7") || durationStr.startsWith(".."))
        num = 7;
    else if (durationStr.startsWith("3") || durationStr.startsWith("."))
        num = 3;


    if ((durationStr == "/") || (durationStr == "♪"))
        istart = 3;

    if (durationStr == "//")
        istart = 4;

    if ((durationStr == "///") || (durationStr == "𝅬"))
        istart = 5;


    for (let i = istart; i < precision; i++)
        A.push(num / (2 ** i));

    return A.sort((a, b) => Math.abs(a - ratio) - Math.abs(b - ratio));
}



function isEq(a, b) {
    return Math.abs(a - b) < 0.00001;
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