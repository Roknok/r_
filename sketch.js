let SIZE = 4;
let board = [];
let tileSize = 120;
let spacing = 8;
let img;

let canvasSize;
let emptyIndex;
let moves = 0;

let movesP, titleP;
let uiHeight = 0;

let tiles = [];
let animationSpeed = 0.5;

let boardPadding = 20;  // <-- NEW PADDING


// ------------------------------------------------------------
// TILE CLASS
// ------------------------------------------------------------
class Tile {
  constructor(val, r, c) {
    this.value = val;
    this.targetR = r;
    this.targetC = c;

    this.currentX = this.getScreenX(c);
    this.currentY = this.getScreenY(r);
  }

  getScreenX(c) {
    return boardPadding + c * (tileSize + spacing);
  }

  getScreenY(r) {
    return boardPadding + r * (tileSize + spacing);
  }

  updatePosition(r, c) {
    this.targetR = r;
    this.targetC = c;
  }

  isMoving() {
    return (
      this.currentX !== this.getScreenX(this.targetC) ||
      this.currentY !== this.getScreenY(this.targetR)
    );
  }

  animate() {
    let targetX = this.getScreenX(this.targetC);
    let targetY = this.getScreenY(this.targetR);

    let dx = targetX - this.currentX;
    let dy = targetY - this.currentY;

    let distRemaining = dist(this.currentX, this.currentY, targetX, targetY);
    let step = min(animationSpeed * (tileSize + spacing), distRemaining);

    if (distRemaining > 0) {
      this.currentX += (dx / distRemaining) * step;
      this.currentY += (dy / distRemaining) * step;
    }

    if (dist(this.currentX, this.currentY, targetX, targetY) < 1) {
      this.currentX = targetX;
      this.currentY = targetY;
    }
  }

  draw() {
    this.animate();

    let val = this.value;

    let sx = ((val - 1) % SIZE) * (img.width / SIZE);
    let sy = floor((val - 1) / SIZE) * (img.height / SIZE);

    image(
      img,
      this.currentX,
      this.currentY,
      tileSize,
      tileSize,
      sx,
      sy,
      img.width / SIZE,
      img.height / SIZE
    );

    fill(0, 100);
    rect(this.currentX, this.currentY, tileSize, tileSize);

    fill(255);
    textSize(tileSize / 3);
    textAlign(CENTER, CENTER);
    text(val, this.currentX + tileSize / 2, this.currentY + tileSize / 2);
  }
}


// ------------------------------------------------------------
// SETUP
// ------------------------------------------------------------
function preload() {
  img = loadImage("image.jpg");
}

function setup() {
  // Create UI first
  titleP = createP("15 Puzzle Game")
    .parent("gameContainer")
    .style("font-size", "26px")
    .style("font-weight", "bold")
    .style("margin", "10px")
    .style("text-align", "center");

  movesP = createP("Moves: 0")
    .parent("gameContainer")
    .style("font-size", "18px")
    .style("margin", "5px")
    .style("text-align", "center");

  calculateUIHeight();
  autoScale();

  let cnv = createCanvas(canvasSize, canvasSize);
  cnv.parent("gameContainer");

  initBoard();
  scrambleBoard();
}


// ------------------------------------------------------------
// UI HEIGHT MEASUREMENT
// ------------------------------------------------------------
function calculateUIHeight() {
  uiHeight = titleP.elt.offsetHeight + movesP.elt.offsetHeight;
}


// ------------------------------------------------------------
// AUTO SCALE BASED ON MINIMUM SIDE
// ------------------------------------------------------------
function autoScale() {
  let usableHeight = windowHeight - uiHeight - boardPadding * 2;
  let usableWidth = windowWidth - boardPadding * 2;

  let smallerSide = min(usableWidth, usableHeight);

  tileSize = floor((smallerSide - (SIZE - 1) * spacing) / SIZE);

  canvasSize =
    boardPadding * 2 +
    SIZE * tileSize +
    (SIZE - 1) * spacing;
}

// ------------------------------------------------------------
function windowResized() {
  calculateUIHeight();
  autoScale();
  resizeCanvas(canvasSize, canvasSize);

  for (let tile of tiles) {
    let idx = board.indexOf(tile.value);
    let r = floor(idx / SIZE);
    let c = idx % SIZE;

    tile.currentX = tile.getScreenX(c);
    tile.currentY = tile.getScreenY(r);
    tile.updatePosition(r, c);
  }
}


// ------------------------------------------------------------
// BOARD LOGIC
// ------------------------------------------------------------
function initBoard() {
  board = [];
  for (let i = 1; i <= SIZE * SIZE - 1; i++) board.push(i);
  board.push(0);

  emptyIndex = board.indexOf(0);
  moves = 0;
  movesP.html("Moves: 0");
}

function createTiles() {
  tiles = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      let idx = r * SIZE + c;
      let val = board[idx];
      if (val !== 0) tiles.push(new Tile(val, r, c));
    }
  }
}

function draw() {
  background(100, 150, 200);
  drawBoard();
}

function drawBoard() {
  for (let t of tiles) t.draw();
}

function mousePressed() {
  if (tiles.some(t => t.isMoving())) return;

  let mx = mouseX - boardPadding;
  let my = mouseY - boardPadding;

  if (mx < 0 || my < 0 || mx > canvasSize || my > canvasSize) return;

  let c = floor(mx / (tileSize + spacing));
  let r = floor(my / (tileSize + spacing));

  tryMove(r * SIZE + c);
}

function tryMove(idx) {
  let r = floor(idx / SIZE);
  let c = idx % SIZE;

  let er = floor(emptyIndex / SIZE);
  let ec = emptyIndex % SIZE;

  if (abs(r - er) + abs(c - ec) === 1) {
    let movingVal = board[idx];

    [board[emptyIndex], board[idx]] = [board[idx], board[emptyIndex]];

    let movingTile = tiles.find(t => t.value === movingVal);
    if (movingTile) movingTile.updatePosition(er, ec);

    emptyIndex = idx;

    moves++;
    movesP.html("Moves: " + moves);
  }
}


// ------------------------------------------------------------
// SCRAMBLE
// ------------------------------------------------------------
function scrambleBoard() {
  initBoard();
  createTiles();

  let lastEmptyIndex = -1;

  for (let i = 0; i < 50; i++) {
    let er = floor(emptyIndex / SIZE);
    let ec = emptyIndex % SIZE;

    let options = [];

    let dirs = [
      [er - 1, ec],
      [er + 1, ec],
      [er, ec - 1],
      [er, ec + 1],
    ];

    for (let [nr, nc] of dirs) {
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        let idx = nr * SIZE + nc;
        if (idx !== lastEmptyIndex) options.push(idx);
      }
    }

    if (options.length === 0) break;

    let target = random(options);

    [board[emptyIndex], board[target]] = [board[target], board[emptyIndex]];

    lastEmptyIndex = emptyIndex;
    emptyIndex = target;
  }

  for (let tile of tiles) {
    let idx = board.indexOf(tile.value);
    let r = floor(idx / SIZE);
    let c = idx % SIZE;

    tile.updatePosition(r, c);
    tile.currentX = tile.getScreenX(c);
    tile.currentY = tile.getScreenY(r);
  }

  moves = 0;
  movesP.html("Moves: 0");
}
