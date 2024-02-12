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

    switch(d) {
        case 1.5: return "6";
        case 1: return "4";
    }

    for (let n of [1, 3, 7]) {
        for (let i = 0; i < 6; i++) {


            const possibleDuration = n / (2 ** i);
            if (d == possibleDuration) {
                const num = n;
                const denom = 2 ** i;

                return "" + (num != 1 ? num : "") + exp2sym(num != 1 ? (i) : i);
            }
        }

    }

    return "";

}