// 🎮 Virtual resolution (16:9)
const GAME_W = 1280;
const GAME_H = 720;

let scaleFactor, offsetX, offsetY;

let levels = [];
let currentLevel = 0;

let player;
let speed = 6;

// drag state
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// flash
let flashAlpha = 0;
let flashColor = null;

function setup() {
  pixelDensity(1)
  if (windowHeight<windowWidth){
  createCanvas(windowWidth, windowHeight);
  }else{

    document.querySelector('canvas').classList.add("rot")
  createCanvas( windowHeight,windowWidth);
  }
  rectMode(CORNER);
  noStroke();

  // 🚫 disable page scrolling on mobile
  document.body.style.overflow = "hidden";

  levels = [
    {
      start: { x: 80, y: 360, size: 30 },
      goal: { x: 1180, y: 320, w: 60, h: 120 },
      walls: [
        { x: 360, y: 0, w: 30, h: 460 },
        { x: 640, y: 260, w: 30, h: 460 },
        { x: 920, y: 0, w: 30, h: 460 }
      ]
    },
    {
      start: { x: 80, y: 80, size: 30 },
      goal: { x: 1150, y: 560, w: 80, h: 120 },
      walls: [
        { x: 240, y: 0, w: 30, h: 520 },
        { x: 480, y: 200, w: 30, h: 520 },
        { x: 720, y: 0, w: 30, h: 520 },
        { x: 960, y: 200, w: 30, h: 520 }
      ]
    }
  ];

  calculateViewport();
  loadLevel(currentLevel);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateViewport();
}

// 📐 Letterbox math
function calculateViewport() {
  scaleFactor = min(width / GAME_W, height / GAME_H);
  offsetX = (width - GAME_W * scaleFactor) / 2;
  offsetY = (height - GAME_H * scaleFactor) / 2;
}

function draw() {
  background(0);

  push();
  translate(offsetX, offsetY);
  scale(scaleFactor);

  background(15, 25, 45);

  drawLevel();
  updateDragMovement();
  checkCollisions();
  drawPlayer();
  drawUI();
  drawFlash();

  pop();
}

// 🎯 Unified pointer position (mouse + touch)
function getPointerPos() {
  let x, y;

  if (touches.length > 0) {
    x = touches[0].x;
    y = touches[0].y;
  } else {
    x = mouseX;
    y = mouseY;
  }

  return {
    x: (x - offsetX) / scaleFactor,
    y: (y - offsetY) / scaleFactor
  };
}

// 🖱️ / 📱 Drag movement
function updateDragMovement() {
  if (!dragging) return;

  let p = getPointerPos();

  let targetX = p.x - dragOffsetX;
  let targetY = p.y - dragOffsetY;

  let dx = targetX - player.x;
  let dy = targetY - player.y;
  let d = sqrt(dx * dx + dy * dy);

  if (d > 0) {
    let step = min(speed, d);
    player.x += (dx / d) * step;
    player.y += (dy / d) * step;
  }
}

// 🖱️ Mouse
function mousePressed() {
  tryStartDrag();
}
function mouseReleased() {
  dragging = false;
}

// 📱 Touch
function touchStarted() {
  tryStartDrag();
  return false;
}
function touchEnded() {
  dragging = false;
  return false;
}

function tryStartDrag() {
  let p = getPointerPos();

  if (
    p.x > player.x &&
    p.x < player.x + player.size &&
    p.y > player.y &&
    p.y < player.y + player.size
  ) {
    dragging = true;
    dragOffsetX = p.x - player.x;
    dragOffsetY = p.y - player.y;
  }
}

function loadLevel(i) {
  let lvl = levels[i];
  player = {
    x: lvl.start.x,
    y: lvl.start.y,
    size: lvl.start.size
  };
  dragging = false;
}

function drawPlayer() {
  fill(255, 215, 0);
  rect(player.x, player.y, player.size, player.size, 6);
}

function drawLevel() {
  let lvl = levels[currentLevel];

  fill(40, 110, 210);
  for (let w of lvl.walls) rect(w.x, w.y, w.w, w.h, 8);

  fill(80, 190, 255);
  rect(lvl.goal.x, lvl.goal.y, lvl.goal.w, lvl.goal.h, 10);
}

function checkCollisions() {
  let lvl = levels[currentLevel];

  for (let w of lvl.walls) {
    if (rectHit(player, w)) {
      triggerFlash("red");
      loadLevel(currentLevel);
      return;
    }
  }

  if (
    player.x < 0 ||
    player.y < 0 ||
    player.x + player.size > GAME_W ||
    player.y + player.size > GAME_H
  ) {
    triggerFlash("red");
    loadLevel(currentLevel);
    return;
  }

  if (rectHit(player, lvl.goal)) {
    triggerFlash("green");
    currentLevel = (currentLevel + 1) % levels.length;
    loadLevel(currentLevel);
  }
}

function rectHit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.size > b.x &&
    a.y < b.y + b.h &&
    a.y + a.size > b.y
  );
}

function triggerFlash(type) {
  flashColor = type;
  flashAlpha = 160;
}

function drawFlash() {
  if (flashAlpha > 0) {
    if (flashColor === "red") fill(255, 60, 60, flashAlpha);
    if (flashColor === "green") fill(60, 255, 140, flashAlpha);
    rect(0, 0, GAME_W, GAME_H);
    flashAlpha -= 10;
  }
}

function drawUI() {
  fill(255);
  textSize(28);
  textAlign(LEFT, TOP);
  text("LEVEL " + (currentLevel + 1), 24, 20);
}
