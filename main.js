// 1. Импорты, цвета, стили линий и приложение PixiJS.
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

const COLORS = {
  background: 0x101827,
  board: 0x1b2840,
  cell: 0x293851,
  x: 0xb9f34c,
  o: 0xbb9aff,
  text: 0xffffff,
};

const STROKES = {
  x: {
    width: 8,
    color: COLORS.x,
    cap: PIXI.LINE_CAP.ROUND,
    join: PIXI.LINE_JOIN.ROUND,
  },
  o: {
    width: 8,
    color: COLORS.o,
    cap: PIXI.LINE_CAP.ROUND,
    join: PIXI.LINE_JOIN.ROUND,
  },
};

// PixiJS создаёт canvas и подстраивает размер рендера под окно.
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: COLORS.background,
});

document.body.appendChild(app.view);

// 2. Глобальные переменные и состояние игры.
let gameOver = false;
let currentPlayer = 'X';
let cellSize = 0;
let winningCombo = null;
let winLine = null;

// Массив хранит символы клеток; счёт сохраняется между раундами.
const board = Array(9).fill('');
// Здесь хранятся анимации поля, которые нужно остановить при сбросе или resize.
const activeAnimations = [];
const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const scores = {
  X: 0,
  O: 0,
  draws: 0,
};
const sounds = {
  x: new Audio(`${import.meta.env.BASE_URL}sounds/x.mp3`),
  o: new Audio(`${import.meta.env.BASE_URL}sounds/o.mp3`),
  win: new Audio(`${import.meta.env.BASE_URL}sounds/win.mp3`),
};
sounds.x.volume = 0.35;
sounds.o.volume = 0.25;
// 3. Контейнеры и элементы интерфейса.
const titleStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fontWeight: 'bold',
  fill: '#f4f7ff',
  letterSpacing: 4,
  dropShadow: true,
  dropShadowColor: 0x000000,
  dropShadowBlur: 10,
  dropShadowDistance: 0,
  dropShadowAlpha: 0.3,
});

const statusStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 22,
  fontWeight: 'bold',
  fill: COLORS.x,
  letterSpacing: 1,
  dropShadow: true,
  dropShadowColor: 0x000000,
  dropShadowBlur: 6,
  dropShadowDistance: 0,
  dropShadowAlpha: 0.25,
});
const scoreStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 20,
  fontWeight: 'bold',
  fill: COLORS.text,
});

const boardBackground = new PIXI.Graphics();
const boardContainer = new PIXI.Container();
const decorContainer = new PIXI.Container();
const statusBackgroundramka = new PIXI.Graphics();
const statusBackground = new PIXI.Graphics();

const scoreXBackground = new PIXI.Graphics();
const scoreDrawBackground = new PIXI.Graphics();
const scoreOBackground = new PIXI.Graphics();

const resetButton = new PIXI.Graphics();
const buttonText = new PIXI.Text('Restart');
const scoreXText = new PIXI.Text('X: 0', scoreStyle);
const scoreDrawText = new PIXI.Text('DRAW: 0', scoreStyle);
const scoreOText = new PIXI.Text('O: 0', scoreStyle);
const titleText = new PIXI.Text('TIC TAC TOE', titleStyle);
titleText.anchor.set(0.5);
titleText.y = 50;
titleText.x = window.innerWidth / 2;
app.stage.addChild(titleText);

const statusText = new PIXI.Text('TURN: X', statusStyle);
statusText.y = 80;
statusText.anchor.set(0.5);
statusText.x = window.innerWidth / 2;
// Порядок addChild задаёт порядок слоёв на сцене PixiJS.
app.stage.addChild(decorContainer);
app.stage.addChild(statusBackgroundramka);
app.stage.addChild(statusBackground);
app.stage.addChild(statusText);
app.stage.addChild(boardBackground);
app.stage.addChild(boardContainer);

const scoreContainer = new PIXI.Container();

scoreContainer.addChild(
  scoreXBackground,
  scoreDrawBackground,
  scoreOBackground,
  scoreXText,
  scoreDrawText,
  scoreOText
);

app.stage.addChild(scoreContainer);

scoreXText.style = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 20,
  fontWeight: 'bold',
  fill: COLORS.x,
});

