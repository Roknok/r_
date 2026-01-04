// Coding Challenge 130.3: Drawing with Fourier Transform and Epicycles
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/130.1-fourier-transform-drawing.html
// https://thecodingtrain.com/CodingChallenges/130.2-fourier-transform-drawing.html
// https://thecodingtrain.com/CodingChallenges/130.3-fourier-transform-drawing.html
// https://youtu.be/7_vKzcgpfvU


points = []

const USER = 0;
const FOURIER = 1;

let x = [];
let fourierX;
let time = 0;
let path = [];
let drawing = [];
let state = -1;
let lines
function preload() {
  // coords.txt must be in the same folder or /data
  lines = loadStrings("coords5.txt");
}


function mousePressed() {
  state = USER;
  drawing = [];
  x = [];
  time = 0;
  path = [];
  loop()
}

function mouseReleased() {
    drawing = []
 let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;

// Find bounds
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "") continue;
  let parts = lines[i].split(",");
  let x = float(parts[0]);
  let y = float(parts[1]);

  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
}

// Center of the shape
let cx = (minX + maxX) / 2;
let cy = (minY + maxY) / 2;

// Compute scale factor to fit canvas with 15% padding
let shapeWidth = maxX - minX;
let shapeHeight = maxY - minY;
let scaleFactor = (Math.min(width, height) * 0.85) / Math.max(shapeWidth, shapeHeight);

drawing = [];

// Map and scale points
for (let i = 0; i < lines.length; i+=1) {
  if (lines[i].trim() === "") continue;
  let parts = lines[i].split(",");
  let x = float(parts[0]);
  let y = float(parts[1]);

  // Center and scale
  let mx = (x - cx) * scaleFactor;
  let my = (y - cy) * scaleFactor;

  drawing.push(createVector(mx, my));
}

  state = FOURIER;
  const skip = 1;
  for (let i = 0; i < drawing.length; i += skip) {
    x.push(new Complex(drawing[i].x, drawing[i].y));
  }
  fourierX = dft(x);

  fourierX.sort((a, b) => b.amp - a.amp);
  print(drawing)
}

function setup() {
    pixelDensity(1)
  createCanvas(windowWidth, windowHeight);
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(64);
  text("Click!", width/2, height/2);
}

function epicycles(x, y, rotation, fourier) {
  for (let i = 0; i < fourier.length; i++) {
    let prevx = x;
    let prevy = y;
    let freq = fourier[i].freq;
    let radius = fourier[i].amp;
    let phase = fourier[i].phase;
    x += radius * cos(freq * time + phase + rotation);
    y += radius * sin(freq * time + phase + rotation);

    stroke(255, 100);
    noFill();
    ellipse(prevx, prevy, radius * 2);
    stroke(255);
    line(prevx, prevy, x, y);
  }
  return createVector(x, y);
}

function draw() {
for ( i  =0 ;i<1;i++){
  if (state == USER) {
  background(0);
    let point = createVector(mouseX - width / 2, mouseY - height / 2);
    drawing.push(point);
    stroke(255);
    noFill();
    beginShape();
    for (let v of drawing) {
      vertex(v.x + width / 2, v.y + height / 2);
    }
    endShape();
  } else if (state == FOURIER) {
    background(0); // Keeps the animation clean

    // 1. Draw the circles and lines (epicycles)
    let v = epicycles(width / 2, height / 2, 0, fourierX);
    
    // 2. Add the current tip position to the path
    path.unshift(v);

    // 3. Draw the actual purple path being traced
    beginShape();
    noFill();
    strokeWeight(2);
    stroke(255, 0, 255);
    for (let i = 0; i < path.length; i++) {
      vertex(path[i].x, path[i].y);
    }
    endShape();

    // 4. Update time
    const dt = TWO_PI / fourierX.length ;
    time += dt;

    // 5. STOP logic: If we have completed one full circle (TWO_PI)
    if (time >= TWO_PI) {
      time = 0; 
      noLoop(); // Stops the sketch exactly when the line meets its start
    }
//   background(0);
//     let v = epicycles(width / 2, height / 2, 0, fourierX);
//     path.unshift(v);
//     beginShape();
//     noFill();
//     strokeWeight(2);
//     stroke(255, 0, 255);
//     for (let i = 0; i < path.length; i++) {
//       vertex(path[i].x, path[i].y);
//     }
//     endShape();

//     const dt = TWO_PI / fourierX.length;
//     time += dt;

//     if (time > TWO_PI) {
//       time = 0;
//       path = [];
//     }
  }

}


}