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
let runcol;

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

let blue
let yellow
let background_i
let background_i2
let background_i3

let backpos = 0
let backpos2 = 0
let backpos3 = 0

let music1, music2, music3, music4, music5;
let allMusic = [];

let currentMusic = null;
let musicLevel = -1;   // -1 = nothing yet
let targetVolume = 0.6;
let fadeSpeed = 0.01;

let rotate = false
let mx,my

/* ---------------- PRELOAD ---------------- */

function preload() {
  music1 = loadSound("music.mp3");
  music2 = loadSound("music2.mp3");
  music3 = loadSound("music3.mp3");
  music4 = loadSound("music4.mp3");
  music5 = loadSound("music5.mp3");
  

  flipSound = loadSound("woop.mp3");
  collectSound = loadSound("coin.mp3");
  clickSound = loadSound("snap.mp3");
  blue = loadImage("blue_sq.png")
  yellow = loadImage("yellow_sq.png")
  background_i = loadImage("back.png")
  background_i2 = loadImage("back2.png")
  background_i3 = loadImage("back3.png")

}

/* ---------------- SETUP ---------------- */

function setup() {
  createCanvas(1000, 500);
  if (windowWidth<windowHeight){
    document.querySelector('canvas').classList.add("rot")
    rotate = true
  }
  pixelDensity(2);

 userStartAudio();
allMusic = [music1, music2, music3, music4, music5];

  // alternating logic
  music1.onended(() => {
    if (musicLevel === 0) startMusic(music2);
  });

  music2.onended(() => {
    if (musicLevel === 0) startMusic(music1);
  });

  laneY[0] = height/3;
  laneY[1] = height/3 * 2;

  runner = {
    x: 175,
    lane: 0,
    y: laneY[0],
    size: 35
  };

  let stored = localStorage.getItem("laneRunnerHighScore");
  highScore = stored ? int(stored) : 0;

restartBtn = {
  w: 140 * 1.5, // 210
  h: 40 * 1.5,  // 60
  x: width / 2 - (140 * 1.5) / 2, // center horizontally
  y: height / 2 + 40 // keep same vertical offset
};

pauseBtn = {
  w: 30 * 1.5, // 45
  h: 30 * 1.5, // 45
  x: width - 100 - (45 - 30)/2, // adjust so it stays visually near top-right
  y: 15 - (45 - 30)/2
};

soundBtn = {
  w: 30 * 1.5, // 45
  h: 30 * 1.5, // 45
  x: width - 45 - (45 - 30)/2, // same adjustment
  y: 15 - (45 - 30)/2
};

  flipSound.playMode('restart');
collectSound.playMode('restart');
clickSound.playMode('restart');

}

/* ---------------- DRAW ---------------- */
function stopAllMusic() {
  for (let m of allMusic) {
    if (m.isPlaying()) {
      m.stop();
    }
  }
}

function startMusic(track) {
  stopAllMusic();

  currentMusic = track;
  currentMusic.setVolume(0);
  currentMusic.play();

  if (musicLevel !== 0) {
    currentMusic.loop(); // tier music loops
  }
}


