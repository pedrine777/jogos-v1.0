// Configurações do tabuleiro quadriculado (16x16 quadrados de 25 pixels = 400x400)
const TAMANHO_GRADE = 16;
const TAMANHO_QUADRADO = 25;
const TOTAL_RODADAS = 8;
const VIDAS_INICIAIS = 3;

// Lista das 8 rodadas com dificuldade progressiva e explicações curtas
const RODADAS_MATEMATICA = [
  {
    sequencia: "2, 4, 6, ?",
    correta: 8,
    erradas: [7, 10],
    explicacaoAcerto: "Boa! A sequência soma 2 a cada passo (6 + 2 = 8).",
    explicacaoErro: "Quase! A sequência conta de 2 em 2. Depois do 6 vem o 8."
  },
  {
    sequencia: "5, 10, 15, ?",
    correta: 20,
    erradas: [16, 25],
    explicacaoAcerto: "Isso aí! Contando de 5 em 5, depois do 15 vem o 20.",
    explicacaoErro: "Ops! Os números aumentam de 5 em 5 (15 + 5 = 20)."
  },
  {
    sequencia: "3, 6, 9, ?",
    correta: 12,
    erradas: [10, 15],
    explicacaoAcerto: "Mandou bem! Na tabuada do 3, o próximo é 12 (9 + 3).",
    explicacaoErro: "Atenção: a sequência pula de 3 em 3. O certo era 12."
  },
  {
    sequencia: "10, 20, 30, ?",
    correta: 40,
    erradas: [35, 50],
    explicacaoAcerto: "Perfeito! Contando de 10 em 10, chegamos ao 40.",
    explicacaoErro: "Aqui contamos de 10 em 10. Depois do 30 vem o 40."
  },
  {
    sequencia: "4, 8, 12, ?",
    correta: 16,
    erradas: [14, 18],
    explicacaoAcerto: "Acertou! Cada número aumenta 4 unidades (12 + 4 = 16).",
    explicacaoErro: "A sequência soma 4 em cada passo. O próximo é 16."
  },
  {
    sequencia: "20, 18, 16, ?",
    correta: 14,
    erradas: [15, 12],
    explicacaoAcerto: "Muito bom! Contagem regressiva de 2 em 2 (16 - 2 = 14).",
    explicacaoErro: "Repare que os números estão diminuindo de 2 em 2! O certo é 14."
  },
  {
    sequencia: "7, 14, 21, ?",
    correta: 28,
    erradas: [24, 27],
    explicacaoAcerto: "Excelente! Somando 7 a cada passo: 21 + 7 = 28.",
    explicacaoErro: "Essa é a contagem de 7 em 7. Depois do 21 vem o 28."
  },
  {
    sequencia: "1, 2, 4, 8, ?",
    correta: 16,
    erradas: [10, 12],
    explicacaoAcerto: "Incrível! Cada número dobra de valor (8 x 2 = 16).",
    explicacaoErro: "Desafio final: cada número dobra! O dobro de 8 é 16."
  }
];

// Elementos da tela
const canvas = document.getElementById("tela-jogo");
const contexto = canvas.getContext("2d");
const textoRodada = document.getElementById("texto-rodada");
const textoPontos = document.getElementById("texto-pontos");
const textoVidas = document.getElementById("texto-vidas");
const caixaSequencia = document.getElementById("sequencia-atual");
const mensagemFeedback = document.getElementById("mensagem-feedback");
const telaAviso = document.getElementById("tela-aviso");
const tituloAviso = document.getElementById("titulo-aviso");
const descricaoAviso = document.getElementById("descricao-aviso");
const botaoIniciar = document.getElementById("botao-iniciar");
const botaoTema = document.getElementById("botao-tema");
const botoesDirecao = document.querySelectorAll(".botao-direcao");

// Estado do jogo
let cobrinha = [];
let direcaoAtual = { x: 1, y: 0 };
let proximaDirecao = { x: 1, y: 0 };
let opcoesNaTela = [];
let rodadaAtual = 0;
let pontos = 0;
let vidas = VIDAS_INICIAIS;
let jogoRodando = false;
let intervaloLoop = null;
let tempoInicioMs = 0;

// Verifica se o dispositivo prefere menos movimento para ajustar a velocidade
const prefereMenosAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const VELOCIDADE_MS = prefereMenosAnimacao ? 280 : 210;

