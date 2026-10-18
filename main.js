import * as PIXI from 'pixi.js';

const app = new PIXI.Application({
   resizeTo: window,
    backgroundColor: 0x34dbeb
});

  document.body.appendChild(app.view);

window.addEventListener("resize", resizeGame);

let gameOver = false;
const combos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
const board = Array(9).fill("");
const myTextStyle = new PIXI.TextStyle({  
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: '#ffffff', // цвет текста
    stroke: '#ff0000', // цвет обводки
    strokeThickness: 5, // толщина обводки
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true, // разрешить перенос строк
    wordWrapWidth: 440, // ширина области для переноса
});
const cont = new PIXI.Container();

const text = new PIXI.Text("TIC TAC TOE", myTextStyle);
text.anchor.x = 0.5;
text.y = 50;
text.x = window.innerWidth / 2;
        app.stage.addChild(text);
let currentPlayer = "X";
        const textStatus = new PIXI.Text("move X", myTextStyle);
textStatus.y = 80;
textStatus.anchor.x = 0.5;
textStatus.x = (window.innerWidth) / 2;
        app.stage.addChild(textStatus);

app.stage.addChild(cont);

function createGrid(){
  
 for (let i = 0; i < 9; i++) {
  
    const cell = new PIXI.Graphics();
            cell.index = i;
        cell.eventMode = 'static';
        cell.cursor = 'pointer'; 
        cell.on('pointertap', onCellClick); 
        cont.addChild(cell);
        
    }

}

function createResBut(){
    const resetButton = new PIXI.Graphics();
        resetButton.eventMode = 'static';
        resetButton.cursor = 'pointer'; 
        
        resetButton.beginFill(0xffffff);
        resetButton.drawRect(0, 0, 50, 50);
        resetButton.endFill();
        resetButton.on('pointertap', resetGame); 

        app.stage.addChild(resetButton);
        

}

function resetGame (){
  gameOver = false;
  board.fill("");
  currentPlayer = "X"
    textStatus.text = `move ${currentPlayer}`;

  for (let i = 0; i < cont.children.length; i++) {
        const cell = cont.children[i];
    cell.removeChildren(); 

}
}

  function onCellClick (){
  
    const index = this.index;
    if (board[index] !=="" ||   gameOver === true) return;
    if (currentPlayer ==="X"){
    board[index] = "X";
        console.log("нажал X");
  drawX(this);
//textStatus.text = "move o";

       // currentPlayer = "O";
}

  else {
     board[index] = "O";
        console.log("нажал O");
        
  drawO(this);
//textStatus.text = "move x";

    //currentPlayer = "X";
  }
textStatus.text = `move ${currentPlayer}` ;
  checkWinner();
 currentPlayer === "X" ? currentPlayer = "O" : currentPlayer = "X"

  console.log(board);
      console.log("Кликнули по клетке номер:", this.index);

}

function checkWinner (){
  for (let combo of combos){
     const [a,b,c] = combo;
if (board[a] && board[a]=== board[b] && board[a] === board[c]) {
  console.log("есть победа");
  textStatus.text = `Победа ${currentPlayer}`;
  gameOver = true;
  return;
    }
  }
  if (board.every(cell => cell !== "")) {
  console.log("Ничья! На поле больше нет свободных мест");
    textStatus.text = "ничья ребята)";
      gameOver = true;

}
}

let sizeForDraw = 0;

function drawX(cell) {
      const graphics = new PIXI.Graphics();
    const crossSize  = sizeForDraw*0.7;
    const offset  = (sizeForDraw - crossSize ) / 2;
    
          graphics.lineStyle(5, 0xff0000);
graphics.moveTo(offset , offset );
graphics.lineTo(crossSize +offset , crossSize +offset );
graphics.moveTo(offset , crossSize +offset );
  graphics.lineTo(crossSize +offset , offset );
        cell.addChild(graphics);
}
function drawO(cell) {
      const graphics = new PIXI.Graphics();
    const center  = sizeForDraw/2;
    const crossSize  = sizeForDraw*0.7;
    
          graphics.lineStyle(5, 0x0c62b3);
          graphics.drawCircle(center, center, crossSize/2);
        cell.addChild(graphics);
}


