let points = [];
let radius = 100;
let totalTargets = 100;
let simultaneousTargets = 1;
let targetsHit = 0;
let startTime;
let times = [];
let distances = [];
let state = "menu";
let playButton, resetButton, themeButton, targetSlider, multiSlider, radiusSlider;
let theme = "roknok-dark";

let themes = {
  "roknok-dark": { name: "Roknok's Sunset", bg: 0, text: 255, button: "#00aaff", target: ["#004466", "#0077aa", "#00ccff"] },
  "roknok-neon": { name: "Roknok's Neon", bg: "#111", text: "#0ff", button: "#f0f", target: ["#0ff", "#f0f", "#ff0"] },
  "roknok-retro": { name: "Roknok's Retro?", bg: "#2b2b2b", text: "#e6e600", button: "#ff6600", target: ["#ffcc00", "#ff9900", "#ff6600"] },
  "roknok-jungle": { name: "Roknok in Jungle", bg: "#1b3b2f", text: "#ccffcc", button: "#228B22", target: ["#88cc88", "#66bb66", "#339933"] },
  "roknok-fire": { name: "Roknok likes Fire", bg: "#220000", text: "#ffcccb", button: "#ff6600", target: ["#ff3300", "#ff6600", "#ff9900"] },
  "roknok-ice": { name: "Roknok thinks Ice is cool", bg: "#e0f7fa", text: "#006064", button: "#00bcd4", target: ["#4dd0e1", "#00acc1", "#00838f"] },
  "roknok-forest": { name: "Roknok's greener Forest", bg: "#0b3d0b", text: "#a5d6a7", button: "#66bb6a", target: ["#81c784", "#66bb6a", "#388e3c"] },
  "roknok-space": { name: "Roknok in Space", bg: "#000", text: "#ffffff", button: "#673ab7", target: ["#7e57c2", "#9575cd", "#d1c4e9"] },
  "roknok-sunset": { name: "Roknok's Love", bg: "#ffccbc", text: "#bf360c", button: "#ff7043", target: ["#ff8a65", "#ff5722", "#e64a19"] },
  "roknok-ocean": { name: "Roknok's Huge Ocean", bg: "#cfe8e8", text: "#004d40", button: "#00acc1", target: ["#26c6da", "#00acc1", "#00838f"] },
  "roknok-rose": { name: "Roknok's Sweetheart's Rose", bg: "#fce4ec", text: "#880e4f", button: "#f06292", target: ["#f8bbd0", "#ec407a", "#ad1457"] },
  "roknok-galaxy": { name: "Roknok's Galaxy", bg: "#1a237e", text: "#ffffff", button: "#7e57c2", target: ["#7986cb", "#5c6bc0", "#3f51b5"] },
  "roknok-lava": { name: "Roknok's fiery Lava", bg: "#3e2723", text: "#ffccbc", button: "#d84315", target: ["#ff7043", "#ff5722", "#bf360c"] },
  "roknok-lemon": { name: "Roknok favourite Lemon", bg: "#fefbd8", text: "#fdd835", button: "#fbc02d", target: ["#fff176", "#ffee58", "#fdd835"] },
  "roknok-grape": { name: "Roknok hates Grape", bg: "#ede7f6", text: "#4a148c", button: "#8e24aa", target: ["#ba68c8", "#ab47bc", "#8e24aa"] },
  "roknok-sky": { name: "Roknok beautiful Sky", bg: "#e1f5fe", text: "#0277bd", button: "#03a9f4", target: ["#4fc3f7", "#29b6f6", "#0288d1"] }
};

let themeList = Object.keys(themes);
let currentThemeIndex = themeList.indexOf(theme);

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupUI();
}

function setupUI() {
  playButton = createButton("▶ Start Aim Trainer");
  playButton.mousePressed(startGame);
  styleButton(playButton);

  resetButton = createButton("🔁 Reset");
  resetButton.mousePressed(resetGame);
  styleButton(resetButton);
  resetButton.hide();

  themeButton = createButton(`🎨 Change Theme`);
  themeButton.mousePressed(toggleTheme);
  styleButton(themeButton);

  targetSlider = createSlider(10, 100, 50, 1);
  targetSlider.style("width", "150px");

  multiSlider = createSlider(1, 10, 1, 1);
  multiSlider.style("width", "150px");

  radiusSlider = createSlider(20, 150, 100, 1);
  radiusSlider.style("width", "150px");
}

function styleButton(btn) {
  const t = themes[theme];
  btn.style("padding", "10px 20px");
  btn.style("font-size", "16px");
  btn.style("border-radius", "10px");
  btn.style("border", "none");
  btn.style("background-color", t.button);
  btn.style("color", "white");
  btn.style("cursor", "pointer");
}

function toggleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themeList.length;
  theme = themeList[currentThemeIndex];
  styleButton(playButton);
  styleButton(resetButton);
  styleButton(themeButton);
  targetSlider.style("accent-color", themes[theme].target[0]);
  multiSlider.style("accent-color", themes[theme].target[1]);
  radiusSlider.style("accent-color", themes[theme].target[2]);
}

function startGame() {
  totalTargets = targetSlider.value();
  simultaneousTargets = multiSlider.value();
  radius = radiusSlider.value();
  playButton.hide();
  themeButton.hide();
  targetSlider.hide();
  multiSlider.hide();
  radiusSlider.hide();
  state = "playing";
  targetsHit = 0;
  times = [];
  distances = [];
  spawnTargets();
}

function resetGame() {
  resetButton.hide();
  playButton.show();
  themeButton.show();
  targetSlider.show();
  multiSlider.show();
  radiusSlider.show();
  state = "menu";
  targetsHit = 0;
  times = [];
  distances = [];
}


function draw() {
  const t = themes[theme];
  background(t.bg);
  fill(t.text);
  noStroke();
  textAlign(CENTER);

  if (state === "menu") {
    textSize(32);
    text("Aim Trainer", width / 2, height / 2 - 180);

    textSize(16);
    text(`Select number of targets: ${targetSlider.value()}`, width / 2, height / 2 - 130);
    targetSlider.position(width / 2 - 75, height / 2 - 125);

    text(`Simultaneous targets: ${multiSlider.value()}`, width / 2, height / 2 - 90);
    multiSlider.position(width / 2 - 75, height / 2 - 85);

    text(`Target radius: ${radiusSlider.value()}`, width / 2, height / 2 - 50);
    radiusSlider.position(width / 2 - 75, height / 2 - 45);

    text(`Current Theme: ${themes[theme].name}`, width / 2, height / 2);

    playButton.position(width / 2 - 90, height / 2 + 20); 
    themeButton.position(width / 2 - 90, height / 2 + 70);
  } else if (state === "playing") {
    drawTargets();
    while (
      points.length < simultaneousTargets && 
      targetsHit + points.length < totalTargets
    ) {
      let newPt = generateNonOverlappingPoint();
      if (newPt) points.push(newPt);
    }
  } else if (state === "result") {
    textSize(24);
    let avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    let avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
    text("Average Time: " + nf(avgTime / 1000, 1, 3) + "s", width / 2, height / 2 - 20);
    text("Average Click Distance: " + nf(avgDist, 1, 2) + " px", width / 2, height / 2 + 20);
    resetButton.position(width / 2 - 40, height / 2 + 60);
  }
}


function drawTargets() {
  for (let pt of points) {
    drawTarget(pt);
  }
}

function drawTarget(pt) {
  let colors = themes[theme].target;
  fill(colors[0]);
  circle(pt[0], pt[1], radius);
  fill(colors[1]);
  circle(pt[0], pt[1], radius / 1.5);
  fill(colors[0]);
  circle(pt[0], pt[1], radius / 1.5 - 2);
  fill(colors[2]);
  circle(pt[0], pt[1], radius / 3);
  fill(colors[1]);
  circle(pt[0], pt[1], radius / 3 - 2);
}

function mousePressed() {
  if (state === "playing") {
    for (let i = points.length - 1; i >= 0; i--) {
      let d = dist(mouseX, mouseY, points[i][0], points[i][1]);
      if (d < radius / 2) {
        if (targetsHit === 0) {
          startTime = millis();
        } else {
          let t = millis() - startTime;
          times.push(t);
          startTime = millis();
        }

        distances.push(d);
        targetsHit++;
        points.splice(i, 1);

        if (targetsHit >= totalTargets) {
          state = "result";
          resetButton.show();
          return;
        }
      }
    }
    while (points.length < simultaneousTargets && targetsHit + points.length < totalTargets) {
      let newPt = generateNonOverlappingPoint();
      if (newPt) points.push(newPt);
    }
  }
}

function spawnTargets() {
  points = [];
  let attempts = 0;
  while (points.length < Math.min(simultaneousTargets, totalTargets) && attempts < 1000) {
    let pt = generateNonOverlappingPoint();
    if (pt) points.push(pt);
    attempts++;
  }
}


function generateNonOverlappingPoint() {
  for (let attempt = 0; attempt < 100; attempt++) {
    let newX = random(radius, windowWidth - radius);
    let newY = random(radius, windowHeight - radius);
    let overlapping = points.some(p => dist(p[0], p[1], newX, newY) < radius);
    if (!overlapping) return [newX, newY];
  }
  return null;
}