// Inicia ou reinicia uma partida completa
function iniciarJogo() {
  rodadaAtual = 0;
  pontos = 0;
  vidas = VIDAS_INICIAIS;
  tempoInicioMs = Date.now();
  jogoRodando = true;

  telaAviso.classList.add("oculta");
  atualizarPlacar();
  prepararRodada();

  if (intervaloLoop) clearInterval(intervaloLoop);
  intervaloLoop = setInterval(atualizarJogo, VELOCIDADE_MS);
  notificarAlturaPortal();
}

// Posiciona a cobrinha no centro e espalha os 3 números da rodada
function prepararRodada() {
  const dadosRodada = RODADAS_MATEMATICA[rodadaAtual];
  caixaSequencia.textContent = dadosRodada.sequencia;

  // Reseta a cobrinha no meio do tabuleiro com 3 gomos
  cobrinha = [
    { x: 6, y: 8 },
    { x: 5, y: 8 },
    { x: 4, y: 8 }
  ];
  direcaoAtual = { x: 1, y: 0 };
  proximaDirecao = { x: 1, y: 0 };

  // Cria os 3 números em posições livres do tabuleiro
  opcoesNaTela = [];
  const listaNumeros = [
    { valor: dadosRodada.correta, certa: true },
    { valor: dadosRodada.erradas[0], certa: false },
    { valor: dadosRodada.erradas[1], certa: false }
  ];

  listaNumeros.forEach((item) => {
    const posicao = gerarPosicaoLivre();
    opcoesNaTela.push({
      x: posicao.x,
      y: posicao.y,
      valor: item.valor,
      certa: item.certa
    });
  });

  atualizarPlacar();
  desenharTabuleiro();
}

// Encontra um quadrado vazio longe da cobrinha e de outros números
function gerarPosicaoLivre() {
  let x = 0;
  let y = 0;
  let ocupado = true;

  while (ocupado) {
    // Evita encostar bem na borda (usa de 1 até TAMANHO_GRADE - 2) para facilitar no celular
    x = Math.floor(Math.random() * (TAMANHO_GRADE - 2)) + 1;
    y = Math.floor(Math.random() * (TAMANHO_GRADE - 2)) + 1;

    const bateuNaCobra = cobrinha.some((parte) => parte.x === x && parte.y === y);
    const bateuNaFrente = y === 8 && x >= 6 && x <= 11; // Deixa a frente da cobra livre ao começar
    const bateuEmOpcao = opcoesNaTela.some((op) => op.x === x && op.y === y);

    ocupado = bateuNaCobra || bateuNaFrente || bateuEmOpcao;
  }

  return { x, y };
}

// Passo principal executado a cada ciclo do jogo
function atualizarJogo() {
  if (!jogoRodando) return;

  direcaoAtual = proximaDirecao;
  const cabecaAtual = cobrinha[0];
  const novaCabeca = {
    x: cabecaAtual.x + direcaoAtual.x,
    y: cabecaAtual.y + direcaoAtual.y
  };

  // 1. Verifica se bateu na parede do caderno
  if (
    novaCabeca.x < 0 ||
    novaCabeca.x >= TAMANHO_GRADE ||
    novaCabeca.y < 0 ||
    novaCabeca.y >= TAMANHO_GRADE
  ) {
    tratarErro("Bateu na borda do caderno! Cuidado com as paredes.");
    return;
  }

  // 2. Verifica se bateu no próprio corpo
  const bateuNoCorpo = cobrinha.some(
    (parte) => parte.x === novaCabeca.x && parte.y === novaCabeca.y
  );
  if (bateuNoCorpo) {
    tratarErro("Ops! A cobrinha encostou no próprio corpo.");
    return;
  }

  // Move a cobrinha colocando a nova cabeça
  cobrinha.unshift(novaCabeca);

  // 3. Verifica se comeu algum número
  const indiceComido = opcoesNaTela.findIndex(
    (op) => op.x === novaCabeca.x && op.y === novaCabeca.y
  );

  if (indiceComido !== -1) {
    const numeroEscolhido = opcoesNaTela[indiceComido];
    const dadosRodada = RODADAS_MATEMATICA[rodadaAtual];

    if (numeroEscolhido.certa) {
      pontos += 10;
      mostrarFeedback(dadosRodada.explicacaoAcerto, "acerto");
      avancarRodada();
      return;
    } else {
      tratarErro(dadosRodada.explicacaoErro);
      return;
    }
  } else {
    // Se não comeu nada, remove a ponta da cauda para manter o tamanho
    cobrinha.pop();
  }

  desenharTabuleiro();
}

