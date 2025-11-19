import { Project, Model, Page, Tree_View, Icon } from '../../libs/mcl/mcl.js';
import { CreateCube, CreateSphere, CreateCylinder, CreateCone, CreatePlane, CreateCamera, CreateLight } from '../../libs/mcl/add.js';
import { ExportButton, ExportMap } from '../../libs/mcl/Export.js';

const gconsole = {
  print: (text) => {
    const output = document.getElementById('scriptOutput');
    output.textContent += text + '\n';
    output.scrollTop = output.scrollHeight;
  }
};

const variables = {};
const functions = {};

let audioContext = null;
let globalVolume = 0.2;

// Execution state
let isRunning = false;
let isPaused = false;
let stopRequested = false;

const noteFrequencies = {
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99,
  'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16,
  'Bb4': 466.16, 'B4': 493.88
};

function safeMathEval(expr) {
  const allowedFunctions = ['sin','cos','tan','sqrt','abs','log','pow','max','min','round','floor','ceil','random'];
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
      } else throw new Error('Invalid array access: ' + match);
    } else if (variables.hasOwnProperty(match)) {
      return variables[match];
    } else return match;
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
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (freq <= 0 || duration <= 0) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
  gainNode.gain.setValueAtTime(globalVolume, audioContext.currentTime);
  oscillator.connect(gainNode).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
  await new Promise(resolve => { oscillator.onended = resolve; });
}

function setWireframeForAllObjects(enabled) {
  scene.traverse(obj => {
    if (obj.isMesh) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach(mat => { if (mat && 'wireframe' in mat) mat.wireframe = enabled; });
    }
  });
}

async function waitForUnpause() {
  while (isPaused && !stopRequested) {
    await new Promise(r => setTimeout(r, 100));
  }
}

async function runLines(lines) {
  let i = 0;
  while (i < lines.length) {
    if (stopRequested) return;
    await waitForUnpause();

    const line = lines[i].trim();
    if (line === '') { i++; continue; }

    if (line.startsWith('function ') && line.endsWith('()')) {
      const funcName = line.match(/^function\s+(\w+)\(\)$/)[1];
      const funcBody = [];
      i++;
      while (i < lines.length && lines[i].trim() !== 'end') { funcBody.push(lines[i]); i++; }
      if (i >= lines.length) { gconsole.print('Error: function not terminated -> ' + funcName); return; }
      functions[funcName] = funcBody;
      i++;
      continue;
    }

    if (line.startsWith('call.function(') && line.endsWith(')')) {
      const funcName = line.slice(14, -1).trim();
      if (functions[funcName]) await runLines(functions[funcName]);
      else gconsole.print('Error: function not defined -> ' + funcName);
      i++;
      continue;
    }

    if (line.startsWith('repeat(') && line.endsWith(')')) {
      const count = parseInt(line.slice(7, -1).trim());
      const repeatBody = [];
      i++;
      while (i < lines.length && lines[i].trim() !== 'end') { repeatBody.push(lines[i]); i++; }
      if (i >= lines.length) { gconsole.print('Error: repeat block not terminated'); return; }
      for (let r = 0; r < count; r++) {
        if (stopRequested) return;
        await runLines([...repeatBody]);
      }
      i++;
      continue;
    }

    if (line === 'loop') {
      const loopBody = [];
      i++;
      while (i < lines.length && lines[i].trim() !== 'end') { loopBody.push(lines[i]); i++; }
      if (i >= lines.length) { gconsole.print('Error: loop block not terminated'); return; }
      while (!stopRequested) await runLines([...loopBody]);
      continue;
    }

    if (/^[a-zA-Z_]\w*\(\)$/.test(line)) {
      const varName = line.slice(0, -2);
      if (variables.hasOwnProperty(varName) && typeof variables[varName] === 'function') {
        try { variables[varName](); }
        catch { gconsole.print('Error executing function variable -> ' + varName); }
      } else gconsole.print('Error: invalid function call -> ' + varName);
      i++;
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
          if (Array.isArray(arr)) variables[name] = arr;
          else gconsole.print('Error: invalid array -> ' + valueRaw);
        } else if (valueRaw.startsWith('create.new.')) {
          const type = valueRaw.slice(11);
          variables[name] = () => {
            switch (type) {
              case 'cube': if (typeof createCube === 'function') CreateCube(); else gconsole.print('Error: createCube not available'); break;
              case 'sphere': if (typeof createSphere === 'function') CreateSphere(); else gconsole.print('Error: createSphere not available'); break;
              case 'cylinder': if (typeof createCylinder === 'function') CreateCylinder(); else gconsole.print('Error: createCylinder not available'); break;
              case 'cone': if (typeof createCone === 'function') CreateCone(); else gconsole.print('Error: createCone not available'); break;
              case 'plane': if (typeof createPlane === 'function') CreatePlane(); else gconsole.print('Error: createPlane not available'); break;
              default: gconsole.print('Error: unknown create type -> ' + type);
            }
          };
        } else variables[name] = safeMathEval(valueRaw);
      } catch { gconsole.print('Error: invalid value -> ' + valueRaw); }
      i++;
      continue;
    }

    if ((line.startsWith('gconsole.print(') || line.startsWith('console.print(')) && line.endsWith(')')) {
      let param = line.slice(line.indexOf('(')+1, -1).trim();
      if ((param.startsWith('"') && param.endsWith('"')) || (param.startsWith("'") && param.endsWith("'"))) gconsole.print(param.slice(1,-1));
      else if (/^[a-zA-Z_]\w*\[\d+\]$/.test(param)) {
        const varName = param.split('[')[0]; const index = parseInt(param.match(/\[(\d+)\]/)[1])-1;
        if (variables.hasOwnProperty(varName) && Array.isArray(variables[varName])) {
          if (index < 0 || index >= variables[varName].length) gconsole.print('Error: array index out of bounds -> ' + param);
          else gconsole.print(String(variables[varName][index]));
        } else gconsole.print('Error: list not defined -> ' + varName);
      } else if (variables.hasOwnProperty(param)) gconsole.print(String(variables[param]));
      else gconsole.print('Error: undefined variable -> ' + param);
      i++;
      continue;
    }

    if (line.startsWith('wait(') && line.endsWith(')')) {
      const t = parseFloat(line.slice(5, -1).trim());
      if (!isNaN(t) && t >= 0) {
        const start = Date.now();
        while (Date.now() - start < t * 1000) {
          if (stopRequested) return;
          await waitForUnpause();
          await new Promise(r => setTimeout(r, 10));
        }
      } else gconsole.print('Error: invalid wait time');
      i++;
      continue;
    }

    gconsole.print('Error: invalid command -> ' + line);
    i++;
  }
}

