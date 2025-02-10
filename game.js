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

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let currentLevel = 0;
const unlockedLevels = [0]; // Start with level 0 unlocked

// Player properties
const player = {
    x: 100,
    y: 100,
    width: 40,
    height: 40,
    speed: 5,
    jumpForce: 15,
    gravity: 0.8,
    velocityY: 0,
    isJumping: false
};

// Levels
const levels = [
    {
        platforms: [
            { x: 0, y: 550, width: 200, height: 20 },
            { x: 300, y: 500, width: 200, height: 20 },
            { x: 600, y: 450, width: 200, height: 20 }
        ],
        finish: { x: 700, y: 400, width: 40, height: 40 }
    },
    {
        platforms: [
            { x: 0, y: 550, width: 150, height: 20 },
            { x: 250, y: 450, width: 150, height: 20 },
            { x: 500, y: 350, width: 150, height: 20 }
        ],
        finish: { x: 600, y: 300, width: 40, height: 40 }
    },
    {
        platforms: [
            { x: 0, y: 550, width: 100, height: 20 },
            { x: 200, y: 450, width: 100, height: 20 },
            { x: 400, y: 350, width: 100, height: 20 },
            { x: 600, y: 250, width: 100, height: 20 }
        ],
        finish: { x: 700, y: 200, width: 40, height: 40 }
    },
    {
        platforms: [
            { x: 0, y: 550, width: 200, height: 20 },
            { x: 300, y: 450, width: 200, height: 20 },
            { x: 600, y: 350, width: 200, height: 20 }
        ],
        finish: { x: 700, y: 300, width: 40, height: 40 }
    },
    {
        platforms: [
            { x: 0, y: 550, width: 200, height: 20 },
            { x: 300, y: 450, width: 200, height: 20 },
            { x: 600, y: 350, width: 200, height: 20 }
        ],
        finish: { x: 700, y: 300, width: 40, height: 40 }
    }
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
    player.velocityY = 0;
    player.isJumping = false;
}

// Load a level
function loadLevel(levelIndex) {
    if (levelIndex >= levels.length || !unlockedLevels.includes(levelIndex)) return;
    currentLevel = levelIndex;
    resetPlayer();
    gameContainer.classList.remove('hidden');
    hubContainer.classList.add('hidden');
    finishedPopup.classList.add('hidden');
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
        const button = document.createElement('button');
        button.textContent = `Level ${index + 1}`;
        if (unlockedLevels.includes(index)) {
            button.classList.add('unlocked');
            button.addEventListener('click', () => loadLevel(index));
        } else {
            button.classList.add('locked');
        }
        levelsMenu.appendChild(button);
    });
}

// Game loop
function update() {
    // Horizontal movement
    if (keys.right) player.x += player.speed;
    if (keys.left) player.x -= player.speed;

    // Jumping
    if (keys.up && !player.isJumping) {
        player.velocityY = -player.jumpForce;
        player.isJumping = true;
    }

    // Apply gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Platform collision
    player.isJumping = true;
    levels[currentLevel].platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0) {
                player.isJumping = false;
                player.velocityY = 0;
                player.y = platform.y - player.height;
            }
        }
    });

    // Keep player in bounds
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.isJumping = false;
        player.velocityY = 0;
    }

    // Check if player reaches the finish
    checkFinish();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#4CAF50';
    levels[currentLevel].platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw finish block
    const finish = levels[currentLevel].finish;
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(finish.x, finish.y, finish.width, finish.height);

    // Draw player
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners for buttons
playButton.addEventListener('click', () => loadLevel(0));
levelsButton.addEventListener('click', () => {
    levelsMenu.style.display = 'flex';
    updateLevelsMenu();
});

nextLevelButton.addEventListener('click', () => {
    loadLevel(currentLevel + 1);
});

mainMenuButton.addEventListener('click', () => {
    gameContainer.classList.add('hidden');
    hubContainer.classList.remove('hidden');
    finishedPopup.classList.add('hidden');
});

// Start the game
gameLoop();