// Perde uma vida e decide se continua ou encerra o jogo
function tratarErro(textoExplicacao) {
  vidas -= 1;
  atualizarPlacar();
  mostrarFeedback(textoExplicacao, "erro");

  if (vidas <= 0) {
    encerrarJogo(false);
  } else {
    // Reinicia a posição da cobrinha na mesma rodada para o jogador tentar de novo
    prepararRodada();
  }
}

// Passa para a próxima sequência ou finaliza as 8 rodadas
function avancarRodada() {
  rodadaAtual += 1;
  if (rodadaAtual >= TOTAL_RODADAS) {
    encerrarJogo(true);
  } else {
    prepararRodada();
  }
}

// Finaliza a partida e avisa o portal
function encerrarJogo(venceu) {
  jogoRodando = false;
  clearInterval(intervaloLoop);

  const maximoPontos = TOTAL_RODADAS * 10;
  const tempoTotalMs = Date.now() - tempoInicioMs;

  if (venceu) {
    tituloAviso.textContent = "Parabéns! Você completou tudo!";
    descricaoAviso.textContent = `Você fechou as ${TOTAL_RODADAS} sequências com ${pontos} de ${maximoPontos} pontos.`;
  } else {
    tituloAviso.textContent = "Fim de jogo! Suas vidas acabaram";
    descricaoAviso.textContent = `Você chegou até a rodada ${rodadaAtual + 1} e fez ${pontos} pontos. Que tal tentar de novo?`;
  }

  botaoIniciar.textContent = "Jogar Novamente";
  telaAviso.classList.remove("oculta");

  // Envia resultado final para o portal escolar
  window.parent.postMessage(
    {
      type: "vrgame:finish",
      score: pontos,
      maxScore: maximoPontos,
      timeMs: tempoTotalMs,
      detail: { jogo: "cobrinha-matematica" }
    },
    "*"
  );

  notificarAlturaPortal();
}

// Atualiza textos de rodada, pontos e corações
function atualizarPlacar() {
  textoRodada.textContent = `Rodada: ${Math.min(rodadaAtual + 1, TOTAL_RODADAS)}/${TOTAL_RODADAS}`;
  textoPontos.textContent = `Pontos: ${pontos}`;
  textoVidas.textContent = "❤️".repeat(Math.max(0, vidas)) + "🤍".repeat(Math.max(0, VIDAS_INICIAIS - vidas));
}

// Exibe mensagem educativa de acerto ou erro
function mostrarFeedback(texto, tipo) {
  mensagemFeedback.textContent = texto;
  mensagemFeedback.className = `feedback ${tipo}`;
}

// Desenha a folha quadriculada, os números e a cobrinha no canvas
function desenharTabuleiro() {
  const escuro = document.body.classList.contains("tema-escuro");
  const corFundo = escuro ? "#1e293b" : "#fffdf7";
  const corLinha = escuro ? "#334155" : "#d6e4f0";
  const corCobraCabeca = escuro ? "#38bdf8" : "#1d4ed8";
  const corCobraCorpo = escuro ? "#0284c7" : "#3b82f6";
  const corFicha = escuro ? "#f59e0b" : "#fef08a";
  const corBordaFicha = escuro ? "#fbbf24" : "#ca8a04";
  const corTextoFicha = "#1e293b";

  // Limpa o fundo
  contexto.fillStyle = corFundo;
  contexto.fillRect(0, 0, canvas.width, canvas.height);

  // Desenha a grade quadriculada de caderno
  contexto.strokeStyle = corLinha;
  contexto.lineWidth = 1;
  for (let i = 0; i <= TAMANHO_GRADE; i++) {
    const pos = i * TAMANHO_QUADRADO;
    contexto.beginPath();
    contexto.moveTo(pos, 0);
    contexto.lineTo(pos, canvas.height);
    contexto.stroke();

    contexto.beginPath();
    contexto.moveTo(0, pos);
    contexto.lineTo(canvas.width, pos);
    contexto.stroke();
  }

  // Desenha as 3 opções numéricas como fichas redondas
  opcoesNaTela.forEach((opcao) => {
    const centroX = opcao.x * TAMANHO_QUADRADO + TAMANHO_QUADRADO / 2;
    const centroY = opcao.y * TAMANHO_QUADRADO + TAMANHO_QUADRADO / 2;

    contexto.fillStyle = corFicha;
    contexto.beginPath();
    contexto.arc(centroX, centroY, TAMANHO_QUADRADO / 2 - 2, 0, Math.PI * 2);
    contexto.fill();

    contexto.strokeStyle = corBordaFicha;
    contexto.lineWidth = 2;
    contexto.stroke();

    contexto.fillStyle = corTextoFicha;
    contexto.font = "bold 13px Trebuchet MS, sans-serif";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillText(String(opcao.valor), centroX, centroY + 1);
  });

  // Desenha a cobrinha (estilo lápis escolar)
  cobrinha.forEach((parte, indice) => {
    const px = parte.x * TAMANHO_QUADRADO + 2;
    const py = parte.y * TAMANHO_QUADRADO + 2;
    const tamanho = TAMANHO_QUADRADO - 4;

    contexto.fillStyle = indice === 0 ? corCobraCabeca : corCobraCorpo;
    contexto.fillRect(px, py, tamanho, tamanho);

    // Desenha dois olhinhos na cabeça da cobrinha
    if (indice === 0) {
      contexto.fillStyle = "#ffffff";
      contexto.fillRect(px + 4, py + 5, 4, 4);
      contexto.fillRect(px + tamanho - 8, py + 5, 4, 4);
    }
  });
}

