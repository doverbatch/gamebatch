const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const COLORS = [
  null,
  "#FF0D72",
  "#0DC2FF",
  "#0DFF72",
  "#F538FF",
  "#FF8E0D",
  "#FFE138",
  "#3877FF"
];

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

let grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
let piece = createPiece();
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameOver = false;
let score = 0;
let level = 1;
let particles = [];

// Create new piece
function createPiece() {
  const typeId = (Math.random() * (SHAPES.length-1) +1)|0;
  return {shape: SHAPES[typeId].map(r => [...r]), pos: {x:(COLS/2|0)-(SHAPES[typeId][0].length/2|0), y:0}, color:typeId, angle:0};
}

// Collision detection
function collide(grid, piece) {
  for (let y=0;y<piece.shape.length;y++){
    for (let x=0;x<piece.shape[y].length;x++){
      if(piece.shape[y][x] && 
        (grid[y+piece.pos.y] && grid[y+piece.pos.y][x+piece.pos.x])!==0){
        return true;
      }
      if(piece.shape[y][x] && (piece.pos.x+x<0 || piece.pos.x+x>=COLS || piece.pos.y+y>=ROWS)){
        return true;
      }
    }
  }
  return false;
}

// Merge piece into grid
function merge(grid,piece){
  piece.shape.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value!==0) grid[y+piece.pos.y][x+piece.pos.x]=piece.color;
    });
  });
}

// Drop piece smoothly
function playerDrop() {
  piece.pos.y += 0.2; // smooth drop
  if (collide(grid, piece)) {
    piece.pos.y = Math.floor(piece.pos.y);
    merge(grid, piece);
    sweepRows();
    piece = createPiece();
    if (collide(grid, piece)) gameOver = true;
  }
  dropCounter=0;
}

// Sweep rows & generate particles
function sweepRows() {
  for(let y=ROWS-1;y>=0;y--){
    if(grid[y].every(v=>v!==0)){
      spawnParticles(y);
      grid.splice(y,1);
      grid.unshift(Array(COLS).fill(0));
      score += 10*level;
      level = 1 + Math.floor(score/50);
      y++;
    }
  }
}

// Particle effect
function spawnParticles(row) {
  for(let x=0;x<COLS;x++){
    if(grid[row][x]!==0) {
      particles.push({x:x*BLOCK_SIZE + BLOCK_SIZE/2, y:row*BLOCK_SIZE + BLOCK_SIZE/2, dx:(Math.random()-0.5)*2, dy:-Math.random()*2-1, life:20, color:COLORS[grid[row][x]]});
    }
  }
}

// Draw everything
function draw(){
  ctx.fillStyle="#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawMatrix(grid,{x:0,y:0});
  drawGhost();
  drawMatrix(piece.shape,piece.pos);
  drawParticles();
  drawScore();
}

// Draw grid/piece matrix
function drawMatrix(matrix,offset){
  matrix.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value!==0){
        ctx.fillStyle = COLORS[value];
        ctx.fillRect((x+offset.x)*BLOCK_SIZE,(y+offset.y)*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
        ctx.strokeStyle="#111";
        ctx.strokeRect((x+offset.x)*BLOCK_SIZE,(y+offset.y)*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
      }
    });
  });
}

// Draw ghost piece
function drawGhost() {
  let ghost = {...piece,pos:{x:piece.pos.x,y:Math.floor(piece.pos.y)}};
  while(!collide(grid,ghost)) ghost.pos.y+=1;
  ghost.pos.y--;
  ctx.globalAlpha=0.3;
  drawMatrix(ghost.shape,ghost.pos);
  ctx.globalAlpha=1;
}

// Draw particles
function drawParticles(){
  particles.forEach(p=>{
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x-2,p.y-2,4,4);
    p.x+=p.dx;
    p.y+=p.dy;
    p.life--;
  });
  particles = particles.filter(p=>p.life>0);
}

// Draw score
function drawScore(){
  ctx.fillStyle="#fff";
  ctx.font="20px Arial";
  ctx.fillText(`Score: ${score}`,10,25);
  ctx.fillText(`Level: ${level}`,10,50);
}

// Rotate piece visually
function rotatePiece(){
  piece.angle += 90;
  piece.angle%=360;
}

// Animation loop
function update(time=0){
  if(gameOver){
    ctx.fillStyle="red";
    ctx.font="30px Arial";
    ctx.fillText("GAME OVER",canvas.width/2-80,canvas.height/2);
    return;
  }
  const delta=time-lastTime;
  lastTime=time;
  dropCounter+=delta;
  if(dropCounter>dropInterval/level) playerDrop();
  draw();
  requestAnimationFrame(update);
}

// Prevent scrolling with arrows
window.addEventListener("keydown", e=>{
  if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"].includes(e.key)) e.preventDefault();
  if(gameOver) return;
  if(e.key==="ArrowLeft"){piece.pos.x--; if(collide(grid,piece)) piece.pos.x++;}
  else if(e.key==="ArrowRight"){piece.pos.x++; if(collide(grid,piece)) piece.pos.x--;}
  else if(e.key==="ArrowDown"){playerDrop();}
  else if(e.key==="ArrowUp"){rotatePiece();}
});

update();
