const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

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

// Platform properties
const platforms = [
    { x: 0, y: 550, width: 200, height: 20 },
    { x: 300, y: 500, width: 200, height: 20 },
    { x: 600, y: 450, width: 200, height: 20 },
    { x: 100, y: 350, width: 200, height: 20 },
    { x: 500, y: 300, width: 200, height: 20 }
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
    platforms.forEach(platform => {
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
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#4CAF50';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw player
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
