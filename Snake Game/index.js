// Game variables
let canvas = document.getElementById('game-board');
let ctx = canvas.getContext('2d');
let gameSpeed = 150;
let minGameSpeed = 50;
let speedIncrease = 5;
let gridSize = 20;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval = null;
let isPaused = false;
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

// DOM elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Mobile controls
const upBtn = document.getElementById('upBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');

// how to play drop down
let dropDown = document.getElementById('drop-down');
let dropDownContent = document.getElementById('drop-down-content');
dropDown.addEventListener('click', () => {
    dropDown.classList.toggle('active');
    dropDownContent.classList.toggle('active');
});

// Initialize game
function initGame() {
    // Set canvas size
    const size = Math.min(
        window.innerWidth - 40,
        window.innerHeight - 300,
        600
    );
    canvas.width = size;
    canvas.height = size;

    // Calculate grid size based on canvas size
    gridSize = Math.max(15, Math.floor(size / 25));

    resetGame();
    drawGame();

    // Set high score display
    highScoreElement.textContent = highScore;
}

// Reset game state
function resetGame() {
    // Clear any existing game interval
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }

    // Reset snake
    const startX = Math.floor(canvas.width / gridSize / 2) * gridSize;
    const startY = Math.floor(canvas.height / gridSize / 2) * gridSize;
    snake = [
        { x: startX, y: startY },
        { x: startX - gridSize, y: startY },
        { x: startX - gridSize * 2, y: startY }
    ];

    // Reset direction
    direction = 'right';
    nextDirection = 'right';

    // Reset game state
    isPaused = false;
    isGameOver = false;
    gameSpeed = 150;
    score = 0;
    scoreElement.textContent = score;

    // Generate first food
    generateFood();

    // Hide game over screen
    gameOverScreen.style.display = 'none';

    // Update button states
    startBtn.textContent = 'Restart Game';
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
}

// Start the game
function startGame() {
    if (isGameOver) {
        resetGame();
    }

    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, gameSpeed);
    } else if (isPaused) {
        isPaused = false;
        pauseBtn.textContent = 'Pause';
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// Pause the game
function pauseGame() {
    if (!isPaused && !isGameOver) {
        clearInterval(gameInterval);
        gameInterval = null;
        isPaused = true;
        pauseBtn.textContent = 'Resume';
    } else if (isPaused) {
        startGame();
    }
}

// Main game loop
function gameLoop() {
    if (isGameOver) {
        clearInterval(gameInterval);
        gameInterval = null;
        return;
    }

    moveSnake();
    checkCollision();
    drawGame();
}

// Move the snake
function moveSnake() {
    // Update direction
    direction = nextDirection;

    // Get head position
    const head = { x: snake[0].x, y: snake[0].y };

    // Move head based on direction
    switch (direction) {
        case 'up':
            head.y -= gridSize;
            break;
        case 'down':
            head.y += gridSize;
            break;
        case 'left':
            head.x -= gridSize;
            break;
        case 'right':
            head.x += gridSize;
            break;
    }

    // Add new head
    snake.unshift(head);

    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score++;
        scoreElement.textContent = score;

        // Increase speed (up to a point)
        if (gameSpeed > minGameSpeed) {
            gameSpeed -= speedIncrease;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }

        // Generate new food
        generateFood();
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }
}

// Check for collisions
function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width ||
        head.y >= canvas.height
    ) {
        gameOver();
        return;
    }

    // Self collision (skip first 3 segments to prevent false collision on quick turns)
    for (let i = 3; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// Game over
function gameOver() {
    isGameOver = true;
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }

    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }

    // Show game over screen
    finalScoreElement.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'flex';
}

// Generate food at random position
function generateFood() {
    // Find all possible positions
    const possiblePositions = [];
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            possiblePositions.push({ x, y });
        }
    }

    // Filter out positions occupied by the snake
    const availablePositions = possiblePositions.filter(pos => {
        return !snake.some(segment => segment.x === pos.x && segment.y === pos.y);
    });

    // Select random position
    if (availablePositions.length > 0) {
        food = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    } else {
        // If no positions left (snake filled the board), player wins!
        gameOver();
    }
}

// Draw the game
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (optional)
    ctx.strokeStyle = 'rgba(127, 140, 141, 0.1)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        // Head is a different color
        if (index === 0) {
            ctx.fillStyle = '#3498db';
        } else {
            // Body gets slightly darker
            const darkness = Math.min(50 + index * 2, 100);
            ctx.fillStyle = `rgba(52, 152, 219, ${1 - darkness / 200})`;
        }

        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);

        // Add border to segments
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
    });

    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    const centerX = food.x + gridSize / 2;
    const centerY = food.y + gridSize / 2;
    const radius = gridSize / 2 - 2;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Add shine effect to food
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
        centerX - radius / 3,
        centerY - radius / 3,
        radius / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', () => {
    resetGame();
    startGame();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    // Prevent default for arrow keys to stop page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    // Don't allow direction changes when paused or game over
    if (isPaused || isGameOver) return;

    // Prevent 180-degree turns
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            // Space bar to pause
            pauseGame();
            break;
    }
});

// Mobile controls
upBtn.addEventListener('click', () => {
    if (direction !== 'down') nextDirection = 'up';
});

leftBtn.addEventListener('click', () => {
    if (direction !== 'right') nextDirection = 'left';
});

rightBtn.addEventListener('click', () => {
    if (direction !== 'left') nextDirection = 'right';
});

downBtn.addEventListener('click', () => {
    if (direction !== 'up') nextDirection = 'down';
});

// Handle window resize
window.addEventListener('resize', () => {
    initGame();
    if (!isGameOver && !isPaused) {
        drawGame();
    }
});

// Initialize the game
initGame();
