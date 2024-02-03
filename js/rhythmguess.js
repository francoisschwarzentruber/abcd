const memo = {};


function storeMemo(abcdStr, signature, result) {
    memo[signature + abcdStr] = result;
}
class RhythmGuess {
    static async getRhythm(abcdStr, signature = 1) {
        if (memo[signature + abcdStr])
            return memo[signature + abcdStr];

        return await RhythmGuess.guess(abcdStr, signature);;
    }
    /**
     * 
     * @param {*} abcdStr, a string representing the content of a voice of a measure
     * @param {*} signature, the duration of the measure. 1 = a whole note
     * @returns a string where each elemnt (note or rest) has a duration
     */
    static async guess(abcdStr, signature = 1) {
        abcdStr = abcdStr.trimLeft();
        if (abcdStr == "") return "";


        function tokenToElements(tokens) {

            /**
             * 
             * @param {*} string
             * @returns the value of the nuplet symbol if it is one, otherwise it returns undefined
             * @example on "(3" returns 3
             */
            function isStringNupletSymbol(string) {
                return string.startsWith("(") ? parseInt(string.substr(1)) : undefined;
            }



            let nbSpaces = 0;
            const nbSpacesArray = [];
            let isElement = false;
            const elements = []; //array of Element, Chord or string :)
            console.log("tokens: ", tokens);


            tokens.map((token) => {
                if (token == "") {
                    if (isElement)
                        nbSpacesArray[elements.length - 1]++;
                    nbSpaces++;
                }
                else if (isStringNupletSymbol(token)) {
                    const value = isStringNupletSymbol(token);
                    const element = new NupletSymbolElement(value);
                    elements.push(element);
                }
                else {
                    let element = new StringElement(token);
                    isElement = true;
                    if (token.startsWith("["))
                        try { element = new Chord(token); } catch (e) { isElement = false; }
                    else
                        try { element = new Element(token); } catch (e) { isElement = false; };
                    elements.push(element);
                    if (isElement) nbSpaces++;
                    nbSpacesArray.push(isElement ? 1 : 0);
                }
            });

            nbSpacesArray[elements.length - 1]--;
            nbSpaces = 0;

            for (const x of nbSpacesArray)
                nbSpaces += x;

            for (let i = 0; i < elements.length; i++)
                elements[i].dhat = nbSpacesArray[i] / nbSpaces;

            console.log("spaces: ", nbSpacesArray);
            console.log("nb total spaces: ", nbSpaces)

            return elements;

        }



        function computePossibleDurations(elements) {
            let nupletValue = undefined;
            let nupletCount = undefined;

            return elements.map(
                (e) => {
                    if (e instanceof NupletSymbolElement) {
                        nupletValue = e.value;
                        nupletCount = nupletValue;
                        return [0];
                    }
                    else if (e instanceof StringElement)
                        return [0];
                    else {
                        let factor = 1;
                        if (nupletCount) {
                            factor = 1 / nupletValue;
                            nupletCount--;
                        }
                        const proportion = e.dhat / factor;
                        console.log("PROPORTION: " + proportion)
                        return getPossibleDurations(e, proportion).map((x) => x * factor);
                    }
                });
        }


        function setDurations(elements, durationsSolution) {
            let nupletValue = undefined;
            let nupletCount = undefined;

            for (let i = 0; i < elements.length; i++) {
                const e = elements[i];

                if (e instanceof NupletSymbolElement) {
                    nupletValue = e.value;
                    nupletCount = nupletValue;
                }
                else if (e instanceof StringElement) {

                }
                else {
                    const d = durationsSolution[i]; //real duration
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
        }


        /**
         * 
         * @param {*} elements with already the correct durations 
         * @param {*} durationsSolution 
         * @returns the ABCD string with the durations
         */
        function elementsToABCD(elements, durationsSolution) {
            let t = 0;
            return elements.map((e, i) => {
                t += durationsSolution[i];
                return e.toStringABCD() + (isEq(Math.floor(t * 4), t * 4) ? " " : "");
            }).join(" ");

        }

        try {
            const tokens = tokenize(abcdStr);
            const elements = tokenToElements(tokens);
            const possibleDurations = computePossibleDurations(elements);
            console.log(abcdStr)
            console.log("elements", elements)
            console.log("possibleDurations", possibleDurations)


            const durationsSolution = await solve(elements.map((e) => e.dhat), possibleDurations, signature);
            setDurations(elements, durationsSolution);
            const abcdResult = elementsToABCD(elements, durationsSolution);
            storeMemo(abcdStr, signature, abcdResult);
            return abcdResult;

        } catch (e) {
            console.log(e);
            return abcdStr;
        }
    }

}

/**
 * 
 * @param {*} abcdStr 
 * @returns a list of tokens
 * @example on "b c [d a]", it returns the list ["b", "c", "[d a]"]
 */
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
            const getClosedBracket = (openBracket) => (openBracket == "[") ? "]" : "}";
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



class StringElement {
    constructor(string) {
        this.string = string;
    }

    toStringABCD() {
        return this.string;
    }
}



class NupletSymbolElement {
    constructor(value) {
        this.value = value;
    }

    toStringABCD() {
        return "(" + this.value;
    }
}


function getPossibleDurations(element, ratio, precision = 7) {
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


async function solve(dhats, possibleDurations, signature) {

    var url = '/your/url';
    var formData = new FormData();
    const strJSON = JSON.stringify({ dhats, possibleDurations, signature });
    formData.append('input', JSON.stringify({ dhats, possibleDurations, signature }));

    const f = await fetch("./guessRhythm/guessRhythm.php", { method: 'POST', body: formData });
    const txt = await f.text();
    const lines = txt.split("\n");
    const array = JSON.parse(lines[lines.length - 2]);
    return array;

}



/*
async function solve(dhats, D, signature) {
    console.log("dhats", dhats)
    const solution = [];
    function solveRec(D, i, subTotal) {
        if (i >= D.length && Math.abs(subTotal) < 0.000001) {
            console.log("we win!")
            console.log(D)
            return true; // we win!
        }

        if (i >= D.length)
            return false;

        const newD = D;
        newD[i] = [...newD[i]];

        function up(durations, bests) {
            return durations;
            return durations.sort((a, b) => {
                if ((bests.indexOf(a) >= 0) && (bests.indexOf(b) >= 0))
                    return bests.indexOf(a) <= bests.indexOf(b);
                else if (bests.indexOf(a) >= 0)
                    return -1;
                else if (bests.indexOf(b) >= 0)
                    return 1;
                else
                    return 0;
            })
        }


        for (j = 0; j < i; j++)
            if (dhats[j] == dhats[i]) {
                console.log("up")
                console.log(solution[j])
                console.log(D[i])
                newD[i] = up(newD[i], [solution[j]]);
                console.log(newD[i])
            }
          else if (dhats[i] > dhats[j])
              newD[i] = up(newD[i], D[i].filter((d) => d >= solution[j]));
          else if (dhats[i] < dhats[j])
              newD[i] = up(newD[i], D[i].filter((d) => d <= solution[j]));
          

        for (const v of newD[i]) {
            solution[i] = v;
            const a = solveRec(newD, i + 1, subTotal - v);
            if (a)
                return true;
        }
        return false;
    }

    const a = solveRec(D, 0, signature);
    if (a)
        return solution;
    else
        throw "impossible to solve";
}*/