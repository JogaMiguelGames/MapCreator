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
  if (typeof scene === 'undefined') return;
  scene.traverse(obj => {
    if (obj.isMesh) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach(mat => { if (mat && 'wireframe' in mat) mat.wireframe = enabled; });
    }
  });
}

function evalExpression(expr) {
  const names = Object.keys(variables);
  const values = Object.values(variables);
  try {
    return Function(...names, `return (${expr});`)(...values);
  } catch {
    return expr;
  }
}

function evalCondition(cond) {
  const names = Object.keys(variables);
  const values = Object.values(variables);
  try {
    return Function(...names, `return (${cond});`)(...values);
  } catch {
    return false;
  }
}

async function executeScript(script) {
  const lines = script.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (stopRequested) break;
    const line = lines[i].trim();
    if (line === '') continue;

    if (line.startsWith('console.print(') || line.startsWith('gconsole.print(')) {
      try { eval(line); } catch { gconsole.print(`Error executing: ${line}`); }
    }

    else if (line.startsWith('create.new.')) {
      const type = line.slice(11).replace('()', '');
      switch(type) {
        case 'cube': if (typeof createCube === 'function') createCube(); else gconsole.print('Error: createCube not available'); break;
        case 'sphere': if (typeof createSphere === 'function') createSphere(); else gconsole.print('Error: createSphere not available'); break;
        case 'cylinder': if (typeof createCylinder === 'function') createCylinder(); else gconsole.print('Error: createCylinder not available'); break;
        case 'cone': if (typeof createCone === 'function') createCone(); else gconsole.print('Error: createCone not available'); break;
        case 'plane': if (typeof createPlane === 'function') createPlane(); else gconsole.print('Error: createPlane not available'); break;
        default: gconsole.print('Error: unknown create type -> ' + type);
      }
    }

    else if (line.startsWith('wireframe.on()')) { setWireframeForAllObjects(true); gconsole.print("Wireframe enabled."); }
    else if (line.startsWith('wireframe.off()')) { setWireframeForAllObjects(false); gconsole.print("Wireframe disabled."); }

    else if (line.startsWith('wait(')) {
      const t = parseFloat(line.slice(5, -1));
      if (!isNaN(t)) await new Promise(r => setTimeout(r, t*1000));
    }

    else if (line.startsWith('wait.ms(')) {
      const t = parseFloat(line.slice(8, -1));
      if (!isNaN(t)) await new Promise(r => setTimeout(r, t));
    }

    else if (line.startsWith('play(')) {
      const args = line.slice(5, -1).split(',').map(s => parseFloat(s.trim()));
      if (args.length === 2) await playTone(args[0], args[1]);
    }

    else if (line.startsWith('note(')) {
      let argsRaw = line.slice(5, -1).split(',');
      if(argsRaw.length===2){
        let note=argsRaw[0].trim().replace(/^['"]|['"]$/g,'');
        let dur=parseFloat(argsRaw[1].trim());
        const freq=noteFrequencies[note];
        if(freq) await playTone(freq,dur);
      }
    }

    else if (line.startsWith('if (') && line.endsWith(')')) {
      const condition = line.slice(4,-1);
      const ifBlock = [], elseBlock = []; let inElse=false; i++;
      while(i<lines.length && lines[i].trim()!=='end') {
        const inner = lines[i].trim();
        if(inner==='else'){inElse=true; i++; continue;}
        if(inElse) elseBlock.push(lines[i]); else ifBlock.push(lines[i]);
        i++;
      }
      if(evalCondition(condition)) await executeScript(ifBlock.join('\n'));
      else await executeScript(elseBlock.join('\n'));
    }

    else if (line.startsWith('repeat(') && line.endsWith(')')) {
      const count=parseInt(line.slice(7,-1));
      const repeatBody=[]; i++;
      while(i<lines.length && lines[i].trim()!=='end'){repeatBody.push(lines[i]); i++;}
      for(let r=0;r<count;r++){ if(stopRequested) break; await executeScript(repeatBody.join('\n')); }
    }

    else if (line.startsWith('loop') && line.endsWith('')) {
      const loopBody=[]; i++;
      while(i<lines.length && lines[i].trim()!=='end'){loopBody.push(lines[i]); i++;}
      while(!stopRequested){ await executeScript(loopBody.join('\n')); }
    }

    else if (line.startsWith('function ') && line.endsWith('()')) {
      const funcName = line.match(/^function\s+(\w+)\(\)$/)[1];
      const funcBody=[]; i++;
      while(i<lines.length && lines[i].trim()!=='end'){funcBody.push(lines[i]); i++;}
      functions[funcName]=funcBody.join('\n');
    }

    else if(line.startsWith('call.function(') && line.endsWith(')')) {
      const funcName = line.slice(14,-1).trim();
      if(functions[funcName]) await executeScript(functions[funcName]);
    }

    else if(/^[a-zA-Z_]\w*\(\)$/.test(line)) {
      const varName=line.slice(0,-2);
      if(variables.hasOwnProperty(varName) && typeof variables[varName]==='function'){ variables[varName](); }
    }

    else if(/^[a-zA-Z_]\w*\s*=/.test(line)) {
      const [varName,...rest]=line.split('=');
      const valueRaw=rest.join('=').trim();
      const name=varName.trim();
      if((valueRaw.startsWith('"') && valueRaw.endsWith('"')) || (valueRaw.startsWith("'") && valueRaw.endsWith("'"))) variables[name]=valueRaw.slice(1,-1);
      else if(!isNaN(Number(valueRaw))) variables[name]=Number(valueRaw);
      else variables[name]=evalExpression(valueRaw);
    }

    else {
      try { eval(line); } catch { gconsole.print('Unknown command: '+line); }
    }
  }
}

async function runUserScript() {
  if(isRunning) return;
  stopRequested=false;
  isRunning=true;
  gconsole.clear();
  gconsole.print("Running script...");
  await new Promise(requestAnimationFrame);
  const code=document.getElementById('scriptInput').value;
  await executeScript(code);
  isRunning=false;
  if(!stopRequested) gconsole.print("Script finished.");
}

function stopUserScript(){
  if(!isRunning) return;
  stopRequested=true;
  if(audioContext){ audioContext.close(); audioContext=null; }
  gconsole.print("Script stopped.");
}

document.getElementById('runButton').addEventListener('click', runUserScript);
document.getElementById('stopButton').addEventListener('click', stopUserScript);