scoreDrawText.style = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 20,
  fontWeight: 'bold',
  fill: '#d7e1ef',
});

scoreOText.style = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 20,
  fontWeight: 'bold',
  fill: COLORS.o,
});

// 4. Игровое поле и кнопка нового раунда.
function createGrid() {
  for (let index = 0; index < 9; index++) {
    const cell = new PIXI.Graphics();
    cell.index = index;
    cell.eventMode = 'static';
    cell.cursor = 'pointer';
    cell.on('pointertap', onCellClick);
    boardContainer.addChild(cell);
  }
}

function createResetButton() {
  resetButton.eventMode = 'static';
  resetButton.cursor = 'pointer';
  resetButton.beginFill(COLORS.x);
  resetButton.drawRoundedRect(0, 0, 200, 56, 18);
  resetButton.pivot.set(100, 28);
  resetButton.endFill();
  resetButton.on('pointertap', resetGame);

  buttonText.text = 'NEW ROUND';
  buttonText.anchor.set(0.5);
  buttonText.position.set(100, 28);
  buttonText.style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: 'bold',
    fill: COLORS.background,
  });
  resetButton.on('pointerdown', () => {
    resetButton.alpha = 0.7;
    gsap.to(resetButton.scale, {
      x: 0.94,
      y: 0.94,
      duration: 0.12,
      ease: 'power2.out',
      overwrite: true,
    });
  });

  resetButton.on('pointerup', restoreButton);
  resetButton.on('pointerupoutside', restoreButton);

  resetButton.addChild(buttonText);
  app.stage.addChild(resetButton);
}

function restoreButton() {
  resetButton.alpha = 1;

  gsap.to(resetButton.scale, {
    x: 1,
    y: 1,
    duration: 0.12,
    ease: 'power2.out',
    overwrite: true,
  });
}

// 5. Игровое состояние: ход, результат и новый раунд.
// PixiJS передаёт нажатую клетку через this; привязка обработчика сохранена.
function onCellClick() {
  const index = this.index;
  if (board[index] !== '' || gameOver === true) {
    return;
  }

  if (currentPlayer === 'X') {
    board[index] = 'X';

    drawX(this);

  } else {
    board[index] = 'O';

    drawO(this);
    playSound(sounds.o);
  }

  checkWinner();

  if (!gameOver) {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`TURN: ${currentPlayer}`, currentPlayer);
  }

}

function checkWinner() {
  for (const combination of winningCombinations) {
    const [firstIndex, secondIndex, thirdIndex] = combination;
    if (
      board[firstIndex] &&
      board[firstIndex] === board[secondIndex] &&
      board[firstIndex] === board[thirdIndex]
    ) {

      updateStatus(`PLAYER ${currentPlayer} WINS!`, currentPlayer);
      gameOver = true;
      winningCombo = combination;
      scores[currentPlayer]++;
      const winnerScoreText = currentPlayer === 'X' ? scoreXText : scoreOText;

      animateScore(winnerScoreText);
      highlightWinner(combination);
      drawWinLine(combination);
      updateScore();
      playSound(sounds.win);

      return;
    }
  }

  if (board.every((cell) => cell !== '')) {

    updateStatus('DRAW!');
    gameOver = true;
    scores.draws++;
    animateScore(scoreDrawText);
  }
  updateScore();
}

function resetGame() {
  winningCombo = null;
  clearWinLine();

  stopAnimations();

  gameOver = false;
  board.fill('');
  currentPlayer = 'X';
  updateStatus(`TURN: ${currentPlayer}`, currentPlayer);

  for (let index = 0; index < boardContainer.children.length; index++) {
    const cell = boardContainer.children[index];
    cell.tint = 0xffffff;
    clearCell(cell);
  }
}

// 6. Статус игры и счёт.
function updateStatus(message, player = null) {
  statusText.text = message;

  if (player === 'X') {
    statusText.style.fill = COLORS.x;
  } else if (player === 'O') {
    statusText.style.fill = COLORS.o;
  } else {
    statusText.style.fill = COLORS.text;
  }
  refreshStatusPanel();
}

