const console = {
  print: (text) => {
    const output = document.getElementById('scriptOutput');
    output.textContent += text + '\n';
    output.scrollTop = output.scrollHeight;
  }
};

const variables = {};
const functions = {};

function safeMathEval(expr) {
  const allowedFunctions = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'log', 'pow', 'max', 'min', 'round', 'floor', 'ceil'];

  if (!/^[0-9+\-*/%^()., a-zA-Z]+$/.test(expr)) throw new Error('Expressão inválida');

  const exprWithMath = expr.replace(/([a-zA-Z]+)\(/g, (m, f) => {
    if (allowedFunctions.includes(f)) return `Math.${f}(`;
    throw new Error('Função não permitida: ' + f);
  });

  return Function(`"use strict"; return (${exprWithMath})`)();
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
      if (functions[funcName]) {
        await runLines(functions[funcName]);
      } else {
        console.print('Error: função não definida -> ' + funcName);
      }
      i++;
      continue;
    }

    if (/^[a-zA-Z_]\w*\s*=/.test(line)) {
      const [varName, ...rest] = line.split('=');
      const valueRaw = rest.join('=').trim();
      if ((valueRaw.startsWith('"') && valueRaw.endsWith('"')) || (valueRaw.startsWith("'") && valueRaw.endsWith("'"))) {
        variables[varName.trim()] = valueRaw.slice(1, -1);
      } else if (!isNaN(Number(valueRaw))) {
        variables[varName.trim()] = Number(valueRaw);
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
      } else if (variables.hasOwnProperty(param)) {
        console.print(String(variables[param]));
      } else {
        console.print('Error: variável não definida -> ' + param);
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
        console.print('Error: expressão inválida');
      }
      i++;
      continue;
    }

    if (line === '') {
      i++;
      continue;
    }

    console.print('Error: comando inválido -> ' + line);
    i++;
  }
}

async function runScript(code) {
  document.getElementById('scriptOutput').textContent = '';
  Object.keys(variables).forEach(k => delete variables[k]);
  Object.keys(functions).forEach(k => delete functions[k]);
  await runLines(code.split('\n'));
}

// Adiciona evento para o botão
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('runScriptBtn').addEventListener('click', () => {
    const code = document.getElementById('scriptInput').value;
    runScript(code);
  });
});