async function runScript(code) {
  const output = document.getElementById('scriptOutput');
  output.textContent = '';
  gconsole.print('Running script...');
  Object.keys(variables).forEach(k => delete variables[k]);
  Object.keys(functions).forEach(k => delete functions[k]);
  isRunning = true;
  stopRequested = false;
  await runLines(code.split('\n'));
  isRunning = false;
  gconsole.print('Script finished.');
}

document.addEventListener('DOMContentLoaded', () => {
  const runButton = document.getElementById('runButton');
  const pauseButton = document.getElementById('pauseButton');
  const stopButton = document.getElementById('stopButton');

  runButton.addEventListener('click', async () => {
    if (isRunning) {
      if (isPaused) {
        isPaused = false;
        gconsole.print('Resumed.');
      }
      return;
    }
  
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const output = document.getElementById('scriptOutput');
    output.textContent = '';
  
    if (!window.customScripts || window.customScripts.length === 0) {
      gconsole.print('No scripts found in Tree View.');
      return;
    }
  
    gconsole.print(`Running ${window.customScripts.length} scripts...`);
  
    isRunning = true;
    stopRequested = false;
  
    for (const script of window.customScripts) {
      if (stopRequested) break;
  
      const code = script.content?.trim();
      if (!code) {
        gconsole.print(`Skipped empty script: ${script.name}`);
        continue;
      }
  
      gconsole.print(`\n=== Running Script: ${script.name} ===`);
      Object.keys(variables).forEach(k => delete variables[k]);
      Object.keys(functions).forEach(k => delete functions[k]);
  
      await runLines(code.split('\n'));
      gconsole.print(`=== Finished Script: ${script.name} ===\n`);
    }
  
    isRunning = false;
    gconsole.print('All scripts finished.');
  });
});



