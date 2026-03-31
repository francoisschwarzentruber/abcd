/**
 * An element with duration can be a Chord or a rest
 */
class ElementWithDuration {
    duration;
    constructor(duration) { this.duration = duration; }
    setDuration(d) { this.duration = new Duration(d); }
}

/**
 * A rest (silence)
 */
class Rest extends ElementWithDuration {
    constructor(letter, duration) {
        super(duration);
        this.duration = duration;
        this.letter = letter;
    }
    toStringABC() { return (this.letter == "r" ? "z" : this.letter) + this.duration.toString(); }
    toStringABCD() { return (this.letter == "r" ? "z" : this.letter) + this.duration.toString(); }
}


/**
 * a note or a chord
 */
class Chord extends ElementWithDuration {
    constructor(pitchs, duration) {
        super(duration);
        this.pitchs = pitchs;
    }

    toStringABC() {
        const pitchsStr = this.pitchs.map(pitch => {
            const accidentalString = (pitch.accidental == 0) ? "=" : (pitch.accidental > 0 ? "^".repeat(pitch.accidental) : "_".repeat(-pitch.accidental));
            const octaveString = octaveToString(pitch.octave - 1);
            return accidentalString + iNote7ToLy(pitch.value7) + octaveString;
        });

        if (pitchsStr.length == 1)
            return pitchsStr[0] + this.duration.toString();
        else
            return "[" + pitchsStr.join("") + "]" + this.duration.toString();
    }

    toStringABCD() {
        const pitchsStr = this.pitchs.map(pitch => {
            const accidentalString = (pitch.accidental == 0) ? "♮" : (pitch.accidental > 0 ? "♯".repeat(pitch.accidental) : "♭".repeat(-pitch.accidental));
            const octaveString = octaveToString(pitch.octave);
            return accidentalString + iNote7ToLy(pitch.value7) + octaveString;
        });

        return pitchsStr.join("") + this.duration.toString();

    }
}

/**
 * a signature, e.g. "4/4"
 */
class ElementSignature {
    constructor(tokenStr) { this.tokenStr = tokenStr; }
    toStringABC() { return "[M: " + this.tokenStr + "]"; }
}



class ElementClef {
    constructor(tokenStr) {
        this.tokenStr = tokenStr;
    }

    static isTokenClef(anyTokenStr) {
        switch (anyTokenStr) {
            case "𝄢", "f:": return "[K:bass]";
            case "𝄞", "g:": return "[K:treble]";
            case "𝄞8", "g8:": return "[K:treble-8]";
            case "𝄞-8", "g-8:": return "[K:treble-8]";
            case "𝄞+8", "g+8:": return "[K:treble+8]";
        }
        return undefined;
    }

    toStringABC() {
        return tokenClefToABC(this.tokenStr);
    }
}



class ElementTempo {
    constructor(tokenStr) {
        this.tokenStr = tokenStr;
    }

    static isTokenStrTempo(tokenStr) {
        if (tokenStr.startsWith("♩=")) {
            return tokenStr.substr(2);
        }
    }

    toStringABC() {
        return "[Q:1/4=" + this.tokenStr.substr(2) + "]";
    }

}



/**
 * a tonality changes
 * @example new ElementTonality("##")
 */
class ElementTonality {
    constructor(tokenStr) {
        this.tonalityNumber = ElementTonality.isTonalityStr(tokenStr);
    }

    static isTonalityStr(token) {
        return strToTonalityNumber(token);
    }

    toStringABC() {

        if (this.tonalityNumber >= 0)
            return ["[K:Cmaj]", " [K:Gmaj]", " [K:D]", " [K:A]", " [K:E]", " [K:B]", " [K:F#maj]", " [K:C#maj]"][this.tonalityNumber];

        if (this.tonalityNumber < 0)
            return ["[K:Cmaj", " [K:F] ", "[K:Bb]", " [K:Eb] ", " [K:Ab] ", " [K:Db] ", " [K:Gb] ", " [K:Cb] "][-this.tonalityNumber];

    }
}

/**
 * class for a symbol e.g. "(3", "(5"
 */
class NupletSymbolElement {
    /**
     * 
     * @param {number} value
     * @example new NupletSymbolElement(3)
     */
    constructor(value) { this.value = value; }
    toStringABC() { return "(" + this.value; }
}

/**
 * class for any element (which is not a note or a rest)
 */
class StringElement {
    constructor(string) { this.string = string; }
    toStringABC() { return this.string; }
}


/**
 * 
 * @param {*} tokenStr 
 * @returns element corresponding to tokenStr
 */
