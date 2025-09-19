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

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece() {
  const typeId = (Math.random() * (SHAPES.length-1) + 1) | 0;
  const shape = SHAPES[typeId];
  return {
    pos: {x: (COLS/2 | 0) - (shape[0].length/2 | 0), y: 0},
    shape: shape,
    color: typeId
  };
}

function collide(grid, piece) {
  for (let y = 0; y < piece.shape.length; ++y) {
    for (let x = 0; x < piece.shape[y].length; ++x) {
      if (piece.shape[y][x] !== 0 &&
         (grid[y + piece.pos.y] &&
          grid[y + piece.pos.y][x + piece.pos.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(grid, piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        grid[y + piece.pos.y][x + piece.pos.x] = piece.color;
      }
    });
  });
}

function playerDrop() {
  piece.pos.y++;
  if (collide(grid, piece)) {
    piece.pos.y--;
    merge(grid, piece);
    piece = createPiece();
    if (collide(grid, piece)) {
      gameOver = true;
    }
    sweepRows();
  }
  dropCounter = 0;
}

function sweepRows() {
  outer: for (let y = ROWS - 1; y >= 0; --y) {
    for (let x = 0; x < COLS; ++x) {
      if (grid[y][x] === 0) {
        continue outer;
      }
    }
    const row = grid.splice(y, 1)[0].fill(0);
    grid.unshift(row);
    y++;
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "#111";
        ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(grid, {x:0, y:0});
  drawMatrix(piece.shape, piece.pos);
}

function update(time = 0) {
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width/2 - 70, canvas.height/2);
    return;
  }
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
  if (gameOver) return;
  if (e.key === "ArrowLeft") {
    piece.pos.x--;
    if (collide(grid, piece)) piece.pos.x++;
  } else if (e.key === "ArrowRight") {
    piece.pos.x++;
    if (collide(grid, piece)) piece.pos.x--;
  } else if (e.key === "ArrowDown") {
    playerDrop();
  } else if (e.key === "ArrowUp") {
    rotate(piece);
    if (collide(grid, piece)) {
      // undo rotation if invalid
      for (let i = 0; i < 3; i++) rotate(piece);
    }
  }
});

function rotate(piece) {
  const m = piece.shape;
  const N = m.length;
  const result = [];
  for (let y = 0; y < N; y++) {
    result[y] = [];
    for (let x = 0; x < N; x++) {
      result[y][x] = m[N - x - 1][y];
    }
  }
  piece.shape = result;
}

update();
