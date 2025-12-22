let runner;
let obstacles = [];
let collectibles = [];

let laneY = [];
let platformThickness = 4;

let baseSpeed = 4;
let speed = baseSpeed;

let spawnTimer = 0;
let spawnInterval = 36;

let score = 0;
let highScore = 0;
let frameCounter = 0;

let restartBtn;
let gameState = "select"; // select | instructions | countdown | play | gameover
let runnerColor;

let firstRun = true;
let countdown = 3;
let countdownStartFrame = 0;

let flipSound;
let collectSound;
let clickSound;

let paused = false;
let soundEnabled = true;

let pauseBtn;
let soundBtn;

/* ---------------- PRELOAD ---------------- */

function preload() {
  flipSound = loadSound("woop.mp3");
  collectSound = loadSound("coin.mp3");
  clickSound = loadSound("snap.mp3");
}

/* ---------------- SETUP ---------------- */

function setup() {
  createCanvas(800, 400);
  pixelDensity(1);

  laneY[0] = 120;
  laneY[1] = 280;

  runner = {
    x: 140,
    lane: 0,
    y: laneY[0],
    size: 30
  };

  let stored = localStorage.getItem("laneRunnerHighScore");
  highScore = stored ? int(stored) : 0;

  restartBtn = {
    x: width / 2 - 70,
    y: height / 2 + 40,
    w: 140,
    h: 40
  };

  pauseBtn = {
    x: width - 90,
    y: 15,
    w: 30,
    h: 30
  };

  soundBtn = {
    x: width - 45,
    y: 15,
    w: 30,
    h: 30
  };
}

/* ---------------- DRAW ---------------- */

function draw() {
  background(18);

  if (gameState === "select") {
    drawCharacterSelect();
    return;
  }

  if (gameState === "instructions") {
    drawInstructions();
    return;
  }

  if (gameState === "countdown") {
    drawCountdown();
    return;
  }

  drawPlatforms();

  if (gameState === "play" && !paused) {
    increaseDifficulty();
    spawnStuff();
    updateObjects();
    checkCollisions();
  }

  animateRunner();
  drawObjects();
  drawRunner();
  drawUI();
  drawTopButtons();
}

/* ---------------- TOP BUTTONS ---------------- */

function drawTopButtons() {
  if (gameState !== "play" && gameState !== "gameover") return;

  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  textSize(16);
  noStroke();

  // Pause button
  fill(40);
  rect(pauseBtn.x, pauseBtn.y, pauseBtn.w, pauseBtn.h, 6);
  fill(255);
  text(paused ? "▶" : "⏸", pauseBtn.x + 15, pauseBtn.y + 15);

  // Sound button
  fill(40);
  rect(soundBtn.x, soundBtn.y, soundBtn.w, soundBtn.h, 6);
  fill(255);
  text(soundEnabled ? "🔊" : "🔇", soundBtn.x + 15, soundBtn.y + 15);

  textAlign(LEFT, BASELINE);
}

/* ---------------- CHARACTER SELECT ---------------- */

function drawCharacterSelect() {
  noStroke();
  textAlign(CENTER, CENTER);

  fill(255);
  textSize(32);
  text("Choose your runner", width / 2, 80);

  rectMode(CENTER);

  fill(0, 200, 255);
  rect(width / 2 - 80, height / 2, 50, 50, 8);

  fill(255, 200, 0);
  rect(width / 2 + 80, height / 2, 50, 50, 8);

  fill(180);
  textSize(14);
  text("Blue", width / 2 - 80, height / 2 + 45);
  text("Yellow", width / 2 + 80, height / 2 + 45);

  textAlign(LEFT, BASELINE);
}

/* ---------------- INSTRUCTIONS ---------------- */

