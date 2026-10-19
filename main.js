import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
// Приложение PixiJS.
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x34dbeb,
});

document.body.appendChild(app.view);

// Состояние игры и выигрышные комбинации.
let gameOver = false;
let animate = false;
let currentPlayer = 'X';
let cellSize = 0;



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
const resetButton = new PIXI.Graphics();
const buttonText = new PIXI.Text("Restart");

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
 /* console.log(
  "Размеры кнопки:",
  resetButton.width,
  resetButton.height,
  resetButton.pivot.x,
  resetButton.pivot.y
);*/
}

// Перезапуск, обработка ходов и проверка результата.
function resetGame() {
  animate = true;
  for (let animation of activeAnimations){
 animation.kill()
  animation++;
}
activeAnimations.length = 0;
  gameOver = false;
  board.fill('');
  currentPlayer = 'X';
  statusText.text = `move ${currentPlayer}`;

  for (let index = 0; index < boardContainer.children.length; index++) {
    const cell = boardContainer.children[index];
cell.removeChildren().forEach((child) => {
    child.destroy();
});  }
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
  //line1.lineTo(crossSize + offset, crossSize + offset);

   line2.lineStyle(5, 0xff0000);
  line2.moveTo(offset, crossSize + offset);
 // line2.lineTo(crossSize + offset, offset);
  crossContainer.addChild(line1,line2);
  cell.addChild(crossContainer);
  if (animate){
  const tween = timeline.to(animation, {
  progress: 1,
  duration: 0.4,
  ease: 'none',
  onUpdate: () => {
    // Здесь будем обновлять линию
    line1.clear();
      line1.lineStyle(5, 0xff0000);
  line1.moveTo(offset, offset);
  line1.lineTo(crossSize*animation.progress + offset, crossSize*animation.progress + offset);
  }
});

  const tween2 = timeline.to(animation2, {
  progress: 1,
  duration: 0.4,
  ease: 'none',
  onUpdate: () => {
    // Здесь будем обновлять линию
    line2.clear();
      line2.lineStyle(5, 0xff0000);
  line2.moveTo(offset, crossSize + offset);
  line2.lineTo(
    offset + crossSize * animation2.progress,
    offset + crossSize * (1 - animation2.progress)
);}
},'+=0.15');
activeAnimations.push(tween, tween2);
}
else{
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
  //graphics.arc(center, center, circleDiameter / 2, progress, 1 );
  cell.addChild(graphics);
  if(animate){
  const tween = gsap.to(animation, {
  progress: 1,
  duration: 0.9,
  ease: 'none',
  onUpdate: () => {
    // Здесь будем обновлять линию
    graphics.clear();
  graphics.lineStyle(5, 0x0c62b3);
  graphics.arc(center, center, circleDiameter / 2, 0, animation.progress* Math.PI * 2 );
  }
});
activeAnimations.push(tween);
 }
 else {
  graphics.drawCircle(center, center, circleDiameter / 2);

 }
}

// Перерисовка и размещение поля при изменении размеров окна.
function resizeGame() {
    animate = true;
for (let animation of activeAnimations){
 animation.kill()
}
activeAnimations.length = 0;

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
      cell.removeChildren().forEach((child) => {
      child.destroy();});
      drawX(cell, false);

    } else if (board[index] === 'O') {
      cell.removeChildren().forEach((child) => {
      child.destroy();});
      drawO(cell, false);
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

  resetButton.x = width / 2;
  resetButton.y = height * 0.85;

  console.log('SUCCESS!:', width, height, boardSize);
}

// Запуск игры и подключение обработчиков.
window.addEventListener('resize', resizeGame);
createGrid();
createResetButton();
resizeGame();

window.resetGame = resetGame;
