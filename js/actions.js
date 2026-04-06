const ninja = document.querySelector('ninja-keys');
ninja.data = [
    {
        title: 'Move notes one octave up',
        icon: "8↑",
        handler: () => performActionOnSelection(str8up)
    },
    {
        title: 'Move notes one octave down',
        icon: "8↓",
        handler: () => performActionOnSelection(str8down)
    },

    {
        title: 'Add notes one octave up',
        icon: "+8↑",
        handler: () => performActionOnSelection(abcdString => mapToAllTokens(abcdString, (str) => addPitch(str, 7)))
    },
    {
        title: 'Add notes one octave down',
        icon: "+8↓",
        handler: () => performActionOnSelection(abcdString => mapToAllTokens(abcdString, (str) => addPitch(str, -7)))
    },


];

[

];