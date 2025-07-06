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
const functions = {}; // Armazena funções declaradas

function safeMathEval(expr) {
  const cleaned = expr.replace(/\s+/g, '');

  // Permitindo dígitos, operadores, parênteses, letras para funções, vírgula e ponto
  if (!/^[0-9+\-*/%^().,a-zA-Z]+$/.test(cleaned)) {
    throw new Error('Expressão inválida');
  }

  const allowedFunctions = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'log', 'pow', 'max', 'min', 'round', 'floor', 'ceil'];

  const safeExpr = cleaned.replace(/([a-zA-Z]+)\(/g, (match, funcName) => {
    if (allowedFunctions.includes(funcName)) {
      return `Math.${funcName}(`;
    }
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

async function runLines(lines) {
  let i = 0;

  while (i < lines.length) {
    let line = lines[i].trim();

    // Declaração de função: function Nome()
    if (line.startsWith('function ') && line.endsWith('()')) {
      const funcName = line.slice(9, -2).trim();
      // Captura corpo da função até encontrar "end"
      let funcBody = [];
      i++;
      while (i < lines.length && lines[i].trim() !== 'end') {
        funcBody.push(lines[i]);
        i++;
      }
      if (i >= lines.length) {
        console.print('Error: função ' + funcName + ' não terminada com end');
        return;
      }
      // Salva a função
      functions[funcName] = funcBody;
      i++; // pula o 'end'
      continue;
    }

    // Chamada de função: call(Nome)
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

    // Atribuição
    if (/^[a-zA-Z_]\w*\s*=\s*.+$/.test(line)) {
      const parts = line.split('=');
      const varName = parts[0].trim();
      let valueRaw = parts.slice(1).join('=').trim();

      if ((valueRaw.startsWith('"') && valueRaw.endsWith('"')) ||
          (valueRaw.startsWith("'") && valueRaw.endsWith("'"))) {
        variables[varName] = valueRaw.slice(1, -1);
      } else if (!isNaN(Number(valueRaw))) {
        variables[varName] = Number(valueRaw);
      } else {
        console.print('Error: invalid assignment value -> ' + valueRaw);
      }
      i++;
      continue;
    }

    // console.print(...)
    if (line.startsWith('console.print(') && line.endsWith(')')) {
      let param = line.slice(14, -1).trim();

      if ((param.startsWith('"') && param.endsWith('"')) ||
          (param.startsWith("'") && param.endsWith("'"))) {
        console.print(param.slice(1, -1));
      } else {
        if (variables.hasOwnProperty(param)) {
          console.print(String(variables[param]));
        } else {
          console.print('Error: variable not defined -> ' + param);
        }
      }
      i++;
      continue;
    }

    // wait(...)
    if (line.startsWith('wait(') && line.endsWith(')')) {
      const ms = Number(line.slice(5, -1).trim());
      if (!isNaN(ms) && ms >= 0) {
        await sleep(ms);
      } else {
        console.print('Error: invalid wait time');
      }
      i++;
      continue;
    }

    // calc(...)
    if (line.startsWith('calc(') && line.endsWith(')')) {
      const expr = line.slice(5, -1).trim();
      try {
        const result = safeMathEval(expr);
        console.print(result);
      } catch (err) {
        console.print('Error: invalid expression -> ' + expr);
      }
      i++;
      continue;
    }

    // if / elseif / else bloco com indentação
    if (line.startsWith('if ') && line.includes('=') && line.endsWith(' then')) {
      i = await runIfBlock(lines, i);
      continue;
    }

    // linha vazia
    if (line === '') {
      i++;
      continue;
    }

    // input("Texto")
    if (/^[a-zA-Z_]\w*\s*=\s*input\((.+)\)$/.test(line)) {
      const match = line.match(/^([a-zA-Z_]\w*)\s*=\s*input\((.+)\)$/);
      const varName = match[1];
      let promptText = match[2].trim();
      if ((promptText.startsWith('"') && promptText.endsWith('"')) ||
          (promptText.startsWith("'") && promptText.endsWith("'"))) {
        promptText = promptText.slice(1, -1);
      } else {
        promptText = '';
      }

      const userInput = await waitForUserInput(promptText);
      variables[varName] = userInput;
      i++;
      continue;
    }

    // comando inválido
    console.print('Error: comando inválido -> ' + line);
    i++;
  }
}

async function runIfBlock(lines, startIndex) {
  // Mesma implementação do bloco if/elseif/else que te passei antes
  // (copie e cole a função runIfBlock daqui da resposta anterior)
  // Para não repetir, só me pedir se quiser
  // Aqui a função completa abaixo:

  const blocks = [];
  let i = startIndex;

  function parseCondition(condStr) {
    const [varName, expected] = condStr.split('=').map(s => s.trim());
    return () => {
      let expectedVal;
      if ((expected.startsWith('"') && expected.endsWith('"')) ||
          (expected.startsWith("'") && expected.endsWith("'"))) {
        expectedVal = expected.slice(1, -1);
      } else if (!isNaN(Number(expected))) {
        expectedVal = Number(expected);
      } else if (variables.hasOwnProperty(expected)) {
        expectedVal = variables[expected];
      } else {
        expectedVal = expected;
      }
      const actualVal = variables[varName];
      return actualVal === expectedVal;
    };
  }

  while (i < lines.length) {
    let line = lines[i];
    let trimmed = line.trim();

    if (trimmed.startsWith('if ') && trimmed.includes('=') && trimmed.endsWith(' then')) {
      const condStr = trimmed.slice(3, -5).trim();
      blocks.push({
        type: 'if',
        condition: parseCondition(condStr),
        startLine: i + 1
      });
      i++;
    } else if (trimmed.startsWith('elseif') && trimmed.endsWith(' then')) {
      const condStr = trimmed.slice(6, -5).trim();
      blocks.push({
        type: 'elseif',
        condition: parseCondition(condStr),
        startLine: i + 1
      });
      i++;
    } else if (trimmed === 'else') {
      blocks.push({
        type: 'else',
        condition: null,
        startLine: i + 1
      });
      i++;
    } else {
      break;
    }

    const indentMatch = lines[blocks[blocks.length - 1].startLine]?.match(/^(\s+)/);
    const indent = indentMatch ? indentMatch[1] : null;
    let endLine = blocks[blocks.length - 1].startLine;

    while (endLine < lines.length) {
      const nextLine = lines[endLine];
      if (nextLine.trim() === '' || (indent && !nextLine.startsWith(indent))) {
        break;
      }
      endLine++;
    }

    blocks[blocks.length - 1].endLine = endLine;
    i = endLine;
  }

  for (const block of blocks) {
    if (block.type === 'else' || (block.condition && block.condition())) {
      for (let j = block.startLine; j < block.endLine; j++) {
        const indentMatch = lines[block.startLine]?.match(/^(\s+)/);
        const indent = indentMatch ? indentMatch[1] : '';
        await runLines([lines[j].slice(indent.length)]);
      }
      break;
    }
  }

  return i;
}

// === Definição dos vetores ===
function Vector2(x, y) {
  return { type: 'Vector2', x: Number(x), y: Number(y) };
}

function Vector3(x, y, z) {
  return { type: 'Vector3', x: Number(x), y: Number(y), z: Number(z) };
}

// === Atualização no safeMathEval para suportar vetores simples (opcional) ===
// (Aqui você pode ampliar depois para operações entre vetores)

// === Modificação no runLines para lidar com atribuição de Vector2 e Vector3 ===

async function runLines(lines) {
  let i = 0;

  while (i < lines.length) {
    let line = lines[i].trim();

    // ... seu código anterior ...

    if (/^[a-zA-Z_]\w*\s*=\s*input\((.+)\)$/.test(line)) {
      const match = line.match(/^([a-zA-Z_]\w*)\s*=\s*input\((.+)\)$/);
      const varName = match[1];
      let promptText = match[2].trim();
      if ((promptText.startsWith('"') && promptText.endsWith('"')) ||
          (promptText.startsWith("'") && promptText.endsWith("'"))) {
        promptText = promptText.slice(1, -1);
      } else {
        promptText = '';
      }

      const userInput = await waitForConsoleInput(promptText);
      variables[varName] = userInput;
      i++;
      continue;
    }


    // Atribuição
    if (/^[a-zA-Z_]\w*\s*=\s*.+$/.test(line)) {
      const parts = line.split('=');
      const varName = parts[0].trim();
      let valueRaw = parts.slice(1).join('=').trim();

      // Checa se é uma chamada Vector2(...) ou Vector3(...)
      let vectorMatch = valueRaw.match(/^(Vector2|Vector3)\(([^)]+)\)$/);
      if (vectorMatch) {
        let vectorType = vectorMatch[1];
        let args = vectorMatch[2].split(',').map(s => s.trim());
        if (vectorType === 'Vector2' && args.length === 2) {
          variables[varName] = Vector2(args[0], args[1]);
        } else if (vectorType === 'Vector3' && args.length === 3) {
          variables[varName] = Vector3(args[0], args[1], args[2]);
        } else {
          console.print('Error: número incorreto de argumentos para ' + vectorType);
        }
      }
      // String
      else if ((valueRaw.startsWith('"') && valueRaw.endsWith('"')) ||
          (valueRaw.startsWith("'") && valueRaw.endsWith("'"))) {
        variables[varName] = valueRaw.slice(1, -1);
      }
      // Número
      else if (!isNaN(Number(valueRaw))) {
        variables[varName] = Number(valueRaw);
      }
      else {
        console.print('Error: invalid assignment value -> ' + valueRaw);
      }
      i++;
      continue;
    }

    // console.print(...)
    if (line.startsWith('console.print(') && line.endsWith(')')) {
      let param = line.slice(14, -1).trim();

      // Caso o param seja string literal
      if ((param.startsWith('"') && param.endsWith('"')) ||
          (param.startsWith("'") && param.endsWith("'"))) {
        console.print(param.slice(1, -1));
      } else if (param.includes('.')) {
        // acesso a propriedade tipo v2.x ou v3.z
        const [varName, prop] = param.split('.');
        if (variables.hasOwnProperty(varName)) {
          const val = variables[varName];
          if (val && typeof val === 'object' && prop in val) {
            console.print(String(val[prop]));
          } else {
            console.print('Error: propriedade não existe -> ' + prop);
          }
        } else {
          console.print('Error: variável não definida -> ' + varName);
        }
      } else {
        if (variables.hasOwnProperty(param)) {
          const val = variables[param];
          if (val && typeof val === 'object' && (val.type === 'Vector2' || val.type === 'Vector3')) {
            // imprime vetor formatado
            if (val.type === 'Vector2') {
              console.print(`Vector2(${val.x}, ${val.y})`);
            } else {
              console.print(`Vector3(${val.x}, ${val.y}, ${val.z})`);
            }
          } else {
            console.print(String(val));
          }
        } else {
          console.print('Error: variável não definida -> ' + param);
        }
      }
      i++;
      continue;
    }

    // ... resto do seu código ...
  }
}

async function runMapCreatorScript(code) {
  const lines = code.split('\n');
  const output = document.getElementById('scriptOutput');
  output.textContent = '';
  Object.keys(variables).forEach(key => delete variables[key]);
  Object.keys(functions).forEach(key => delete functions[key]);

  await runLines(lines);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('runScriptBtn').addEventListener('click', () => {
    const code = document.getElementById('scriptInput').value;
    runMapCreatorScript(code);
  });
});