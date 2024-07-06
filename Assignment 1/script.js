const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const gameInfo = document.getElementById('gameInfo');
const coinsDisplay = document.getElementById('coins');
const lifelinesDisplay = document.getElementById('lifelines');
canvas.width = 600;
canvas.height = 800;

const roadWidth = 200;
const laneCount = 3;
const laneWidth = roadWidth / laneCount;

let bike = {
    x: canvas.width / 2 - roadWidth / 2 + laneWidth / 2 - 25,
    y: canvas.height - 150,
    width: 50,
    height: 100,
    speed: 5,
    maxSpeed: 10,
    lane: 1
};

let obstacles = [];
let coins = [];
let collectedCoins = 0;
let lifelines = 3;
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    KeyF: false
};

function drawBike() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(bike.x, bike.y, bike.width, bike.height);
}

function drawRoad() {
    ctx.fillStyle = 'gray';
    ctx.fillRect(canvas.width / 2 - roadWidth / 2, 0, roadWidth, canvas.height);

    for (let i = 1; i < laneCount; i++) {
        let x = canvas.width / 2 - roadWidth / 2 + laneWidth * i;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

function drawObstacles() {
    ctx.fillStyle = 'red';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        obstacle.y += bike.speed;
    });
}

function drawCoins() {
    ctx.fillStyle = 'gold';
    coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, 2 * Math.PI);
        ctx.fill();
        coin.y += bike.speed;
    });
}

function checkCollision() {
    obstacles.forEach((obstacle, index) => {
        if (
            bike.x < obstacle.x + obstacle.width &&
            bike.x + bike.width > obstacle.x &&
            bike.y < obstacle.y + obstacle.height &&
            bike.y + bike.height > obstacle.y
        ) {
            obstacles.splice(index, 1);
            lifelines--;
            lifelinesDisplay.textContent = `Lifelines: ${lifelines}`;
        }
    });

    coins.forEach((coin, index) => {
        if (
            bike.x < coin.x + coin.radius &&
            bike.x + bike.width > coin.x - coin.radius &&
            bike.y < coin.y + coin.radius &&
            bike.y + bike.height > coin.y - coin.radius
        ) {
            coins.splice(index, 1);
            collectedCoins++;
            coinsDisplay.textContent = `Coins: ${collectedCoins}`;
        }
    });
}

function update() {
    if (keys.Space) {
        bike.speed = bike.maxSpeed;
    } else {
        bike.speed = 5;
    }

    if (keys.ArrowLeft && bike.lane > 0) {
        bike.lane--;
        bike.x = canvas.width / 2 - roadWidth / 2 + laneWidth * bike.lane + (laneWidth - bike.width) / 2;
        keys.ArrowLeft = false; // To ensure smooth lane change
    }

    if (keys.ArrowRight && bike.lane < laneCount - 1) {
        bike.lane++;
        bike.x = canvas.width / 2 - roadWidth / 2 + laneWidth * bike.lane + (laneWidth - bike.width) / 2;
        keys.ArrowRight = false; // To ensure smooth lane change
    }

    if (keys.KeyF) {
        toggleFullscreen();
        keys.KeyF = false;
    }

    if (obstacles.length < 3 && Math.random() < 0.02) {
        let lane = Math.floor(Math.random() * laneCount);
        obstacles.push({
            x: canvas.width / 2 - roadWidth / 2 + laneWidth * lane + (laneWidth - bike.width) / 2,
            y: -100,
            width: bike.width,
            height: bike.height
        });
    }

    if (coins.length < 5 && Math.random() < 0.02) {
        let lane = Math.floor(Math.random() * laneCount);
        coins.push({
            x: canvas.width / 2 - roadWidth / 2 + laneWidth * lane + laneWidth / 2,
            y: -50,
            radius: 15
        });
    }

    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
    coins = coins.filter(coin => coin.y < canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoad();
    drawBike();
    drawObstacles();
    drawCoins();
    checkCollision();

    if (lifelines > 0) {
        requestAnimationFrame(update);
    } else {
        alert('Game Over! Refresh to play again.');
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().then(() => {
            gameInfo.style.position = 'fixed';
            gameInfo.style.top = '10px';
            gameInfo.style.left = '50%';
            gameInfo.style.transform = 'translateX(-50%)';
            gameInfo.style.zIndex = '10';
        });
    } else {
        document.exitFullscreen().then(() => {
            gameInfo.style.position = 'absolute';
            gameInfo.style.top = '10px';
            gameInfo.style.left = '50%';
            gameInfo.style.transform = 'translateX(-50%)';
            gameInfo.style.zIndex = '10';
        });
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code in keys) {
        keys[event.code] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code in keys) {
        keys[event.code] = false;
    }
});

startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    gameInfo.style.display = 'flex';
    canvas.style.display = 'block';
    canvas.requestFullscreen();
    update();
});
