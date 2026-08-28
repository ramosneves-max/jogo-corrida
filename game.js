class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Propriedades do carro
        this.car = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 60,
            width: 40,
            height: 60,
            speed: 0,
            maxSpeed: 15,
            acceleration: 0.3,
            friction: 0.95,
            turnSpeed: 0.15
        };
        
        // Variáveis do jogo
        this.position = 0;
        this.fuel = 100;
        this.maxFuel = 100;
        this.distance = 5000; // metros até a linha de chegada
        this.gameRunning = true;
        this.gameWon = false;
        
        // Controles
        this.keys = {};
        
        // Obstáculos
        this.obstacles = [];
        this.obstacleTimer = 0;
        
        // Inicializar controles
        this.setupControls();
        
        // Iniciar loop do jogo
        this.gameLoop();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                location.reload();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Controles
        if (this.keys['ArrowUp']) {
            if (this.fuel > 0) {
                this.car.speed = Math.min(this.car.speed + this.car.acceleration, this.car.maxSpeed);
                this.fuel = Math.max(this.fuel - 0.3, 0);
            }
        }
        
        if (this.keys['ArrowDown']) {
            this.car.speed = Math.max(this.car.speed - this.car.acceleration * 2, -5);
        }
        
        if (this.keys['ArrowLeft']) {
            this.car.x = Math.max(this.car.x - this.car.turnSpeed * 15, 0);
        }
        
        if (this.keys['ArrowRight']) {
            this.car.x = Math.min(this.car.x + this.car.turnSpeed * 15, this.canvas.width - this.car.width);
        }
        
        // Aplicar fricção
        this.car.speed *= this.car.friction;
        
        // Atualizar posição
        this.position += Math.abs(this.car.speed) * 2;
        
        // Regenerar combustível lentamente
        if (this.fuel < this.maxFuel && this.car.speed < 2) {
            this.fuel = Math.min(this.fuel + 0.1, this.maxFuel);
        }
        
        // Gerar obstáculos
        this.obstacleTimer++;
        if (this.obstacleTimer > 80 && this.obstacles.length < 3) {
            this.createObstacle();
            this.obstacleTimer = 0;
        }
        
        // Atualizar obstáculos
        this.obstacles = this.obstacles.filter(obs => {
            obs.y += 5;
            
            // Verificar colisão
            if (this.checkCollision(obs)) {
                this.car.speed *= 0.5;
                return false;
            }
            
            return obs.y < this.canvas.height;
        });
        
        // Verificar se venceu
        if (this.position >= this.distance) {
            this.winGame();
        }
    }
    
    createObstacle() {
        const x = Math.random() * (this.canvas.width - 40);
        this.obstacles.push({
            x: x,
            y: -40,
            width: 40,
            height: 40
        });
    }
    
    checkCollision(obs) {
        return !(this.car.x + this.car.width < obs.x ||
                 this.car.x > obs.x + obs.width ||
                 this.car.y + this.car.height < obs.y ||
                 this.car.y > obs.y + obs.height);
    }
    
    winGame() {
        this.gameRunning = false;
        this.gameWon = true;
        
        const finalStats = `Distância: ${Math.round(this.position)}m | Velocidade Final: ${Math.round(this.car.speed)} km/h`;
        document.getElementById('finalStats').textContent = finalStats;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    draw() {
        // Limpar canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar estrada
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 80);
        
        // Desenhar linhas da pista
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([20, 20]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Desenhar carro
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);
        
        // Janela do carro
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.fillRect(this.car.x + 5, this.car.y + 10, this.car.width - 10, 15);
        
        // Rodas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.car.x + 5, this.car.y - 5, 8, 8);
        this.ctx.fillRect(this.car.x + this.car.width - 13, this.car.y - 5, 8, 8);
        
        // Desenhar obstáculos
        this.ctx.fillStyle = '#FFD700';
        this.obstacles.forEach(obs => {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            // Desenhar alerta no obstáculo
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('⚠', obs.x + 10, obs.y + 25);
            this.ctx.fillStyle = '#FFD700';
        });
        
        // Desenhar linha de chegada
        if (this.position < this.distance) {
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 10]);
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.setLineDash([]);
        }
        
        // Desenhar texto de progresso
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 16px Arial';
        const progress = Math.min((this.position / this.distance) * 100, 100);
        this.ctx.fillText(`Progresso: ${Math.round(progress)}%`, 10, 30);
    }
    
    updateUI() {
        document.getElementById('speed').textContent = Math.round(this.car.speed * 10);
        document.getElementById('position').textContent = Math.round(this.position);
        document.getElementById('fuel').textContent = Math.round(this.fuel);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        this.updateUI();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Iniciar jogo quando a página carregar
window.addEventListener('load', () => {
    new Game();
});