// Muda a direção evitando que a cobrinha dê ré em si mesma
function definirDirecao(novaDir) {
  if (!jogoRodando) return;

  if (novaDir === "CIMA" && direcaoAtual.y !== 1) {
    proximaDirecao = { x: 0, y: -1 };
  } else if (novaDir === "BAIXO" && direcaoAtual.y !== -1) {
    proximaDirecao = { x: 0, y: 1 };
  } else if (novaDir === "ESQUERDA" && direcaoAtual.x !== 1) {
    proximaDirecao = { x: -1, y: 0 };
  } else if (novaDir === "DIREITA" && direcaoAtual.x !== -1) {
    proximaDirecao = { x: 1, y: 0 };
  }
}

// Controles pelo teclado (Setas ou WASD)
window.addEventListener("keydown", (evento) => {
  const tecla = evento.key;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(tecla)) {
    evento.preventDefault();
  }

  if (tecla === "ArrowUp" || tecla === "w" || tecla === "W") definirDirecao("CIMA");
  if (tecla === "ArrowDown" || tecla === "s" || tecla === "S") definirDirecao("BAIXO");
  if (tecla === "ArrowLeft" || tecla === "a" || tecla === "A") definirDirecao("ESQUERDA");
  if (tecla === "ArrowRight" || tecla === "d" || tecla === "D") definirDirecao("DIREITA");
});

// Controles pelos botões na tela (toque no celular ou clique)
botoesDirecao.forEach((botao) => {
  botao.addEventListener("click", () => {
    definirDirecao(botao.dataset.direcao);
  });
});

// Botão de iniciar / reiniciar
botaoIniciar.addEventListener("click", iniciarJogo);

// Botão para alternar entre tema claro e escuro
botaoTema.addEventListener("click", () => {
  document.body.classList.toggle("tema-escuro");
  desenharTabuleiro();
});

// --- Contrato de comunicação com o portal escolar ---

function aplicarTemaPortal(tema) {
  if (tema === "dark" || tema === "escuro") {
    document.body.classList.add("tema-escuro");
  } else {
    document.body.classList.remove("tema-escuro");
  }
  desenharTabuleiro();
}

function notificarAlturaPortal() {
  const altura = document.documentElement.scrollHeight;
  window.parent.postMessage({ type: "vrgame:resize", height: altura }, "*");
}

window.addEventListener("message", (evento) => {
  const dados = evento.data;
  if (!dados || typeof dados !== "object") return;

  if (dados.type === "vrgame:theme") {
    aplicarTemaPortal(dados.theme || dados.value);
  }

  if (dados.type === "vrgame:fullscreen") {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }
});

window.addEventListener("resize", notificarAlturaPortal);

// Desenha o tabuleiro inicial e avisa o portal que o jogo carregou
window.addEventListener("load", () => {
  desenharTabuleiro();
  window.parent.postMessage({ type: "vrgame:ready" }, "*");
  notificarAlturaPortal();
});