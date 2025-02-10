const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hubContainer = document.getElementById('hubContainer');
const gameContainer = document.getElementById('gameContainer');
const playButton = document.getElementById('playButton');
const levelsButton = document.getElementById('levelsButton');
const levelsMenu = document.getElementById('levelsMenu');
const finishedPopup = document.getElementById('finishedPopup');
const nextLevelButton = document.getElementById('nextLevelButton');
const mainMenuButton = document.getElementById('mainMenuButton');
const currentLevelDisplay = document.getElementById('currentLevel');
const coinCounter = document.getElementById('coinCounter');
const livesCounter = document.getElementById('livesCounter');
const touchLeft = document.querySelector('.touch-left');
const touchRight = document.querySelector('.touch-right');
const touchJump = document.querySelector('.touch-jump');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let currentLevel = 0;
let score = 0;
let lives = 3;
const unlockedLevels = [0]; // Start with level 0 unlocked

// Player properties
const player = {
    x: 100,
    y: 100,
    width: 16,
    height: 16,
    speed: 0.3,
    maxSpeed: 5,
    jumpForce: 12,
    gravity: 0.5,
    velocityX: 0,
    velocityY: 0,
    canDoubleJump: true,
    isGrounded: false
};

// Load images
const images = {
    player: new Image(),
    dirt: new Image(),
    grass: new Image(),
    finish: new Image()
};

images.player.src = 'assets/images/player.png';
images.dirt.src = 'assets/images/dirt.png';
images.grass.src = 'assets/images/grass.png';
images.finish.src = 'assets/images/finish.png';

// Levels
const levels = [
    // Level 1 - Basic introduction
    {
        platforms: [
            {x: 0, y: 550, width: 800, height: 16, type: 'dirt'}
        ],
        finish: {x: 700, y: 500, width: 16, height: 16}
    },

    // Level 2 - Moving platforms
    {
        platforms: [
            {x: 0, y: 550, width: 200, height: 16, type: 'grass'},
            {x: 600, y: 550, width: 200, height: 16, type: 'grass'}
        ],
        movingPlatforms: [
            {x: 200, y: 500, width: 400, height: 16, speed: 2, direction: 1, type: 'dirt'}
        ],
        finish: {x: 700, y: 400, width: 16, height: 16}
    },

    // Level 3 - Spikes and gaps
    {
        platforms: [
            {x: 0, y: 550, width: 200, height: 16, type: 'dirt'},
            {x: 300, y: 550, width: 200, height: 16, type: 'dirt'},
            {x: 600, y: 550, width: 200, height: 16, type: 'dirt'}
        ],
        spikes: [
            {x: 250, y: 530, width: 40, height: 20}
        ],
        finish: {x: 700, y: 500, width: 16, height: 16}
    },

    // Add more levels here...
];

// Input handling
const keys = {
    right: false,
    left: false,
    up: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowUp') keys.up = false;
});

// Touch controls
touchLeft.addEventListener('touchstart', () => keys.left = true);
touchLeft.addEventListener('touchend', () => keys.left = false);
touchRight.addEventListener('touchstart', () => keys.right = true);
touchRight.addEventListener('touchend', () => keys.right = false);
touchJump.addEventListener('touchstart', () => keys.up = true);
touchJump.addEventListener('touchend', () => keys.up = false);

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Reset player position
function resetPlayer() {
    player.x = 100;
    player.y = 100;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isGrounded = false;
}

// Load a level
function loadLevel(levelIndex) {
    if (levelIndex >= levels.length || !unlockedLevels.includes(levelIndex)) return;
    currentLevel = levelIndex;
    resetPlayer();
    gameContainer.classList.remove('hidden');
    hubContainer.classList.add('hidden');
    finishedPopup.classList.add('hidden');
    currentLevelDisplay.textContent = currentLevel + 1;
}

// Show finished popup
function showFinishedPopup() {
    finishedPopup.classList.remove('hidden');
}

// Check if player reaches the finish block
function checkFinish() {
    const finish = levels[currentLevel].finish;
    if (checkCollision(player, finish)) {
        showFinishedPopup();
        if (!unlockedLevels.includes(currentLevel + 1)) {
            unlockedLevels.push(currentLevel + 1);
            updateLevelsMenu();
        }
    }
}

// Update levels menu
function updateLevelsMenu() {
    levelsMenu.innerHTML = '';
    levels.forEach((_, index) => {
        const button = document.createElement
