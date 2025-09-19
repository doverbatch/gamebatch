const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

canvas.width = COLS * BLOCK;
canvas.height = ROWS * BLOCK;

const COLORS = [null,"#FF0D72","#0DC2FF","#0DFF72","#F538FF","#FF8E0D","#FFE138","#3877FF"];
const SHAPES = [
  [],
  [[1,1,1],[0,1,0]],
  [[1,1,1,1]],
  [[0,1,1],[1,1,0]],
  [[1,1,0],[0,1,1]],
  [[1,1,1],[1,0,0]],
  [[1,1],[1,1]],
  [[1,1,1],[0,0,1]]
];

let grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
let piece = createPiece();
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameOver = false;
let score = 0;
let level = 1;
let started=false;

// audio
const audioElements = {
  bgm: document.getElementById("bgm"),
  drop: document.getElementById("drop"),
  lineclear: document.getElementById("lineclear")
};

// helper to play safely
function safePlay(audio){
  if(audio && audio.src){
    audio.play().catch(()=>{});
  }
}

function startGame(){
  if(!started){
    safePlay(audioElements.bgm);
    started=true;
  }
}

function createPiece(){
  const type = Math.floor(Math.random()*(SHAPES.length-1))+1;
  return {shape:SHAPES[type].map(r=>[...r]), pos:{x:Math.floor(COLS/2 - SHAPES[type][0].length/2), y:0}, color:type};
}

function collide(grid,p){
  for(let y=0;y<p.shape.length;y++)
    for(let x=0;x<p.shape[y].length;x++)
      if(p.shape[y][x] && 
         ((grid[y+p.pos.y] && grid[y+p.pos.y][x+p.pos.x])!==0 || x+p.pos.x<0 || x+p.pos.x>=COLS || y+p.pos.y>=ROWS))
        return true;
  return false;
}

function merge(grid,p){
  p.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v!==0)grid[y+p.pos.y][x+p.pos.x]=p.color;}));
}

function rotate(matrix){
  const N=matrix.length;
  const res=Array.from({length:N},()=>Array(N).fill(0));
  for(let y=0;y<N;y++) for(let x=0;x<N;x++) res[x][N-1-y]=matrix[y][x];
  return res;
}

function rotatePiece(){
  const old = piece.shape.map(r=>[...r]);
  piece.shape = rotate(piece.shape);
  if(piece.pos.x+piece.shape[0].length>COLS) piece.pos.x=COLS-piece.shape[0].length;
  if(piece.pos.x<0) piece.pos.x=0;
  if(collide(grid,piece)) piece.shape=old;
}

function sweep(){
  for(let y=ROWS-1;y>=0;y--){
    if(grid[y].every(v=>v!==0)){
      safePlay(audioElements.lineclear);
      grid.splice(y,1);
      grid.unshift(Array(COLS).fill(0));
      score += 10*level;
      level = 1+Math.floor(score/50);
      y++;
    }
  }
}

function drop(){
  piece.pos.y++;
  if(collide(grid,piece)){
    piece.pos.y--;
    merge(grid,piece);
    safePlay(audioElements.drop);
    sweep();
    piece = createPiece();
    if(collide(grid,piece)) gameOver=true;
  }
}

function drawMatrix(matrix,offset){
  matrix.forEach((row,y)=>row.forEach((v,x)=>{
    if(v!==0){
      ctx.fillStyle=COLORS[v];
      ctx.fillRect((x+offset.x)*BLOCK,(y+offset.y)*BLOCK,BLOCK,BLOCK);
      ctx.strokeStyle="#111";
      ctx.strokeRect((x+offset.x)*BLOCK,(y+offset.y)*BLOCK,BLOCK,BLOCK);
    }
  }));
}

function draw(){
  ctx.fillStyle="#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawMatrix(grid,{x:0,y:0});
  drawMatrix(piece.shape,piece.pos);
  ctx.fillStyle="#fff";
  ctx.font="20px Arial";
  ctx.fillText("Score: "+score,10,25);
  ctx.fillText("Level: "+level,10,50);
  if(gameOver){
    ctx.fillStyle="red";
    ctx.font="30px Arial";
    ctx.fillText("GAME OVER",canvas.width/2-80,canvas.height/2);
  }
}

function update(time=0){
  const delta=time-lastTime;
  lastTime=time;
  dropCounter+=delta;
  if(dropCounter>dropInterval/level && !gameOver) drop();
  draw();
  requestAnimationFrame(update);
}

// prevent scrolling
window.addEventListener("keydown",e=>{
  startGame();
  if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"].includes(e.key)) e.preventDefault();
  if(gameOver) return;
  if(e.key==="ArrowLeft"){ piece.pos.x--; if(collide(grid,piece)) piece.pos.x++; }
  if(e.key==="ArrowRight"){ piece.pos.x++; if(collide(grid,piece)) piece.pos.x--; }
  if(e.key==="ArrowDown"){ drop(); }
  if(e.key==="ArrowUp"){ rotatePiece(); }
});

update();
