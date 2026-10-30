# Jogo da Tabuada

Jogo educativo de cartas para praticar as 4 operações matemáticas básicas (adição, subtração,
multiplicação e divisão), feito em HTML, CSS e JavaScript puro — sem instalação, sem servidor,
funciona offline abrindo o `index.html` no navegador.

Este documento descreve **tudo que já foi implementado** até o momento.

---

## 1. Como jogar (visão geral)

1. Na tela inicial, o jogador escolhe: a **operação**, quais **tabuadas** praticar, quantas
   **vidas** quer ter e o nível de **dificuldade**.
2. Uma carta aparece com uma operação (ex: `7 × 8`).
3. O jogador pensa na resposta e clica em **Revelar** para virar a carta e ver o resultado.
4. Depois de ver a resposta, o jogador clica em **✅ Acertei** ou **❌ Errei** (autoavaliação).
5. O jogo ajusta pontuação, vidas e a chance daquela carta voltar a aparecer, e mostra a
   próxima carta.
6. O jogo termina quando o jogador clica em **Encerrar** ou quando as vidas acabam (Game Over).
7. Uma tela de resumo mostra as estatísticas da partida, com opção de jogar de novo.

---

## 2. Tela de seleção (início da partida)

### 2.1 Operação
Escolha única (não dá pra combinar operações na mesma partida):
- ➕ Adição
- ➖ Subtração
- ✖️ Multiplicação (selecionada por padrão)
- ➗ Divisão

### 2.2 Tabuadas
Checkboxes de 1 a 10 — pode marcar quantas quiser. Existe um botão **"Selecionar todas"**.
O botão **"Começar Jogo"** só é liberado depois de marcar pelo menos uma tabuada.

### 2.3 Vidas
Quantidade de vidas (corações) para a partida: **3, 6 ou 9** (3 é o padrão).

### 2.4 Dificuldade
**Fácil**, **Médio** ou **Difícil** (Fácil é o padrão) — controla o tempo por carta, a
velocidade com que cartas erradas voltam a aparecer, e a recuperação de vidas. Detalhes na
seção 5.

---

## 3. Como as cartas são geradas por operação

Para cada tabuada **N** escolhida, o jogo gera 10 cartas, combinando N com os números de 1 a 10.
A regra muda por operação para que **subtração e divisão nunca deem resultado negativo ou
quebrado** (a criança ainda não estudou esses conceitos):

| Operação | Exemplo (tabuada do 3) | Como é calculada |
|---|---|---|
| Adição | `3 + 1` até `3 + 10` | `N + contador` |
| Subtração | `4 − 3` até `13 − 3` | `(N + contador) − N` (sempre resulta em 1 a 10) |
| Multiplicação | `3 × 1` até `3 × 10` | `N × contador` |
| Divisão | `3 ÷ 3` até `30 ÷ 3` | `(N × contador) ÷ N` (sempre resulta em 1 a 10) |

Ou seja, "tabuada de subtrair 3" pratica tirar 3 de vários números, e "tabuada de dividir
por 3" pratica dividir múltiplos de 3. Se mais de uma tabuada for marcada, as cartas de todas
entram juntas no mesmo baralho.

Implementado em [js/cards.js](js/cards.js) (`gerarCarta`, `gerarBaralho`).

---

## 4. A carta e o fluxo de resposta

- A carta tem **frente** (mostra a operação, ex: `7 × 8`) e **verso** (mostra a resposta, `56`),
  com uma **animação 3D de virar** ao clicar em "Revelar".
- Depois de revelada, aparecem os botões **✅ Acertei** e **❌ Errei** — o jogador se
  autoavalia, o jogo não confere a resposta digitada (é um exercício de conferência mental).
- Ao trocar de carta, ela volta pra frente **instantaneamente** (sem animação), só para não
  mostrar a resposta da carta nova por engano durante a troca.

---

## 5. Dificuldade

Cada nível de dificuldade controla três coisas ([js/game.js](js/game.js), objeto
`DIFICULDADES`):

| Dificuldade | Tempo por carta | Aumento de prioridade ao errar | Acertos seguidos p/ +1 vida |
|---|---|---|---|
| 🙂 Fácil | 20s | +1 | a cada 2 acertos seguidos |
| 😐 Médio | 12s | +2 | a cada 5 acertos seguidos |
| 😰 Difícil | 7s | +4 | nunca recupera vida |

- **Tempo por carta**: quanto tempo o cronômetro dá antes de considerar tempo esgotado
  (seção 7).
- **Aumento de prioridade ao errar**: quanto maior, mais rápido aquela carta errada volta a
  aparecer (seção 6).
- **Recuperação de vida**: a cada X acertos **consecutivos**, o jogador ganha 1 vida de volta
  (nunca passa do máximo escolhido no início). Um erro zera a sequência de acertos.

---

## 6. Repetição das cartas (prioridade)

Cada carta tem um valor de **prioridade** (começa em 1) que define a chance dela ser sorteada
para a próxima rodada — quanto maior a prioridade, maior a chance ([js/game.js](js/game.js),
`escolherProximaCarta`, sorteio ponderado).

- **Acertou**: prioridade diminui em 1 (nunca abaixo de 1) → aparece com menos frequência.
- **Errou**: prioridade aumenta conforme a dificuldade (+1, +2 ou +4) → aparece com mais
  frequência, principalmente no modo Difícil.
- A carta que acabou de ser respondida nunca se repete imediatamente na rodada seguinte
  (quando há mais de uma carta no baralho).

---

## 7. Cronômetro e tempo esgotado

