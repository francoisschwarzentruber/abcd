// @ts-check
/// <reference path="pitch.js" />
/**
 * 
 * @param {string} abcdString 
 * @param {*} f 
 * @returns apply function f to all tokens in abcdString and returns the obtained string
 */
function mapToAllTokens(abcdString, f) {
    return abcdString.replaceAll("[", " [ ")
        .replaceAll("]", " ] ")
        .split(' ').map(f).join(' ').replaceAll(" [ ", "[").replaceAll(" ] ", "]");
}




/**
 * 
 * @param {string} abcdTokenString 
 * @param {number} diff 
 * @returns the string
 */
function movePitch(abcdTokenString, diff) {
    const element = tokenToElement(abcdTokenString);

    if (!(element instanceof Chord))
        return abcdTokenString;

    for (const pitch of element.pitchs)
        pitch.value += diff;

    return element.toStringABCD();
}


/**
 * 
 * @param {string} abcdString 
 * @returns the string where each note is one octave higher
 * 
 * @example str8up("a'' c,") == "a''' c"
 */
function str8up(abcdString) {
    return mapToAllTokens(abcdString, (str) => movePitch(str, 7));
}

/**
 * 
 * @param {*} abcdString 
 * @returns the string where each note is one octave lower
 * 
 * @example str8up("a'' c,") == "a' c,,"
 */
function str8down(abcdString) {
    return mapToAllTokens(abcdString, (str) => movePitch(str, -7));
}




/**
 * 
 * @param {Pitch} pitch1 
 * @param {Pitch} pitch2 
 * @return the sum of the two pitch.
 * @example add(D, E) = F# because D = one tone, D = two tones => the result is three tones, so F#
 */
function add(pitch1, pitch2) {
    let result = new Pitch(pitch1.value + pitch2.value, 0);
    let nbHalfTone = result.nbHalfTones - pitch1.nbHalfTones;
    result.accidental = pitch2.nbHalfTones - nbHalfTone;
    return result;
}

/**
* 
* @param {Pitch} pitch 
* @returns the same pitch but in the normal octave
*/
function modulo(pitch) {
    return new Pitch(pitch.value % 7, pitch.accidental);
}



/**
* 
* @param {Pitch} pitch
* @param {Pitch} key 
* @example enharmonic(new Pitch(1, 1), new Pitch(3, -1)) is Object { value: 2, accidental: -1 }
* @returns the same pitch but in the key (e.g. G# in Eb is Ab)
*/
function enharmonic(pitch, key) {
    const pitch0e = imidiNote2RawPitch(pitch.nbHalfTones - key.nbHalfTones);
    return add(pitch0e, key);
}

/**
* 
* @param {Pitch} key
* @returns the array of accidentals in the key
*/
function getAccidentals(key) {
    const array = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 7; i++) {
        let newPitch = modulo(add(new Pitch(i, 0), key));
        array[newPitch.value] = newPitch.accidental;
    }
    return array;
}


/**
 * @param {Pitch} pitch 
 * @param {Pitch} key 
 * @return the pitch with the accidental that is natural in the key
 * @example accidentalize(C, E) => C# because C has a # in E major
 */
function accidentalize(pitch, key) { return new Pitch(pitch.value, getAccidentals(key)[pitch.value7]); }

