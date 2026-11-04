// Liga o estado do jogo aos elementos da tela (eventos e renderização).

var estado = {
  baralho: [],
  cartaAtual: null,
  placar: null,
  dificuldade: null,
  modo: "escolha",
  comTempo: false,
  timerId: null,
  tempoRestante: 0,
  avancoId: null,
  confirmarEncerrarId: null
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
var gradeTempo = document.getElementById("grade-tempo");
var btnComecar = document.getElementById("btn-comecar");
var avisoTabuada = document.getElementById("aviso-tabuada");

var placarPontos = document.getElementById("placar-pontos");
var coracoesTopo = document.getElementById("coracoes-topo");
var anuncio = document.getElementById("anuncio");
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
var resumoRevisao = document.getElementById("resumo-revisao");
var listaRevisao = document.getElementById("lista-revisao");
var btnPraticarErradas = document.getElementById("btn-praticar-erradas");
var resumoSemErros = document.getElementById("resumo-sem-erros");
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
  var nenhuma = tabuadasMarcadas().length === 0;
  btnComecar.disabled = nenhuma;
  avisoTabuada.classList.toggle("escondido", !nenhuma);
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

function comTempoEscolhido() {
  var selecionado = gradeTempo.querySelector("input[name=tempo]:checked");
  return selecionado ? selecionado.value === "com" : false;
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
  anunciar("Tempo esgotado. A resposta é " + estado.cartaAtual.resposta);
}

function anunciar(texto) {
  anuncio.textContent = texto;
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
    botao.dataset.valor = numero;
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
    if (Number(botao.dataset.valor) === estado.cartaAtual.resposta) {
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
  anunciar(acertou ? "Certo!" : "Errado. A resposta é " + estado.cartaAtual.resposta);

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

  // Para leitores de tela: "2 de 3 vidas" em vez de "coração, coração, coração"
  coracoesTopo.setAttribute("aria-label", estado.placar.vidas + " de " + estado.placar.vidasMax + " vidas");
}

btnSelecionarTodas.addEventListener("click", function () {
  var checkboxes = gradeTabuadas.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = true;
  });
  atualizarBotaoComecar();
});

btnComecar.addEventListener("click", function () {
  iniciarPartida(gerarBaralho(operacaoEscolhida(), tabuadasMarcadas()));
});

function iniciarPartida(baralho) {
  estado.baralho = baralho;
  estado.placar = criarPlacar(vidasEscolhidas());
  estado.dificuldade = dificuldadeEscolhida();
  estado.modo = modoEscolhido();
  estado.comTempo = comTempoEscolhido();
  // Sem tempo, o cronômetro some da tela para não passar nenhuma sensação de pressa.
  cronometro.classList.toggle("escondido", !estado.comTempo);
  restaurarBotaoEncerrar();
  iniciarRodada();
  mostrarTela(telaJogo);
}

function iniciarRodada() {
  var idAnterior = estado.cartaAtual ? estado.cartaAtual.id : null;
  estado.cartaAtual = escolherProximaCarta(estado.baralho, idAnterior);

  // Volta a carta para a frente sem animação antes de trocar o texto,
  // senão a resposta da nova carta aparece brevemente durante o "desvirar".
  cardInner.classList.add("sem-transicao");
  cardInner.classList.remove("virada");
  void cardInner.offsetWidth; // força o navegador a aplicar o "sem-transicao" antes de tirar a classe

  textoResposta.textContent = estado.cartaAtual.resposta;
  anunciar("");

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
  if (estado.comTempo) {
    iniciarCronometro();
  }

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

// Primeiro toque só pede confirmação, para um toque sem querer não acabar com a partida.
btnEncerrar.addEventListener("click", function () {
  if (!btnEncerrar.classList.contains("confirmando")) {
    btnEncerrar.classList.add("confirmando");
    btnEncerrar.textContent = "Toque de novo para sair";
    estado.confirmarEncerrarId = setTimeout(restaurarBotaoEncerrar, 3000);
    return;
  }

  restaurarBotaoEncerrar();
  pararCronometro();
  cancelarAvanco();
  mostrarResumo("manual");
});

function restaurarBotaoEncerrar() {
  clearTimeout(estado.confirmarEncerrarId);
  estado.confirmarEncerrarId = null;
  btnEncerrar.classList.remove("confirmando");
  btnEncerrar.textContent = "Encerrar";
}

function mostrarResumo(motivo) {
  resumoTitulo.textContent = motivo === "gameover" ? "💀 Game Over!" : "🏁 Fim de jogo!";
  resumoPontos.textContent = estado.placar.pontos;
  resumoAcertos.textContent = estado.placar.acertos;
  resumoErros.textContent = estado.placar.erros;
  resumoCartas.textContent = estado.placar.cartasTreinadas;
  mostrarRevisao();
  mostrarTela(telaResumo);
}

// Lista as contas erradas na partida, das mais erradas para as menos.
function cartasErradas() {
  return estado.baralho
    .filter(function (carta) {
      return carta.erros > 0;
    })
    .sort(function (a, b) {
      return b.erros - a.erros;
    });
}

function mostrarRevisao() {
  var erradas = cartasErradas();
  listaRevisao.innerHTML = "";

  erradas.forEach(function (carta) {
    var item = document.createElement("span");
    item.className = "item-revisao";
    item.textContent = carta.operacao;
    listaRevisao.appendChild(item);
  });

  resumoRevisao.classList.toggle("escondido", erradas.length === 0);
  resumoSemErros.classList.toggle("escondido", erradas.length > 0 || estado.placar.cartasTreinadas === 0);
}

// Nova partida só com as contas erradas, começando do zero (mesmas opções de antes).
btnPraticarErradas.addEventListener("click", function () {
  var baralho = cartasErradas().map(function (carta) {
    return Object.assign({}, carta, { acertos: 0, erros: 0, prioridade: 1 });
  });
  iniciarPartida(baralho);
});

btnJogarDeNovo.addEventListener("click", function () {
  mostrarTela(telaSelecao);
});

montarGradeTabuadas();
atualizarBotaoComecar();
