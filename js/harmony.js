class Note {
    constructor(s) {
        if (s == "")
            throw "empty string";

        if (!(["a", "b", "c", "d", "e", "f", "g"].indexOf(s[0]) >= 0))
            throw "not a note";
        this.note = s[0];

        s = s.substr(1);

        this.alteration = 0;
        if (s.startsWith("♯♯")) {
            this.alteration = 2;
        }
        else if (s.startsWith("♯")) {
            this.alteration = 1;
        }
        else if (s.startsWith("♭♭")) {
            this.alteration = -2;
        }
        else if (s.startsWith("♭")) {
            this.alteration = -1;
        }

        s = s.substr(Math.abs(this.alteration));

        this.height = 0; // by default
        for (let i = 4; i >= 1; i--)
            if (s.startsWith("'".repeat(i))) {
                this.height = i;
                s = s.substr(i);
                break;
            }

        for (let i = 4; i >= 1; i--)
            if (s.startsWith(",".repeat(i))) {
                this.height = -i;
                s = s.substr(i);
                break;
            }

        this.duration = s;
    }


    toString() {
        return this.note + (this.alteration > 0 ? "♯".repeat(this.alteration) : "♭".repeat(-this.alteration))
            + (this.height > 0 ? "'".repeat(this.height) : ",".repeat(-this.height))
            + this.duration;
    }


}



function str8up(str) {
    function move8up(s) {
        if (s == "") return s;
        try {
            const note = new Note(s);
            note.height++;
            return note.toString();
        }
        catch (e) {
            console.log(e)
            return s;
        }

    }
    return str.split(' ').map(move8up).join(' ');
}


function str8down(str) {
    function move8up(s) {
        if (s == "") return s;
        try {
            const note = new Note(s);
            note.height--;
            return note.toString();
        }
        catch {
            console.log(s)
            return s;
        }

    }
    return str.split(' ').map(move8up).join(' ');
}


