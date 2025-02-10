const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
let slime;
let obstacles = [];
let score = 0;
let gameOver = false;
let animationFrame;

// Slime properties
class Slime {
  constructor() {
    this.x = canvas.width / 4;
    this.y = canvas.height / 2;
    this.radius = 30;
    this.color = "green";
    this.velocityY = 0;
    this.gravity = 0.5;
    this.jumpStrength = -10;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    // Ground collision
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.velocityY = 0;
    }
  }

  jump() {
    if (this.y + this.radius >= canvas.height) {
      this.velocityY = this.jumpStrength;
    }
  }
}

// Obstacle properties
class Obstacle {
  constructor() {
    this.width = 50;
    this.height = Math.random() * 100 + 50;
    this.x = canvas.width;
    this.y = canvas.height - this.height;
    this.speed = 5;
    this.color = "red";
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= this.speed;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  collidesWith(slime) {
    return (
      slime.x + slime.radius > this.x &&
      slime.x - slime.radius < this.x + this.width &&
      slime.y + slime.radius > this.y
    );
  }
}

// Initialize game
function init() {
  slime = new Slime();
  obstacles = [];
  score = 0;
  gameOver = false;
  scoreDisplay.textContent = "Score: 0";
  gameOverScreen.classList.add("hidden");
  animationFrame = requestAnimationFrame(update);
}

// Update game state
function update() {
  if (gameOver) {
    cancelAnimationFrame(animationFrame);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update slime
  slime.update();
  slime.draw();

  // Update obstacles
  if (Math.random() < 0.02) {
    obstacles.push(new Obstacle());
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].draw();

    // Check for collision
    if (obstacles[i].collidesWith(slime)) {
      gameOver = true;
      finalScore.textContent = score;
      gameOverScreen.classList.remove("hidden");
    }

    // Remove off-screen obstacles
    if (obstacles[i].isOffScreen()) {
      obstacles.splice(i, 1);
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  animationFrame = requestAnimationFrame(update);
}

// Jump on key press
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    slime.jump();
  }
});

// Restart game
restartButton.addEventListener("click", () => {
  init();
});

// Start the game
init();
