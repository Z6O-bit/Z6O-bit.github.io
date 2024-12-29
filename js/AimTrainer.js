const AimTrainer = {
    canvas: null,
    ctx: null,
    targets: [],
    isPlaying: false,
    timeLeft: 30,
    hits: 0,
    misses: 0,
    timer: null,
    lastSpawn: 0,
    spawnInterval: 1000,
    mouseX: 0,
    mouseY: 0,
    viewX: 0,
    viewY: 0,
    centerX: 0,
    centerY: 0,
    sensitivity: 1,
    particles: [], // 用于存储爆炸粒子

    init() {
        this.canvas = document.getElementById('aimCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // 只在电脑端添加鼠标事件
        if (window.innerWidth > 768) {
            document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('click', () => this.handleClick());
            
            // 锁定鼠标指针
            this.canvas.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.canvas.requestPointerLock();
                }
            });

            // 添加灵敏度控制
            const sensitivitySlider = document.getElementById('sensitivity');
            sensitivitySlider.addEventListener('input', (e) => {
                this.sensitivity = parseFloat(e.target.value);
                document.getElementById('sensitivityValue').textContent = this.sensitivity.toFixed(1);
            });
        }
    },

    resizeCanvas() {
        this.canvas.width = Math.min(800, window.innerWidth - 40);
        this.canvas.height = 500;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    },

    handleMouseMove(e) {
        if (this.isPlaying) {
            if (document.pointerLockElement === this.canvas) {
                // 累积视角移动，不限制范围
                this.viewX += e.movementX * this.sensitivity * 0.5;
                this.viewY += e.movementY * this.sensitivity * 0.5;
                
                // 更新目标位置
                this.updateTargetsPosition();
            }
        }
    },

    updateTargetsPosition() {
        this.targets.forEach(target => {
            // 计算目标在屏幕上的显示位置
            target.displayX = target.x - this.viewX;
            target.displayY = target.y - this.viewY;
            
            // 确保目标不会随视角移动而改变实际位置
            target.x = target.initialX;
            target.y = target.initialY;
            
            // 计算目标到屏幕中心的距离
            const distance = Math.sqrt(
                Math.pow(target.displayX - this.centerX, 2) + 
                Math.pow(target.displayY - this.centerY, 2)
            );
            
            // 更新目标的缩放比例
            target.scale = Math.max(0.3, 1 - (distance / 1000));
        });
    },

    startGame() {
        if (window.innerWidth <= 768) {
            alert('射击训练仅支持电脑端使用！');
            return;
        }

        this.isPlaying = true;
        this.timeLeft = 30;
        this.hits = 0;
        this.misses = 0;
        this.targets = [];
        // 重置视角位置
        this.viewX = 0;
        this.viewY = 0;
        this.updateStats();

        // 重置灵敏度
        document.getElementById('sensitivity').value = this.sensitivity;
        document.getElementById('sensitivityValue').textContent = this.sensitivity.toFixed(1);

        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.updateGame(), 1000 / 60);

        this.countdownTimer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timeLeft').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    },

    spawnTarget() {
        const baseSize = 30;
        // 在视野范围内生成目标，使用屏幕坐标系
        const margin = baseSize * 2;
        
        // 随机选择生成区域（屏幕四周）
        const side = Math.floor(Math.random() * 4); // 0: 上, 1: 右, 2: 下, 3: 左
        let x, y;
        
        switch(side) {
            case 0: // 上方
                x = Math.random() * this.canvas.width;
                y = margin;
                break;
            case 1: // 右方
                x = this.canvas.width - margin;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // 下方
                x = Math.random() * this.canvas.width;
                y = this.canvas.height - margin;
                break;
            case 3: // 左方
                x = margin;
                y = Math.random() * this.canvas.height;
                break;
        }

        // 转换为世界坐标
        const worldX = x + this.viewX;
        const worldY = y + this.viewY;
        
        this.targets.push({
            x: worldX,
            y: worldY,
            displayX: x,
            displayY: y,
            baseSize,
            scale: 1,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            createdAt: Date.now(),
            lifetime: 2000, // 增加存活时间到2秒
            initialX: worldX, // 记录初始位置
            initialY: worldY
        });
    },

    handleClick() {
        if (!this.isPlaying) return;

        let hit = false;
        const hitboxSize = 20; // 增加点击判定范围

        this.targets = this.targets.filter(target => {
            const dx = this.centerX - target.displayX;
            const dy = this.centerY - target.displayY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const effectiveSize = (target.baseSize * target.scale) + hitboxSize;

            if (distance < effectiveSize) {
                this.hits++;
                hit = true;
                // 添加击中效果
                this.createHitEffect(target.displayX, target.displayY);
                return false;
            }
            return true;
        });

        if (!hit) this.misses++;
        this.updateStats();
    },

    // 添加击中效果
    createHitEffect(x, y) {
        // 创建爆炸粒子
        const particleCount = 20;
        const colors = ['#ff0000', '#ff5500', '#ffaa00', '#ffff00', '#ffffff'];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            const size = 2 + Math.random() * 3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0, // 生命值从1递减到0
                gravity: 0.1
            });
        }
    },

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            
            // 更新生命值
            particle.life -= 0.02;
            
            // 移除死亡粒子
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${this.hexToRgb(particle.color)}, ${particle.life})`;
            this.ctx.fill();
        });
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '255, 255, 255';
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制3D网格背景
        this.drawGrid();
        
        // 绘制目标
        this.targets.forEach(target => {
            this.drawTarget(target);
        });

        // 绘制爆炸粒子
        this.updateParticles();
        this.drawParticles();

        // 绘制准星
        this.drawCrosshair();
    },

    drawGrid() {
        // 绘制深色背景
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const gridSize = 50;
        const vanishingPointX = this.canvas.width / 2;
        const vanishingPointY = this.canvas.height / 2;
        const offsetX = this.viewX % gridSize;
        const offsetY = this.viewY % gridSize;

        // 绘制放射状网格
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;

        // 绘制水平线（带透视效果）
        for (let y = -offsetY; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            
            // 根据距离中心的距离调整透明度
            const distanceFromCenter = Math.abs(y - vanishingPointY);
            const alpha = Math.max(0.1, 1 - distanceFromCenter / this.canvas.height);
            this.ctx.strokeStyle = `rgba(26, 26, 26, ${alpha})`;
            
            this.ctx.stroke();
        }

        // 绘制垂直线（带透视效果）
        for (let x = -offsetX; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            
            const distanceFromCenter = Math.abs(x - vanishingPointX);
            const alpha = Math.max(0.1, 1 - distanceFromCenter / this.canvas.width);
            this.ctx.strokeStyle = `rgba(26, 26, 26, ${alpha})`;
            
            this.ctx.stroke();
        }

        // 添加径向渐变效果
        const gradient = this.ctx.createRadialGradient(
            vanishingPointX, vanishingPointY, 0,
            vanishingPointX, vanishingPointY, this.canvas.width
        );
        gradient.addColorStop(0, 'rgba(10, 10, 10, 0)');
        gradient.addColorStop(1, 'rgba(10, 10, 10, 0.5)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawTarget(target) {
        const size = target.baseSize * target.scale;
        
        // 绘制目标外圈
        this.ctx.beginPath();
        this.ctx.arc(target.displayX, target.displayY, size, 0, Math.PI * 2);
        this.ctx.fillStyle = target.color;
        this.ctx.fill();
        
        // 绘制目标内圈
        this.ctx.beginPath();
        this.ctx.arc(target.displayX, target.displayY, size * 0.6, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2 * target.scale;
        this.ctx.stroke();
    },

    endGame() {
        this.isPlaying = false;
        clearInterval(this.timer);
        clearInterval(this.countdownTimer);
        this.targets = [];
        this.draw();
        
        const accuracy = this.hits + this.misses === 0 ? 0 : 
            Math.round((this.hits / (this.hits + this.misses)) * 100);
        
        alert(`训练结束！\n命中: ${this.hits}\n错过: ${this.misses}\n准确率: ${accuracy}%`);
    },

    updateGame() {
        const now = Date.now();
        if (now - this.lastSpawn > this.spawnInterval) {
            this.spawnTarget();
            this.lastSpawn = now;
        }

        this.updateTargets();
        this.draw();
    },

    updateTargets() {
        const now = Date.now();
        this.targets = this.targets.filter(target => {
            const age = now - target.createdAt;
            
            // 只在超出生命周期时移除目标
            if (age > target.lifetime) {
                this.misses++;
                this.updateStats();
                return false;
            }
            return true;
        });
    },

    updateStats() {
        document.getElementById('hitsCount').textContent = this.hits;
        document.getElementById('missesCount').textContent = this.misses;
        const accuracy = this.hits + this.misses === 0 ? 0 : 
            Math.round((this.hits / (this.hits + this.misses)) * 100);
        document.getElementById('accuracy').textContent = accuracy;
    },

    // 添加一个方法来检查目标是否在视野范围内
    isTargetVisible(target) {
        const margin = target.baseSize;
        return (
            target.displayX + margin >= -100 &&
            target.displayX - margin <= this.canvas.width + 100 &&
            target.displayY + margin >= -100 &&
            target.displayY - margin <= this.canvas.height + 100
        );
    },

    drawCrosshair() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = 20;
        const thickness = 2;
        const gap = 4;

        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = thickness;

        // 绘制十字准星
        // 上
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - gap);
        this.ctx.lineTo(centerX, centerY - gap - size);
        this.ctx.stroke();

        // 下
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY + gap);
        this.ctx.lineTo(centerX, centerY + gap + size);
        this.ctx.stroke();

        // 左
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - gap, centerY);
        this.ctx.lineTo(centerX - gap - size, centerY);
        this.ctx.stroke();

        // 右
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + gap, centerY);
        this.ctx.lineTo(centerX + gap + size, centerY);
        this.ctx.stroke();

        // 中心点
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fill();
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 只在电脑端初始化
    if (window.innerWidth > 768) {
        AimTrainer.init();
    }
}); 