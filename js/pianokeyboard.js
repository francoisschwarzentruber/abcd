// @ts-check

/**
 * HTMLElement for a piano keyboard
 */
class PianoKeyboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.octaveNotes = [
      { name: 'c', accidental: 0, type: 'white' }, { name: 'c', accidental: 1, type: 'black' },
      { name: 'd', accidental: 0, type: 'white' }, { name: 'd', accidental: 1, type: 'black' },
      { name: 'e', accidental: 0, type: 'white' }, { name: 'f', accidental: 0, type: 'white' },
      { name: 'f', accidental: 1, type: 'black' }, { name: 'g', accidental: 0, type: 'white' },
      { name: 'g', accidental: 1, type: 'black' }, { name: 'a', accidental: 0, type: 'white' },
      { name: 'a', accidental: 1, type: 'black' }, { name: 'b', accidental: 0, type: 'white' }
    ];
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
        keysHtml += `<div class="key ${note.type}" data-name= "${note.name}" data-accidental= ${note.accidental} data-octave=${i} }}></div>`;
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
          position:relative;
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
          transitioname:background 0.1s;
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
          transitioname:background 0.1s;
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
          detail: { name: key.dataset.name, accidental: key.dataset.accidental, octave: key.dataset.octave },
          bubbles: true,
          composed: true
        }));
      });
    });
  }
}

customElements.define('piano-keyboard', PianoKeyboard);