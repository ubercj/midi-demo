const inputDataContainer = document.getElementById("input-data");
const outputDataContainer = document.getElementById("output-data");
const notesContainer = document.getElementById("notes");
const eventLogContainer = document.getElementById("event-log");

/**
 * DOM manipulation
 */

const addElement = (parent, tag, content, id) => {
  const newElement = document.createElement(tag);
  if (id) {
    newElement.id = id;
  }
  newElement.textContent = content;
  parent.appendChild(newElement);
};

const updateElement = (el, content) => {
  el.textContent = content;
};

const clearLogButton = document.getElementById("clear-log");
clearLogButton.addEventListener("click", () => {
  updateElement(eventLogContainer, "");
});

/**
 * MIDI event handlers
 */

const NOTE_ON = "Note start";
const NOTE_OFF = "Note stop";
const PITCH_BEND = "Pitch_bend";
const EFFECTS = "Effects";

const parseCommand = (command) => {
  switch (command) {
    case 144:
      return NOTE_ON;
    case 128:
      return NOTE_OFF;
    case 224:
      return PITCH_BEND;
    case 176:
      return EFFECTS;
    default:
      return command;
  }
};

const getPitchName = (pitch) => {
  switch (pitch) {
    case 0:
      return "C";
    case 1:
      return "C#/Db";
    case 2:
      return "D";
    case 3:
      return "D#/Eb";
    case 4:
      return "E";
    case 5:
      return "F";
    case 6:
      return "F#/Gb";
    case 7:
      return "G";
    case 8:
      return "G#/Ab";
    case 9:
      return "A";
    case 10:
      return "A#/Bb";
    case 11:
      return "B";
    default:
      return "Error parsing pitch";
  }
};

const getNoteName = (note) => {
  const octave = Math.floor(note / 12) - 2;
  const pitchNumber = note % 12;

  const pitch = getPitchName(pitchNumber);
  return `${pitch}${octave}`;
};

const parseMIDImessage = (midiMessage) => {
  const commandData = midiMessage.data[0];
  const noteData = midiMessage.data[1];
  const velocity = midiMessage.data[2];

  const command = parseCommand(commandData);
  const note =
    command === NOTE_ON || command === NOTE_OFF
      ? getNoteName(noteData)
      : noteData;

  return { command, note, velocity };
};

const onMIDImessage = (event) => {
  const { command, note, velocity } = parseMIDImessage(event);
  const logMessage = `${event.timeStamp} | ${command}: ${note} ${velocity}`;
  console.log(logMessage);

  const parentNode = note ? notesContainer : eventLogContainer;
  const messageId = note || command;

  const existingNote = document.getElementById(messageId);
  if (existingNote && command === NOTE_OFF) {
    existingNote.remove();
  } else {
    addElement(parentNode, "p", logMessage, messageId);
  }
};

const onMIDISuccess = (midiAccess) => {
  console.log("MIDI ready");
  console.log(midiAccess);
};

const onMIDIFailure = (message) => {
  console.error("MIDI access failed: " + message);
};

const logInputsAndOutputs = (midiAccess) => {
  for (const entry of midiAccess.inputs) {
    const input = entry[1];
    const inputData =
      `Input port [type:'${input.type}']` +
      ` id:'${input.id}'` +
      ` manufacturer:'${input.manufacturer}'` +
      ` name:'${input.name}'` +
      ` version:'${input.version}'`;
    addElement(inputDataContainer, "p", inputData);
  }

  for (const entry of midiAccess.outputs) {
    const output = entry[1];
    const outputData = `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`;
    addElement(outputDataContainer, "p", outputData);
  }
};

const initMidi = async () => {
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    onMIDISuccess(midiAccess);

    if (midiAccess) {
      logInputsAndOutputs(midiAccess);

      midiAccess.inputs?.forEach((entry) => {
        entry.onmidimessage = onMIDImessage;
      });
    }
  } catch (err) {
    onMIDIFailure(err);
  }
};

document.addEventListener("DOMContentLoaded", initMidi);
