let SIZE = 4;
let board = [];
let tileSize = 120;
let spacing = 8;
let img;

let canvasSize;
let emptyIndex;
let moves = 0;

let movesP;

// New global array to hold animated tile objects
let tiles = [];
// INCREASED AND CHANGED to be the step size per frame for linear movement
let animationSpeed = 0.5;

// --- Tile Class for Animation Management ---
class Tile {
  constructor(val, r, c) {
    this.value = val;
    this.targetR = r; // Target row index
    this.targetC = c; // Target column index
    // Current drawing position (used for animation)
    this.currentX = this.getScreenX(c);
    this.currentY = this.getScreenY(r);
  }

  getScreenX(c) {
    return c * (tileSize + spacing);
  }

  getScreenY(r) {
    return r * (tileSize + spacing);
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

    // --- CHANGE FOR LINEAR MOVEMENT ---

    let dx = targetX - this.currentX;
    let dy = targetY - this.currentY;

    // Calculate the distance remaining
    let distRemaining = dist(this.currentX, this.currentY, targetX, targetY);

    // Determine the step size, which is the speed, but cap it at the remaining distance
    let step = min(animationSpeed * (tileSize + spacing), distRemaining);

    if (distRemaining > 0) {
      // Move in the direction of the target by the step size
      this.currentX += (dx / distRemaining) * step;
      this.currentY += (dy / distRemaining) * step;
    }

    // Snap to target if very close (handles floating point inaccuracy)
    if (dist(this.currentX, this.currentY, targetX, targetY) < 1) {
      this.currentX = targetX;
      this.currentY = targetY;
    }

    // --- END CHANGE ---
  }

  draw() {
    push();
    translate(spacing, spacing); // Apply the board-level translation

    this.animate();

    // Draw the tile background (no longer needed based on previous requests, but kept original structure)
    fill(200);
    noStroke();
    // Replaced rect with image/overlay drawing for the tile's visual representation

    // Draw the image slice
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

    // Draw the number overlay
    fill(0, 100);
    rect(this.currentX, this.currentY, tileSize, tileSize);

    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(
      val,
      this.currentX + tileSize / 2,
      this.currentY + tileSize / 2
    );

    pop();
  }
}

// --- P5.js Standard Functions ---

function preload() {
  img = loadImage("image.jpg");
}

function setup() {
  createP("15 Puzzle Game")
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

  canvasSize = SIZE * tileSize + (SIZE + 1) * spacing;

  let cnv = createCanvas(canvasSize, canvasSize);
  cnv.parent("gameContainer");

  initBoard();
  // Changed to call the new scrambleBoard function
  scrambleBoard(); 
}

function initBoard() {
  board = [];
  // Sets up the solved state: 1, 2, 3, ..., 15, 0
  for (let i = 1; i <= SIZE * SIZE - 1; i++) board.push(i);
  board.push(0);
  emptyIndex = board.indexOf(0);
  moves = 0;
  movesP.html("Moves: " + moves);
}

function createTiles() {
    tiles = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            let idx = r * SIZE + c;
            let val = board[idx];
            if (val !== 0) {
                // The Tile constructor will set its initial currentX/Y based on r and c
                tiles.push(new Tile(val, r, c));
            }
        }
    }
}

function draw() {
  background(100, 150, 200);
  drawBoard();
}

function drawBoard() {
  // Draw all non-empty tiles
  for (let tile of tiles) {
    tile.draw();
  }

  // Draw the empty space background
  let er = floor(emptyIndex / SIZE);
  let ec = emptyIndex % SIZE;
  push();
  translate(spacing, spacing);
  fill(150, 200, 250); // Lighter color for the empty slot
  noStroke();
  // Drawing a simple rectangle for the empty slot's background
  // rect(
  //    ec * (tileSize + spacing),
  //    er * (tileSize + spacing),
  //    tileSize,
  //    tileSize
  // );
  pop();

  // If the board is solved, you could add a 'solved' message here
  if (isSolved() && !tiles.some(t => t.isMoving())) {
      // Remove the number overlay on the last frame
      push();
      translate(spacing, spacing);
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          let idx = r * SIZE + c;
          let val = board[idx];
          if (val !== 0) {
            let tile = tiles.find(t => t.value === val);

            // Redraw the image without the number overlay
            let sx = ((val - 1) % SIZE) * (img.width / SIZE);
            let sy = floor((val - 1) / SIZE) * (img.height / SIZE);
            image(
              img,
              tile.currentX,
              tile.currentY,
              tileSize,
              tileSize,
              sx, sy,
              img.width / SIZE,
              img.height / SIZE
            );
          }
        }
      }
      pop();

      // Optional: Add a victory message
      fill(255, 0, 0);
      textSize(64);
      textAlign(CENTER, CENTER);
      text("Solved!", canvasSize / 2, canvasSize / 2);
  }
}