function drawInstructions() {
  noStroke();
  textAlign(CENTER, CENTER);

  fill(255);
  textSize(28);
  text("How to Play", width / 2, 70);

  textSize(16);
  fill(200);
  text(
    "• The square runs forward\n" +
    "• Obstacles block one lane\n" +
    "• Collect green orbs to earn points\n" +
    "• Click or press any key to switch lanes\n" +
    "• Survive as long as you can",
    width / 2,
    height / 2
  );

  fill(150);
  textSize(14);
  text("Click anywhere to continue", width / 2, height - 50);

  textAlign(LEFT, BASELINE);
  fill(80, 255, 120); 
  ellipse(width / 2 + textWidth("• Collect green orbs to earn points\n")/2+28, height/2, 16); 
  fill(220) 
  rect(width / 2 + textWidth("• Obstacles block one lane\n")/2+24, height/2 - height/20, 7,16, 1); 
}

/* ---------------- COUNTDOWN ---------------- */

function drawCountdown() {
  drawPlatforms();
  animateRunner();
  drawRunner();

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(64);
  text(countdown, width / 2, height / 2);

  if (frameCount - countdownStartFrame > 60) {
    countdown--;
    countdownStartFrame = frameCount;
    if (countdown === 0) startGame();
  }

  textAlign(LEFT, BASELINE);
}

/* ---------------- PLATFORMS ---------------- */

function drawPlatforms() {
  stroke(220);
  strokeWeight(platformThickness);
  line(0, laneY[0] + 22, width, laneY[0] + 22);
  line(0, laneY[1] + 22, width, laneY[1] + 22);
}

/* ---------------- RUNNER ---------------- */

function animateRunner() {
  let targetY = laneY[runner.lane];
  runner.y = lerp(runner.y, targetY, paused ? 0.2 : 0.75);
}

function drawRunner() {
  noStroke();
  fill(runnerColor);
  rectMode(CENTER);
  rect(runner.x, runner.y, runner.size, runner.size, 6);
}

/* ---------------- DIFFICULTY ---------------- */

function increaseDifficulty() {
  frameCounter++;
  speed = baseSpeed + frameCounter * 0.001;
  spawnInterval = max(28, 36 - frameCounter * 0.006);
}

/* ---------------- SPAWNING ---------------- */

function spawnStuff() {
  spawnTimer++;
  if (spawnTimer > spawnInterval) {
    spawnTimer = 0;
    if (random() < 0.22) return;

    let obstacleLane = random([0, 1]);
    let freeLane = obstacleLane === 0 ? 1 : 0;

    if (random() < 0.8) {
      obstacles.push({ x: width + 40, lane: obstacleLane, w: 14, h: 40 });
    }

    if (random() < 0.6) {
      collectibles.push({ x: width + 40, lane: freeLane, size: 18 });
    }
  }
}

/* ---------------- OBJECTS ---------------- */

function updateObjects() {
  for (let o of obstacles) o.x -= speed;
  for (let c of collectibles) c.x -= speed;
  obstacles = obstacles.filter(o => o.x > -60);
  collectibles = collectibles.filter(c => c.x > -60);
}

function drawObjects() {
  noStroke();
  rectMode(CENTER);

  fill(220);
  for (let o of obstacles) {
    rect(o.x, laneY[o.lane] + 22 - o.h / 2, o.w, o.h, 2);
  }

  fill(80, 255, 120);
  for (let c of collectibles) {
    ellipse(c.x, laneY[c.lane], c.size);
  }
}

/* ---------------- COLLISIONS ---------------- */

function checkCollisions() {
  for (let o of obstacles) {
    if (o.lane === runner.lane && abs(o.x - runner.x) < (o.w + runner.size) / 2) {
      gameState = "gameover";
      saveHighScore();
    }
  }

  for (let i = collectibles.length - 1; i >= 0; i--) {
    let c = collectibles[i];
    if (c.lane === runner.lane && abs(c.x - runner.x) < (c.size + runner.size) / 2) {
      score++;
      if (soundEnabled) collectSound.play();
      collectibles.splice(i, 1);
    }
  }
}

/* ---------------- INPUT ---------------- */

