const memo = {};

/**
 * 
 * @param {*} abcdStr 
 * @param {*} signature 
 * @param {*} result
 * @example abcdStr = "a  b ", signature = 1, result = "a2 b2 "
 * @description store the result of guessing rhythm so that we do not call the solver again and again 
 */
function storeMemo(abcdStr, signature, result) {
    memo[signature + abcdStr] = result;
}


class RhythmGuess {
    static async getRhythm(abcdStr, signature = "4/4") {
        if (memo[signature + abcdStr])
            return memo[signature + abcdStr];

        return await RhythmGuess.inferRhythm(abcdStr, signature);
    }


    /**
     * 
     * @param {*} abcdStr, a string representing the content of a voice of a measure
     * @param {*} signature, the duration of the measure. 1 = a whole note
     * @returns a string where each elemnt (note or rest) has a duration
     * @description if the string does not contain any note/rest/chord, then it adds a "x" with its duration at the end
     */
    static async inferRhythm(abcdStr, signature) {
        const signatureValue = eval(signature);
        console.log(`inferRhythm(${abcdStr}, ${signature})`)
        abcdStr = abcdStr.trimLeft();

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
                    nbSpacesArray.push(0);
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
                    nbSpacesArray.push(isElement ? (1 + ((token.indexOf(".") >= 0) ? 0.5 : 0)) : 0);
                }
            });

            nbSpacesArray[elements.length - 1]--;
            nbSpaces = 0;

            for (const x of nbSpacesArray)
                nbSpaces += x;

            if (nbSpaces == 0) nbSpaces = 1;

            for (let i = 0; i < elements.length; i++)
                elements[i].dhat = nbSpacesArray[i] / nbSpaces;

            console.log("spaces: ", nbSpacesArray);
            console.log("nb total spaces: ", nbSpaces)

            return elements;

        }






        /**
         * 
         * @param {*} elements
         * @returns elements unchanged if elements contain notes or rests
         * elements + a rest 
         */
        function addFakeRestIfMeasureIsEmpty(elements) {
            if (elements.some((el) => el instanceof Element || el instanceof Chord))
                return elements;
            else {
                const extraRest = new Element("x")
                elements.push(extraRest);
                extraRest.dhat = 1;
                return elements;
            }
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
                        return getPossibleDurations(e, proportion, signature).map((x) => x * factor);
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

                let splittingDuration = 0.25; //

                if (["6/8", "9/8", "3/8", "12/8"].indexOf(signature) >= 0)
                    splittingDuration = 1.5 / 4;
                return e.toStringABCD() + (isEq(Math.floor(t / splittingDuration), t / splittingDuration) ? " " : "");
            }).join(" ");

        }

        //main
        try {
            const tokens = tokenize(abcdStr);
            const elements = addFakeRestIfMeasureIsEmpty(tokenToElements(tokens));
            const possibleDurations = computePossibleDurations(elements);
            const durationsSolution = await solve(elements.map((e) => e.dhat), possibleDurations, signatureValue);
            setDurations(elements, durationsSolution);
            const abcdResult = elementsToABCD(elements, durationsSolution);
            console.log("result of the inference: ", durationsSolution, abcdResult)
            storeMemo(abcdStr, signature, abcdResult);
            return abcdResult;

        } catch (e) {
            console.error(e);
            return abcdStr + ' [Q:"error: inconsistent_rhythm"] ';
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

    abcdStr = abcdStr.replaceAll(/\([^0-9]/g, (s) => " ( " + s.substr(1));
    abcdStr = abcdStr.replaceAll(")", " ) ");
    abcdStr = abcdStr.replaceAll("-", " - ");

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


function getPossibleDurations(element, ratio, signature) {
    let A = [eval(signature)]; // the signature itself should always be a possibility (e.g. one single note)
    let num = 1;
    let istart = 0;

    let durationStr = element.duration.toString();

    if (durationStr == "4")
        return [1];

    if (durationStr == "2")
        return [1 / 2];

    if (durationStr == "2.")
        return [3 / 4];

    if (durationStr == "2..")
        return [3 / 4];

    if (durationStr == "1")
        return [1 / 4];

    if (durationStr == "1.")
        return [3 / 8];

    if (durationStr == "1.")
        return [7 / 16];

    if (durationStr.startsWith("7") || durationStr.endsWith(".."))
        num = 7;
    else if (durationStr.startsWith("3") || durationStr.endsWith("."))
        num = 3;


    if (durationStr.startsWith("////"))
        istart = 6;
    else if (durationStr.startsWith("///") || (durationStr == "𝅬"))
        istart = 5;
    else if (durationStr.startsWith("//"))
        istart = 4;
    else if ((durationStr.startsWith("/")) || (durationStr == "♪"))
        istart = 3;

    const precision = 7;
    for (let i = istart; i < precision; i++)
        A.push(num / (2 ** i));

    return A.sort((a, b) => Math.abs(a - ratio) - Math.abs(b - ratio));
}



function isEq(a, b) { return Math.abs(a - b) < 0.00001; }


const solve = window.location.href.indexOf("github") >= 0 ? solveQuickAndDirty : solveWithLP//solveQuickAndDirty;
/**
 * 
 * @param {*} dhats 
 * @param {*} possibleDurations 
 * @param {*} signatureValue 
 * @returns array of durations, or 0 if no solution
 * @description it calls the LP solver in Python (server side)
 */
async function solveWithLP(dhats, possibleDurations, signatureValue) {
    var url = '/your/url';
    var formData = new FormData();
    const strJSON = JSON.stringify({ dhats, possibleDurations, signature: signatureValue });
    formData.append('input', JSON.stringify({ dhats, possibleDurations, signature: signatureValue }));

    const f = await fetch("./guessRhythm/guessRhythm.php", { method: 'POST', body: formData });
    const txt = await f.text();
    const lines = txt.split("\n");
    console.log(txt)
    const array = JSON.parse(lines[lines.length - 2]);

    if (array == "0")
        throw "no solution"
    return array;
}

/**
 * up([1, 2, 4, 5,3], [3, 4])
 * */
function up(durations, bests) {
    return durations.sort((a, b) => {
        if ((bests.indexOf(a) >= 0) && (bests.indexOf(b) >= 0))
            return bests.indexOf(a) >= bests.indexOf(b);
        else if (bests.indexOf(a) >= 0)
            return -1;
        else if (bests.indexOf(b) >= 0)
            return 1;
        else
            return 0;
    })
}


async function solveQuickAndDirty(dhats, D, signature) {
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




        for (j = 0; j < i; j++)
            if (dhats[j] == dhats[i]) {
                newD[i] = up(newD[i], [solution[j]]);
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
}