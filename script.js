Tone.start();

const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
    }
}).toDestination();


let currentOctave = 4;
const minOctave = 1;
const maxOctave = 7;




const noteMapping = {

    'a': { note: 'C', offset: 0 },
    's': { note: 'D', offset: 0 },
    'd': { note: 'E', offset: 0 },
    'f': { note: 'F', offset: 0 },
    'g': { note: 'G', offset: 0 },
    'h': { note: 'A', offset: 0 },
    'j': { note: 'B', offset: 0 },


    'w': { note: 'C#', offset: 0 },
    'e': { note: 'D#', offset: 0 },
    't': { note: 'F#', offset: 0 },
    'y': { note: 'G#', offset: 0 },
    'u': { note: 'A#', offset: 0 },


    'k': { note: 'C', offset: 1 },
    'l': { note: 'D', offset: 1 },
    'o': { note: 'C#', offset: 1 }
};


const saragamMap = {
    'C':  { en: 'Sa', hi: 'सा' },
    'C#': { en: 'Re♭', hi: 'रे॒' },
    'D':  { en: 'Re', hi: 'रे' },
    'D#': { en: 'Ga♭', hi: 'ग॒' },
    'E':  { en: 'Ga', hi: 'ग' },
    'F':  { en: 'Ma', hi: 'म' },
    'F#': { en: 'Ma♯', hi: 'म॑' },
    'G':  { en: 'Pa', hi: 'प' },
    'G#': { en: 'Dha♭', hi: 'ध॒' },
    'A':  { en: 'Dha', hi: 'ध' },
    'A#': { en: 'Ni♭', hi: 'नि॒' },
    'B':  { en: 'Ni', hi: 'नि' }
};


let currentStyle = 'english';


function getNoteLabel(noteBase) {
    if (currentStyle === 'english') return noteBase;
    if (currentStyle === 'saragam') return saragamMap[noteBase]?.en || noteBase;
    return saragamMap[noteBase]?.hi || noteBase;
}


function updateKeyLabels() {
    document.querySelectorAll('.key').forEach(keyEl => {
        const noteSpan = keyEl.querySelector('.note');
        if (noteSpan) {
            noteSpan.textContent = getNoteLabel(keyEl.dataset.note);
        }
    });
}


function setStyle(style) {
    currentStyle = style;
    document.querySelector('.container').setAttribute('data-style', style);
    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.style-btn[data-style="${style}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    updateKeyLabels();
}


document.querySelector('.container').setAttribute('data-style', 'english');


const pressedKeys = new Set();


const octaveDisplay = document.getElementById('current-octave');

function updateOctaveDisplay() {
    if (octaveDisplay) {
        octaveDisplay.textContent = currentOctave;
    }
}


function playNote(noteConfig, inputKey) {
    const targetOctave = currentOctave + noteConfig.offset;
    const fullNote = `${noteConfig.note}${targetOctave}`;
    const noteBase = noteConfig.note;


    let keyElement = null;


    if (inputKey) {
        keyElement = document.querySelector(`.key[data-key="${inputKey}"]`);
    }


    if (!keyElement) {
        keyElement = document.querySelector(`.key[data-note="${noteBase}"]`);
    }

    if (keyElement) {
        keyElement.classList.add('playing');
        createFloatingNote(keyElement, fullNote);
    }

    synth.triggerAttack(fullNote);
}


function stopNote(noteConfig, inputKey) {
    const targetOctave = currentOctave + noteConfig.offset;
    const fullNote = `${noteConfig.note}${targetOctave}`;

    let keyElement = null;


    if (inputKey) {
        keyElement = document.querySelector(`.key[data-key="${inputKey}"]`);
    }


    if (!keyElement) {
        keyElement = document.querySelector(`.key[data-note="${noteConfig.note}"]`);
    }

    if (keyElement) {
        keyElement.classList.remove('playing');
    }


    synth.triggerRelease(fullNote);
}


document.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    const key = e.key.toLowerCase();

    if (noteMapping[key] && !pressedKeys.has(key)) {
        pressedKeys.add(key);
        playNote(noteMapping[key], key);
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();

    if (noteMapping[key]) {
        pressedKeys.delete(key);
        stopNote(noteMapping[key], key);
    }
});


document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        if (currentOctave < maxOctave) {
            currentOctave++;
            updateOctaveDisplay();
        }
    } else if (e.key === 'ArrowDown') {
        if (currentOctave > minOctave) {
            currentOctave--;
            updateOctaveDisplay();
        }
    }
});


document.querySelectorAll('.key').forEach(keyElement => {
    function noteOn(e) {
        if (e.type.startsWith('touch')) {
            e.preventDefault();
        }
        const note = keyElement.dataset.note;
        let offset = 0;
        if (keyElement.dataset.offset) {
            offset = parseInt(keyElement.dataset.offset);
        }

        const fullNote = `${note}${currentOctave + offset}`;

        keyElement.classList.add('playing');
        createFloatingNote(keyElement, fullNote);
        synth.triggerAttack(fullNote);
    }

    function noteOff(e) {
        if (e.type.startsWith('touch')) {
            e.preventDefault();
        }
        const note = keyElement.dataset.note;
        let offset = 0;
        if (keyElement.dataset.offset) {
            offset = parseInt(keyElement.dataset.offset);
        }
        const fullNote = `${note}${currentOctave + offset}`;

        keyElement.classList.remove('playing');
        synth.triggerRelease(fullNote);
    }

    keyElement.addEventListener('mousedown', noteOn);
    keyElement.addEventListener('mouseup', noteOff);
    keyElement.addEventListener('mouseleave', noteOff);
    keyElement.addEventListener('touchstart', noteOn, { passive: false });
    keyElement.addEventListener('touchend', noteOff, { passive: false });
    keyElement.addEventListener('touchcancel', noteOff, { passive: false });
});


function createFloatingNote(keyElement, noteName) {
    const note = document.createElement('div');
    note.classList.add('floating-note');

    const noteBase = keyElement.dataset.note;
    note.textContent = getNoteLabel(noteBase);

    if (currentStyle === 'hindi') {
        note.classList.add('hindi');
    }

    const rect = keyElement.getBoundingClientRect();
    note.style.left = `${rect.left + rect.width / 2}px`;
    note.style.top = `${rect.top}px`;

    document.body.appendChild(note);

    setTimeout(() => {
        note.remove();
    }, 1500);
}


document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setStyle(btn.dataset.style);
    });
});


if (screen.orientation) {
    screen.orientation.addEventListener('change', () => {
        document.getElementById('rotate-overlay').style.display =
            screen.orientation.type.includes('portrait') && window.innerWidth <= 768 ? 'flex' : 'none';
    });
}