class PianoKeyboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.octaveNotes = [
      { n: 'C', t: 'white' }, { n: 'C#', t: 'black' },
      { n: 'D', t: 'white' }, { n: 'D#', t: 'black' },
      { n: 'E', t: 'white' }, { n: 'F', t: 'white' },
      { n: 'F#', t: 'black' }, { n: 'G', t: 'white' },
      { n: 'G#', t: 'black' }, { n: 'A', t: 'white' },
      { n: 'A#', t: 'black' }, { n: 'B', t: 'white' }
    ];
  }

  static get observedAttributes() {
    return ['octaves'];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const octaves = parseInt(this.getAttribute('octaves') || '1');
    const totalWhiteKeys = octaves * 7;
    let keysHtml = '';

    for (let i = 0; i < octaves; i++) {
      this.octaveNotes.forEach(note => {
        const noteName = `${note.n}${i}`;
        keysHtml += `<div class="key ${note.t}" data-note="${noteName}"></div>`;
      });
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 200px;
          --white-count: ${totalWhiteKeys};
          --white-width: calc(100% / var(--white-count));
          --black-width: calc(var(--white-width) * 0.7);
        }

        .keyboard {
          display: flex;
          width: 100%;
          height: 100%;
          background: #111;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          user-select: none;
        }

        .key {
          box-sizing: border-box;
          cursor: pointer;
        }

        .white {
          flex: 1 0 var(--white-width);
          background: white;
          border: 1px solid #333;
          z-index: 1;
          border-radius: 0 0 5px 5px;
          transition: background 0.1s;
        }

        .white:active {
          background: #ddd;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
        }

        .black {
          width: var(--black-width);
          height: 60%;
          background: #000;
          /* The magic: Negative margins pull the white keys together 
             so the black key sits "on top" of the seam */
          margin-left: calc(var(--black-width) / -2);
          margin-right: calc(var(--black-width) / -2);
          z-index: 2;
          border-radius: 0 0 3px 3px;
          border: 1px solid #000;
          transition: background 0.1s;
        }

        .black:active {
          background: #444;
        }
      </style>
      <div class="keyboard">
        ${keysHtml}
      </div>
    `;

    // Interaction logic
    this.shadowRoot.querySelectorAll('.key').forEach(key => {
      key.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('noteplay', {
          detail: { note: key.dataset.note },
          bubbles: true,
          composed: true
        }));
      });
    });
  }
}

customElements.define('piano-keyboard', PianoKeyboard);