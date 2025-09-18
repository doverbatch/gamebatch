// BlockDrop.js - browser version of your Tetris-like game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Colors for each block type
const COLORS = [
  null,
  'cyan',
  'yellow',
  'purple',
  'green',
  'red',
  'blue',
  'orange'
];

// Create empty arena
function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

// Pieces (shapes)
function createPiece(type) {
  switch(type) {
    case 'T': return [
      [0,1,0],
      [1,1,1],
      [0,0,0]
    ];
    case 'O': return [
      [2,2],
      [2,2]
    ];
    case 'L': return [
      [0,0,3],
      [3,3,3],
      [0,0,0]
    ];
    case 'J': return [
      [4,0,0],
      [4,4,4],
      [0,0,0]
    ];
    case 'I': return [
      [0,0,0,0],
      [5,5,5,5],
      [0,0,0,0],
      [0,0,0,0]
    ];
    case 'S': return [
      [0,6,6],
      [6,6,0],
      [0,0,0]
    ];
    case 'Z': return [
      [7,7,0],
      [0,7,7],
      [0,0,0]
    ];
  }
}

// Draw the arena and the player piece
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

// Clear full rows
function arenaSweep() {
  outer: for (let y = arena.length -1; y >=0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
  }
}

// Collision detection
function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y =0; y<m.length; ++y) {
    for (let x =0; x<m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

// Merge piece into arena
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

// Player object
const player = {
  pos: {x:0, y:0},
  matrix: createPiece('T')
};

// Arena
const arena = createMatrix(COLS, ROWS);

// Player actions
function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
  }
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    playerReset();
  }
  dropCounter = 0;
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

// Rotate matrix
function rotate(matrix, dir) {
  for (let y=0; y<matrix.length; ++y) {
    for (let x=0; x<y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

// Draw everything
function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x:0, y:0});
  drawMatrix(player.matrix, player.pos);
}

// Game loop
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

// Controls
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'q') playerRotate(-1);
  else if (event.key === 'w') playerRotate(1);
});

// Start game
playerReset();
update();
