// Baralho: monta as cartas a partir da operação e das tabuadas escolhidas.

var OPERACOES = {
  soma: { nome: "Adição", simbolo: "+" },
  subtracao: { nome: "Subtração", simbolo: "−" },
  multiplicacao: { nome: "Multiplicação", simbolo: "×" },
  divisao: { nome: "Divisão", simbolo: "÷" }
};

// Para cada operação, "tabuada" é o número fixo escolhido (1 a 10) combinado com 1..10.
// Subtração e divisão usam o número fixo como o que é subtraído/divide, para o resultado
// nunca ficar negativo nem quebrado (ex: tabuada de dividir por 2 -> 2÷2, 4÷2, ..., 20÷2).
function gerarCarta(tipoOperacao, tabuada, contador) {
  var num1, num2, resposta;

  if (tipoOperacao === "soma") {
    num1 = tabuada;
    num2 = contador;
    resposta = num1 + num2;
  } else if (tipoOperacao === "subtracao") {
    num1 = tabuada + contador;
    num2 = tabuada;
    resposta = contador;
  } else if (tipoOperacao === "divisao") {
    num1 = tabuada * contador;
    num2 = tabuada;
    resposta = contador;
  } else {
    num1 = tabuada;
    num2 = contador;
    resposta = num1 * num2;
  }

  var simbolo = OPERACOES[tipoOperacao].simbolo;

  return {
    id: tipoOperacao + "-" + num1 + "-" + num2,
    tipo: tipoOperacao,
    num1: num1,
    num2: num2,
    operacao: num1 + " " + simbolo + " " + num2,
    resposta: resposta,
    acertos: 0,
    erros: 0,
    prioridade: 1
  };
}

function gerarBaralho(tipoOperacao, tabuadasSelecionadas) {
  var baralho = [];

  for (var i = 0; i < tabuadasSelecionadas.length; i++) {
    var tabuada = tabuadasSelecionadas[i];

    for (var contador = 1; contador <= 10; contador++) {
      baralho.push(gerarCarta(tipoOperacao, tabuada, contador));
    }
  }

  return baralho;
}

// Modo múltipla escolha: 4 opções embaralhadas (1 certa + 3 erradas).
// As erradas são números "parecidos" com a certa, para ela não ficar óbvia:
// vizinhos (±1, ±2, ±3) e, na multiplicação, vizinhos na tabuada (ex: 7×8 -> 49, 63, 48, 64).
function gerarOpcoes(carta) {
  var certa = carta.resposta;
  var candidatas = [certa - 1, certa + 1, certa - 2, certa + 2, certa - 3, certa + 3];

  if (carta.tipo === "multiplicacao") {
    candidatas.push(certa - carta.num1, certa + carta.num1, certa - carta.num2, certa + carta.num2);
  }

  var erradas = [];
  embaralhar(candidatas).forEach(function (numero) {
    if (erradas.length < 3 && numero >= 0 && numero !== certa && erradas.indexOf(numero) === -1) {
      erradas.push(numero);
    }
  });

  return embaralhar([certa].concat(erradas));
}

function embaralhar(lista) {
  var copia = lista.slice();
  for (var i = copia.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = copia[i];
    copia[i] = copia[j];
    copia[j] = temp;
  }
  return copia;
}