function mousePressed() {
  // Prevent moves while a tile is animating
  if (tiles.some(t => t.isMoving())) return;

  let mx = mouseX - spacing;
  let my = mouseY - spacing;
  if (mx < 0 || my < 0 || mx > canvasSize - spacing || my > canvasSize - spacing) return;

  let c = floor(mx / (tileSize + spacing));
  let r = floor(my / (tileSize + spacing));

  tryMove(r * SIZE + c);
}

// Updated tryMove to trigger an animated move
function tryMove(idx) {
  let r = floor(idx / SIZE), c = idx % SIZE;
  let er = floor(emptyIndex / SIZE), ec = emptyIndex % SIZE;

  if (abs(r - er) + abs(c - ec) === 1) {
    let movingVal = board[idx];

    // 1. Update the board array (instant swap for logic)
    [board[emptyIndex], board[idx]] = [board[idx], board[emptyIndex]];

    // 2. Find the Tile object and update its target position
    let movingTile = tiles.find(t => t.value === movingVal);
    if (movingTile) {
      // The tile's new target is the *old* empty slot position
      movingTile.updatePosition(er, ec);
    }

    // 3. Update the empty index
    emptyIndex = idx;
    moves++;
    movesP.html("Moves: " + moves);
  }
}

/**
 * --- MODIFIED SCRAMBLE FUNCTION ---
 * Scrambles the board by making 50 random, non-reversing, valid moves.
 */
function scrambleBoard() {
    // 1. Initialize to solved state (which initBoard does)
    initBoard();
    
    // 2. Create the tile objects for the solved state
    createTiles(); 
    
    let lastEmptyIndex = -1; // Track the previous empty index to prevent reversing the last move
    
    for (let i = 0; i < 50; i++) {
        let er = floor(emptyIndex / SIZE);
        let ec = emptyIndex % SIZE;
        
        // Find all valid neighbors (indices) to move into the empty slot
        let validMoves = [];

        // Check Up (row - 1)
        let neighborR = er - 1;
        let neighborC = ec;
        if (neighborR >= 0) {
            let idx = neighborR * SIZE + neighborC;
            if (idx !== lastEmptyIndex) {
                validMoves.push(idx);
            }
        }

        // Check Down (row + 1)
        neighborR = er + 1;
        if (neighborR < SIZE) {
            let idx = neighborR * SIZE + neighborC;
            if (idx !== lastEmptyIndex) {
                validMoves.push(idx);
            }
        }

        // Check Left (col - 1)
        neighborR = er;
        neighborC = ec - 1;
        if (neighborC >= 0) {
            let idx = neighborR * SIZE + neighborC;
            if (idx !== lastEmptyIndex) {
                validMoves.push(idx);
            }
        }

        // Check Right (col + 1)
        neighborC = ec + 1;
        if (neighborC < SIZE) {
            let idx = neighborR * SIZE + neighborC;
            if (idx !== lastEmptyIndex) {
                validMoves.push(idx);
            }
        }
        
        // If somehow no valid moves are left (shouldn't happen, but as a safeguard)
        if (validMoves.length === 0) break;
        
        // Pick a random move from the valid, non-reversing options
        let randomMoveIndex = floor(random(validMoves.length));
        let tileIndexToMove = validMoves[randomMoveIndex];

        // Perform the swap (instantaneously, without animation in the scramble)
        [board[emptyIndex], board[tileIndexToMove]] = [board[tileIndexToMove], board[emptyIndex]];

        // Update lastEmptyIndex *before* emptyIndex is updated
        lastEmptyIndex = emptyIndex; 
        
        // Update emptyIndex to the new position
        emptyIndex = tileIndexToMove;
    }
    
    // After 50 moves, update tile objects to reflect the final scrambled position
    for (let tile of tiles) {
        let idx = board.indexOf(tile.value);
        let r = floor(idx / SIZE);
        let c = idx % SIZE;
        // This ensures the tiles are drawn instantly in their new location when the game starts
        tile.updatePosition(r, c); 
        tile.currentX = tile.getScreenX(c);
        tile.currentY = tile.getScreenY(r);
    }
    
    // Reset moves counter for the player
    moves = 0;
    movesP.html("Moves: 0");
}

// Renamed the original shuffleBoard to scrambleBoard and removed, but kept
// helper functions that were requested to remain unchanged.

function isSolved(arr = board) {
  for (let i = 0; i < arr.length - 1; i++)
    if (arr[i] !== i + 1) return false;
  return arr[arr.length - 1] === 0;
}

function isSolvable(arr) {
  let inv = 0;
  let flat = arr.filter(v => v !== 0);
  for (let i = 0; i < flat.length; i++)
    for (let j = i + 1; j < flat.length; j++)
      if (flat[i] > flat[j]) inv++;

  let blankRowFromBottom = SIZE - floor(arr.indexOf(0) / SIZE);
  return (inv + blankRowFromBottom) % 2 === 0;
}
