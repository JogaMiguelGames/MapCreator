const console = {
  print: function (text) {
    const output = document.getElementById('scriptOutput');
    output.textContent += text + '\n';
    output.scrollTop = output.scrollHeight;
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const variables = {};
const functions = {};

function Vector2(x, y) {
  return { type: 'Vector2', x: Number(x), y: Number(y) };
}

function Vector3(x, y, z) {
  return { type: 'Vector3', x: Number(x), y: Number(y), z: Number(z) };
}

function safeMathEval(expr) {
  const cleaned = expr.replace(/\s+/g, '');
  if (!/^[0-9+\-*/%^().,a-zA-Z]+$/.test(cleaned)) throw new Error('Expressão inválida');

  const allowedFunctions = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'log', 'pow', 'max', 'min', 'round', 'floor', 'ceil'];

  const safeExpr = cleaned.replace(/([a-zA-Z]+)\(/g, (match, funcName) => {
    if (allowedFunctions.includes(funcName)) return `Math.${funcName}(`;
    throw new Error('Função matemática não permitida: ' + funcName);
  });

  return eval(safeExpr);
}

function waitForConsoleInput(promptText) {
  return new Promise(resolve => {
    const output = document.getElementById('scriptOutput');
    let buffer = '';

    console.print(promptText);
    console.print('> ');

    function onKeyDown(event) {
      if (event.key === 'Enter') {
        output.textContent += '\n';
        document.removeEventListener('keydown', onKeyDown);
        resolve(buffer);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          output.textContent = output.textContent.slice(0, -1);
        }
      } else if (event.key.length === 1) {
        buffer += event.key;
        output.textContent += event.key;
      }
      output.scrollTop = output.scrollHeight;
    }

    document.addEventListener('keydown', onKeyDown);
  });
}

async function runBlock(lines) {
  for (const line of lines) {
    await runLines([line]);
  }
}

async function runIfBlock(lines, startIndex) {
  const blocks = [];
  let i = startIndex;

  function parseCondition(condStr) {
    const [varName, expected] = condStr.split('=').map(s => s.trim());
    return () => {
      let expectedVal;
      if ((expected.startsWith('"') && expected.endsWith('"')) || (expected.startsWith("'") && expected.endsWith("'"))) {
        expectedVal = expected.slice(1, -1);
      } else if (!isNaN(Number(expected))) {
        expectedVal = Number(expected);
      } else if (variables.hasOwnProperty(expected)) {
        expectedVal = variables[expected];
      } else {
        expectedVal = expected;
      }
      return variables[varName] === expectedVal;
    };
  }

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('if ') && line.includes('=') && line.endsWith(' then')) {
      const condStr = line.slice(3, -5).trim();
      blocks.push({ type: 'if', condition: parseCondition(condStr), startLine: i + 1 });
    } else if (line.startsWith('elseif') && line.endsWith(' then')) {
      const condStr = line.slice(6, -5).trim();
      blocks.push({ type: 'elseif', condition: parseCondition(condStr), startLine: i + 1 });
    } else if (line === 'else') {
      blocks.push({ type: 'else', condition: null, startLine: i + 1 });
    } else {
      break;
    }

    const indent = lines[blocks[blocks.length - 1].startLine]?.match(/^(\s+)/)?.[1] || '';
    let endLine = blocks[blocks.length - 1].startLine;
    while (endLine < lines.length && (lines[endLine].startsWith(indent) || lines[endLine].trim() === '')) {
      endLine++;
    }
    blocks[blocks.length - 1].endLine = endLine;
    i = endLine;
  }

  for (const block of blocks) {
    if (block.type === 'else' || (block.condition && block.condition())) {
      const indent = lines[block.startLine]?.match(/^(\s+)/)?.[1] || '';
      const sliced = lines.slice(block.startLine, block.endLine).map(l => l.slice(indent.length));
      await runBlock(sliced);
      break;
    }
  }

  return i;
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
        console.print('Error: função não terminada -> ' + funcName);
        return;
      }
      functions[funcName] = funcBody;
      i++;
      continue;
    }

    if (line.startsWith('call(') && line.endsWith(')')) {
      const funcName = line.slice(5, -1).trim();
      if (functions.hasOwnProperty(funcName)) {
        await runLines(functions[funcName]);
      } else {
        console.print('Error: função não definida -> ' + funcName);
      }
      i++;
      continue;
    }

    if (/^[a-zA-Z_]\w*\s*=\s*input\((.+)\)$/.test(line)) {
      const match = line.match(/^([a-zA-Z_]\w*)\s*=\s*input\((.+)\)$/);
      const varName = match[1];
      let promptText = match[2].trim();
      if ((promptText.startsWith('"') && promptText.endsWith('"')) || (promptText.startsWith("'") && promptText.endsWith("'"))) {
        promptText = promptText.slice(1, -1);
      } else {
        promptText = '';
      }
      const userInput = await waitForConsoleInput(promptText);
      variables[varName] = userInput;
      i++;
      continue;
    }

    if (/^[a-zA-Z_]\w*\s*=/.test(line)) {
      const [varName, ...rest] = line.split('=');
      const valueRaw = rest.join('=').trim();

      const vectorMatch = valueRaw.match(/^(Vector2|Vector3)\(([^)]+)\)$/);
      if (vectorMatch) {
        const args = vectorMatch[2].split(',').map(a => a.trim());
        if (vectorMatch[1] === 'Vector2' && args.length === 2) {
          variables[varName.trim()] = Vector2(args[0], args[1]);
        } else if (vectorMatch[1] === 'Vector3' && args.length === 3) {
          variables[varName.trim()] = Vector3(args[0], args[1], args[2]);
        } else {
          console.print('Error: argumentos inválidos para ' + vectorMatch[1]);
        }
      } else if (!isNaN(Number(valueRaw))) {
        variables[varName.trim()] = Number(valueRaw);
      } else if ((valueRaw.startsWith('"') && valueRaw.endsWith('"')) || (valueRaw.startsWith("'") && valueRaw.endsWith("'"))) {
        variables[varName.trim()] = valueRaw.slice(1, -1);
      } else {
        console.print('Error: valor inválido -> ' + valueRaw);
      }
      i++;
      continue;
    }

    if (line.startsWith('console.print(') && line.endsWith(')')) {
      let param = line.slice(14, -1).trim();

      if ((param.startsWith('"') && param.endsWith('"')) || (param.startsWith("'") && param.endsWith("'"))) {
        console.print(param.slice(1, -1));
      } else if (param.includes('.')) {
        const [varName, prop] = param.split('.');
        if (variables[varName] && prop in variables[varName]) {
          console.print(String(variables[varName][prop]));
        } else {
          console.print('Error: propriedade não existe -> ' + prop);
        }
      } else if (variables.hasOwnProperty(param)) {
        const val = variables[param];
        if (val?.type === 'Vector2') {
          console.print(`Vector2(${val.x}, ${val.y})`);
        } else if (val?.type === 'Vector3') {
          console.print(`Vector3(${val.x}, ${val.y}, ${val.z})`);
        } else {
          console.print(String(val));
        }
      } else {
        console.print('Error: variável não definida -> ' + param);
      }
      i++;
      continue;
    }

    if (line.startsWith('wait(') && line.endsWith(')')) {
      const ms = Number(line.slice(5, -1).trim());
      if (!isNaN(ms) && ms >= 0) await sleep(ms);
      else console.print('Error: tempo inválido');
      i++;
      continue;
    }

    if (line.startsWith('calc(') && line.endsWith(')')) {
      const expr = line.slice(5, -1).trim();
      try {
        console.print(safeMathEval(expr));
      } catch (e) {
        console.print('Error: expressão inválida');
      }
      i++;
      continue;
    }

    if (line.startsWith('if ') && line.includes('=') && line.endsWith(' then')) {
      i = await runIfBlock(lines, i);
      continue;
    }

    if (line !== '') {
      console.print('Error: comando inválido -> ' + line);
    }
    i++;
  }
}

async function runMapCreatorScript(code) {
  const lines = code.split('\n');
  document.getElementById('scriptOutput').textContent = '';
  Object.keys(variables).forEach(k => delete variables[k]);
  Object.keys(functions).forEach(k => delete functions[k]);
  await runLines(lines);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('runScriptBtn').addEventListener('click', () => {
    const code = document.getElementById('scriptInput').value;
    runMapCreatorScript(code);
  });
});
