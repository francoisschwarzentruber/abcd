class Duration {
    constructor(value) {
        if (typeof (value) == "string")
            this.str = value;
        else {
            this.str = durationFractionToStr(value);
        }
    }


    toString() {
        return this.str;
    }
}



function durationFractionToStr(d) {
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
        for (let i = 0; i < 6; i++) {
            const possibleDuration = num / (2 ** i);
            if (d == possibleDuration) {
                return "" + (num != 1 ? num : "") + exp2sym(num != 1 ? (i) : i);
            }
        }

    }

    return "";

}