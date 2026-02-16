/**
 * 
 * @param {*} abcdString 
 * @param {*} f 
 * @returns apply function f to all tokens in abcdString and returns the obtained string
 */
function mapToAllToken(abcdString, f) {
    return abcdString.replaceAll("[", " [ ")
        .replaceAll("]", " ] ")
        .split(' ').map(f).join(' ').replaceAll(" [ ", "[").replaceAll(" ] ", "]");
}

/**
 * 
 * @param {*} abcdString 
 * @returns the string where each note is one octave higher
 * 
 * @example str8up("a'' c,") == "a''' c"
 */
function str8up(abcdString) {
    function move8up(abcdTokenString) {
        if (abcdTokenString == "") return abcdTokenString;
        try {
            const note = new Element(abcdTokenString);
            note.value += 7;
            return note.toStringLy();
        }
        catch (e) {
            return abcdTokenString;
        }

    }
    return mapToAllToken(abcdString, move8up);
}

/**
 * 
 * @param {*} abcdString 
 * @returns the string where each note is one octave lower
 * 
 * @example str8up("a'' c,") == "a' c,,"
 */
function str8down(abcdString) {
    function move8up(abcdTokenString) {
        if (abcdTokenString == "") return abcdTokenString;
        try {
            const note = new Element(abcdTokenString);
            note.value -= 7;
            return note.toStringLy();
        }
        catch {
            return abcdTokenString;
        }

    }
    return mapToAllToken(abcdString, move8up);
}




/**
 * 
 * @param pitch1 
 * @param pitch2 
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
* @param pitch 
* @returns the same pitch but in the normal octave
*/
function modulo(pitch) {
    return new Pitch(pitch.value % 7, pitch.accidental);
}



/**
* 
* @param pitch 
* @param key 
* @returns the same pitch but in the key (e.g. G# in Eb is Ab)
*/
function enharmonic(pitch, key) {
    const pitch0e = imidiNote2Pitch(pitch.nbHalfTones - key.nbHalfTones);
    return add(pitch0e, key);
}

/**
* 
* @param key : Pitch
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
 * @param pitch 
 * @param key 
 * @return the pitch with the accidental that is natural in the key
 * @example accidentalize(C, E) => C# because C has a # in E major
 */
function accidentalize(pitch, key) { return new Pitch(pitch.value, getAccidentals(key)[pitch.value7]); }


/**
 * 
 * @param {*} tonalityNumber 
 * @returns a string that represents the tonic in the major tonality
 * 
 * @example tonalityNumberToTonicMajor(2) returns new Pitch('d')
 */
function tonalityNumberToTonicMajor(tonalityNumber) {
    return lyToPitch(["c♭", "g♭", "d♭", "a♭", "e♭", "b♭", "f", "c", "g", "d", "a", "e", "b", "f#", "c#"][7 + tonalityNumber]);
}