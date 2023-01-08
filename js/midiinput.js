var log = console.log.bind(console), keyData = document.getElementById('key_data'),
    deviceInfoInputs = document.getElementById('inputs'), deviceInfoOutputs = document.getElementById('outputs');
var AudioContext = AudioContext || webkitAudioContext; // for ios/safari
var context = new AudioContext();
var activeNotes = [];
var btnBox = document.getElementById('content'), btn = document.getElementsByClassName('button');
var data, cmd, channel, type, note, velocity;

let midi;


class MidiInput {
    static setEventListenerNoteOff(f) { MidiInput.onNoteOff = f; }
    static setEventListenerNoteOn(f) { MidiInput.onNoteOn = f; }


    static start() {


        function onMIDISuccess(midiAccess) {
            midi = midiAccess;
            midi.onstatechange = (event) => {
                const port = event.port, state = port.state, name = port.name, type = port.type;
                if (type == "input")
                    console.log("name", name, "port", port, "state", state);
            }

            var inputs = midi.inputs.values();
            // loop through all inputs
            for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                // listen for midi messages
                input.value.onmidimessage = onMIDIMessage;

                listInputs(input);
            }

        }




        function listInputs(inputs) {
            var input = inputs.value;
            log("Input port : [ type:'" + input.type + "' id: '" + input.id +
                "' manufacturer: '" + input.manufacturer + "' name: '" + input.name +
                "' version: '" + input.version + "']");
        }


        // request MIDI access
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess,
                (e) => console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e));
        }
        else {
            log("No MIDI support in your browser.");
        }






        function onMIDIMessage(event) {
            if (!document.getElementById("recordMidi").checked)
                return;
            data = event.data,
                cmd = data[0] >> 4,
                channel = data[0] & 0xf,
                type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
                note = data[1],
                velocity = data[2];
            // with pressure and tilt off
            // note off: 128, cmd: 8 
            // note on: 144, cmd: 9
            // pressure / tilt on
            // pressure: 176, cmd 11: 
            // bend: 224, cmd: 14
            console.log('MIDI data', data);
            switch (type) {
                case 144: // noteOn message 
                    if (velocity == 0)
                        MidiInput.onNoteOff(note, velocity);
                    else
                        MidiInput.onNoteOn(note, velocity);
                    break;
                case 128: // noteOff message 
                    MidiInput.onNoteOff(note, velocity);
                    break;
            }

            //  console.log('data', data, 'cmd', cmd, 'channel', channel);
        }
    }
}
