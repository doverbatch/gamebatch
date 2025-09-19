const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const COLORS = [
  null,
  "cyan", "blue", "orange", "yellow", "green", "purple", "red"
];

const SHAPES = [
  [],
  [[1,1,1,1]],                      // I
  [[2,2],[2,2]],                    // O
  [[0,3,0],[3,3,3]],                // T
  [[0,4,4],[4,4,0]],                // S
  [[5,5,0],[0,5,5]],                // Z
  [[6,6,6],[0,6,0]],                // Plus
  [[7,7,7],[7,0,0]]                 // L
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

function drawBoard() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        ctx.fillStyle = COLORS[board[y][x]];
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

class Piece {
  constructor(shape, colorId) {
    this.shape = shape;
    this.colorId = colorId;
    this.x = Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
    this.y = 0;
  }

  draw() {
    this.shape.forEach((row, dy) => {
      row.forEach((val, dx) => {
        if (val) {
          ctx.fillStyle = COLORS[this.colorId];
          ctx.fillRect((this.x + dx) * BLOCK_SIZE, (this.y + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#111";
          ctx.strokeRect((this.x + dx) * BLOCK_SIZE, (this.y + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }

  move(dx, dy) {
    if (!this.collision(dx, dy, this.shape)) {
      this.x += dx;
      this.y += dy;
      return true;
    }
    return false;
  }

  collision(dx, dy, shape) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          let newX = this.x + x + dx;
          let newY = this.y + y + dy;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && board[newY][newX]) return true;
        }
      }
    }
    return false;
  }

  rotate() {
    const rotated = this.shape[0].map((_, i) => this.shape.map(row => row[i]).reverse());
    if (!this.collision(0, 0, rotated)) {
      this.shape = rotated;
    }
  }

  lock() {
    this.shape.forEach((row, dy) => {
      row.forEach((val, dx) => {
        if (val) {
          let newY = this.y + dy;
          let newX = this.x + dx;
          if (newY < 0) {
            gameOver = true;
          } else {
            board[newY][newX] = this.colorId;
          }
        }
      });
    });

    clearLines();
  }
}

function clearLines() {
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (!board[y][x]) continue outer;
    }
    board.splice(y, 1);
    board.unshift(Array(COLS).fill(0));
    y++;
  }
}

function randomPiece() {
  let id = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
  return new Piece(SHAPES[id], id);
}

let current = randomPiece();
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;
let gameOver = false;

function update(time = 0) {
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 4, canvas.height / 2);
    return;
  }

  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    if (!current.move(0, 1)) {
      current.lock();
      current = randomPiece();
      if (current.collision(0, 0, current.shape)) {
        gameOver = true;
      }
    }
    dropCounter = 0;
  }

  drawBoard();
  current.draw();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  if (e.key === "ArrowLeft") current.move(-1, 0);
  else if (e.key === "ArrowRight") current.move(1, 0);
  else if (e.key === "ArrowDown") current.move(0, 1);
  else if (e.key === "ArrowUp") current.rotate();
  else if (e.key === " ") {
    while (current.move(0, 1)) {}
    current.lock();
    current = randomPiece();
  }
});

update();
