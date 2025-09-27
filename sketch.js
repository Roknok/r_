let disks = [];
let grabbedDisk = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(16);
  noStroke();
}

function draw() {
  background(20, 40, 70, 60);

  for (let i = 0; i < disks.length; i++) {
    let d1 = disks[i];

    if (d1 !== grabbedDisk) d1.move();
    d1.display();

    for (let j = i + 1; j < disks.length; j++) {
      let d2 = disks[j];
      if (d1.checkCollision(d2)) {
        let relVel = p5.Vector.sub(d1.vel, d2.vel).mag();
        d1.resolveCollision(d2);

        // Play note for both disks on collision
        playNote(d1.freq, relVel);
        playNote(d2.freq, relVel);
      }
    }
  }
}

function mousePressed() {
  for (let d of disks) {
    if (dist(mouseX, mouseY, d.pos.x, d.pos.y) < d.r) {
      grabbedDisk = d;
      d.vel.set(0, 0);
      return;
    }
  }
  let r = random(30, 70);
  disks.push(new Disk(r, createVector(mouseX, mouseY)));
}

function mouseDragged() {
  if (grabbedDisk) grabbedDisk.pos.set(mouseX, mouseY);
}

function mouseReleased() {
  if (grabbedDisk) {
    let mouseVel = createVector(mouseX - pmouseX, mouseY - pmouseY);
    grabbedDisk.vel = mouseVel.mult(0.5);
    grabbedDisk = null;
  }
}

function playNote(freq, force) {
  let amp = constrain(map(force, 0, 10, 0.1, 0.6), 0.05, 0.6);
  let release = constrain(map(force, 0, 10, 0.3, 1.5), 0.1, 1.5);

  let osc = new p5.Oscillator('triangle');
  let env = new p5.Envelope();

  env.setADSR(0.05, 0.2, 0.2, release);
  env.setRange(amp, 0);

  osc.freq(freq);
  osc.start();
  env.play(osc, 0, 0.5);

  setTimeout(() => osc.stop(), (release + 1) * 1000);
}

// Convert frequency to note name
function freqToNoteName(freq) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const A4 = 440;
  const semitone = 12 * Math.log2(freq / A4);
  const midi = Math.round(69 + semitone);
  const octave = Math.floor(midi / 12) - 1;
  const note = notes[midi % 12];
  return note + octave;
}

class Disk {
  constructor(r, pos) {
    this.r = r;
    this.pos = pos || createVector(random(r, width - r), random(r, height - r));
    this.vel = p5.Vector.random2D().mult(random(1, 2));
    this.col = color(random(100, 255), random(100, 255), random(150, 255), 200);

    // Frequency now spans C3 (130.81 Hz) to C6 (1046.50 Hz)
    this.freq = map(this.r, 30, 70, 130.81, 1046.50);
    this.noteName = freqToNoteName(this.freq);
  }

  move() {
    this.pos.add(this.vel);

    // Edge collision - bounce and play its own frequency
    let hit = false;
    if (this.pos.x < this.r) {
      this.vel.x *= -1;
      this.pos.x = this.r;
      hit = true;
    }
    if (this.pos.x > width - this.r) {
      this.vel.x *= -1;
      this.pos.x = width - this.r;
      hit = true;
    }
    if (this.pos.y < this.r) {
      this.vel.y *= -1;
      this.pos.y = this.r;
      hit = true;
    }
    if (this.pos.y > height - this.r) {
      this.vel.y *= -1;
      this.pos.y = height - this.r;
      hit = true;
    }

    if (hit) {
      playNote(this.freq, 2); // small force for edge hit
    }
  }

  display() {
    fill(this.col);
    ellipse(this.pos.x, this.pos.y, this.r * 2);

    stroke(0);
    strokeWeight(2);
    fill(255);
    text(this.noteName, this.pos.x, this.pos.y);
    noStroke();
  }

  checkCollision(other) {
    return dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < this.r + other.r;
  }

  resolveCollision(other) {
    let normal = p5.Vector.sub(this.pos, other.pos);
    let distBetween = normal.mag();
    if (distBetween === 0) return;
    let overlap = (this.r + other.r) - distBetween;

    normal.normalize();

    this.pos.add(normal.copy().mult(overlap / 2));
    other.pos.sub(normal.copy().mult(overlap / 2));

    let relativeVelocity = p5.Vector.sub(this.vel, other.vel);
    let sepVel = relativeVelocity.dot(normal);
    if (sepVel < 0) {
      let impulse = normal.mult(sepVel);
      this.vel.sub(impulse);
      other.vel.add(impulse);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
