// ===================== SCRIPTING.JS =====================

const gconsole = {
  print: (text) => {
    const output = document.getElementById('scriptOutput');
    output.textContent += text + '\n';
    output.scrollTop = output.scrollHeight;
  },
  clear: () => {
    const output = document.getElementById('scriptOutput');
    output.textContent = '';
  }
};

const variables = {};
const functions = {};
let isRunning = false;
let stopRequested = false;
let audioContext = null;
let globalVolume = 0.2;

const noteFrequencies = {
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18,
  'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13,
  'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99,
  'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30,
  'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16,
  'B4': 493.88
};

function playTone(note, duration = 0.3) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  const frequency = noteFrequencies[note];
  if (!frequency) {
    gconsole.print(`Invalid note: ${note}`);
    return;
  }
  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = globalVolume;
  osc.frequency.value = frequency;
  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function stopAudio() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

async function executeScript(script) {
  const lines = script.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (stopRequested) break;
    const line = lines[i].trim();
    if (line === '') continue;

    if (line.startsWith('print ')) {
      const text = line.slice(6);
      gconsole.print(text.replace(/^"|"$/g, ''));
    }

    else if (line.startsWith('wait ')) {
      const ms = parseFloat(line.slice(5));
      await new Promise(r => setTimeout(r, ms));
    }

    else if (line.startsWith('define ')) {
      const [_, name, ...valueParts] = line.split(' ');
      const value = valueParts.join(' ');
      variables[name] = evalExpression(value);
    }

    else if (line.startsWith('set ')) {
      const [_, name, ...valueParts] = line.split(' ');
      const value = valueParts.join(' ');
      if (variables[name] !== undefined) {
        variables[name] = evalExpression(value);
      } else {
        gconsole.print(`Variable not found: ${name}`);
      }
    }

    else if (line.startsWith('if ')) {
      const condition = line.slice(3);
      const block = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('endif')) {
        block.push(lines[i]);
        i++;
      }
      if (evalCondition(condition)) {
        await executeScript(block.join('\n'));
      }
    }

    else if (line.startsWith('loop ')) {
      const count = parseInt(line.split(' ')[1]);
      const block = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('endloop')) {
        block.push(lines[i]);
        i++;
      }
      for (let n = 0; n < count; n++) {
        if (stopRequested) break;
        await executeScript(block.join('\n'));
      }
    }

    else if (line.startsWith('function ')) {
      const name = line.split(' ')[1];
      const block = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('endfunction')) {
        block.push(lines[i]);
        i++;
      }
      functions[name] = block.join('\n');
    }

    else if (line.startsWith('call ')) {
      const name = line.split(' ')[1];
      if (functions[name]) {
        await executeScript(functions[name]);
      } else {
        gconsole.print(`Function not found: ${name}`);
      }
    }

    else if (line.startsWith('math ')) {
      const [_, name, ...expr] = line.split(' ');
      const value = evalExpression(expr.join(' '));
      variables[name] = value;
    }

    else if (line.startsWith('play ')) {
      const parts = line.split(' ');
      const note = parts[1];
      const duration = parseFloat(parts[2]) || 0.3;
      playTone(note, duration);
    }

    else if (line.startsWith('create.new.cube')) {
      gconsole.print('Creating cube...');
      if (typeof createCube === 'function') {
        createCube();
      }
    }

    else if (line.startsWith('create.folder')) {
      gconsole.print('Creating folder...');
      if (typeof createFolder === 'function') {
        createFolder();
      }
    }

    else if (line.startsWith('delete.object')) {
      gconsole.print('Deleting object...');
      if (typeof deleteSelectedObject === 'function') {
        deleteSelectedObject();
      }
    }

    else if (line.startsWith('set.position')) {
      const parts = line.split(' ');
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const z = parseFloat(parts[3]);
      if (typeof setSelectedObjectPosition === 'function') {
        setSelectedObjectPosition(x, y, z);
      }
    }

    else {
      gconsole.print(`Unknown command: ${line}`);
    }
  }
}

function evalExpression(expr) {
  const names = Object.keys(variables);
  const values = Object.values(variables);
  try {
    return Function(...names, `return ${expr}`)(...values);
  } catch {
    return expr;
  }
}

function evalCondition(cond) {
  const names = Object.keys(variables);
  const values = Object.values(variables);
  try {
    return Function(...names, `return (${cond})`)(...values);
  } catch {
    return false;
  }
}

async function runUserScript() {
  if (isRunning) return;
  stopRequested = false;
  isRunning = true;
  gconsole.clear();
  gconsole.print("Running script...");
  await new Promise(requestAnimationFrame);
  const script = document.getElementById('scriptInput').value.trim();
  await executeScript(script);
  isRunning = false;
  if (!stopRequested) gconsole.print("Script finished.");
}

function stopUserScript() {
  if (!isRunning) return;
  stopRequested = true;
  stopAudio();
  gconsole.print("Script stopped.");
}

const runButton = document.getElementById('runButton');
const stopButton = document.getElementById('stopButton');
runButton.addEventListener('click', runUserScript);
stopButton.addEventListener('click', stopUserScript);
