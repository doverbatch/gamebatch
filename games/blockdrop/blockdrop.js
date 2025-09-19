// blockdrop.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const COLORS = [
  null,
  "#FF0D72", // T
  "#0DC2FF", // I
  "#0DFF72", // S
  "#F538FF", // Z
  "#FF8E0D", // L
  "#FFE138", // O
  "#3877FF"  // J
];

const SHAPES = [
  [],
  [[1,1,1],[0,1,0]],      // T
  [[1,1,1,1]],            // I
  [[0,1,1],[1,1,0]],      // S
  [[1,1,0],[0,1,1]],      // Z
  [[1,1,1],[1,0,0]],      // L
  [[1,1],[1,1]],          // O
  [[1,1,1],[0,0,1]]       // J
];

let grid = createMatrix(COLS, ROWS);
let piece = createPiece();
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameOver = false;
let score = 0;

// Create matrix
function createMatrix(w, h) {
  return Array.from({length: h}, () => Array(w).fill(0));
}

// Create a new piece
function createPiece() {
  const typeId = (Math.random() * (SHAPES.length-1) + 1) | 0;
  const shape = SHAPES[typeId].map(row => [...row]); // clone so rotation doesn’t change original
  return {
    pos: {x: (COLS/2 | 0) - (shape[0].length/2 | 0), y: 0},
    shape: shape,
    color: typeId,
    angle: 0
  };
}

// Detect collision
function collide(grid, piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] !== 0) {
        const gx = x + piece.pos.x;
        const gy = y + piece.pos.y;
        if (grid[gy] && grid[gy][gx] !== 0) return true;
        if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
      }
    }
  }
  return false;
}

// Merge piece into grid
function merge(grid, piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        grid[y + piece.pos.y][x + piece.pos.x] = piece.color;
      }
    });
  });
}

// Drop piece
function playerDrop() {
  piece.pos.y++;
  if (collide(grid, piece)) {
    piece.pos.y--;
    merge(grid, piece);
    sweepRows();
    piece = createPiece();
    if (collide(grid, piece)) {
      gameOver = true;
    }
  }
  dropCounter = 0;
}

// Clear rows and add score
function sweepRows() {
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x] === 0) continue outer;
    }
    const row = grid.splice(y,1)[0].fill(0);
    grid.unshift(row);
    y++;
    score += 10;
    flashRow(y); // animation
  }
}

// Flash animation for cleared row
function flashRow(y) {
  let flashCount = 0;
  const interval = setInterval(() => {
    for (let x = 0; x < COLS; x++) {
      grid[y][x] = flashCount % 2 === 0 ? 0 : 8; // 8 = white flash
    }
    flashCount++;
    if (flashCount > 3) clearInterval(interval);
  }, 100);
}

// Draw
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = value === 8 ? "#fff" : COLORS[value];
        ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "#111";
        ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

// Draw ghost piece
function drawGhost() {
  let ghost = {...piece, pos:{x: piece.pos.x, y: piece.pos.y}};
  while (!collide(grid, ghost)) ghost.pos.y++;
  ghost.pos.y--;
  ctx.globalAlpha = 0.3;
  drawMatrix(ghost.shape, ghost.pos);
  ctx.globalAlpha = 1;
}

// Draw everything
function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawMatrix(grid, {x:0,y:0});
  drawGhost();
  drawMatrix(piece.shape, piece.pos);
  drawScore();
}

// Draw score
function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);
}

// Rotate piece visually (doesn’t change shape)
function rotatePiece() {
  piece.angle += 90;
  piece.angle %= 360;
}

// Animation loop
function update(time = 0) {
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("GAME OVER", canvas.width/2 - 80, canvas.height/2);
    return;
  }
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) playerDrop();
  draw();
  requestAnimationFrame(update);
}

// Prevent arrow keys from scrolling
window.addEventListener("keydown", e => {
  if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"].includes(e.key)) e.preventDefault();
  if (gameOver) return;

  if (e.key === "ArrowLeft") {
    piece.pos.x--;
    if (collide(grid,piece)) piece.pos.x++;
  }
  else if (e.key === "ArrowRight") {
    piece.pos.x++;
    if (collide(grid,piece)) piece.pos.x--;
  }
  else if (e.key === "ArrowDown") {
    playerDrop();
  }
  else if (e.key === "ArrowUp") {
    rotatePiece();
  }
});

update();
