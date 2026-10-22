// 1. Импорты и инициализация PixiJS.
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

const COLORS = {
  background: 0x101827,
  board: 0x1b2840,
  cell: 0x293851,
  x: 0xb9f34c,
  o: 0xbb9aff,
  win: 0xb9f34c,
  text: 0xffffff,
};

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

const board = Array(9).fill('');
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

// 3. Контейнеры и элементы интерфейса.
const titleStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fontWeight: 'bold',
  fill: COLORS.text,
  letterSpacing: 3,
});

const statusStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 22,
  fontWeight: 'bold',
  fill: COLORS.text,
});
const scoreStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 20,
  fontWeight: 'bold',
  fill: COLORS.text,
});
const boardBackground = new PIXI.Graphics();
const boardContainer = new PIXI.Container();
const resetButton = new PIXI.Graphics();
const buttonText = new PIXI.Text('Restart');
const scoreXText = new PIXI.Text('X: 0', scoreStyle);
const scoreDrawText = new PIXI.Text('DRAW: 0', scoreStyle);
const scoreOText = new PIXI.Text('O: 0', scoreStyle);
const titleText = new PIXI.Text('TIC TAC TOE', titleStyle);
titleText.anchor.x = 0.5;
titleText.y = 50;
titleText.x = window.innerWidth / 2;
app.stage.addChild(titleText);

const statusText = new PIXI.Text('TURN: X', statusStyle);
statusText.y = 80;
statusText.anchor.x = 0.5;
statusText.x = window.innerWidth / 2;
app.stage.addChild(statusText);
app.stage.addChild(boardBackground);
app.stage.addChild(boardContainer);

const scoreContainer = new PIXI.Container();

scoreContainer.addChild(scoreXText, scoreDrawText, scoreOText);

app.stage.addChild(scoreContainer);

// 4. Создание игрового поля и кнопок.
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

// 5. Ходы, проверка победы и ничьей, перезапуск.
function updateScore() {
  scoreXText.text = `X: ${scores.X}`;
  scoreDrawText.text = `DRAW: ${scores.draws}`;
  scoreOText.text = `O: ${scores.O}`;
}

function onCellClick() {
  const index = this.index;
  if (board[index] !== '' || gameOver === true) {
    return;
  }

  if (currentPlayer === 'X') {
    board[index] = 'X';
    console.log('нажал X');
    drawX(this);
  } else {
    board[index] = 'O';
    console.log('нажал O');
    drawO(this);
  }

  checkWinner();

  if (!gameOver) {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusText.text = `TURN: ${currentPlayer}`;
  }

  console.log(board);
  console.log('Кликнули по клетке номер:', this.index);
}

function checkWinner() {
  for (const combination of winningCombinations) {
    const [firstIndex, secondIndex, thirdIndex] = combination;
    if (
      board[firstIndex] &&
      board[firstIndex] === board[secondIndex] &&
      board[firstIndex] === board[thirdIndex]
    ) {
      console.log('есть победа');
      statusText.text = `PLAYER ${currentPlayer} WINS!`;
      gameOver = true;
      winningCombo = combination;
      scores[currentPlayer]++;
      const winnerScoreText = currentPlayer === 'X' ? scoreXText : scoreOText;

      animateScore(winnerScoreText);
      highlightWinner(combination);
      drawWinLine(combination);
      updateScore();

      return;
    }
  }

  if (board.every((cell) => cell !== '')) {
    console.log('Ничья! На поле больше нет свободных мест');
    statusText.text = 'DRAW!)';
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
  statusText.text = `TURN: ${currentPlayer}`;

  for (let index = 0; index < boardContainer.children.length; index++) {
    const cell = boardContainer.children[index];
    cell.tint = 0xffffff;
    clearCell(cell);
  }
}

// 6. Отрисовка и анимации X, O, победных рамок и линии.
function drawX(cell, animate = true) {
  const crossContainer = new PIXI.Container();
  const line1 = new PIXI.Graphics();
  const line2 = new PIXI.Graphics();
  const animation = { progress: 0 };
  const animation2 = { progress: 0 };

  const crossSize = cellSize * 0.7;
  const offset = (cellSize - crossSize) / 2;

  line1.lineStyle(5, COLORS.x);
  line1.moveTo(offset, offset);
  line2.lineStyle(5, COLORS.x);
  line2.moveTo(offset, crossSize + offset);
  crossContainer.addChild(line1, line2);
  cell.addChild(crossContainer);

  if (animate) {
      const timeline = gsap.timeline();
    timeline.to(animation, {
      progress: 1,
      duration: 0.4,
      ease: 'none',
      onUpdate: () => {
        line1.clear();
        line1.lineStyle(5, COLORS.x);
        line1.moveTo(offset, offset);
        line1.lineTo(
          crossSize * animation.progress + offset,
          crossSize * animation.progress + offset
        );
      },
    });

    timeline.to(animation2, {
      progress: 1,
      duration: 0.4,
      ease: 'none',
      onUpdate: () => {
        line2.clear();
        line2.lineStyle(5, COLORS.x);
        line2.moveTo(offset, crossSize + offset);
        line2.lineTo(
          offset + crossSize * animation2.progress,
          offset + crossSize * (1 - animation2.progress)
        );
      },
    }, '+=0.15');

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

  graphics.lineStyle(5, COLORS.o);
  cell.addChild(graphics);

  if (animate) {
    const tween = gsap.to(animation, {
      progress: 1,
      duration: 0.9,
      ease: 'none',
      onUpdate: () => {
        graphics.clear();
        graphics.lineStyle(5, COLORS.o);
        graphics.arc(center, center, circleDiameter / 2, 0, animation.progress * Math.PI * 2);
      },
    });
    activeAnimations.push(tween);
  } else {
    graphics.drawCircle(center, center, circleDiameter / 2);
  }
}

function highlightWinner(combination, animate = true) {
  for (const win of combination) {
    const winnerFrame = new PIXI.Graphics();
    const cell = boardContainer.children[win];
    winnerFrame.alpha = 1;
    winnerFrame.lineStyle(3, COLORS.win);
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

  console.log(combination);
}

function drawWinLine(combination, animate = true) {
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
        line.lineStyle(7, COLORS.win);
        line.moveTo(startX, startY);
        line.lineTo(
          startX + (endX - startX) * animation.progress,
          startY + (endY - startY) * animation.progress
        );
      },
    });
    activeAnimations.push(tween);
  } else {
    line.lineStyle(7, COLORS.win);
    line.moveTo(startX, startY);
    line.lineTo(endX, endY);
  }

  console.log('Начало:', startX, startY);
  console.log('Конец:', endX, endY);
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

