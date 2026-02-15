/**
 * 
 * @param {*} abcdLine 
 * @returns false if the line is not a staff line, otherwise returns an object containing the information of the line
 * {content: content without the instrument name, instrument: (optional) instrument name}
 * @description a staffline is a line starting with a key or starting with an instrument name followed by a key
 * 
 * isStaffLine('flute 𝄞 a a a |') returns {content: "a a a |", instrument: "flute"}
 * isStaffLine('𝄞 a a a |') returns {content: "𝄞 a a a |"}
 * isStaffLine('   a a |)' returns false
 *
 */
function isStaffLine(abcdLine) {
    if (abcdLine == "")
        return false;

    if (abcdLine.startsWith("𝄞") || abcdLine.startsWith("𝄢"))
        return { content: abcdLine };

    const words = abcdLine.split(" ");
    const firstWord = words[0].toLowerCase();
    let content = words.splice(1).join(" ").trim();

    if (instrumentToMIDITable[firstWord] != undefined) {
        if (!(content.startsWith("𝄞") || content.startsWith("𝄢")))
            content = (instrumentToStandardKey[firstWord] ? instrumentToStandardKey[firstWord] : "𝄞") + content;
        return { instrument: firstWord, content };
    }
    return false;
}


/**
 * 
 * @returns true if line is of the form "flute {" or "piano   {   "
 * 
 * isStaffInstrumentAndOpenCurlyBracket('piano {') returns {instrument: "piano"}
 * isStaffInstrumentAndOpenCurlyBracket('flute 𝄞 a a a |') returns false
 */
function isStaffInstrumentAndOpenCurlyBracket(abcdLine) {
    const words = abcdLine.split(" ");
    const firstWord = words[0].toLowerCase();
    const content = words.splice(1).join(" ").trim();

    if (content == "{" && instrumentToMIDITable[firstWord] != undefined)
        return { instrument: firstWord };

    return false;
}



function isLyricsLine(abcdLine) {
    if (abcdLine.startsWith("😀") || abcdLine.startsWith("💬"))
        return abcdLine.substr(2);

    //TODO: detect that the line does not contain music and therefore it is lyrics
    return false;
}






/**
     * 
     * @param {*} abcdLines 
     * @effect pop the corresponding lines in abcdLines
     * @returns the score preambule (title of the score + name of the composer)
     */
function extractScorePreambuleFromABCDLines(abcdLines) {
    const scorePreambule = new ScorePreambule();
    let i = 0;

    function isNotATitleOrComposer(line) {
        return line == "{" || isStaffLine(line);
    }

    while (abcdLines.length > 0) {
        let line = abcdLines[0].trim();
        if (line != "") {
            if (isNotATitleOrComposer(line))
                return scorePreambule;
            abcdLines.shift();
            if (i == 0) {
                scorePreambule.title = line;
                i++;
            }
            else {
                scorePreambule.composer = line;
                return scorePreambule;
            }
        }
        else
            abcdLines.shift();
    }
    return scorePreambule;
}

/**
 * 
 * @param {*} abcdString that represents a score. For instance
 *          Bloup
 *                    Mozart
 * 
 * {
 * 𝄞 4/4 a |
 * 𝄢   a   |
 * }
 * 
 * 𝄞 4/4 a |
 * 𝄢   a   |
 * 
 * @returns the corresponding abc code
 */
async function abcd2abc(abcdString) {
    const abcdLines = abcdString.split("\n");
    const scorePreambule = extractScorePreambuleFromABCDLines(abcdLines);
    const score = await abcd2Score(abcdLines);
    score.scorePreambule = scorePreambule;

    return score.toStringABC();
}




function abcdMultipleLines2abcdSingleLines(abcdLines) {
    return abcdLines;
}





