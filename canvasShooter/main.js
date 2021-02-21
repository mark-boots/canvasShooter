//canvas setup
const canvas = document.querySelector("#canvasShooter");
const canvasBounding = canvas.getBoundingClientRect();
canvas.width = canvasBounding.width;
canvas.height = canvasBounding.height;
const ctx = canvas.getContext("2d");

//ui setup
const controllMute = document.querySelector("#controlls .mute");
const startScreen = document.querySelector("#startscreen");
const startButton = document.querySelector("#startbutton");
const liveScore = document.querySelector("#livepoints");
const endScore = document.querySelector("#endscore");
const liveLevel = document.querySelector("#livelevel");
//events setup
setUpEventListeners();

//images sounds setup
const imagesSrc = {
  player: "./canvasShooter/images/logo.png",
  projectile: "./canvasShooter/images/reet.png",
  enemies: {
    enemy1: "./canvasShooter/images/nick.png",
    enemy2: "./canvasShooter/images/syl.png",
    enemy3: "./canvasShooter/images/rene.png",
  },
};

const soundsSrc = {
  start: document.querySelector("#audio_start"),
  destroy: document.querySelector("#audio_destroy"),
  shoot: document.querySelector("#audio_shoot"),
  kill: document.querySelector("#audio_kill"),
};

//custom options
let playerOptions = {};
let projectilesOptions = {};
let enemiesOptions = {};

// globals
let player, animies, enemiesInterval, projectiles, paricles;
let loopId, loopFrameNr;
let gameOver = true,
  gamePoints,
  gamePaused,
  gameMuted = false,
  gameLevel = 1,
  gameLevelUpOn = 25,
  gameLevelPoints = 0;
let images;

//load and start
loadImages(imagesSrc);
async function loadImages(imagesSrc) {
  images = await loadImagesRecursive(imagesSrc);
  startScreen.style.display = "flex";
}

async function startGame() {
  //reset globals
  player = new Player();
  drawBackground();
  player.draw();
  enemies = [];
  enemiesInterval = 1 * 60; // ± 60 frames per second
  projectiles = [];
  particles = [];

  loopId;
  loopFrameNr = 0;
  loopStopped = false;

  gameOver = false;
  gamePoints = 0;
  updateScore();
  gamePaused = false;

  resetLevel();

  playSound("start");
  let countdownCount = 3;
  endScore.innerHTML = countdownCount;
  let promise = new Promise((res, rej) => {
    let countdown = setInterval(() => {
      if (countdownCount == 1) {
        clearInterval(countdown);
        res("done");
      } else {
        countdownCount--;
        endScore.innerHTML = countdownCount;
      }
    }, 1500);
  });

  let result = await promise;
  startScreen.style.display = "none";
  endScore.innerHTML = 0;
  gameloop();
}

function gameloop() {
  if (!gamePaused) {
    //clear canvas
    drawBackground();

    //create enemie per given interval
    if (gameLevelPoints % gameLevelUpOn == 0 && gameLevelPoints !== 0)
      levelUp();
    if (loopFrameNr % enemiesInterval == 0) enemies.push(new Enemy());

    //draw player
    player.draw();

    //update and draw projectiles
    projectiles.forEach((projectile, index) => {
      projectile.update();
      projectile.offScreen()
        ? removeFromArray(projectiles, index)
        : projectile.draw();
    });

    //update and draw enemies
    enemies.forEach((enemy, index) => {
      enemy.update();
      if (enemy.destroyed) {
        playSound("destroy");
        removeFromArray(enemies, index);
        gameLevelPoints++;
      } else {
        enemy.draw();
      }
      if (checkCollision(player, enemy)) {
        gameOver = true;
        endGame();
      }
    });

    //update and draw particles
    particles.forEach((particle, index) => {
      particle.update();
      if (particle.alpha <= 0) removeFromArray(particles, index);
      else particle.draw();
    });

    //check if game is stopped
  }
  if (gameOver) cancelAnimationFrame(loopId);
  else {
    loopFrameNr++;
    loopId = requestAnimationFrame(gameloop);
  }
}

//general functions
function getMousePos(e) {
  const x = e.clientX - canvasBounding.left;
  const y = e.clientY - canvasBounding.top;
  return [x, y];
}
function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function getAngleBetweenPoints(startX, startY, targetX, targetY) {
  return Math.atan2(targetY - startY, targetX - startX);
}
function getVelocityByAngle(angle, speed) {
  return { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
}
function getRandomSizeBetween(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomColor() {
  return `hsl(${Math.random() * 360},50%,50%`;
}
function checkCollision(obj1, obj2) {
  const dist = Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y);
  coll = dist - obj1.radius - obj2.radius < 1;
  return coll;
}
function endGame() {
  playSound("kill");
  startScreen.style.display = "flex";
  startButton.style.display = "inline-block";
}
function removeFromArray(array, index) {
  setTimeout(() => {
    array.splice(index, 1);
  }, 0);
}
function updateScore(points = 0) {
  gamePoints += points;
  liveScore.innerHTML = gamePoints.toLocaleString();
  endScore.innerHTML = gamePoints.toLocaleString();
}
async function loadImagesRecursive(obj) {
  if (typeof obj === "string")
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = obj;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  return typeof obj === "object"
    ? Promise.all(
        Object.entries(obj).map(async ([key, val]) => [
          key,
          await loadImagesRecursive(val),
        ])
      ).then((arr) => arr.reduce((obj, [k, v]) => (obj[k] = v) && obj, {}))
    : null;
}

function playSound(type) {
  if (!gameMuted) {
    let sound = soundsSrc[type].cloneNode();
    sound.play();
  }
}

let countdownCount = 3;
let countdown;
function setUpEventListeners() {
  //startgame button
  startButton.addEventListener("click", () => {
    startGame();
    startButton.style.display = "none";
  });

  //turn player in direction of mouse
  canvas.addEventListener("mousemove", (e) => {
    if (!gameOver && !gamePaused) {
      player.updateAngle(...getMousePos(e));
    }
  });

  //shoot projectile mouseclick
  canvas.addEventListener("click", (e) => {
    if (!gameOver && !gamePaused) {
      playSound("shoot");
      projectiles.push(new Projectile(player.x, player.y, ...getMousePos(e)));
    }
  });

  //keyboard Controlls
  window.addEventListener("keydown", (e) => {
    if (e.code == "Space") gamePaused = !gamePaused;
    else if (e.code == "KeyS") muteGame();
  });

  //canvas Controlls
  controllMute.addEventListener("click", () => {
    muteGame();
  });
}

function muteGame() {
  gameMuted = !gameMuted;
  state = gameMuted ? "on" : "off";
  controllMute.setAttribute("data-state", state);
}

function resetLevel() {
  gameLevel = 1;
  gameLevelPoints = 0;
  liveLevel.innerHTML = gameLevel;
}
function levelUp() {
  enemiesInterval = Math.floor(enemiesInterval * 0.98);
  console.log(enemiesInterval);
  gameLevel++;
  gameLevelPoints = 0;
  liveLevel.innerHTML = gameLevel;
}
