// Fluxo da partida: qual carta mostrar agora e como reagir a acerto/erro.

var PRIORIDADE_MINIMA = 1;

// tempoLimite: segundos para responder antes de contar como erro automático.
// aumentoAoErrar: quanto a prioridade da carta sobe ao errar (quanto maior, mais rápido ela volta).
// sequenciaParaVida: acertos seguidos necessários para ganhar 1 vida de volta (null = nunca recupera).
var DIFICULDADES = {
  facil: { nome: "Fácil", tempoLimite: 20, aumentoAoErrar: 1, sequenciaParaVida: 2 },
  medio: { nome: "Médio", tempoLimite: 12, aumentoAoErrar: 2, sequenciaParaVida: 5 },
  dificil: { nome: "Difícil", tempoLimite: 7, aumentoAoErrar: 4, sequenciaParaVida: null }
};

function escolherProximaCarta(baralho, idCartaAtual) {
  var candidatas = baralho;

  if (baralho.length > 1 && idCartaAtual) {
    candidatas = baralho.filter(function (carta) {
      return carta.id !== idCartaAtual;
    });
  }

  var somaPrioridades = candidatas.reduce(function (soma, carta) {
    return soma + carta.prioridade;
  }, 0);

  var sorteio = Math.random() * somaPrioridades;
  var acumulado = 0;

  for (var i = 0; i < candidatas.length; i++) {
    acumulado += candidatas[i].prioridade;
    if (sorteio < acumulado) {
      return candidatas[i];
    }
  }

  return candidatas[candidatas.length - 1];
}

function responderCarta(carta, acertou, aumentoAoErrar) {
  if (acertou) {
    carta.acertos += 1;
    carta.prioridade = Math.max(PRIORIDADE_MINIMA, carta.prioridade - 1);
  } else {
    carta.erros += 1;
    carta.prioridade += aumentoAoErrar;
  }
}