- Cada carta tem um cronômetro regressivo (visível no topo, ⏱), com o tempo definido pela
  dificuldade escolhida. Fica vermelho nos últimos 3 segundos.
- O cronômetro **pausa** assim que o jogador clica em "Revelar" manualmente — só corre enquanto
  a pergunta está sem resposta.
- **Se o tempo acabar antes de revelar**: a carta vira sozinha mostrando a resposta, aparece a
  mensagem "⏰ Tempo esgotado!" e um botão **Continuar**. O jogo espera o clique no botão (sem
  avançar sozinho) e, ao clicar, conta automaticamente como **erro** (perde 1 vida e aumenta a
  prioridade da carta).

---

## 8. Sistema de vidas (corações)

- O jogador escolhe o total de vidas no início (3, 6 ou 9) — exibidas como corações ❤️ no topo
  da tela de jogo.
- Cada erro (manual ou por tempo esgotado) tira 1 vida; corações perdidos ficam apagados/
  transparentes na fileira.
- É possível recuperar vidas por sequência de acertos (ver seção 5), até o máximo escolhido.
- Quando as vidas chegam a zero, o jogo termina automaticamente em **Game Over** (seção 9).

Implementado em [js/score.js](js/score.js) (`criarPlacar`, `registrarErro`, `ganharVida`,
`semVidas`).

---

## 9. Pontuação e fim de jogo

- **Acerto** = +1 ponto. **Erro** = +0 pontos (não tira ponto, só vida).
- O jogo pode terminar de duas formas, com títulos diferentes na tela de resumo:
  - **Encerrar** (botão sempre visível durante o jogo) → "🏁 Fim de jogo!"
  - **Vidas zeradas** → "💀 Game Over!"
- Tela de resumo mostra: Pontuação, Acertos, Erros e Cartas treinadas (total de rodadas
  respondidas), e um botão **"Jogar de novo"** que volta para a tela de seleção (mantém a
  operação/vidas/dificuldade escolhidas anteriormente, mas exige marcar as tabuadas de novo).

---

## 10. O que NÃO tem (ainda)

- **Sem persistência**: nada é salvo — ao fechar ou atualizar a página, o progresso da partida
  se perde. Não usa `localStorage`.
- Sem som, sem conquistas/medalhas, sem modo multiplayer.
- Sem conferência automática de resposta digitada (o jogo confia na autoavaliação do jogador).

---

## 11. Estrutura de arquivos

```
jogo-tabuada/
├── index.html          # As 3 telas do jogo (seleção, carta, resumo)
├── css/
│   └── style.css        # Visual, cores, animação de flip da carta
└── js/
    ├── cards.js          # Geração do baralho por operação e tabuada
    ├── score.js           # Pontuação, vidas, sequência de acertos
    ├── game.js             # Config de dificuldade + sorteio da próxima carta
    └── app.js               # Liga tudo à interface (eventos, cronômetro, telas)
```

## 12. Como rodar

Basta abrir o [index.html](index.html) diretamente no navegador — não precisa de instalação,
internet ou servidor.

---

## 13. Roadmap / Próximos passos

Ideias do documento inicial do projeto e das conversas de desenvolvimento, organizadas por tema.
✅ = já implementado · ⬜ = ainda não. Este documento deve ser atualizado a cada nova
funcionalidade — tanto marcando itens como concluídos quanto acrescentando ideias novas.

### Persistência
- ⬜ Salvar progresso com `localStorage` (pontuação, vidas, prioridade das cartas, histórico de
  partidas) para continuar depois de fechar o navegador.

### Gamificação
- ⬜ Sistema de níveis
- ⬜ Medalhas / conquistas
- ⬜ Recordes (melhor pontuação, maior sequência de acertos)
- ✅ Vidas
- ⬜ Moedas/pontos para desbloquear itens (temas, avatares)
- ⬜ Personagem/avatar (mascote que reage a acerto/erro)
- ⬜ Pontuação maior por acerto conforme a dificuldade (ex: acertar no Difícil vale mais pontos)
- ⬜ Desafio do dia: uma tabuada ou combinação diferente sugerida a cada dia, pra criar um
  hábito de prática

### Matemática
- ✅ Adição, Subtração, Multiplicação, Divisão
- ✅ Seleção de tabuada(s) por partida
- ✅ Níveis de dificuldade (Fácil / Médio / Difícil)
- ⬜ Operações combinadas (misturar +, −, ×, ÷ na mesma partida)
- ⬜ Faixa de números diferente por dificuldade (ex: Fácil libera só tabuadas 1, 2, 5, 10)

### Inteligência
- ✅ Repetição baseada em prioridade (carta errada volta mais rápido)
- ⬜ Repetição espaçada mais sofisticada (baseada em tempo, não só prioridade)
- ⬜ Identificação automática das tabuadas/operações com mais erro
- ⬜ Relatório de evolução entre partidas
- ⬜ Recomendação do que estudar na próxima sessão
- ⬜ Sessão de revisão: botão "Praticar só o que errei" ao fim da partida, montando um baralho
  novo só com as cartas erradas

### Experiência
- ✅ Animação de virar a carta
- ✅ Cronômetro por carta com botão "Continuar" após tempo esgotado
- ⬜ Modo contra o relógio: responder o máximo de cartas possível dentro de um tempo total fixo
  (diferente do cronômetro por carta atual)
- ⬜ Sons (acerto, erro, tempo esgotado, vitória)
- ⬜ Responsividade para celular/tablet
- ⬜ Modo para dois jogadores (turnos alternados ou cooperativo pai/filho)
- ⬜ Temas visuais (cores/mascotes diferentes para o Dudu escolher)
