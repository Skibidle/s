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
    x: 0, // Player is always at x = 0 (center of the screen)
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

// Camera properties
const camera = {
    x: 0, // Camera's x position in the level
    y: 0, // Camera's y position in the level
    width: canvas.width,
    height: canvas.height
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

// Wait for all images to load
let imagesLoaded = 0;
Object.values(images).forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === Object.keys(images).length) {
            console.log('All images loaded!');
            gameLoop(); // Start the game once all images are loaded
        }
    };
    img.onerror = () => {
        console.error('Failed to load image:', img.src);
    };
});

// Levels
const levels = [
    // Level 1 - Basic introduction
    {
        platforms: [
            {x: 0, y: 550, width: 2000, height: 16, type: 'grass'}, // Longer level
            {x: 0, y: 566, width: 2000, height: 16, type: 'dirt'} // Dirt below grass
        ],
        finish: {x: 1900, y: 534, width: 16, height: 16} // Finish block at the end
    },

    // Level 2 - Moving platforms
    {
        platforms: [
            {x: 0, y: 550, width: 2000, height: 16, type: 'grass'},
            {x: 0, y: 566, width: 2000, height: 16, type: 'dirt'}, // Dirt below grass
            {x: 500, y: 450, width: 200, height: 16, type: 'grass'},
            {x: 500, y: 466, width: 200, height: 16, type: 'dirt'}, // Dirt below grass
            {x: 1000, y: 350, width: 200, height: 16, type: 'grass'},
            {x: 1000, y: 366, width: 200, height: 16, type: 'dirt'} // Dirt below grass
        ],
        movingPlatforms: [
            {x: 200, y: 500, width: 400, height: 16, speed: 2, direction: 1, type: 'grass'},
            {x: 200, y: 516, width: 400, height: 16, speed: 2, direction: 1, type: 'dirt'} // Dirt below grass
        ],
        finish: {x: 1900, y: 534, width: 16, height: 16} // Finish block at the end
    },

    // Level 3 - Spikes and gaps
    {
        platforms: [
            {x: 0, y: 550, width: 2000, height: 16, type: 'grass'},
            {x: 0, y: 566, width: 2000, height: 16, type: 'dirt'}, // Dirt below grass
            {x: 300, y: 450, width: 200, height: 16, type: 'grass'},
            {x: 300, y: 466, width: 200, height: 16, type: 'dirt'}, // Dirt below grass
            {x: 600, y: 350, width: 200, height: 16, type: 'grass'},
            {x: 600, y: 366, width: 200, height: 16, type: 'dirt'} // Dirt below grass
        ],
        spikes: [
            {x: 250, y: 530, width: 40, height: 20},
            {x: 550, y: 430, width: 40, height: 20},
            {x: 850, y: 330, width: 40, height: 20}
        ],
        finish: {x: 1900, y: 534, width: 16, height: 16} // Finish block at the end
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
    player.x = 0; // Player is always at x = 0
    player.y = 100;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isGrounded = false;
}

// Update camera position
function updateCamera() {
    // Camera follows the player
    camera.x = player.x - canvas.width / 2;

    // Clamp camera to level bounds
    const currentLevelData = levels[currentLevel];
    const levelWidth = currentLevelData.platforms[0].width; // Assume first platform defines level width
    camera.x = Math.max(0, Math.min(camera.x, levelWidth - canvas.width));
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
    handleMovement();
    handleCollisions();
    checkFinish();
    updateCamera();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    levels[currentLevel].platforms.forEach(platform => {
        const img = platform.type === 'grass' ? images.grass : images.dirt;
        for (let i = 0; i < platform.width / 16; i++) {
            ctx.drawImage(img, platform.x - camera.x + i * 16, platform.y, 16, 16);
        }
    });

    // Draw moving platforms
    levels[currentLevel].movingPlatforms?.forEach(platform => {
        const img = platform.type === 'grass' ? images.grass : images.dirt;
        for (let i = 0; i < platform.width / 16; i++) {
            ctx.drawImage(img, platform.x - camera.x + i * 16, platform.y, 16, 16);
        }
    });

    // Draw finish block
    const finish = levels[currentLevel].finish;
    ctx.drawImage(images.finish, finish.x - camera.x, finish.y, finish.width, finish.height);

    // Draw player
    ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
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
