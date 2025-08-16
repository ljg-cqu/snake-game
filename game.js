document.addEventListener('DOMContentLoaded', () => {
    // Game canvas setup
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');

    // Game constants
    const GRID_SIZE = 20;
    const GAME_SPEED = 150; // milliseconds
    
    // Game variables
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameInterval;
    let isGameRunning = false;
    let gameOver = false;

    // Initialize high score display
    highScoreElement.textContent = highScore;

    // Initialize game
    function initGame() {
        // Reset game state
        snake = [
            {x: 5 * GRID_SIZE, y: 10 * GRID_SIZE},
            {x: 4 * GRID_SIZE, y: 10 * GRID_SIZE},
            {x: 3 * GRID_SIZE, y: 10 * GRID_SIZE}
        ];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        gameOver = false;
        
        // Generate initial food
        generateFood();
        
        // Clear previous interval if exists
        if (gameInterval) {
            clearInterval(gameInterval);
        }
    }

    // Generate food at random position
    function generateFood() {
        // Generate random coordinates (making sure they align with the grid)
        const gridWidth = canvas.width / GRID_SIZE;
        const gridHeight = canvas.height / GRID_SIZE;
        
        let foodX, foodY;
        let foodOnSnake;
        
        // Keep generating until food is not on snake
        do {
            foodOnSnake = false;
            foodX = Math.floor(Math.random() * gridWidth) * GRID_SIZE;
            foodY = Math.floor(Math.random() * gridHeight) * GRID_SIZE;
            
            // Check if food is on snake
            for (let segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        food = { x: foodX, y: foodY };
    }

    // Draw everything on canvas
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Head is a different color
            if (index === 0) {
                ctx.fillStyle = '#4CAF50'; // Green head
            } else {
                ctx.fillStyle = '#8BC34A'; // Lighter green body
            }
            
            ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
            
            // Add a border to make segments more distinct
            ctx.strokeStyle = '#222';
            ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
        });
        
        // Draw food
        ctx.fillStyle = '#FF5722'; // Orange food
        ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
        
        // Draw game over message if game is over
        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '30px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
            
            ctx.font = '20px Arial';
            ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
            ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 80);
        }
    }

    // Update game state
    function update() {
        if (gameOver) return;
        
        // Update direction from nextDirection
        direction = nextDirection;
        
        // Calculate new head position based on current direction
        const head = { x: snake[0].x, y: snake[0].y };
        
        switch (direction) {
            case 'up':
                head.y -= GRID_SIZE;
                break;
            case 'down':
                head.y += GRID_SIZE;
                break;
            case 'left':
                head.x -= GRID_SIZE;
                break;
            case 'right':
                head.x += GRID_SIZE;
                break;
        }
        
        // Check for collisions with walls
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            handleGameOver();
            return;
        }
        
        // Check for collisions with self
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                handleGameOver();
                return;
            }
        }
        
        // Check if snake eats food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Generate new food
            generateFood();
            
            // Don't remove tail (snake grows)
        } else {
            // Remove tail segment (snake moves without growing)
            snake.pop();
        }
        
        // Add new head segment
        snake.unshift(head);
    }

    // Game loop
    function gameLoop() {
        update();
        draw();
    }

    // Handle game over
    function handleGameOver() {
        gameOver = true;
        isGameRunning = false;
        clearInterval(gameInterval);
        draw(); // Draw final state with game over message
    }

    // Start game
    function startGame() {
        if (!isGameRunning) {
            initGame();
            gameInterval = setInterval(gameLoop, GAME_SPEED);
            isGameRunning = true;
        }
    }

    // Restart game
    function restartGame() {
        initGame();
        if (isGameRunning) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, GAME_SPEED);
        } else {
            startGame();
        }
    }

    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Prevent default behavior for arrow keys (page scrolling)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        
        // Update direction based on key press
        // Prevent 180-degree turns (can't go directly opposite of current direction)
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
        }
    });

    // Initial draw
    initGame();
    draw();
});