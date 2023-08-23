
function mapToAllToken(str, f) {
    return str.replaceAll("<", " < ")
        .replaceAll(">", " > ")
        .split(' ').map(f).join(' ').replaceAll(" < ", "<").replaceAll(" > ", ">");
}


function str8up(str) {
    function move8up(s) {
        if (s == "") return s;
        try {
            const note = new Element(s);
            note.pitch.value += 7;
            return note.toStringLy();
        }
        catch (e) {
            return s;
        }

    }
    return mapToAllToken(str, move8up);
}


function str8down(str) {
    function move8up(s) {
        if (s == "") return s;
        try {
            const note = new Element(s);
            note.pitch.value -= 7;
            return note.toStringLy();
        }
        catch {
            return s;
        }

    }
    return mapToAllToken(str, move8up);
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