// Liga o estado do jogo aos elementos da tela (eventos e renderização).

var estado = {
  baralho: [],
  cartaAtual: null,
  placar: null,
  dificuldade: null,
  modo: "escolha",
  timerId: null,
  tempoRestante: 0,
  avancoId: null
};

var telaSelecao = document.getElementById("tela-selecao");
var telaJogo = document.getElementById("tela-jogo");
var telaResumo = document.getElementById("tela-resumo");

var gradeModo = document.getElementById("grade-modo");
var gradeOperacao = document.getElementById("grade-operacao");
var gradeTabuadas = document.getElementById("grade-tabuadas");
var btnSelecionarTodas = document.getElementById("btn-selecionar-todas");
var gradeVidas = document.getElementById("grade-vidas");
var gradeDificuldade = document.getElementById("grade-dificuldade");
var btnComecar = document.getElementById("btn-comecar");

var placarPontos = document.getElementById("placar-pontos");
var coracoesTopo = document.getElementById("coracoes-topo");
var cronometro = document.getElementById("cronometro");
var mensagemTempo = document.getElementById("mensagem-tempo");
var cardInner = document.getElementById("card-inner");
var perguntaPrefixo = document.getElementById("pergunta-prefixo");
var textoOperacao = document.getElementById("texto-operacao");
var opcoesResposta = document.getElementById("opcoes-resposta");
var textoResposta = document.getElementById("texto-resposta");
var btnRevelar = document.getElementById("btn-revelar");
var btnContinuar = document.getElementById("btn-continuar");
var botoesResposta = document.getElementById("botoes-resposta");
var btnAcertei = document.getElementById("btn-acertei");
var btnErrei = document.getElementById("btn-errei");
var btnEncerrar = document.getElementById("btn-encerrar");

var resumoTitulo = document.getElementById("resumo-titulo");
var resumoPontos = document.getElementById("resumo-pontos");
var resumoAcertos = document.getElementById("resumo-acertos");
var resumoErros = document.getElementById("resumo-erros");
var resumoCartas = document.getElementById("resumo-cartas");
var btnJogarDeNovo = document.getElementById("btn-jogar-de-novo");

function mostrarTela(tela) {
  [telaSelecao, telaJogo, telaResumo].forEach(function (t) {
    t.classList.remove("ativa");
  });
  tela.classList.add("ativa");
}

function montarGradeTabuadas() {
  gradeTabuadas.innerHTML = "";

  for (var numero = 1; numero <= 10; numero++) {
    var opcao = document.createElement("div");
    opcao.className = "opcao-tabuada";

    var input = document.createElement("input");
    input.type = "checkbox";
    input.id = "tabuada-" + numero;
    input.value = numero;
    input.addEventListener("change", atualizarBotaoComecar);

    var label = document.createElement("label");
    label.setAttribute("for", input.id);
    label.textContent = numero;

    opcao.appendChild(input);
    opcao.appendChild(label);
    gradeTabuadas.appendChild(opcao);
  }
}

function tabuadasMarcadas() {
  var checkboxes = gradeTabuadas.querySelectorAll("input[type=checkbox]:checked");
  return Array.prototype.map.call(checkboxes, function (checkbox) {
    return Number(checkbox.value);
  });
}

function atualizarBotaoComecar() {
  btnComecar.disabled = tabuadasMarcadas().length === 0;
}

function modoEscolhido() {
  var selecionado = gradeModo.querySelector("input[name=modo]:checked");
  return selecionado ? selecionado.value : "escolha";
}

function operacaoEscolhida() {
  var selecionado = gradeOperacao.querySelector("input[name=operacao]:checked");
  return selecionado ? selecionado.value : "multiplicacao";
}

function vidasEscolhidas() {
  var selecionado = gradeVidas.querySelector("input[name=vidas]:checked");
  return selecionado ? Number(selecionado.value) : 3;
}

function dificuldadeEscolhida() {
  var selecionado = gradeDificuldade.querySelector("input[name=dificuldade]:checked");
  var chave = selecionado ? selecionado.value : "facil";
  return DIFICULDADES[chave];
}

function iniciarCronometro() {
  pararCronometro();
  estado.tempoRestante = estado.dificuldade.tempoLimite;
  atualizarTextoCronometro();

  estado.timerId = setInterval(function () {
    estado.tempoRestante -= 1;
    atualizarTextoCronometro();

    if (estado.tempoRestante <= 0) {
      pararCronometro();
      tempoEsgotado();
    }
  }, 1000);
}

function pararCronometro() {
  if (estado.timerId) {
    clearInterval(estado.timerId);
    estado.timerId = null;
  }
}

function atualizarTextoCronometro() {
  cronometro.textContent = "⏱ " + estado.tempoRestante;
  cronometro.classList.toggle("tempo-critico", estado.tempoRestante <= 3);
}

function tempoEsgotado() {
  if (estado.modo === "escolha") {
    marcarOpcaoCerta();
  } else {
    cardInner.classList.add("virada");
  }
  btnRevelar.classList.add("escondido");
  botoesResposta.classList.add("escondido");
  mensagemTempo.classList.remove("escondido");
  btnContinuar.classList.remove("escondido");
}

btnContinuar.addEventListener("click", function () {
  mensagemTempo.classList.add("escondido");
  btnContinuar.classList.add("escondido");
  responder(false);
});

