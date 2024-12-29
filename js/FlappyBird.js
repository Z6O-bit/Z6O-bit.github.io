const FlappyBird = {
    canvas: null,
    ctx: null,
    bird: {
        x: 50,
        y: 150,
        velocity: 0,
        gravity: 0.5,
        jump: -8,
        size: 20
    },
    pipes: [],
    score: 0,
    highScore: 0,
    gameLoop: null,
    isGameOver: true,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        // 加载最高分
        this.highScore = parseInt(localStorage.getItem('flappyBirdHighScore')) || 0;
        document.getElementById('highScore').textContent = this.highScore;

        // 添加点击/触摸事件
        this.canvas.addEventListener('click', () => this.birdJump());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.birdJump();
        });
    },

    startGame() {
        if (!this.isGameOver) return;
        
        this.resetGame();
        this.isGameOver = false;
        this.gameLoop = setInterval(() => this.update(), 20);
    },

    resetGame() {
        this.bird.y = 150;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        document.getElementById('score').textContent = '0';
        this.addPipe();
    },

    birdJump() {
        if (!this.isGameOver) {
            this.bird.velocity = this.bird.jump;
        }
    },

    addPipe() {
        const gap = 120;
        const minHeight = 50;
        const maxHeight = this.canvas.height - gap - minHeight;
        const height = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

        this.pipes.push({
            x: this.canvas.width,
            y: 0,
            width: 50,
            height: height,
            passed: false
        });

        this.pipes.push({
            x: this.canvas.width,
            y: height + gap,
            width: 50,
            height: this.canvas.height - height - gap
        });
    },

    update() {
        // 更新鸟的位置
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;

        // 检查碰撞
        if (this.checkCollision()) {
            this.gameOver();
            return;
        }

        // 更新管道位置
        this.pipes.forEach(pipe => {
            pipe.x -= 2;
        });

        // 移除超出屏幕的管道
        if (this.pipes[0].x < -50) {
            this.pipes.splice(0, 2);
            this.addPipe();
        }

        // 检查得分
        if (!this.pipes[0].passed && this.pipes[0].x < this.bird.x) {
            this.score++;
            this.pipes[0].passed = true;
            document.getElementById('score').textContent = this.score;
        }

        // 绘制游戏
        this.draw();
    },

    checkCollision() {
        // 检查是否撞到地面或天花板
        if (this.bird.y < 0 || this.bird.y > this.canvas.height) {
            return true;
        }

        // 检查是否撞到管道
        return this.pipes.some(pipe => {
            return this.bird.x + this.bird.size > pipe.x &&
                   this.bird.x < pipe.x + pipe.width &&
                   this.bird.y + this.bird.size > pipe.y &&
                   this.bird.y < pipe.y + pipe.height;
        });
    },

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('flappyBirdHighScore', this.highScore);
            document.getElementById('highScore').textContent = this.highScore;
        }
    },

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制鸟
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.size/2, 0, Math.PI * 2);
        this.ctx.fill();

        // 绘制管道
        this.ctx.fillStyle = '#4CAF50';
        this.pipes.forEach(pipe => {
            this.ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        });
    }
}; 