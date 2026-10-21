import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

// 1. Импорты и инициализация PixiJS.
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x34dbeb,
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

// 3. Контейнеры и элементы интерфейса.
const textStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fontStyle: 'italic',
  fontWeight: 'bold',
  fill: '#ffffff',
  stroke: '#ff0000',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 6,
  wordWrap: true,
  wordWrapWidth: 440,
});

const boardContainer = new PIXI.Container();
const resetButton = new PIXI.Graphics();
const buttonText = new PIXI.Text('Restart');

const titleText = new PIXI.Text('TIC TAC TOE', textStyle);
titleText.anchor.x = 0.5;
titleText.y = 50;
titleText.x = window.innerWidth / 2;
app.stage.addChild(titleText);

const statusText = new PIXI.Text('move X', textStyle);
statusText.y = 80;
statusText.anchor.x = 0.5;
statusText.x = window.innerWidth / 2;
app.stage.addChild(statusText);

app.stage.addChild(boardContainer);

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
  resetButton.beginFill(0xffffff);
  resetButton.drawRoundedRect(0, 0, 140, 60, 10);
  resetButton.pivot.x = resetButton.width / 2;
  resetButton.pivot.y = resetButton.height / 2;
  resetButton.endFill();
  resetButton.on('pointertap', resetGame);

  buttonText.anchor.set(0.5);
  buttonText.x = resetButton.width / 2;
  buttonText.y = resetButton.height / 2;
  resetButton.addChild(buttonText);
  app.stage.addChild(resetButton);
}

// 5. Ходы, проверка победы и ничьей, перезапуск.
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
    statusText.text = `move ${currentPlayer}`;
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
      statusText.text = `Победа ${currentPlayer}`;
      gameOver = true;
      winningCombo = combination;
      highlightWinner(combination);
      drawWinLine(combination);
      return;
    }
  }

  if (board.every((cell) => cell !== '')) {
    console.log('Ничья! На поле больше нет свободных мест');
    statusText.text = 'ничья ребята)';
    gameOver = true;
  }
}

function resetGame() {
  winningCombo = null;
  if (winLine !== null) {
    boardContainer.removeChild(winLine);
    winLine.destroy();
    winLine = null;
  }

  stopAnimations();

  gameOver = false;
  board.fill('');
  currentPlayer = 'X';
  statusText.text = `move ${currentPlayer}`;

  for (let index = 0; index < boardContainer.children.length; index++) {
    const cell = boardContainer.children[index];
    cell.tint = 0xffffff;
    cell.removeChildren().forEach((child) => {
      child.destroy();
    });
  }
}

// 6. Отрисовка и анимации X, O, победных рамок и линии.
function drawX(cell, animate = true) {
  const crossContainer = new PIXI.Container();
  const line1 = new PIXI.Graphics();
  const line2 = new PIXI.Graphics();
  const animation = { progress: 0 };
  const animation2 = { progress: 0 };
  const timeline = gsap.timeline();

  const crossSize = cellSize * 0.7;
  const offset = (cellSize - crossSize) / 2;

  line1.lineStyle(5, 0xff0000);
  line1.moveTo(offset, offset);
  line2.lineStyle(5, 0xff0000);
  line2.moveTo(offset, crossSize + offset);
  crossContainer.addChild(line1, line2);
  cell.addChild(crossContainer);

  if (animate) {
    timeline.to(animation, {
      progress: 1,
      duration: 0.4,
      ease: 'none',
      onUpdate: () => {
        line1.clear();
        line1.lineStyle(5, 0xff0000);
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
        line2.lineStyle(5, 0xff0000);
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

  graphics.lineStyle(5, 0x0c62b3);
  cell.addChild(graphics);

  if (animate) {
    const tween = gsap.to(animation, {
      progress: 1,
      duration: 0.9,
      ease: 'none',
      onUpdate: () => {
        graphics.clear();
        graphics.lineStyle(5, 0x0c62b3);
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
    const ramka = new PIXI.Graphics();
    const cell = boardContainer.children[win];
    ramka.alpha = 1;
    ramka.lineStyle(3, 0x00ff00);
    ramka.drawRoundedRect(0, 0, cellSize, cellSize, 10);
    cell.addChild(ramka);

    if (animate) {
      ramka.alpha = 0;
      const tween = gsap.to(ramka, {
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
        line.lineStyle(7, 0x0fff00);
        line.moveTo(startX, startY);
        line.lineTo(
          startX + (endX - startX) * animation.progress,
          startY + (endY - startY) * animation.progress
        );
      },
    });
    activeAnimations.push(tween);
  } else {
    line.lineStyle(7, 0x0fff00);
    line.moveTo(startX, startY);
    line.lineTo(endX, endY);
  }

  console.log('Начало:', startX, startY);
  console.log('Конец:', endX, endY);
}

// 7. Вспомогательные функции и управление GSAP-анимациями.
function stopAnimations() {
  for (let animation of activeAnimations) {
    animation.kill();
  }
  activeAnimations.length = 0;
}

// 8. Адаптивность и обработка изменения размера окна.
function resizeGame() {
  stopAnimations();

  if (winLine !== null) {
    boardContainer.removeChild(winLine);
    winLine.destroy();
    winLine = null;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  titleText.x = width / 2;
  statusText.x = width / 2;

  const availableSize = Math.min(width, height);
  const gap = 5;
  const boardSize = Math.min(0.6 * availableSize, 450);
  cellSize = (boardSize - gap * 2) / 3;

  for (let index = 0; index < 9; index++) {
    const cell = boardContainer.children[index];
    cell.clear();

    if (board[index] === 'X') {
      cell.removeChildren().forEach((child) => {
        child.destroy();
      });
      drawX(cell, false);
    } else if (board[index] === 'O') {
      cell.removeChildren().forEach((child) => {
        child.destroy();
      });
      drawO(cell, false);
    }

    const row = Math.floor(index / 3);
    const column = index % 3;

    cell.beginFill(0xffffff);
    cell.drawRoundedRect(0, 0, cellSize, cellSize, 10);
    cell.endFill();

    cell.x = column * (cellSize + gap);
    cell.y = row * (cellSize + gap);
  }

  const gridWidth = 3 * cellSize + 2 * gap;
  const gridHeight = 3 * cellSize + 2 * gap;

  boardContainer.pivot.x = gridWidth / 2;
  boardContainer.pivot.y = gridHeight / 2;
  boardContainer.x = width / 2;
  boardContainer.y = height / 2;

  resetButton.x = width / 2;
  resetButton.y = height * 0.85;

  if (winningCombo !== null) {
    drawWinLine(winningCombo, false);
    highlightWinner(winningCombo, false);
  }

  console.log('SUCCESS!:', width, height, boardSize);
}

// 9. Инициализация и запуск игры.
window.addEventListener('resize', resizeGame);
createGrid();
createResetButton();
resizeGame();

window.resetGame = resetGame;
