// =======================
//   Sector Click Game
//   HTML UI Version
// =======================

let angle = 0;
let speed = 3;

let sectorStart;
let sectorSize;

let score = 0;
let highScore = 0;

let state = "playing";

let restartBtn;
let ignoreNextClick = false;

// HTML elements
let uiContainer;
let scoreText;
let highScoreText;
let instr1;
let instr2;
let gameOverText;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textFont("Arial, sans-serif");

  // LOAD HIGHSCORE
  let saved = localStorage.getItem("highScore_sectorGame");
  if (saved) highScore = int(saved);

  createUI();

  initGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionUI();
}

// ----------------------
//   CREATE HTML UI
// ----------------------
function createUI() {
  uiContainer = createDiv();
  uiContainer.style("position", "fixed");
  uiContainer.style("top", "0");
  uiContainer.style("left", "0");
  uiContainer.style("width", "100%");
  uiContainer.style("text-align", "center");
  uiContainer.style("padding", "20px");
  uiContainer.style("color", "white");
  uiContainer.style("font-family", "Arial, sans-serif");
  uiContainer.style("pointer-events", "none");

  scoreText = createDiv("");
  scoreText.parent(uiContainer);
  scoreText.style("font-size", "60px");

  highScoreText = createDiv("");
  highScoreText.parent(uiContainer);
  highScoreText.style("font-size", "45px");
  highScoreText.style("margin-bottom", "20px");

  instr1 = createDiv("Click only when the arm is inside the green sector.");
  instr1.parent(uiContainer);
  instr1.style("font-size", "40px");
  instr1.style("margin-top", "10px");

  instr2 = createDiv("The sector shrinks each round.");
  instr2.parent(uiContainer);
  instr2.style("font-size", "40px");
  instr2.style("margin-bottom", "20px");

  gameOverText = createDiv("GAME OVER");
  gameOverText.parent(uiContainer);
  gameOverText.style("font-size", "60px");
  gameOverText.style("margin-top", "40px");
  gameOverText.style("display", "none");
  gameOverText.style("color", "rgb(255,100,100)");

  restartBtn = createButton("Restart");
  restartBtn.style("padding", "30px 50px");
  restartBtn.style("font-size", "60px");
  restartBtn.style("border-radius", "10px");
  restartBtn.style("display", "none");
  restartBtn.style("z-index", "9999");
  restartBtn.mousePressed(() => {
    restartBtn.hide();
    gameOverText.hide();
    initGame();
    ignoreNextClick = true;
    setTimeout(() => (ignoreNextClick = false), 150);
  });

  positionUI();
}

function positionUI() {
  restartBtn.position(width / 2 - restartBtn.elt.offsetWidth / 2, height * 0.55);
}

// ----------------------
//   GAME RESET
// ----------------------
function initGame() {
  angle = 0;
  score = 0;
  sectorSize = 260;
  sectorStart = random(0, 360);
  state = "playing";

  restartBtn.hide();
  gameOverText.hide();
  instr1.show();
  instr2.show();
}

// ----------------------
//      DRAW
// ----------------------
function draw() {
  background(18);

  updateUI();

  const R = min(width, height) * 0.33;
  const circleCX = width / 2;
  const circleCY = height * 0.62;  // below UI

  push();
  translate(circleCX, circleCY);

  // circle
  noFill();
  stroke(255);
  strokeWeight(3);
  ellipse(0, 0, R * 2, R * 2);

  // sector
  noStroke();
  fill(0, 200, 100, 160);
  arc(0, 0, R * 2, R * 2, sectorStart, sectorStart + sectorSize, PIE);

  // arm
  let armX = R * cos(angle);
  let armY = R * sin(angle);

  let a = (angle % 360 + 360) % 360;
  let s1 = (sectorStart % 360 + 360) % 360;
  let s2 = s1 + sectorSize;

  let glow = s2 <= 360 ? a >= s1 && a <= s2 : a >= s1 || a <= (s2 % 360);

  // --- ARM RENDER ---
  if (glow) {
    for (let i = 14; i >= 1; i--) {
      stroke(0, 255, 180, map(i, 1, 14, 40, 240));
      line(0, 0, armX, armY);
    }
  } else {
    stroke(255);
    strokeWeight(4);
    line(0, 0, armX, armY);
  }

  pop();

  if (state === "playing") {
    angle += speed;
    if (angle >= 360) angle -= 360;
  }
}

// ----------------------
//     UPDATE HTML UI
// ----------------------
function updateUI() {
  scoreText.html("Score: " + score);
  highScoreText.html("High Score: " + highScore);

  if (state === "gameover") {
    instr1.hide();
    instr2.hide();
    gameOverText.show();
    restartBtn.show();
    positionUI();
  }
}

// ----------------------
//   INPUT HANDLING
// ----------------------
function mousePressed() {
  handleClick();
}

function touchStarted() {
  handleClick();
}

function handleClick() {
  if (ignoreNextClick) return;
  if (state !== "playing") return;

  let a = (angle % 360 + 360) % 360;
  let s1 = (sectorStart % 360 + 360) % 360;
  let s2 = s1 + sectorSize;

  let correct = s2 <= 360 ? a >= s1 && a <= s2 : a >= s1 || a <= (s2 % 360);

  if (correct) {
    score++;
    sectorSize *= 0.85;
    if (sectorSize < 12) sectorSize = 12;
    sectorStart = random(0, 360);
  } else {
    state = "gameover";
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore_sectorGame", highScore);
    }
  }
}
