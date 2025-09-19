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
  [[1,1,1],[0,1,0]], [[1,1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]],
  [[1,1,1],[1,0,0]], [[1,1],[1,1]], [[1,1,1],[0,0,1]]
];

let grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
let piece = createPiece();
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameOver = false;
let score = 0;
let level = 1;

document.getElementById("bgm").play().catch(()=>{});

function createPiece() {
  const type = (Math.random() * (SHAPES.length-1) + 1)|0;
  return {shape: SHAPES[type].map(r=>[...r]), pos:{x:Math.floor(COLS/2- SHAPES[type][0].length/2), y:0}, color:type};
}

function collide(grid,p) {
  for(let y=0;y<p.shape.length;y++){
    for(let x=0;x<p.shape[y].length;x++){
      if(p.shape[y][x] &&
        ((grid[y+p.pos.y] && grid[y+p.pos.y][x+p.pos.x]) !==0 || x+p.pos.x<0 || x+p.pos.x>=COLS || y+p.pos.y>=ROWS)) {
        return true;
      }
    }
  }
  return false;
}

function merge(grid,p){
  p.shape.forEach((row,y)=>row.forEach((v,x)=>{ if(v!==0) grid[y+p.pos.y][x+p.pos.x]=p.color; }));
}

function playerDrop(){
  piece.pos.y += 1;
  if(collide(grid,piece)){
    piece.pos.y--;
    merge(grid,piece);
    document.getElementById("drop").play().catch(()=>{});
    sweepRows();
    piece = createPiece();
    if(collide(grid,piece)) gameOver=true;
  }
  dropCounter=0;
}

function sweepRows(){
  for(let y=ROWS-1;y>=0;y--){
    if(grid[y].every(v=>v!==0)){
      document.getElementById("lineclear").play().catch(()=>{});
      grid.splice(y,1);
      grid.unshift(Array(COLS).fill(0));
      score += 10*level;
      level = 1 + Math.floor(score/50);
      y++;
    }
  }
}

function draw(){
  ctx.fillStyle="#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawMatrix(grid,{x:0,y:0});
  drawMatrix(piece.shape,piece.pos);
  drawScore();
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

function drawScore(){
  ctx.fillStyle="#fff";
  ctx.font="20px Arial";
  ctx.fillText(`Score: ${score}`,10,25);
  ctx.fillText(`Level: ${level}`,10,50);
}

function rotateMatrix(matrix){
  const N = matrix.length;
  const result = Array.from({length:N},()=>Array(N).fill(0));
  for(let y=0;y<N;y++) for(let x=0;x<N;x++) result[x][N-1-y]=matrix[y][x];
  return result;
}

function rotatePiece(){
  const old = piece.shape.map(r=>[...r]);
  piece.shape = rotateMatrix(piece.shape);
  if(piece.pos.x + piece.shape[0].length>COLS) piece.pos.x=COLS-piece.shape[0].length;
  if(piece.pos.x<0) piece.pos.x=0;
  if(collide(grid,piece)) piece.shape=old;
}

function update(time=0){
  if(gameOver){
    ctx.fillStyle="red";
    ctx.font="30px Arial";
    ctx.fillText("GAME OVER",canvas.width/2-80,canvas.height/2);
    return;
  }
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if(dropCounter>dropInterval/level) playerDrop();
  draw();
  requestAnimationFrame(update);
}

// prevent scrolling
window.addEventListener("keydown",e=>{
  if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"].includes(e.key)) e.preventDefault();
  if(gameOver) return;
  if(e.key==="ArrowLeft"){ piece.pos.x--; if(collide(grid,piece)) piece.pos.x++; }
  else if(e.key==="ArrowRight"){ piece.pos.x++; if(collide(grid,piece)) piece.pos.x--; }
  else if(e.key==="ArrowDown"){ playerDrop(); }
  else if(e.key==="ArrowUp"){ rotatePiece(); }
});

update();
