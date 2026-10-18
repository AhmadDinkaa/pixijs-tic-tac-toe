import * as PIXI from 'pixi.js';

// Приложение PixiJS.
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x34dbeb,
});

document.body.appendChild(app.view);

// Состояние игры и выигрышные комбинации.
let gameOver = false;
let currentPlayer = 'X';
let cellSize = 0;

const board = Array(9).fill('');
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

// Тексты и контейнер игрового поля.
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

// Создание клеток и кнопки перезапуска.
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
  const resetButton = new PIXI.Graphics();
  resetButton.eventMode = 'static';
  resetButton.cursor = 'pointer';

  resetButton.beginFill(0xffffff);
  resetButton.drawRect(0, 0, 50, 50);
  resetButton.endFill();
  resetButton.on('pointertap', resetGame);

  app.stage.addChild(resetButton);
}

// Перезапуск, обработка ходов и проверка результата.
function resetGame() {
  gameOver = false;
  board.fill('');
  currentPlayer = 'X';
  statusText.text = `move ${currentPlayer}`;

  for (let index = 0; index < boardContainer.children.length; index++) {
    const cell = boardContainer.children[index];
    cell.removeChildren();
  }
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
      return;
    }
  }

  if (board.every((cell) => cell !== '')) {
    console.log('Ничья! На поле больше нет свободных мест');
    statusText.text = 'ничья ребята)';
    gameOver = true;
  }
}

// Отрисовка крестика и нолика внутри клетки.
function drawX(cell) {
  const graphics = new PIXI.Graphics();
  const crossSize = cellSize * 0.7;
  const offset = (cellSize - crossSize) / 2;

  graphics.lineStyle(5, 0xff0000);
  graphics.moveTo(offset, offset);
  graphics.lineTo(crossSize + offset, crossSize + offset);
  graphics.moveTo(offset, crossSize + offset);
  graphics.lineTo(crossSize + offset, offset);
  cell.addChild(graphics);
}

function drawO(cell) {
  const graphics = new PIXI.Graphics();
  const center = cellSize / 2;
  const circleDiameter = cellSize * 0.7;

  graphics.lineStyle(5, 0x0c62b3);
  graphics.drawCircle(center, center, circleDiameter / 2);
  cell.addChild(graphics);
}

// Перерисовка и размещение поля при изменении размеров окна.
function resizeGame() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  titleText.x = width / 2;
  statusText.x = width / 2;

  const availableSize = Math.min(width, height);
  const gap = 5;
  const boardSize = Math.min(0.6 * availableSize, 450);
  cellSize = (boardSize - gap * 2) / 3;

  for (let index = 0; index < boardContainer.children.length; index++) {
    const cell = boardContainer.children[index];
    cell.clear();

    if (board[index] === 'X') {
      cell.removeChildren();
      drawX(cell);
    } else if (board[index] === 'O') {
      cell.removeChildren();
      drawO(cell);
    }

    const row = Math.floor(index / 3);
    const column = index % 3;

    cell.beginFill(0xffffff);
    cell.drawRect(0, 0, cellSize, cellSize);
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

  console.log('Screen:', width, height, boardSize);
}

// Запуск игры и подключение обработчиков.
window.addEventListener('resize', resizeGame);
createGrid();
createResetButton();
resizeGame();
window.resetGame = resetGame;