async function abcd2Score(abcdLines) {
    const score = new Score();
    const cursor = new Cursor();
    let currentInstrument = undefined;

    for (let i = 0; i < abcdLines.length; i++) {
        let lyrics = undefined;
        let line = abcdLines[i].trim();
        if (line == "") {
            cursor.reset();
        }





        else if (isStaffInstrumentAndOpenCurlyBracket(line)) {
            const infoStaff = isStaffInstrumentAndOpenCurlyBracket(line);
            currentInstrument = infoStaff.instrument;
            score.setStaffSymbol(cursor, "{");
        }

        else if (["[", "]", "{", "}"].indexOf(line) >= 0) {
            score.setStaffSymbol(cursor, line);
        }
        else if (lyrics = isLyricsLine(line)) {
            score.appendLyrics(cursor, lyrics);
        }
        else {
            if (isStaffLine(line)) {
                cursor.nextStaff();
                const infoStaff = isStaffLine(line);
                line = infoStaff.content;
                if (infoStaff.instrument)
                    currentInstrument = infoStaff.instrument;
            }





            let measures = line.split("|");
            let currentTonalityTonicMaj = new Pitch(0, 0);
            let currentTimeSignature = score.getLastTimeSignature(cursor);
            if (currentTimeSignature == undefined)
                currentTimeSignature = "4/4";

            measures = await Promise.all(measures.map(async (measureStr) => {
                if (measureStr == "") // DO NOT REMOVE. It enables to handle "||"
                    return "";

                let accidentals = {};

                const getCurrentAccidental = (pitchvalue) => {
                    const ppure = new Pitch(pitchvalue, 0);
                    if (accidentals[ppure.toStringABC()]) {
                        return accidentals[ppure.toStringABC()];
                    }
                    else {
                        const p = accidentalize(ppure, currentTonalityTonicMaj);
                        // console.log("looking for the tonality")
                        return p.accidental;
                    }
                }

                let timeSignatureRead = undefined;
                let alreadyOneNote = false;

                const abcdToken2abcToken = (token) => {
                    if (token == "") return token;

                    if (isTimeSignature(token)) {
                        timeSignatureRead = token;
                        if (!alreadyOneNote) {
                            currentTimeSignature = timeSignatureRead;
                        }
                        return "[M: " + token + "]";

                    }

                    switch (token) {
                        case "𝄢", "f:": return "[K:bass]";
                        case "𝄞", "g:": return "[K:treble]";
                        case "𝄞8", "g:": return "[K:treble-8]";
                        case "𝄞-8", "g:": return "[K:treble-8]";
                        case "𝄞+8", "g:": return "[K:treble+8]";
                    }

                    if (token.startsWith("♩="))
                        return "[Q:1/4=" + token.substr(2) + "]";
                    if (strToTonalityNumber(token)) {
                        currentTonalityTonicMaj = tonalityNumberToTonicMajor(strToTonalityNumber(token));
                        return token;
                    }
                    else {
                        let note;
                        try { note = new Element(token); }
                        catch { return token; } //console.log("TOKEN LEAVED AS IT IS: " + token)

                        //note is defined

                        alreadyOneNote = true;
                        const currentA = getCurrentAccidental(note.value);
                        if (note.accidental == undefined) {
                            return note.toStringABC();
                        }
                        else {
                            const noteAccidental = note.accidental;
                            note.pitch.accidental = undefined;
                            const ppure = new Pitch(note.pitch.value, 0);
                            accidentals[ppure.toStringABC()] = noteAccidental;

                            if (currentA == noteAccidental)
                                return note.toStringABC();
                            else {
                                note.pitch.accidental = noteAccidental;
                                return ((noteAccidental == 0) ? "=" : "") + note.toStringABC();
                            }
                        }

                    }
                };


                /**
                 * 
                 * @param {*} measureStr
                 * @description read in advance the signature for eventually update currentTimeSignature before the full 
                 */
                function readSignature(measureStr) {
                    measureStr.split(" ").map(abcdToken2abcToken);
                }

                readSignature(measureStr);
                accidentals = {}; //reintialize accidentals because of side effect of readSignature

                const result = (await RhythmGuess.getRhythm(measureStr, currentTimeSignature)).split(" ")
                    .map((A) => A.split("[")
                        .map((B) => B.split("]")
                            .map((C) => C.split("{")
                                .map((D) => D.split("}")
                                    .map(abcdToken2abcToken)
                                    .join("}")).join("{")).join("]")).join("[")).join(" ")

                if (timeSignatureRead != undefined)
                    currentTimeSignature = timeSignatureRead;

                return result;
            }));



            let s = measures.join("|");
            score.appendVoice(cursor, s, currentInstrument);

        }
    } //endfor

    return score;

}