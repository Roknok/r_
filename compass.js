const needle = document.getElementById("needle");

let pointerX = 0;
let pointerY = 0;

// Direction order: N → E → W → S
const directions = ["N", "E", "W", "S"];

const directionRanges = {
  N: [337.5, 22.5],
  E: [67.5, 112.5],
  W: [247.5, 292.5],
  S: [157.5, 202.5]
};

const holdduration = 500;
let index = 0;
let prevdir = null;
let ltime = null;

function getAngle(cx, cy, ex, ey) {
  const dy = ey - cy;
  const dx = ex - cx;
  let theta = Math.atan2(dy, dx) * 180 / Math.PI;
  theta += 90;
  if (theta < 0) theta += 360;
  return theta;
}

function isInRange(angle, [min, max]) {
  return min > max
    ? angle >= min || angle <= max
    : angle >= min && angle <= max;
}

document.addEventListener("mousemove", (e) => {
  pointerX = e.clientX;
  pointerY = e.clientY;
});

document.addEventListener("touchstart", (e) => {
  if (e.touches.length > 0) {
    pointerX = e.touches[0].clientX;
    pointerY = e.touches[0].clientY;
  }
}, { passive: true });

document.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    pointerX = e.touches[0].clientX;
    pointerY = e.touches[0].clientY;
  }
}, { passive: true });

function updateGlow(index) {
  const directionIds = ["N", "E", "W", "S"];
  directionIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (i <= index - 1) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });

  if (index >= directions.length) {
    triggerFinalScreen();
  }
}

function triggerFinalScreen() {
  const elementsToFade = [
    document.querySelector('.directions'),
    document.querySelector('.compass'),
    document.querySelector('h1')
  ];

  elementsToFade.forEach(el => {
    el.style.transition = "opacity 1s ease";
    el.style.opacity = 0;
  });

  setTimeout(() => {
    elementsToFade.forEach(el => el.style.display = "none");
    const final = document.getElementById("final-screen");
    final.style.display = "block";
    setTimeout(() => {
      final.style.opacity = 1;
    }, 50);
  }, 1000);
}

function update() {
  const compass = needle.parentElement.getBoundingClientRect();
  const cx = compass.left + compass.width / 2;
  const cy = compass.top + compass.height / 2;

  const angle = getAngle(cx, cy, pointerX, pointerY);
  needle.style.transform = `rotate(${angle}deg)`;

  let currentDir = null;
  for (const dir of directions) {
    if (isInRange(angle, directionRanges[dir])) {
      currentDir = dir;
      break;
    }
  }

  if (!currentDir) {
    prevdir = null;
    ltime = null;
  } else {
    if (currentDir === prevdir) {
      if (ltime && Date.now() - ltime >= holdduration) {
        if (directions[index] === currentDir) {
          index++;
          updateGlow(index);
        } else {
          index = 0;
          updateGlow(index);
        }
        ltime = null;
      }
    } else {
      ltime = Date.now();
    }
    prevdir = currentDir;
  }

  requestAnimationFrame(update);
}

requestAnimationFrame(update);