function resizeGame() {
    
    const width = window.innerWidth;
    const height = window.innerHeight;
      text.x = window.innerWidth / 2;
     textStatus.x = (window.innerWidth) / 2;


    const availableWidth = Math.min(width, height);
    const gap = 5; 
    const fieldSize = Math.min((0.6 * availableWidth),450); 
    const size = (fieldSize - gap*2) /3;
      sizeForDraw = size;

  for (let i = 0; i < cont.children.length; i++) {
    const cell = cont.children[i];
    cell.clear();
    if (board[i] === "X"){
      cell.removeChildren()
      drawX(cell);
    }

    else if(board[i] === "O") {
      cell.removeChildren()
      drawO(cell);
    }
  
    const row = Math.floor(i / 3);
        const col = i % 3;

        cell.beginFill(0xffffff);
        cell.drawRect(0, 0, size, size);
        cell.endFill();
    
        cell.x = col * (size + gap);
        cell.y = row * (size + gap);     
}    
    
    const gridWidth = 3 * size + 2 * gap;
    const gridHeight = 3 * size + 2 * gap;

    
    cont.pivot.x = gridWidth / 2;
    cont.pivot.y = gridHeight / 2;

    cont.x = width / 2;
    cont.y = height / 2;

    console.log("Screen:", width, height,fieldSize);
} 
createGrid();
createResBut();
resizeGame();
window.resetGame = resetGame;

/*const text = new PIXI.Text({
    text: "",
    style:{
    fill: 0x000000,
    fontSize: 40
}})*/

/*square.x = posX;
   square.y = posY;
      square.beginFill(0x05a625);
      square.drawRect(0 , 0, size, size);
      square.endFill();*/


//  square.clear();
 //  cell.clear();








/*
let gameOver = false;
const restart =  document.querySelector("#q")
restart.addEventListener("click",() => {
    restartGame();
} )
const cells = [];

const combos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
const board = Array(9).fill("");
const cont = new PIXI.Container();
app.stage.addChild(cont);
let player = "X";
const size = 100;
const gap = 5; 
const startX = (app.screen.width - (size * 3 + gap * 2))  / 2 ;
const startY = (app.screen.height - (size * 3 + gap * 2))  / 2 ;

for (let i=0; i < 9; i++){
   const cell = new PIXI.Graphics()
     cell.beginFill(0xffffff)
     cell.drawRect(0, 0, size, size)
     cell.endFill();
   cell.index = i;

const row = Math.floor(i / 3);
const col = i % 3;

    cell.eventMode = 'static';
    cell.cursor = 'pointer';
    cell.x = startX + col * (size + gap);
    cell.y = startY + row * (size + gap);

    cont.addChild(cell);
   app.stage.addChild(cell);
  const text = new PIXI.Text({
    text: "",
    style:{
    fill: 0x000000,
    fontSize: 40
}
});
   text.anchor.set(0.5);
  text.x = size / 2;
  text.y = size / 2;

    cell.addChild(text);
      cell.textObj = text;

        cell.on('pointerdown', () => handleClick(cell));
    cont.addChild(cell);
   cells.push(cell);

}

function handleClick(cell){
  const index = cell.index;
  if (board[index] !=="" || gameOver) return;
  board[index] = player;
       // console.log("нажали на клетку", player);
  cell.textObj.text = player;

    if(player === "X") player = "O";
    else player = "X";
    checkWinner();
    
//console.log(combos);
console.log(board);
}

function checkWinner(){
  for(let combo of combos){
const [a,b,c] = combo;
if (board[a] && board[a]=== board[b] && board[a] === board[c]) {
  console.log("есть победа");
  gameOver = true;
  return;
  }
  }
}

  function restartGame() {
    board.fill("");
    cells.forEach(cell => {
      cell.textObj.text = "";
    });
    gameOver = false;
    player = "X";
}
*/