function montarOpcoes() {
  opcoesResposta.innerHTML = "";

  gerarOpcoes(estado.cartaAtual).forEach(function (numero) {
    var botao = document.createElement("button");
    botao.className = "botao-opcao";
    botao.textContent = numero;
    botao.addEventListener("click", function () {
      escolherOpcao(botao, numero);
    });
    opcoesResposta.appendChild(botao);
  });

  opcoesResposta.classList.remove("escondido");
}

// Trava todas as opções e pinta a certa de verde.
function marcarOpcaoCerta() {
  opcoesResposta.querySelectorAll(".botao-opcao").forEach(function (botao) {
    botao.disabled = true;
    if (Number(botao.textContent) === estado.cartaAtual.resposta) {
      botao.classList.add("opcao-certa");
    }
  });
}

function escolherOpcao(botao, numero) {
  pararCronometro();
  var acertou = numero === estado.cartaAtual.resposta;

  marcarOpcaoCerta();
  if (!acertou) {
    botao.classList.add("opcao-errada");
  }

  // Avança sozinho; no erro espera um pouco mais para dar tempo de ver a resposta certa.
  estado.avancoId = setTimeout(function () {
    estado.avancoId = null;
    responder(acertou);
  }, acertou ? 1000 : 2000);
}

function cancelarAvanco() {
  if (estado.avancoId) {
    clearTimeout(estado.avancoId);
    estado.avancoId = null;
  }
}

function verificarBonusDeVida() {
  var meta = estado.dificuldade.sequenciaParaVida;
  if (!meta) {
    return;
  }
  if (estado.placar.sequenciaAtual > 0 && estado.placar.sequenciaAtual % meta === 0) {
    ganharVida(estado.placar);
  }
}

function atualizarCoracoes() {
  coracoesTopo.innerHTML = "";

  for (var i = 1; i <= estado.placar.vidasMax; i++) {
    var coracao = document.createElement("span");
    coracao.textContent = "❤️";
    if (i > estado.placar.vidas) {
      coracao.classList.add("coracao-perdido");
    }
    coracoesTopo.appendChild(coracao);
  }
}

btnSelecionarTodas.addEventListener("click", function () {
  var checkboxes = gradeTabuadas.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = true;
  });
  atualizarBotaoComecar();
});

btnComecar.addEventListener("click", function () {
  estado.baralho = gerarBaralho(operacaoEscolhida(), tabuadasMarcadas());
  estado.placar = criarPlacar(vidasEscolhidas());
  estado.dificuldade = dificuldadeEscolhida();
  estado.modo = modoEscolhido();
  iniciarRodada();
  mostrarTela(telaJogo);
});

function iniciarRodada() {
  var idAnterior = estado.cartaAtual ? estado.cartaAtual.id : null;
  estado.cartaAtual = escolherProximaCarta(estado.baralho, idAnterior);

  // Volta a carta para a frente sem animação antes de trocar o texto,
  // senão a resposta da nova carta aparece brevemente durante o "desvirar".
  cardInner.classList.add("sem-transicao");
  cardInner.classList.remove("virada");
  void cardInner.offsetWidth; // força o navegador a aplicar o "sem-transicao" antes de tirar a classe

  textoResposta.textContent = estado.cartaAtual.resposta;

  if (estado.modo === "escolha") {
    perguntaPrefixo.classList.remove("escondido");
    textoOperacao.textContent = estado.cartaAtual.operacao + "?";
    btnRevelar.classList.add("escondido");
    montarOpcoes();
  } else {
    perguntaPrefixo.classList.add("escondido");
    textoOperacao.textContent = estado.cartaAtual.operacao;
    btnRevelar.classList.remove("escondido");
    opcoesResposta.classList.add("escondido");
  }

  btnContinuar.classList.add("escondido");
  mensagemTempo.classList.add("escondido");
  botoesResposta.classList.add("escondido");
  placarPontos.textContent = estado.placar.pontos;
  atualizarCoracoes();
  iniciarCronometro();

  requestAnimationFrame(function () {
    cardInner.classList.remove("sem-transicao");
  });
}

btnRevelar.addEventListener("click", function () {
  pararCronometro();
  cardInner.classList.add("virada");
  btnRevelar.classList.add("escondido");
  botoesResposta.classList.remove("escondido");
});

function responder(acertou) {
  responderCarta(estado.cartaAtual, acertou, estado.dificuldade.aumentoAoErrar);

  if (acertou) {
    registrarAcerto(estado.placar);
    verificarBonusDeVida();
  } else {
    registrarErro(estado.placar);
  }

  if (semVidas(estado.placar)) {
    atualizarCoracoes();
    pararCronometro();
    mostrarResumo("gameover");
    return;
  }

  iniciarRodada();
}

btnAcertei.addEventListener("click", function () {
  responder(true);
});

btnErrei.addEventListener("click", function () {
  responder(false);
});

btnEncerrar.addEventListener("click", function () {
  pararCronometro();
  cancelarAvanco();
  mostrarResumo("manual");
});

function mostrarResumo(motivo) {
  resumoTitulo.textContent = motivo === "gameover" ? "💀 Game Over!" : "🏁 Fim de jogo!";
  resumoPontos.textContent = estado.placar.pontos;
  resumoAcertos.textContent = estado.placar.acertos;
  resumoErros.textContent = estado.placar.erros;
  resumoCartas.textContent = estado.placar.cartasTreinadas;
  mostrarTela(telaResumo);
}

btnJogarDeNovo.addEventListener("click", function () {
  var checkboxes = gradeTabuadas.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });
  atualizarBotaoComecar();
  mostrarTela(telaSelecao);
});

montarGradeTabuadas();
