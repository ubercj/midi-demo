import { addElement } from "./dom.js";

export const NOTE_ON = "Note start";
export const NOTE_OFF = "Note stop";
export const PITCH_BEND = "Pitch_bend";
export const EFFECTS = "Effects";

/**
 * @typedef {Object} RawMIDIMessage
 * @property {number} command - A number greater than 127 which indicates the type of command
 * @property {number} note - A number from 0 to 127 that indicates a note's pitch or provides more specifics on the type of command
 * @property {number} velocity - A number from 0 to 127 indicating how loud a note is
 */

/**
 * @typedef {"Note start" | "Note stop" | "Pitch_bend" | "Effects"} MIDICommand
 */

/**
 * Parsed MIDI Message
 * @typedef {Object} MIDIMessage
 * @property {MIDICommand} command - The type of command
 * @property {string | number} note - The note name if a note command, or otherwise the raw number
 * @property {number} velocity - A number from 0 to 127 indicating how loud a note is
 */

/**
 * @param {number} command
 * @return {MIDICommand}
 */
export const parseCommand = (command) => {
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

/**
 * @param {MIDICommand} command
 * @returns {boolean}
 */
export const isNoteCommand = (command) =>
  command === NOTE_ON || command === NOTE_OFF;

/**
 * @param {number} pitch
 * @returns {string}
 */
export const getPitchName = (pitch) => {
  switch (pitch) {
    case 0:
      return "C";
    case 1:
      return "C#";
    case 2:
      return "D";
    case 3:
      return "D#";
    case 4:
      return "E";
    case 5:
      return "F";
    case 6:
      return "F#";
    case 7:
      return "G";
    case 8:
      return "G#";
    case 9:
      return "A";
    case 10:
      return "A#";
    case 11:
      return "B";
    default:
      return "Error parsing pitch";
  }
};

/**
 * @param {number} note
 * @returns {string}
 */
export const getNoteName = (note) => {
  const octave = Math.floor(note / 12) - 2;
  const pitchNumber = note % 12;

  const pitch = getPitchName(pitchNumber);
  return `${pitch}${octave}`;
};

/**
 * @param {RawMIDIMessage} midiMessage
 * @returns {MIDIMessage}
 */
export const parseMIDImessage = (midiMessage) => {
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

const notesContainer = document.getElementById("notes");
/**
 * @param {MIDIMessage} midiMessage
 * @param {() => {}} callback
 * @returns {void}
 */
export const displayNote = ({ command, note, velocity }) => {
  const existingNote = document.getElementById(note);
  if (existingNote && command === NOTE_OFF) {
    existingNote.remove();
  } else {
    const newNote = addElement(notesContainer, "p", note, note);
    const noteSize = velocity / 50 + 1;
    newNote.style.fontSize = `${noteSize.toString()}rem`;
  }
};
