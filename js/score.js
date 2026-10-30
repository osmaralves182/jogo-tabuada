// Pontuação e estatísticas da partida.

function criarPlacar(vidasIniciais) {
  return {
    pontos: 0,
    acertos: 0,
    erros: 0,
    cartasTreinadas: 0,
    vidas: vidasIniciais,
    vidasMax: vidasIniciais,
    sequenciaAtual: 0
  };
}

function registrarAcerto(placar) {
  placar.pontos += 1;
  placar.acertos += 1;
  placar.cartasTreinadas += 1;
  placar.sequenciaAtual += 1;
}

function registrarErro(placar) {
  placar.erros += 1;
  placar.cartasTreinadas += 1;
  placar.vidas -= 1;
  placar.sequenciaAtual = 0;
}

function semVidas(placar) {
  return placar.vidas <= 0;
}

function ganharVida(placar) {
  if (placar.vidas < placar.vidasMax) {
    placar.vidas += 1;
  }
}
