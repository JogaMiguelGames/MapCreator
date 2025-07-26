const console = {
  print: (text) => {
    const output = document.getElementById('scriptOutput');
    const line = document.createElement('div');
    line.textContent = text;
    line.style.color = '#0f0';
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  },
  error: (text) => {
    const output = document.getElementById('scriptOutput');
    const line = document.createElement('div');
    line.textContent = text;
    line.style.color = '#f33';
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }
};

const variables = {};
const functions = {};

let audioContext = null;
let globalVolume = 0.2;

const noteFrequencies = {
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99,
  'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16,
  'Bb4': 466.16, 'B4': 493.88
};

function safeMathEval(expr) {
  const allowedFunctions = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'log', 'pow', 'max', 'min', 'round', 'floor', 'ceil', 'random'];
  if (!/^[0-9+\-*/%^()., \[\]a-zA-Z0-9_]+$/.test(expr)) throw new Error('Invalid expression');
  const exprWithMath = expr.replace(/([a-zA-Z]+)\(/g, (m, f) => {
    if (f === 'random') return `__custom_random__(`;
    if (allowedFunctions.includes(f)) return `Math.${f}(`;
    throw new Error('Function not allowed: ' + f);
  });
  const exprWithVars = exprWithMath.replace(/\b([a-zA-Z_]\w*(?:\[\d+\])?)\b/g, (match) => {
    if (match.includes('[')) {
      const varName = match.split('[')[0];
      const index = parseInt(match.match(/\[(\d+)\]/)[1]) - 1;
      if (variables.hasOwnProperty(varName) && Array.isArray(variables[varName])) {
        if (index < 0 || index >= variables[varName].length) throw new Error('Array index out of bounds: ' + match);
        return variables[varName][index];
      } else {
        throw new Error('Invalid array access: ' + match);
      }
    } else if (variables.hasOwnProperty(match)) {
      return variables[match];
    } else {
      return match;
    }
  });

  const __custom_random__ = (a = 0, b = 1, decimals = 10) => {
    if (typeof a !== 'number' || typeof b !== 'number' || typeof decimals !== 'number') throw new Error('Invalid arguments for random');
    if (decimals < 0) decimals = 0;
    const rand = Math.random() * (b - a) + a;
    const factor = Math.pow(10, decimals);
    return Math.round(rand * factor) / factor;
  };

  return Function('__custom_random__', '"use strict"; return (' + exprWithVars + ')')(__custom_random__);
}

async function playTone(freq, duration) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (freq <= 0 || duration <= 0) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
  gainNode.gain.setValueAtTime(globalVolume, audioContext.currentTime);

  oscillator.connect(gainNode).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
  await new Promise(resolve => setTimeout(resolve, duration * 1000));
}

function setWireframeForAllObjects(enabled) {
  scene.traverse(obj => {
    if (obj.isMesh) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach(mat => {
        if (mat && 'wireframe' in mat) {
          mat.wireframe = enabled;
        }
      });
    }
  });
}

