export const ninja = document.querySelector('ninja-keys');
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

    {
        id: "dynamics",
        title: "Add dynamics",
        handler: () => {
            ninja.open({ parent: 'dynamics' });
            return { keepOpen: true };
        },
    },
    ...['pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'].map((dynamicsStr) => ({
        id: `dynamics/${dynamicsStr}`,
        parent: "dynamics",
        title: `Add dynamics ${dynamicsStr}`,
        handler: () => { editor.write(`!${dynamicsStr}!`) }
    }))
];

[

];