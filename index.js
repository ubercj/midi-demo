import { addElement, updateElement } from "./dom.js";
import {
  parseMIDImessage,
  NOTE_OFF,
  isNoteCommand,
  displayNote,
} from "./midi.js";

console.log("JS loaded");

const inputDataContainer = document.getElementById("input-data");
const outputDataContainer = document.getElementById("output-data");
const enabledMessage = document.getElementById("enabled");
const eventLogContainer = document.getElementById("event-log");

let synth;
const now = Tone.now();

const clearLogButton = document.getElementById("clear-log");
clearLogButton?.addEventListener("click", () => {
  updateElement(eventLogContainer, "");
});

const playButton = document.getElementById("play");
playButton?.addEventListener("click", async () => {
  await Tone.start();
  synth = new Tone.PolySynth(Tone.FMSynth).toDestination();

  enabledMessage.textContent = "Audio enabled";
});

const onMIDImessage = (event) => {
  const midiMessage = parseMIDImessage(event);
  const logMessage = `${event.timeStamp} | ${midiMessage.command}: ${midiMessage.note} ${midiMessage.velocity}`;
  console.log(logMessage);
  addElement(eventLogContainer, "p", logMessage);

  if (!isNoteCommand(midiMessage.command)) return;

  displayNote(midiMessage);

  if (midiMessage.command === NOTE_OFF) {
    synth.triggerRelease(midiMessage.note, now);
  } else {
    synth.triggerAttack(midiMessage.note, now);
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
  console.log("initMidi");
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
