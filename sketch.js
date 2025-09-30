let player;
let obstacles = [];
let lane = 1; // target lane (0 = left, 1 = center, 2 = right)
let speed = 25;
let score = 0;
let lives = 3;
let gameOver = false;
let imm = false
// swipe tracking
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// restart button
let restartButton;

// HTML elements for HUD
let scoreDiv, livesDiv, gameOverDiv;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  player = new Player();

  // Immersion toggle slider
  let immersionDiv = createDiv("Immersion: ");
  immersionDiv.style('position', 'absolute');
  immersionDiv.style('top', '100px');
  immersionDiv.style('left', '20px');
  immersionDiv.style('color', 'white');
  immersionDiv.style('font-size', '24px');
// Create slider-style toggle
let sliderWrapper = createDiv();
sliderWrapper.style('position', 'absolute');
sliderWrapper.style('top', '100px');
sliderWrapper.style('left', '150px');
sliderWrapper.style('width', '60px');
sliderWrapper.style('height', '30px');
sliderWrapper.style('background', '#555');
sliderWrapper.style('border-radius', '15px');
sliderWrapper.style('cursor', 'pointer');

let sliderCircle = createDiv();
sliderCircle.style('width', '28px');
sliderCircle.style('height', '28px');
sliderCircle.style('border-radius', '50%');
sliderCircle.style('position', 'absolute');
sliderCircle.style('top', '1px');
sliderCircle.style('left', imm ? '31px' : '1px');
sliderCircle.style('background', imm ? '#0f0' : '#f00'); // green if on, red if off
sliderCircle.parent(sliderWrapper);

sliderWrapper.mousePressed(() => {
  imm = !imm;
  sliderCircle.style('left', imm ? '31px' : '1px');
  sliderCircle.style('background', imm ? '#0f0' : '#f00');
});
  sliderWrapper.touchStarted(() => {
  imm = !imm;
  sliderCircle.style('left', imm ? '31px' : '1px');
  sliderCircle.style('background', imm ? '#0f0' : '#f00');
});

  // HUD
  scoreDiv = createDiv("Score: 0");
  scoreDiv.style('position', 'absolute');
  scoreDiv.style('top', '20px');
  scoreDiv.style('left', '20px');
  scoreDiv.style('color', 'white');
  scoreDiv.style('font-size', '24px');

  livesDiv = createDiv("Lives: 3");
  livesDiv.style('position', 'absolute');
  livesDiv.style('top', '60px');
  livesDiv.style('left', '20px');
  livesDiv.style('color', 'white');
  livesDiv.style('font-size', '24px');

  gameOverDiv = createDiv("");
  gameOverDiv.style('position', 'absolute');
  gameOverDiv.style('white-space', 'nowrap');
  gameOverDiv.style('top', '50%');
  gameOverDiv.style('left', '50%');
  gameOverDiv.style('transform', 'translate(-50%, -50%)');
  gameOverDiv.style('color', 'red');
  gameOverDiv.style('font-size', '40px');
  gameOverDiv.style('text-align', 'center');

  // restart button (hidden initially)
  restartButton = createButton("Restart");
  restartButton.size(120, 50);
  restartButton.style('font-size', '18px');
  restartButton.position(width/2 - 60, height/2 + 80);
  restartButton.hide();
  restartButton.mousePressed(restartGame);
  restartButton.touchStarted(restartGame);
}