function tokenToElement(tokenStr) {
    console.log(tokenStr)
    if (tokenStr == "")
        return new StringElement(tokenStr);

    if (isTimeSignature(tokenStr))
        return new ElementSignature(tokenStr);

    if (ElementClef.isTokenClef(tokenStr))
        return new ElementClef(tokenStr);

    if (ElementTonality.isTonalityStr(tokenStr))
        return new ElementTonality(tokenStr);

    if (ElementTempo.isTokenStrTempo(tokenStr))
        return new ElementTempo(tokenStr);

    /**
    * @param {*} string
    * @returns the value of the nuplet symbol if it is one, otherwise it returns undefined
    * @example on "(3" returns 3
    */
    function isStringNupletSymbol(string) {
        return string.startsWith("(") ? parseInt(string.substr(1)) : undefined;
    }


    if (isStringNupletSymbol(tokenStr)) {
        const value = isStringNupletSymbol(tokenStr);
        return new NupletSymbolElement(value);
    }

    /**
     * 
     * @param {*} str 
     * @returns [ the rest of the string, value of the accidental read] or [str, undefined]
     */
    function eatAccidental(str) {
        if (str.startsWith("♮"))
            return [str.substr(1), 0];

        let accidental = undefined;
        if (str.startsWith("♯♯") || str.startsWith("##")) {
            accidental = 2;
        }
        else if (str.startsWith("♯") || str.startsWith("#")) {
            accidental = 1;
        }
        else if (str.startsWith("♭♭")) {
            accidental = -2;
        }
        else if (str.startsWith("♭")) {
            accidental = -1;
        }

        str = str.substr(Math.abs(accidental));
        return [str, accidental];
    }



    function eatRestLetter(str) {
        if (str.startsWith("_")) return [str.substr(1), "r"];
        if (str.startsWith("r")) return [str.substr(1), "r"];
        if (str.startsWith("x")) return [str.substr(1), "x"];
        return [str, undefined];
    }



    /**
     * 
     * @param {*} str 
     * @returns [the rest to be parsed, the letter] or [str, undefined]
     */
    function eatLetterNote(str) {
        if (str.startsWith("do"))
            return [str.substr(2), "c"];
        if (str.startsWith("ré"))
            return [str.substr(2), "d"];
        if (str.startsWith("mi"))
            return [str.substr(2), "e"];
        if (str.startsWith("fa"))
            return [str.substr(2), "f"];
        if (str.startsWith("sol"))
            return [str.substr(3), "g"];
        if (str.startsWith("la"))
            return [str.substr(2), "a"];
        if (str.startsWith("si"))
            return [str.substr(2), "b"];

        const letterNote = str[0];
        if (!(["a", "b", "c", "d", "e", "f", "g"].indexOf(letterNote.toLowerCase()) >= 0))
            return [str, undefined];
        return [str.substr(1), letterNote];
    }

    function eatOctaves(str) {
        let octave = 0; // by default
        for (let i = 4; i >= 1; i--)
            if (str.startsWith("'".repeat(i))) {
                octave = i;
                str = str.substr(i);
                break;
            }

        for (let i = 4; i >= 1; i--)
            if (str.startsWith(",".repeat(i))) {
                octave = -i;
                str = str.substr(i);
                break;
            }
        return [str, octave];
    }

    let letter = undefined;
    let accidental = undefined;

    [tokenStr, letter] = eatRestLetter(tokenStr);
    if (letter)
        return new Rest(letter, new Duration(tokenStr));


    const pitchs = [];
    while (tokenStr.length > 0) {
        [tokenStr, accidental] = eatAccidental(tokenStr);

        if (tokenStr == "")
            break;

        [tokenStr, letter] = eatLetterNote(tokenStr);
        if (letter == undefined) {
            if (pitchs.length > 0)
                if (pitchs[pitchs.length - 1].accidental == undefined)
                    pitchs[pitchs.length - 1].accidental = accidental;
            break;
        }

        let value = 0;
        value = lyNoteLetterToiNote7(letter.toLowerCase());

        let octave;
        [tokenStr, octave] = eatOctaves(tokenStr);

        if (letter == letter.toUpperCase()) //if uppercase
            octave--;

        value += octave * 7;

        pitchs.push(new Pitch(value, accidental));
    }

    if (pitchs.length > 0)
        return new Chord(pitchs, new Duration(tokenStr));


    return new StringElement(tokenStr);
}





function lyNoteLetterToiNote7(iNote) {
        switch (iNote) {
            case "c": return 0;
            case "d": return 1;
            case "e": return 2;
            case "f": return 3;
            case "g": return 4;
            case "a": return 5;
            case "b": return 6;
        }
        throw "error";
    }

function lyToPitch(str) {
    const el = new Chord(str);
    return el.pitchs[0];
}