async function runLines(lines) {
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.startsWith('function ') && line.endsWith('()')) {
      const funcName = line.slice(9, -2).trim();
      const funcBody = [];
      i++;
      while (i < lines.length && lines[i].trim() !== 'end') {
        funcBody.push(lines[i]);
        i++;
      }
      if (i >= lines.length) {
        console.error('Error: function not terminated -> ' + funcName);
        return;
      }
      functions[funcName] = funcBody;
      i++;
      continue;
    }

    if (line.startsWith('call(') && line.endsWith(')')) {
      const funcName = line.slice(5, -1).trim();
      if (functions[funcName]) {
        await runLines(functions[funcName]);
      } else {
        console.error('Error: function not defined -> ' + funcName);
      }
      i++;
      continue;
    }

    if (line.startsWith('repeat(') && line.endsWith(')')) {
      const count = parseInt(line.slice(7, -1).trim());
      const repeatBody = [];
      i++;
      while (i < lines.length && lines[i].trim() !== 'end') {
        repeatBody.push(lines[i]);
        i++;
      }
      if (i >= lines.length) {
        console.error('Error: repeat block not terminated');
        return;
      }
      for (let r = 0; r < count; r++) {
        await runLines([...repeatBody]);
      }
      i++;
      continue;
    }

    if (line === 'loop') {
      const loopBody = [];
      i++;
      while (i < lines.length && lines[i].trim() !== 'end') {
        loopBody.push(lines[i]);
        i++;
      }
      if (i >= lines.length) {
        console.error('Error: loop block not terminated');
        return;
      }
      while (true) {
        await runLines([...loopBody]);
      }
    }

    if (/^[a-zA-Z_]\w*\s*=/.test(line)) {
      const [varName, ...rest] = line.split('=');
      const valueRaw = rest.join('=').trim();
      const name = varName.trim();
      try {
        if ((valueRaw.startsWith('"') && valueRaw.endsWith('"')) || (valueRaw.startsWith("'") && valueRaw.endsWith("'"))) {
          variables[name] = valueRaw.slice(1, -1);
        } else if (!isNaN(Number(valueRaw))) {
          variables[name] = Number(valueRaw);
        } else if (valueRaw.startsWith('[') && valueRaw.endsWith(']')) {
          const arr = JSON.parse(valueRaw);
          if (Array.isArray(arr)) {
            variables[name] = arr;
          } else {
            console.error('Error: invalid array -> ' + valueRaw);
          }
        } else {
          variables[name] = safeMathEval(valueRaw);
        }
      } catch {
        console.error('Error: invalid value -> ' + valueRaw);
      }
      i++;
      continue;
    }

    if (line.startsWith('console.print(') && line.endsWith(')')) {
      let param = line.slice(14, -1).trim();
      if ((param.startsWith('"') && param.endsWith('"')) || (param.startsWith("'") && param.endsWith("'"))) {
        console.print(param.slice(1, -1));
      } else if (/^[a-zA-Z_]\w*\[\d+\]$/.test(param)) {
        const varName = param.split('[')[0];
        const index = parseInt(param.match(/\[(\d+)\]/)[1]) - 1;
        if (variables.hasOwnProperty(varName) && Array.isArray(variables[varName])) {
          if (index < 0 || index >= variables[varName].length) {
            console.error('Error: array index out of bounds -> ' + param);
          } else {
            console.print(String(variables[varName][index]));
          }
        } else {
          console.error('Error: list not defined -> ' + varName);
        }
      } else if (variables.hasOwnProperty(param)) {
        console.print(String(variables[param]));
      } else {
        console.error('Error: undefined variable -> ' + param);
      }
      i++;
      continue;
    }

    if (line.startsWith('if (') && line.endsWith(')')) {
      const condition = line.slice(4, -1).trim();
      const ifBlock = [];
      const elseBlock = [];
      let inElse = false;
      i++;
      while (i < lines.length && lines[i].trim() !== 'end') {
        const innerLine = lines[i].trim();
        if (innerLine === 'else') {
          inElse = true;
          i++;
          continue;
        }
        if (inElse) {
          elseBlock.push(lines[i]);
        } else {
          ifBlock.push(lines[i]);
        }
        i++;
      }
      if (i >= lines.length) {
        console.error('Error: if block not terminated');
        return;
      }
      try {
        const conditionResult = !!safeMathEval(condition);
        if (conditionResult) {
          await runLines(ifBlock);
        } else {
          await runLines(elseBlock);
        }
      } catch {
        console.error('Error: invalid if condition');
      }
      i++;
      continue;
    }

    if (line.startsWith('calc(') && line.endsWith(')')) {
      const expr = line.slice(5, -1).trim();
      try {
        const result = safeMathEval(expr);
        console.print(result);
      } catch {
        console.error('Error: invalid expression');
      }
      i++;
      continue;
    }

    if (line.startsWith('wait(') && line.endsWith(')')) {
      const time = parseFloat(line.slice(5, -1).trim());
      if (!isNaN(time) && time >= 0) {
        await new Promise(resolve => setTimeout(resolve, time * 1000));
      } else {
        console.error('Error: invalid wait time');
      }
      i++;
      continue;
    }

    if (line.startsWith('volume(') && line.endsWith(')')) {
      const raw = line.slice(7, -1).trim();
      let percent = parseFloat(raw.replace('%', ''));
      if (!isNaN(percent) && percent >= 0 && percent <= 100) {
        globalVolume = percent / 100;
        console.print(`Volume set to ${percent}%`);
      } else {
        console.error('Error: invalid volume value');
      }
      i++;
      continue;
    }

    if (line.startsWith('skycolor(') && line.endsWith(')')) {
      const hex = line.slice(9, -1).trim();
      if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
        try {
          scene.background = new THREE.Color(hex);
          console.print(`Sky color set to ${hex}`);
        } catch {
          console.error('Error: invalid color format');
        }
      } else {
        console.error('Error: invalid hex color');
      }
      i++;
      continue;
    }

    if (line.startsWith('play(') && line.endsWith(')')) {
      const args = line.slice(5, -1).split(',').map(s => parseFloat(s.trim()));
      if (args.length === 2 && !isNaN(args[0]) && !isNaN(args[1])) {
        await playTone(args[0], args[1]);
      } else {
        console.error('Error: invalid play arguments');
      }
      i++;
      continue;
    }

    if (line.startsWith('note(') && line.endsWith(')')) {
      let argsRaw = line.slice(5, -1).split(',');
      if (argsRaw.length === 2) {
        let noteName = argsRaw[0].trim();
        if ((noteName.startsWith('"') && noteName.endsWith('"')) || (noteName.startsWith("'") && noteName.endsWith("'"))) {
          noteName = noteName.slice(1, -1);
        }
        let duration = parseFloat(argsRaw[1].trim());
        if (!isNaN(duration) && duration > 0) {
          const freq = noteFrequencies[noteName];
          if (freq) {
            await playTone(freq, duration);
          } else {
            console.error('Error: unknown note -> ' + noteName);
          }
        } else {
          console.error('Error: invalid note duration');
        }
      } else {
        console.error('Error: invalid note arguments');
      }
      i++;
      continue;
    }

    if (line.startsWith('open.url(') && line.endsWith(')')) {
      let raw = line.slice(9, -1).trim();
      if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        let url = raw.slice(1, -1);
        if (!/^https?:\/\//.test(url)) {
          url = 'https://' + url;
        }
        window.open(url, '_blank');
        console.print('Opening URL: ' + url);
      } else {
        console.error('Error: invalid URL string');
      }
      i++;
      continue;
    }

    if (line === 'wireframe.on') {
      setWireframeForAllObjects(true);
      console.print("Wireframe enabled.");
      i++;
      continue;
    }

    if (line === 'wireframe.off') {
      setWireframeForAllObjects(false);
      console.print("Wireframe disabled.");
      i++;
      continue;
    }

    if (line === '') {
      i++;
      continue;
    }

    console.error('Error: invalid command -> ' + line);
    i++;
  }
}

async function runScript(code) {
  document.getElementById('scriptOutput').textContent = '';
  Object.keys(variables).forEach(k => delete variables[k]);
  Object.keys(functions).forEach(k => delete functions[k]);
  await runLines(code.split('\n'));
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('runScriptBtn').addEventListener('click', () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const code = document.getElementById('scriptInput').value;
    runScript(code);
  });
});
