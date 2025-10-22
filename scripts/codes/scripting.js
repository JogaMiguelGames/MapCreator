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

async function runLines(lines) {
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (line === '') { i++; continue; }

    // Funções literais
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
      for (let r = 0; r < count; r++) await runLines([...repeatBody]);
      i++;
      continue;
    }

    if (line === 'loop') {
      const loopBody = [];
      i++;
      while (i < lines.length && lines[i].trim() !== 'end') { loopBody.push(lines[i]); i++; }
      if (i >= lines.length) { gconsole.print('Error: loop block not terminated'); return; }
      while (true) await runLines([...loopBody]);
    }

    // Chamada de variável que é função
    if (/^[a-zA-Z_]\w*\(\)$/.test(line)) {
      const varName = line.slice(0, -2);
      if (variables.hasOwnProperty(varName) && typeof variables[varName] === 'function') {
        try { variables[varName](); }
        catch { gconsole.print('Error executing function variable -> ' + varName); }
      } else gconsole.print('Error: invalid function call -> ' + varName);
      i++;
      continue;
    }

    // Atribuição de variáveis
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
              case 'cube': if (typeof createCube === 'function') createCube(); else gconsole.print('Error: createCube not available'); break;
              case 'sphere': if (typeof createSphere === 'function') createSphere(); else gconsole.print('Error: createSphere not available'); break;
              case 'cylinder': if (typeof createCylinder === 'function') createCylinder(); else gconsole.print('Error: createCylinder not available'); break;
              case 'cone': if (typeof createCone === 'function') createCone(); else gconsole.print('Error: createCone not available'); break;
              case 'plane': if (typeof createPlane === 'function') createPlane(); else gconsole.print('Error: createPlane not available'); break;
              default: gconsole.print('Error: unknown create type -> ' + type);
            }
          };
        } else variables[name] = safeMathEval(valueRaw);
      } catch { gconsole.print('Error: invalid value -> ' + valueRaw); }
      i++;
      continue;
    }

    // gconsole.print
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

    // create.new literal (antigo)
    if (line.startsWith('create.new.')) {
      const type = line.slice(11);
      switch(type){
        case 'cube': if(typeof createCube==='function') createCube(); else gconsole.print('Error: createCube not available'); break;
        case 'sphere': if(typeof createSphere==='function') createSphere(); else gconsole.print('Error: createSphere not available'); break;
        case 'cylinder': if(typeof createCylinder==='function') createCylinder(); else gconsole.print('Error: createCylinder not available'); break;
        case 'cone': if(typeof createCone==='function') createCone(); else gconsole.print('Error: createCone not available'); break;
        case 'plane': if(typeof createPlane==='function') createPlane(); else gconsole.print('Error: createPlane not available'); break;
        default: gconsole.print('Error: unknown create type -> ' + type);
      }
      i++;
      continue;
    }

    // wireframe
    if (line==='wireframe.on'){setWireframeForAllObjects(true); gconsole.print("Wireframe enabled."); i++; continue;}
    if (line==='wireframe.off'){setWireframeForAllObjects(false); gconsole.print("Wireframe disabled."); i++; continue;}

    // if
    if (line.startsWith('if (') && line.endsWith(')')) {
      const condition = line.slice(4,-1).trim();
      const ifBlock=[], elseBlock=[]; let inElse=false; i++;
      while(i<lines.length && lines[i].trim()!=='end'){
        const inner=lines[i].trim();
        if(inner==='else'){inElse=true; i++; continue;}
        if(inElse) elseBlock.push(lines[i]); else ifBlock.push(lines[i]);
        i++;
      }
      if(i>=lines.length){gconsole.print('Error: if block not terminated'); return;}
      try{const condResult=!!safeMathEval(condition); if(condResult) await runLines(ifBlock); else await runLines(elseBlock);}catch{gconsole.print('Error: invalid if condition');}
      i++; continue;
    }

    // calc
    if(line.startsWith('calc(')&&line.endsWith(')')){const expr=line.slice(5,-1).trim(); try{gconsole.print(safeMathEval(expr));}catch{gconsole.print('Error: invalid expression');} i++; continue;}

    // wait
    if(line.startsWith('wait(')&&line.endsWith(')')){const t=parseFloat(line.slice(5,-1).trim()); if(!isNaN(t)&&t>=0) await new Promise(r=>setTimeout(r,t*1000)); else gconsole.print('Error: invalid wait time'); i++; continue;}
    if(line.startsWith('wait.ms(')&&line.endsWith(')')){const t=parseFloat(line.slice(8,-1).trim()); if(!isNaN(t)&&t>=0) await new Promise(r=>setTimeout(r,t)); else gconsole.print('Error: invalid wait.ms time'); i++; continue;}

    // volume
    if(line.startsWith('volume(')&&line.endsWith(')')){let p=parseFloat(line.slice(7,-1).trim().replace('%','')); if(!isNaN(p)&&p>=0&&p<=100){globalVolume=p/100; gconsole.print(`Volume set to ${p}%`);}else gconsole.print('Error: invalid volume value'); i++; continue;}

    // skycolor
    if(line.startsWith('skycolor(')&&line.endsWith(')')){const hex=line.slice(9,-1).trim(); if(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)){try{scene.background=new THREE.Color(hex); gconsole.print(`Sky color set to ${hex}`);}catch{gconsole.print('Error: invalid color format');}}else gconsole.print('Error: invalid hex color'); i++; continue;}

    // play
    if(line.startsWith('play(')&&line.endsWith(')')){const args=line.slice(5,-1).split(',').map(s=>parseFloat(s.trim())); if(args.length===2&&!isNaN(args[0])&&!isNaN(args[1])) await playTone(args[0],args[1]); else gconsole.print('Error: invalid play arguments'); i++; continue;}

    // note
    if(line.startsWith('note(')&&line.endsWith(')')){let argsRaw=line.slice(5,-1).split(','); if(argsRaw.length===2){let note=argsRaw[0].trim(); if((note.startsWith('"')&&note.endsWith('"'))||(note.startsWith("'")&&note.endsWith("'"))) note=note.slice(1,-1); let dur=parseFloat(argsRaw[1].trim()); if(!isNaN(dur)&&dur>0){const freq=noteFrequencies[note]; if(freq) await playTone(freq,dur); else gconsole.print('Error: unknown note -> '+note);}else gconsole.print('Error: invalid note duration');}else gconsole.print('Error: invalid note arguments'); i++; continue;}

    // open.url
    if(line.startsWith('open.url(')&&line.endsWith(')')){let raw=line.slice(9,-1).trim(); if((raw.startsWith('"')&&raw.endsWith('"'))||(raw.startsWith("'")&&raw.endsWith("'"))){let url=raw.slice(1,-1); if(!/^https?:\/\//.test(url)) url='https://'+url; window.open(url,'_blank'); gconsole.print('Opening URL: '+url);} else gconsole.print('Error: invalid URL string'); i++; continue;}

    gconsole.print('Error: invalid command -> '+line);
    i++;
  }
}

async function runScript(code) {
  document.getElementById('scriptOutput').textContent='';
  Object.keys(variables).forEach(k=>delete variables[k]);
  Object.keys(functions).forEach(k=>delete functions[k]);
  await runLines(code.split('\n'));
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('runButton').addEventListener('click', ()=>{
    if(!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const code=document.getElementById('scriptInput').value;
    runScript(code);
  });
});

