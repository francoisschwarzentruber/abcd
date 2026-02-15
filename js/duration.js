class Duration {
    constructor(value) {
        if (typeof (value) == "string")
            this.str = value;
        else {
            this.str = durationFractionToStr(value);
        }
    }

    toString() { return this.str; }
}

/**
 * 
 * @param {*} duration 
 * @returns a string representing the duration
 * 
 * @example durationFractionToStr(1.875) == "15/2"
 */
function durationFractionToStr(duration) {
    switch (duration) {
        case 1.5: return "6";
        case 1: return "4";
        case 0.75: return "3";
    }


    function exp2sym(i) {
        if (i == 0)
            return "4";
        if (i == 1)
            return "2";
        if (i == 2)
            return "";

        return "/".repeat(i - 2);
    }

    for (let num of [1, 3, 7]) {
        for (let i = 0; i <= 6; i++) {
            const possibleDuration = num / (2 ** i);
            if (duration == possibleDuration) {
                const denom = 2 ** i;
                return "" + (num != 1 ? num : "") + exp2sym(num != 1 ? (i) : i);
            }
        }
    }


    for (let num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
        for (let denom of [1, 2, 4, 8, 16, 32]) {
            if (duration == num / denom)
                return 4 * num + "/" + denom;
        }
    }

    console.error("impossible to write down the duration for " + duration)
    return "";

}