function draw() {
  background(100);

  // camera
  if (!imm){
    camera(0, -550, 1000, 0, 0, 0, 0, 1, 0);
  }else{
    camera(player.x, -400 - player.y, player.z + 800, player.x, -50 - player.y, player.z, 0, 1, 0);
  }

  // lights
  directionalLight(255, 255, 255, 0.3, -1, -0.5);
  ambientLight(150);

  // draw lanes
  push();
  for (let i = -1; i <= 1; i++) {
    push();
    translate(i * 200, 50, -3000);
    fill(100, 100, 120);
    box(180, 10, 12000);
    pop();
  }
  pop();

  if (!gameOver) {
    if (frameCount % 60 === 0) speed += 0.5;

    // draw player shadow
    push();
    translate(player.x, 0, player.z);
    rotateX(HALF_PI);
    noStroke();
    fill(0, 50);
    rect(-25, -10, 50, 40);
    pop();

    player.update();
    player.show();

    if (frameCount % round(1500/speed) === 0) spawnObstacles();

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();
      obstacles[i].show();

      if (player.lane === obstacles[i].lane &&
          obstacles[i].z > player.z - 50 &&
          obstacles[i].z < player.z + 50) {
        if (player.y < 60) {
          lives--;
          obstacles.splice(i, 1);
          if (lives <= 0) {
            gameOver = true;
            showGameOver();
          }
        }
      }

      if (obstacles[i] && obstacles[i].z > 600) obstacles.splice(i, 1);
    }

    score += 0.2;
  }

  scoreDiv.html("Score: " + floor(score));
  livesDiv.html("Lives: " + lives);
}

function spawnObstacles() {
  let lanesToSpawn = [];
  let numObstacles;
  let r = random();
  if (r < 0.6) numObstacles = 1;
  else if (r < 0.9) numObstacles = 2;
  else numObstacles = 3;

  while (lanesToSpawn.length < numObstacles) {
    let l = int(random(0, 3));
    if (!lanesToSpawn.includes(l)) lanesToSpawn.push(l);
  }
  lanesToSpawn.forEach(l => obstacles.push(new Obstacle(l)));
}

function keyPressed() {
  if (gameOver) return;
  if (keyCode === LEFT_ARROW) lane = max(0, lane - 1);
  else if (keyCode === RIGHT_ARROW) lane = min(2, lane + 1);
  else if (keyCode === UP_ARROW || key === ' ') jumpPlayer();
}

function jumpPlayer() {
  if (!player.jumping) {
    player.vy = 13;
    player.jumping = true;
  }
}

function touchStarted() {
  touchStartX = mouseX;
  touchStartY = mouseY;
  return false;
}

function touchEnded() {
  if (gameOver) return false;
  touchEndX = mouseX;
  touchEndY = mouseY;

  let dx = touchEndX - touchStartX;
  let dy = touchEndY - touchStartY;

  if (abs(dx) > abs(dy)) {
    if (dx > 50) lane = min(2, lane + 1);
    else if (dx < -50) lane = max(0, lane - 1);
  } else {
    if (dy < -50) jumpPlayer();
  }
  return false;
}

function showGameOver() {
  gameOverDiv.html("GAME OVER<br>Final Score: " + floor(score));
  restartButton.show();
}

function restartGame() {
  score = 0;
  lives = 3;
  speed = 10;
  obstacles = [];
  lane = 1;
  player = new Player();
  gameOver = false;
  gameOverDiv.html("");
  restartButton.hide();
}

class Player {
  constructor() {
    this.lane = 1;
    this.x = 0;
    this.y = 0;
    this.z = 200;
    this.vy = 0;
    this.jumping = false;
  }
  update() {
    this.lane = lane;
    let targetX = (lane - 1) * 200;
    this.x = lerp(this.x, targetX, 0.2);
    this.y += this.vy;
    this.vy -= 0.4;
    if (this.y < 0) {
      this.y = 0;
      this.vy = 0;
      this.jumping = false;
    }
  }
  show() {
    push();
    translate(this.x, -50 - this.y, this.z);
    fill(0, 200, 150);
    box(50, 100, 50);
    pop();
  }
}

class Obstacle {
  constructor(lane) {
    this.lane = lane;
    this.x = (lane - 1) * 200;
    this.y = -30;
    this.z = -6000;
  }
  update() {
    this.z += speed;
  }
  show() {
    push();
    translate(this.x, this.y, this.z);
    fill(200, 50, 50);
    box(80, 60, 80);
    pop();
  }
}