function refreshStatusPanel() {
  const width = window.innerWidth;
  const isLandscape = width > window.innerHeight;

  const leftWidth = width * 0.45;
  const uiWidth = isLandscape ? leftWidth - 20 : width - 20;

  statusText.scale.set(1);

  statusText.scale.set(
    Math.min(1, (uiWidth - 32) / statusText.width)
  );

  const panelWidth = Math.min(
    uiWidth,
    statusText.width + 32
  );

  const panelHeight = Math.max(
    44,
    statusText.height + 20
  );

  drawStatusPanel(panelWidth, panelHeight);
}

function drawStatusPanel(panelWidth, panelHeight) {
  statusBackgroundramka.clear();
  statusBackgroundramka.beginFill(COLORS.cell);
  statusBackgroundramka.drawRoundedRect(
    -panelWidth / 2,
    -panelHeight / 2,
    panelWidth,
    panelHeight,
    20
  );
  statusBackgroundramka.endFill();

  statusBackground.clear();
  statusBackground.beginFill(0x16233a);
  statusBackground.drawRoundedRect(
    -panelWidth / 2 + 5,
    -panelHeight / 2 + 5,
    panelWidth - 10,
    panelHeight - 10,
    16
  );
  statusBackground.endFill();
}

function updateScore() {
  scoreXText.text = `X: ${scores.X}`;
  scoreDrawText.text = `DRAW: ${scores.draws}`;
  scoreOText.text = `O: ${scores.O}`;
}

function drawScoreCard(graphics, color, width, height) {
  graphics.clear();

  graphics.beginFill(0x16233a);
  graphics.lineStyle(2, color);

  graphics.drawRoundedRect(
    -width / 2,
    -height / 2,
    width,
    height,
    12
  );

  graphics.endFill();
}

function animateScore(textObject) {
  gsap.killTweensOf(textObject.scale);

  gsap.fromTo(
    textObject.scale,
    { x: 1, y: 1 },
    {
      x: 1.25,
      y: 1.25,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    }
  );
}

// 7. Отрисовка и анимации символов и победы.
function drawX(cell, animate = true) {
  const crossContainer = new PIXI.Container();
  const line1 = new PIXI.Graphics();
  const line2 = new PIXI.Graphics();
  const animation = { progress: 0 };
  const animation2 = { progress: 0 };

  const crossSize = cellSize * 0.7;
  const offset = (cellSize - crossSize) / 2;
  line1.lineStyle(STROKES.x);
  line1.moveTo(offset, offset);
  line2.lineStyle(STROKES.x);

  line2.moveTo(offset, crossSize + offset);
  crossContainer.addChild(line1, line2);
  cell.addChild(crossContainer);

  if (animate) {
    // GSAP последовательно рисует две линии X и запускает их звуки.
    const timeline = gsap.timeline();
    timeline.call(() => playSound(sounds.x));
    timeline.to(animation, {
      progress: 1,
      duration: 0.4,
      ease: 'none',
      onUpdate: () => {
        line1.clear();
        line1.lineStyle(STROKES.x);
        line1.moveTo(offset, offset);
        line1.lineTo(
          crossSize * animation.progress + offset,
          crossSize * animation.progress + offset
        );
      },
    });
    timeline.call(() => playSound(sounds.x), null, '+=0.15');
    timeline.to(animation2, {
      progress: 1,
      duration: 0.4,
      ease: 'none',
      onUpdate: () => {
        line2.clear();
        line2.lineStyle(STROKES.x);

        line2.moveTo(offset, crossSize + offset);
        line2.lineTo(
          offset + crossSize * animation2.progress,
          offset + crossSize * (1 - animation2.progress)
        );
      },
    });

    activeAnimations.push(timeline);
  } else {
    line1.lineTo(crossSize + offset, crossSize + offset);
    line2.lineTo(crossSize + offset, offset);
  }
}

function drawO(cell, animate = true) {
  const graphics = new PIXI.Graphics();
  const center = cellSize / 2;
  const circleDiameter = cellSize * 0.7;
  const animation = { progress: 0 };

  graphics.lineStyle(STROKES.o);

  cell.addChild(graphics);

  if (animate) {
    const tween = gsap.to(animation, {
      progress: 1,
      duration: 0.9,
      ease: 'none',
      onUpdate: () => {
        graphics.clear();
        graphics.lineStyle(STROKES.o);

        graphics.arc(center, center, circleDiameter / 2, 0, animation.progress * Math.PI * 2);
      },
    });
    activeAnimations.push(tween);
  } else {
    graphics.drawCircle(center, center, circleDiameter / 2);
  }
}