function draw() {

  mx = mouseX
  my = mouseY
  if (rotate){
mx = mouseY;
my = height - mouseX;
  }

  background(0);
  image(background_i,0-backpos,0,width,height)
  image(background_i,0-backpos+width,0,width,height)
  image(background_i2,0-backpos2,0,width,height)
  image(background_i2,0-backpos2+width,0,width,height)
  image(background_i3,0-backpos3,0,width,height)
  image(background_i3,0-backpos3+width,0,width,height)



     let newLevel =
    score < 100 ? 0 :
    score < 200 ? 1 :
    score < 300 ? 2 :
    3;

  if (newLevel !== musicLevel) {
    musicLevel = newLevel;

    if (musicLevel === 0) startMusic(music1);
    else if (musicLevel === 1) startMusic(music3);
    else if (musicLevel === 2) startMusic(music4);
    else if (musicLevel === 3) startMusic(music5);
  }

  // -------- FADE IN MUSIC --------
if (currentMusic && currentMusic.isPlaying()) {
  if (soundEnabled) {
    // fade in toward targetVolume
    let v = currentMusic.getVolume();
    if (v < targetVolume) {
      currentMusic.setVolume(min(v + fadeSpeed, targetVolume));
    }
  } else {
    // fade out instantly (or gradually)
    currentMusic.setVolume(0);
  }
}




  backpos+=speed/4
  if( backpos>width){
      backpos=0
  }
    backpos2+=speed/3.3
  if( backpos2>width){
      backpos2=0
  }
    backpos3+=speed/2.8
  if( backpos3>width){
      backpos3=0
  }

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
  textSize(20);
  noStroke();

  // Pause button
  fill(40);
  rect(pauseBtn.x, pauseBtn.y, pauseBtn.w, pauseBtn.h, 6);
  fill(255);
  text(paused ? "▶" : "⏸", pauseBtn.x + pauseBtn.w/2, pauseBtn.y + pauseBtn.h/2);

  // Sound button
  fill(40);
  rect(soundBtn.x, soundBtn.y, soundBtn.w, soundBtn.h, 6);
  fill(255);
  text(soundEnabled ? "🔊" : "🔇", soundBtn.x + soundBtn.w/2, soundBtn.y + soundBtn.h/2);

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
  let x = width / 2 - 80-25;
let y = height / 2- 25;
let w = 50;
let h = 50;
let r = 8;

drawingContext.save();
drawingContext.beginPath();
drawingContext.roundRect(x, y, w, h, r);
drawingContext.clip();
image(blue, x, y, w, h);
drawingContext.restore();


  fill(255, 200, 0);
  rect(width / 2 + 80, height / 2, 50, 50, 8);
     x = width / 2 + 80-25;
 y = height / 2- 25;
 w = 50;
 h = 50;
 r = 8;

drawingContext.save();
drawingContext.beginPath();
drawingContext.roundRect(x, y, w, h, r);
drawingContext.clip();
image(yellow, x, y, w, h);
drawingContext.restore();

  fill(180);
  textSize(16);
  text("Blue", width / 2 - 80, height / 2 + 45);
  text("Yellow", width / 2 + 80, height / 2 + 45);

  textAlign(LEFT, BASELINE);
}

/* ---------------- INSTRUCTIONS ---------------- */

function drawInstructions() {
  noStroke();
  textAlign(CENTER, CENTER);

  fill(255);
  textSize(30);
  text("How to Play", width / 2, 70);

  textSize(20);
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
  textSize(16);
  text("Click anywhere to continue", width / 2, height - 50);

  textAlign(LEFT, BASELINE);
  fill(80, 255, 120); 
  ellipse(width / 2 + textWidth("• Collect green orbs to earn points\n")/2+40, height/2, 16); 
  fill(220) 
  rect(width / 2 + textWidth("• Obstacles block one lane\n")/2+32, height/2 - height/20, 7,16, 1); 
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
  let x = runner.x - runner.size / 2;
let y = runner.y - runner.size / 2;
let s = runner.size;
let r = 6;

drawingContext.save();
drawingContext.beginPath();
drawingContext.roundRect(x, y, s, s, r);
drawingContext.clip();
if (runcol =="y"){
image(yellow, x, y, s, s);
}else{
image(blue, x, y, s, s);

}
drawingContext.restore();
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
      score+=1;
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
      
  // mute/unmute music
  if (currentMusic && currentMusic.isPlaying()) {
    currentMusic.setVolume(soundEnabled ? targetVolume : 0);
  }

      return;
    }
  }

  if (gameState === "select") {
    if (dist(mx, my, width / 2 - 80, height / 2) < 30) {
      runnerColor = color(0, 200, 255);
      runcol = "b"
      afterSelect();
      if (soundEnabled) clickSound.play();
    }
    if (dist(mx, my, width / 2 + 80, height / 2) < 30) {
      runnerColor = color(255, 200, 0);
      runcol = "y"
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
    if (dist(mx, my, width / 2 - 80, height / 2) < 30) {
      runnerColor = color(0, 200, 255);
      afterSelect();
      if (soundEnabled) clickSound.play();
    }
    if (dist(mx, my, width / 2 + 80, height / 2) < 30) {
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
  textSize(20);
  text("Score: " + score, 20, 30);
  text("High: " + highScore, 20, 55);

  if (gameState === "gameover") {
    textAlign(CENTER, CENTER);
    textSize(40);
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
  textSize(25)
  text("RESTART", restartBtn.x + restartBtn.w / 2, restartBtn.y + restartBtn.h / 2);
}

function overRestart() {
  return overBtn(restartBtn);
}

function overBtn(b) {
  return mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h;
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
