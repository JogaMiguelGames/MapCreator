const console = {
  print: (text) => {
    const output = document.getElementById('scriptOutput');
    output.textContent += text + '\n';
    output.scrollTop = output.scrollHeight;
  }
};

const variables = {};
const functions = {};

let audioContext = null;

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
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
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
        console.print('Error: function not terminated -> ' + funcName);
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
        console.print('Error: function not defined -> ' + funcName);
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
        console.print('Error: repeat block not terminated');
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
        console.print('Error: loop block not terminated');
        return;
      }
      while (true) {
        await runLines([...loopBody]);
      }
      continue;
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
            console.print('Error: invalid array -> ' + valueRaw);
          }
        } else {
          variables[name] = safeMathEval(valueRaw);
        }
      } catch {
        console.print('Error: invalid value -> ' + valueRaw);
      }
      i++;
      continue;
    }

    // ✅ Suporte a concatenação no console.print()
    if (line.startsWith('console.print(') && line.endsWith(')')) {
      let expr = line.slice(14, -1).trim();
      try {
        const result = Function(...Object.keys(variables), `
          "use strict";
          return ${expr};
        `)(...Object.values(variables));
        console.print(String(result));
      } catch (e) {
        console.print('Error: invalid print expression -> ' + expr);
      }
      i++;
      continue;
    }

    if (line.startsWith('calc(') && line.endsWith(')')) {
      const expr = line.slice(5, -1).trim();
      try {
        const result = safeMathEval(expr);
        console.print(result);
      } catch (e) {
        console.print('Error: invalid expression');
      }
      i++;
      continue;
    }

    if (line.startsWith('wait(') && line.endsWith(')')) {
      const time = parseFloat(line.slice(5, -1).trim());
      if (!isNaN(time) && time >= 0) {
        await new Promise(resolve => setTimeout(resolve, time * 1000));
      } else {
        console.print('Error: invalid wait time');
      }
      i++;
      continue;
    }

    if (line.startsWith('play(') && line.endsWith(')')) {
      const args = line.slice(5, -1).split(',').map(s => parseFloat(s.trim()));
      if (args.length === 2 && !isNaN(args[0]) && !isNaN(args[1])) {
        await playTone(args[0], args[1]);
      } else {
        console.print('Error: invalid play arguments');
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
            console.print('Error: unknown note -> ' + noteName);
          }
        } else {
          console.print('Error: invalid note duration');
        }
      } else {
        console.print('Error: invalid note arguments');
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

    console.print('Error: invalid command -> ' + line);
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