function getWinnerAccentColor(combination) {
  const winnerSymbol = board[combination[0]];

  return winnerSymbol === 'O' ? COLORS.o : COLORS.x;
}

function highlightWinner(combination, animate = true) {

  const accentColor = getWinnerAccentColor(combination);
  for (const win of combination) {
    const winnerFrame = new PIXI.Graphics();
    const cell = boardContainer.children[win];
    winnerFrame.alpha = 1;
    winnerFrame.lineStyle(3, accentColor);
    winnerFrame.drawRoundedRect(0, 0, cellSize, cellSize, 10);
    cell.addChild(winnerFrame);

    if (animate) {
      winnerFrame.alpha = 0;
      const tween = gsap.to(winnerFrame, {
        alpha: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
      activeAnimations.push(tween);
    }
  }

}

function drawWinLine(combination, animate = true) {
  const accentColor = getWinnerAccentColor(combination);

  const firstCell = boardContainer.children[combination[0]];
  const lastCell = boardContainer.children[combination[2]];

  const startX = firstCell.x + cellSize / 2;
  const startY = firstCell.y + cellSize / 2;
  const endX = lastCell.x + cellSize / 2;
  const endY = lastCell.y + cellSize / 2;

  const line = new PIXI.Graphics();
  winLine = line;
  const animation = { progress: 0 };
  boardContainer.addChild(line);

  if (animate) {
    const tween = gsap.to(animation, {
      progress: 1,
      duration: 0.9,
      ease: 'none',
      onUpdate: () => {
        line.clear();
        line.lineStyle({
          width: 7,
          color: accentColor,
          cap: PIXI.LINE_CAP.ROUND,
          join: PIXI.LINE_JOIN.ROUND,
        });
        line.moveTo(startX, startY);
        line.lineTo(
          startX + (endX - startX) * animation.progress,
          startY + (endY - startY) * animation.progress
        );
      },
    });
    activeAnimations.push(tween);
  } else {
    line.lineStyle({
      width: 7,
      color: accentColor,
      cap: PIXI.LINE_CAP.ROUND,
      join: PIXI.LINE_JOIN.ROUND,
    });
    line.moveTo(startX, startY);
    line.lineTo(endX, endY);
  }

}

// 8. Декоративный фон.
function createDecorX(size, color, alpha = 0.5) {
  const text = new PIXI.Text('X', {
    fontFamily: 'Arial',
    fontSize: size,
    fontWeight: 'bold',
    fill: color,
  });

  text.anchor.set(0.5);
  text.alpha = alpha;

  return text;
}

function createDecorO(size, color, alpha = 0.12) {
  const graphic = new PIXI.Graphics();

  graphic.alpha = alpha;

  graphic.lineStyle({
    width: 20,
    color,
    cap: PIXI.LINE_CAP.ROUND,
    join: PIXI.LINE_JOIN.ROUND,
  });

  graphic.drawCircle(size / 2, size / 2, size * 0.6);

  return graphic;
}

function drawBackgroundDecor(width, height, isLandscape) {
  decorContainer.removeChildren().forEach((child) => child.destroy());

  if (isLandscape) {
    const o1 = createDecorO(180, COLORS.o, 0.10);
    o1.position.set(width * 0.08, height * 0.28);

    const x1 = createDecorX(160, COLORS.x, 0.20);
    x1.position.set(width * 0.30, height * 0.65);

    const o2 = createDecorO(140, COLORS.o, 0.08);
    o2.position.set(width * 0.78, height * 0.08);

    const x2 = createDecorX(180, COLORS.x, 0.20);
    x2.position.set(width * 0.78, height * 0.80);

    decorContainer.addChild(o1, x1, o2, x2);
  } else {
    const o1 = createDecorO(170, COLORS.o, 0.10);
    o1.position.set(width * 0.05, height * 0.10);

    const o2 = createDecorO(150, COLORS.o, 0.08);
    o2.position.set(width * 0.68, height * 0.72);

    const x1 = createDecorX(150, COLORS.x, 0.09);
    x1.position.set(width * 0.68, height * 0.15);

    const x2 = createDecorX(170, COLORS.x, 0.08);
    x2.position.set(width * 0.15, height * 0.72);

    decorContainer.addChild(o1, x1, o2, x2);
  }
}

// 9. Звук, очистка графики и управление анимациями.
// Повторный запуск начинается с начала; отказ браузера в воспроизведении игнорируется.
function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

// Удаляем и уничтожаем дочернюю графику, сохраняя саму клетку и её события.
function clearCell(cell) {
  cell.removeChildren().forEach((child) => {
    child.destroy();
  });
}

function clearWinLine() {
  if (winLine !== null) {
    boardContainer.removeChild(winLine);
    winLine.destroy();
    winLine = null;
  }
}

function stopAnimations() {
  for (const animation of activeAnimations) {
    animation.kill();
  }
  activeAnimations.length = 0;
}

function animateIntro() {
  const timeline = gsap.timeline();

  timeline.from(titleText, {
    alpha: 0,
    y: titleText.y - 25,
    duration: 0.6,
    ease: 'power2.out',
  });

  timeline.from(statusText, {
    alpha: 0,
    y: statusText.y - 15,
    duration: 0.4,
    ease: 'power2.out',
    }, '-=0.2');
}

// 10. Адаптивная компоновка и перерисовка.
function resizeGame() {
  stopAnimations();
  clearWinLine();

  const width = window.innerWidth;
  const height = window.innerHeight;
  // Ориентация определяет две существующие схемы расположения элементов.
  const isLandscape = width > height;

  const gap = 5;
  const padding = 15;
  const margin = 16;

  const leftWidth = width * 0.45;
  const rightWidth = width - leftWidth;
  const uiWidth = isLandscape ? leftWidth - 20 : width - 20;

  // 1. Размеры текста
  titleText.style.fontSize = isLandscape ? 28 : 32;
  titleText.style.letterSpacing = 2;

  statusText.style.fontSize = isLandscape ? 18 : 20;

  const scoreFontSize = isLandscape ? 16 : 18;
  scoreXText.style.fontSize = scoreFontSize;
  scoreDrawText.style.fontSize = scoreFontSize;
  scoreOText.style.fontSize = scoreFontSize;

  titleText.scale.set(1);
  statusText.scale.set(1);

  // Ограничиваем ширину заголовка и статуса
  titleText.scale.set(
    Math.min(1, uiWidth / titleText.width)
  );

  statusText.scale.set(
    Math.min(1, (uiWidth - 32) / statusText.width)
  );

  const titleHeight = titleText.height;
  const statusHeight = Math.max(44, statusText.height + 20);
  const statusWidth = Math.min(
    uiWidth,
    statusText.width + 32
  );

  // 2. Рисуем карточку статуса
  drawStatusPanel(statusWidth, statusHeight);

  // 3. Размеры карточек счёта
  const scoreHeight = 48;
  const cardWidth = Math.min(95, (uiWidth - 24) / 3);
  const cardSpacing = cardWidth + 8;

  drawScoreCard(scoreXBackground, COLORS.x, cardWidth, scoreHeight);
  drawScoreCard(scoreDrawBackground, 0x94a3b8, cardWidth, scoreHeight);
  drawScoreCard(scoreOBackground, COLORS.o, cardWidth, scoreHeight);

  const scoreBackgrounds = [
    scoreXBackground,
    scoreDrawBackground,
    scoreOBackground,
  ];

  const scoreTexts = [
    scoreXText,
    scoreDrawText,
    scoreOText,
  ];

  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * cardSpacing;

    scoreBackgrounds[i].position.set(x, 0);
    scoreTexts[i].anchor.set(0.5);
    scoreTexts[i].position.set(x, 0);

    scoreTexts[i].scale.set(1);
    scoreTexts[i].scale.set(
      Math.min(1, (cardWidth - 8) / scoreTexts[i].width)
    );
  }

  // 4. Рассчитываем место для игрового поля
  const buttonHeight = 56;
  const layoutGap = isLandscape ? 12 : 10;

  const fixedHeight =
  titleHeight +
  statusHeight +
  scoreHeight +
  buttonHeight +
  layoutGap * 4;

  const boardSize = isLandscape
  ? Math.min(
    rightWidth - margin * 2 - padding * 2,
    height - margin * 2 - padding * 2,
    450
  )
  : Math.min(
    width - margin * 2 - padding * 2,
    height - fixedHeight - margin * 2 - padding * 2,
    450
  );

  cellSize = Math.max(1, (boardSize - gap * 2) / 3);

  const gridWidth = 3 * cellSize + 2 * gap;
  const gridHeight = 3 * cellSize + 2 * gap;
  const panelBoardSize = gridHeight + padding * 2;

  // 5. Восстанавливаем символы из board без повторных анимаций и звуков.
  for (let index = 0; index < 9; index++) {
    const cell = boardContainer.children[index];

    clearCell(cell);
    cell.clear();

    if (board[index] === 'X') {
      drawX(cell, false);
    } else if (board[index] === 'O') {
      drawO(cell, false);
    }

    const row = Math.floor(index / 3);
    const column = index % 3;

    cell.beginFill(COLORS.cell);
    cell.drawRoundedRect(0, 0, cellSize, cellSize, 10);
    cell.endFill();

    cell.position.set(
      column * (cellSize + gap),
      row * (cellSize + gap)
    );
  }

  boardContainer.pivot.set(gridWidth / 2, gridHeight / 2);

  // 6. Подложка игрового поля
  boardBackground.clear();
  boardBackground.beginFill(COLORS.board);
  boardBackground.drawRoundedRect(
    0,
    0,
    gridWidth + padding * 2,
    gridHeight + padding * 2,
    25
  );
  boardBackground.endFill();

  boardBackground.pivot.set(
    gridWidth / 2 + padding,
    gridHeight / 2 + padding
  );

  // 7. Располагаем интерфейс
  const panelObjects = [
    statusBackgroundramka,
    statusBackground,
    statusText,
  ];

  if (isLandscape) {
    const boardX = leftWidth + rightWidth / 2;
    const boardY = height / 2;
    const uiX = leftWidth / 2;

    boardContainer.position.set(boardX, boardY);
    boardBackground.position.set(boardX, boardY);

    // Центрируем весь левый столбец по вертикали
    let y = (height - fixedHeight) / 2;

    titleText.position.set(uiX, y + titleHeight / 2);
    y += titleHeight + layoutGap;

    const statusY = y + statusHeight / 2;

    for (const object of panelObjects) {
      object.position.set(uiX, statusY);
    }

    y += statusHeight + layoutGap;

    scoreContainer.position.set(uiX, y + scoreHeight / 2);
    y += scoreHeight + layoutGap;

    resetButton.position.set(uiX, y + buttonHeight / 2);

  } else {
    const uiX = width / 2;

    const totalHeight = fixedHeight + panelBoardSize;
    let y = (height - totalHeight) / 2;

    titleText.position.set(uiX, y + titleHeight / 2);
    y += titleHeight + layoutGap;

    const statusY = y + statusHeight / 2;

    for (const object of panelObjects) {
      object.position.set(uiX, statusY);
    }

    y += statusHeight + layoutGap;

    const boardY = y + panelBoardSize / 2;

    boardContainer.position.set(uiX, boardY);
    boardBackground.position.set(uiX, boardY);

    y += panelBoardSize + layoutGap;

    scoreContainer.position.set(uiX, y + scoreHeight / 2);
    y += scoreHeight + layoutGap;

    resetButton.position.set(uiX, y + buttonHeight / 2);
  }

  // 8. Возвращаем победные эффекты
  if (winningCombo !== null) {
    drawWinLine(winningCombo, false);
    highlightWinner(winningCombo, false);
  }

  // 9. Декоративный фон
  drawBackgroundDecor(width, height, isLandscape);
}

// 11. Подключение событий и запуск игры.
window.addEventListener('resize', resizeGame);
createGrid();
createResetButton();
resizeGame();
animateIntro();

window.resetGame = resetGame;