function mousePressed() {
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
  }

  if (gameState === "play" || gameState === "gameover") {
    if (overBtn(pauseBtn)) {
      paused = !paused;
      if (soundEnabled) clickSound.play();
      return;
    }
    if (overBtn(soundBtn)) {
      soundEnabled = !soundEnabled;
      return;
    }
  }

  if (gameState === "select") {
    if (dist(mouseX, mouseY, width / 2 - 80, height / 2) < 30) {
      runnerColor = color(0, 200, 255);
      afterSelect();
      if (soundEnabled) clickSound.play();
    }
    if (dist(mouseX, mouseY, width / 2 + 80, height / 2) < 30) {
      runnerColor = color(255, 200, 0);
      afterSelect();
      if (soundEnabled) clickSound.play();
    }
    return;
  }

  if (gameState === "instructions") {
    gameState = "countdown";
    countdown = 3;
    countdownStartFrame = frameCount;
    if (soundEnabled) clickSound.play();
    return;
  }

  if (gameState === "gameover" && overRestart()) {
    resetGame();
    startGame();
    paused = false;
    if (soundEnabled) clickSound.play();
    return;
  }

  // ✅ DESKTOP FLIP
  if (gameState === "play" && !paused) {
    flipRunner();
  }
}

function touchStarted() {
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
  }

  if (gameState === "play" || gameState === "gameover") {
    if (overBtn(pauseBtn)) {
      paused = !paused;
      if (soundEnabled) clickSound.play();
      return false;
    }
    if (overBtn(soundBtn)) {
      soundEnabled = !soundEnabled;
      return false;
    }
  }

  if (gameState === "select") {
    if (dist(mouseX, mouseY, width / 2 - 80, height / 2) < 30) {
      runnerColor = color(0, 200, 255);
      afterSelect();
      if (soundEnabled) clickSound.play();
    }
    if (dist(mouseX, mouseY, width / 2 + 80, height / 2) < 30) {
      runnerColor = color(255, 200, 0);
      afterSelect();
      if (soundEnabled) clickSound.play();
    }
    return false;
  }

  if (gameState === "instructions") {
    gameState = "countdown";
    countdown = 3;
    countdownStartFrame = frameCount;
    if (soundEnabled) clickSound.play();
    return false;
  }

  if (gameState === "gameover" && overRestart()) {
    resetGame();
    startGame();
    paused = false;
    if (soundEnabled) clickSound.play();
    return false;
  }

  // ✅ MOBILE FLIP (no delay)
  if (gameState === "play" && !paused) {
    flipRunner();
  }

  return false; // 🚫 prevents delayed mousePressed
}



function keyPressed() {
  if (gameState === "play" && !paused) flipRunner();
}

function flipRunner() {
  runner.lane = runner.lane === 0 ? 1 : 0;
  if (soundEnabled) flipSound.play();
}

/* ---------------- UI ---------------- */

function drawUI() {
  fill(255);
  textSize(18);
  text("Score: " + score, 20, 30);
  text("High: " + highScore, 20, 55);

  if (gameState === "gameover") {
    textAlign(CENTER, CENTER);
    textSize(36);
    text("GAME OVER", width / 2, height / 2 - 30);
    drawRestartButton();
    textAlign(LEFT, BASELINE);
  }
}

function drawRestartButton() {
  rectMode(CORNER);
  fill(40);
  rect(restartBtn.x, restartBtn.y, restartBtn.w, restartBtn.h, 8);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20)
  text("RESTART", restartBtn.x + restartBtn.w / 2, restartBtn.y + restartBtn.h / 2);
}

function overRestart() {
  return overBtn(restartBtn);
}

function overBtn(b) {
  return mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
}

/* ---------------- FLOW ---------------- */

function afterSelect() {
  resetGame();
  if (firstRun) {
    gameState = "instructions";
    firstRun = false;
  } else {
    startGame();
  }
}

function startGame() {
  gameState = "play";
}

function resetGame() {
  obstacles = [];
  collectibles = [];
  score = 0;
  frameCounter = 0;
  speed = baseSpeed;
  spawnTimer = 0;
  runner.lane = 0;
  runner.y = laneY[0];
}

/* ---------------- HIGH SCORE ---------------- */

function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("laneRunnerHighScore", highScore);
  }
}
