let shapes = ["Circle", "Triangle", "Square", "Rectangle", "Star"];
let current = 0;

let points = [];
let drawing = false;

let scores = [];
let showFinal = false;

// score flash
let showScore = false;
let scoreTimer = 0;
let lastScore = 0;

const YELLOW = "#F4D35E";
const GREEN = "#2E7D32";

function setup() {
    pixelDensity(1);
  createCanvas(700, 600);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(245);

  // ===== SCORE FLASH =====
  if (showScore) {
    scoreTimer--;

    fill(GREEN);
    noStroke();
    textSize(48);
    text(`${lastScore}%`, width / 2, height / 2);

    if (scoreTimer <= 0) {
      showScore = false;
      current++;
      if (current >= shapes.length) showFinal = true;
    }
    return;
  }

  // ===== FINAL SCREEN =====
  if (showFinal) {
    let total = floor(scores.reduce((a, b) => a + b, 0) / scores.length);

    fill(GREEN);
    textSize(42);
    text("FINAL SCORE", width / 2, 120);
    text(`${total}%`, width / 2, 180);

    textSize(16);
    let y = 240;
    for (let i = 0; i < shapes.length; i++) {
      text(`${shapes[i]}: ${scores[i]}%`, width / 2, y);
      y += 24;
    }
    return;
  }

  // ===== SILHOUETTE =====
  drawSilhouette(shapes[current]);

  // ===== USER DRAWING =====
  noFill();
  stroke(GREEN);
  strokeWeight(3);
  beginShape();
  for (let p of points) vertex(p.x, p.y);
  endShape();

  fill(GREEN);
  noStroke();
  textSize(22);
  text(`Draw a ${shapes[current]}`, width / 2, 30);
}

function mousePressed() {
  if (showScore || showFinal) return;
  points = [];
  drawing = true;
}

function mouseDragged() {
  if (drawing) points.push(createVector(mouseX, mouseY));
}

function mouseReleased() {
  if (!drawing || points.length < 20) return;

  drawing = false;

  lastScore = scoreShape(points, shapes[current]);
  scores.push(lastScore);

  points = [];
  showScore = true;
  scoreTimer = 60;
}

/* =========================
   SILHOUETTES
   ========================= */

function drawSilhouette(type) {
  stroke(YELLOW);
  strokeWeight(4);
  noFill();

  push();
  translate(width / 2, height / 2);

  if (type === "Circle") ellipse(0, 0, 220);

  if (type === "Triangle")
    triangle(-120, 100, 0, -120, 120, 100);

  if (type === "Square") {
    rectMode(CENTER);
    rect(0, 0, 200, 200);
  }

  if (type === "Rectangle") {
    rectMode(CENTER);
    rect(0, 0, 260, 160);
  }

  if (type === "Star") {
    beginShape();
    for (let i = 0; i < 10; i++) {
      let a = i * TWO_PI / 10;
      let r = i % 2 === 0 ? 120 : 50;
      vertex(cos(a) * r, sin(a) * r);
    }
    endShape(CLOSE);
  }

  pop();
}

/* =========================
   CHECKING LOGIC (UNCHANGED)
   ========================= */

function scoreShape(pts, type) {
  let user = normalizePoints(pts);
  let ideal = idealPoints(type, 300);

  let d1 = avgMinDist(user, ideal);
  let d2 = avgMinDist(ideal, user);

  let avg = (d1 + d2) / 2;
  let score = floor(100 - avg * 500);

  return constrain(score, 0, 100);
}

function normalizePoints(pts) {
  let xs = pts.map(p => p.x);
  let ys = pts.map(p => p.y);
  let minX = min(xs), maxX = max(xs);
  let minY = min(ys), maxY = max(ys);
  let cx = (minX + maxX) / 2;
  let cy = (minY + maxY) / 2;
  let scale = max(maxX - minX, maxY - minY) || 1;

  return pts.map(p => ({
    x: (p.x - cx) / scale,
    y: (p.y - cy) / scale
  }));
}

function idealPoints(type, samples) {
  let pts = [];

  if (type === "Circle") {
    for (let i = 0; i < samples; i++) {
      let a = i * TWO_PI / samples;
      pts.push({ x: cos(a) * 0.45, y: sin(a) * 0.45 });
    }
    return pts;
  }

  let polygons = {
    Triangle: [
      { x: 0, y: -0.48 },
      { x: -0.43, y: 0.24 },
      { x: 0.43, y: 0.24 }
    ],
    Square: [
      { x: -0.45, y: -0.45 },
      { x: 0.45, y: -0.45 },
      { x: 0.45, y: 0.45 },
      { x: -0.45, y: 0.45 }
    ],
    Rectangle: [
      { x: -0.48, y: -0.32 },
      { x: 0.48, y: -0.32 },
      { x: 0.48, y: 0.32 },
      { x: -0.48, y: 0.32 }
    ],
    Star: (() => {
      let v = [];
      for (let i = 0; i < 10; i++) {
        let a = -HALF_PI + i * TWO_PI / 10;
        let r = i % 2 === 0 ? 0.45 : 0.18;
        v.push({ x: cos(a) * r, y: sin(a) * r });
      }
      return v;
    })()
  };

  return samplePolygon(polygons[type], samples);
}
function touchStarted() {
  mousePressed();
  return false; // prevent scrolling
}

function touchMoved() {
  mouseDragged();
  return false; // prevent scrolling
}

function touchEnded() {
  mouseReleased();
  return false; // prevent scrolling
}


function samplePolygon(v, samples) {
  let edges = [];
  let total = 0;

  for (let i = 0; i < v.length; i++) {
    let a = v[i];
    let b = v[(i + 1) % v.length];
    let len = dist(a.x, a.y, b.x, b.y);
    edges.push({ a, b, len });
    total += len;
  }

  let pts = [];
  for (let i = 0; i < samples; i++) {
    let t = (i / samples) * total;
    let acc = 0;
    for (let e of edges) {
      if (acc + e.len >= t) {
        let u = (t - acc) / e.len;
        pts.push({
          x: lerp(e.a.x, e.b.x, u),
          y: lerp(e.a.y, e.b.y, u)
        });
        break;
      }
      acc += e.len;
    }
  }
  return pts;
}

function avgMinDist(A, B) {
  let total = 0;
  for (let a of A) {
    let minD = Infinity;
    for (let b of B) {
      let d = dist(a.x, a.y, b.x, b.y);
      if (d < minD) minD = d;
    }
    total += minD;
  }
  return total / A.length;
}
