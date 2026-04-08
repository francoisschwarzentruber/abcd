

/**
 * @description dictionnary instrument name to MIDI id
 */
const instrumentToMIDITable = {
    "piano": 1,
    "harpsichord": 7,
    "clavinet": 8,
    "celesta": 9,
    "glockenspiel": 10,
    "vibraphone": 12,
    "marimba": 13,
    "xylophone": 14,
    "guitar": 25,
    "violin": 41,
    "viola": 42,
    "cello": 43,
    "contrabass": 44,
    "trumpet": 57,
    "trombone": 58,
    "tuba": 59,
    "oboe": 69,
    "bassoon": 71,
    "clarinet": 72,
    "piccolo": 73,
    "flute": 74,
    "recorder": 75,
    "whistle": 79,
    "ocarina": 80,
    "bass": 54,
    "soprano": 53,
    "tenor": 53
}




/**
 * @type {Object.<string, string>}
 * @description Correspondance ABCD to ABC
 */
const clefsDictionnary = {
    "𝄢": "[K:bass]",
    "f:": "[K:bass]",
    "𝄞": "[K:treble]",
    "g:": "[K:treble]",
    "𝄞8": "[K:treble-8]",
    "g8:": "[K:treble-8]",
    "𝄞-8": "[K:treble-8]",
    "g-8:": "[K:treble-8]",
    "𝄞+8": "[K:treble+8]",
    "g+8:": "[K:treble+8]",
}



const dictionnaryABCDtoABC = {
    "tr": "!trill!",

}


/**
 * @description dictionnary instrument name to standard key for playing that instrument
 * if not present, by default it is 𝄞
 */
const instrumentToStandardKey = {
    "cello": "𝄢"
}



const abcdStringTimeSignature = ["1/2", "1/4", "2/2", "2/4", "3/4", "5/4", "7/4", "3/8", "4/4", "6/4", "6/8", "12/8", "15/8"];

function isTimeSignature(str) { return abcdStringTimeSignature.indexOf(str) >= 0; }

/**
 * 
 * @param {string} str 
 * @returns {number | undefined} the corresponding tonality number, and undefined if not a tonality
 * 
 * @example strToTonalityNumber('###') == 3
 * @example strToTonalityNumber('bb') == -2
 * @example strToTonalityNumber('####') == 4
 * @example strToTonalityNumber('bonjour') == undefined
 * 
 */
function strToTonalityNumber(str) {
    if (str == "♮")
        return 0;

    function accidentals(accident, n) { return accident.repeat(n); }

    for (const accident of ["#", "♯", "♭", "b"]) {
        for (let n = 7; n > 0; n--) {
            if (!(n == 1 && accident == "b")) // b once is not a tonality but a note "b"
                if (str == accidentals(accident, n))
                    return n * (((accident == "#") || accident == "♯") ? 1 : -1);
        }
    }
    return undefined;
}







const abcdStringClefs = Object.keys(clefsDictionnary);

/**
 * 
 * @param {*} abcdString 
 * @returns false if abcdString does not start with a clef, or that clef
 * @example isStartsWithClefs("𝄞 a") == "𝄞"
 * @example isStartsWithClefs("a a ") == false 
 */
function isStartsWithClefs(abcdString) {
    for (clef of abcdStringClefs)
        if (abcdString.startsWith(clef))
            return clef;

    return false;
}