// 7. Вспомогательные функции и управление GSAP-анимациями.
// Удаляем содержимое клетки одинаково при Restart и Resize.
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

// 8. Адаптивность и обработка изменения размера окна.
function resizeGame() {
  stopAnimations();

  clearWinLine();

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;

  const gap = 5;
  const padding = 15;
  const margin = 20;
  const leftWidth = width * 0.45;
  const rightWidth = width - leftWidth;

  const boardSize = isLandscape
    ? Math.min(
        rightWidth - margin * 2 - padding * 2,
        height - margin * 2 - padding * 2,
        450
      )
    : Math.min(
        width - margin * 2 - padding * 2,
        height - 300,
        450
      );
  cellSize = (boardSize - gap * 2) / 3;

  const gridWidth = 3 * cellSize + 2 * gap;
  const gridHeight = 3 * cellSize + 2 * gap;
  if (isLandscape) {
    // Игровое поле справа
    const boardX = leftWidth + rightWidth / 2;
    const boardY = height / 2;

    boardContainer.position.set(boardX, boardY);
    boardBackground.position.set(boardX, boardY);

    // Интерфейс слева
    const uiX = leftWidth / 2;

    titleText.position.set(uiX, height * 0.2);
    statusText.position.set(uiX, height * 0.35);

    scoreContainer.position.set(uiX, height * 0.55);
    resetButton.position.set(uiX, height * 0.78);
  } else {
    // Игровое поле по центру
    const boardX = width / 2;
    const boardY = height / 2;

    boardContainer.position.set(boardX, boardY);
    boardBackground.position.set(boardX, boardY);

    const boardTop = boardY - (gridHeight + padding * 2) / 2;
    const boardBottom = boardY + (gridHeight + padding * 2) / 2;

    titleText.position.set(width / 2, boardTop - 100);
    statusText.position.set(width / 2, boardTop - 55);

    scoreContainer.position.set(width / 2, boardBottom + 35);
    resetButton.position.set(width / 2, boardBottom + 115);
  }

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

    cell.x = column * (cellSize + gap);
    cell.y = row * (cellSize + gap);
  }

  boardContainer.pivot.x = gridWidth / 2;
  boardContainer.pivot.y = gridHeight / 2;

  boardBackground.clear();
  boardBackground.beginFill(COLORS.board);

  boardBackground.drawRoundedRect(
    0,
    0,
    gridWidth + padding * 2,
    gridHeight + padding * 2,
    25
  );
  boardBackground.pivot.set(gridWidth / 2 + padding, gridHeight / 2 + padding);
  boardBackground.endFill();

  if (winningCombo !== null) {
    drawWinLine(winningCombo, false);
    highlightWinner(winningCombo, false);
  }

  scoreXText.anchor.set(0.5);
  scoreDrawText.anchor.set(0.5);
  scoreOText.anchor.set(0.5);

  scoreXText.x = -100;
  scoreDrawText.x = 0;
  scoreOText.x = 100;
}

// 9. Инициализация и запуск игры.
window.addEventListener('resize', resizeGame);
createGrid();
createResetButton();
resizeGame();
animateIntro();
window.resetGame = resetGame;
