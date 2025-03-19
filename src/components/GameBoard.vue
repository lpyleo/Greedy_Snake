<template>
  <div class="game-container">
    <div class="canvas-wrapper">
      <canvas ref="gameCanvas" :width="canvasSize" :height="canvasSize"></canvas>
      <div v-if="debugMode" class="debug-info">
        <p>游戏状态: {{ gameActive ? '运行中' : '停止' }}</p>
        <p>蛇长度: {{ snake.length }}</p>
        <p>方向: {{ direction }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    gridSize: {
      type: Number,
      default: 20
    },
    gridCount: {
      type: Number,
      default: 25
    },
    gameActive: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      ctx: null,
      snake: [{x: 12, y: 12}],
      food: {x: 15, y: 15},
      direction: 'right',
      nextDirection: 'right',
      gameLoop: null,
      score: 0,
      initialized: false,
      debugMode: false  // 调试模式开关
    }
  },
  computed: {
    canvasSize() {
      // 使用固定尺寸确保画布是正方形
      return this.gridSize * this.gridCount;
    }
  },
  watch: {
    gameActive: {
      handler(newVal, oldVal) {
        console.log('游戏状态变化：', oldVal, '->', newVal);
        if (newVal === true) {
          // 如果游戏激活，重置游戏并初始化
          console.log('游戏开始，正在初始化...');
          this.resetGame();
          this.$nextTick(() => {
            this.initCanvas();
            
            // 确保游戏初始化后立即开始一帧
            requestAnimationFrame(() => {
              console.log('立即执行第一帧');
              this.updateGame();
            });
          });
        } else if (this.gameLoop) {
          // 如果游戏不再激活且有游戏循环，清除循环
          console.log('游戏停止，正在清理...');
          clearInterval(this.gameLoop);
          this.gameLoop = null;
        }
      },
      immediate: true
    }
  },
  mounted() {
    console.log('GameBoard mounted');
    // 添加键盘事件监听
    window.addEventListener('keydown', this.handleKeyPress);
    
    // 阻止方向键导致的页面滚动
    window.addEventListener('keydown', this.preventScrolling);
    
    // 初始化画布背景
    this.$nextTick(() => {
      this.initCanvasBackground();
      
      // 确保游戏画布居中显示
      this.scrollToCanvas();
    });
  },
  beforeUnmount() {
    console.log('GameBoard unmounted');
    // 移除键盘事件监听
    window.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('keydown', this.preventScrolling);
    // 清除游戏循环
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  },
  methods: {
    scrollToCanvas() {
      // 确保游戏容器在视窗中居中
      if (this.$refs.gameCanvas) {
        this.$refs.gameCanvas.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    },
    initCanvasBackground() {
      // 仅初始化画布背景，不启动游戏
      if (this.$refs.gameCanvas) {
        const ctx = this.$refs.gameCanvas.getContext('2d');
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
      } else {
        console.error('Canvas未找到');
      }
    },
    resetGame() {
      console.log('重置游戏状态');
      // 重置蛇和食物
      this.snake = [{x: 12, y: 12}];
      this.food = {x: 15, y: 15};
      // 重置方向
      this.direction = 'right';
      this.nextDirection = 'right';
      // 重置分数
      this.score = 0;
      this.$emit('score-update', this.score);
      // 重置游戏循环
      if (this.gameLoop) {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
      }
      this.initialized = false;
    },
    initCanvas() {
      console.log('初始化游戏画布');
      // 获取canvas上下文
      if (!this.$refs.gameCanvas) {
        console.error('Canvas元素未找到');
        return;
      }
      
      this.ctx = this.$refs.gameCanvas.getContext('2d');
      if (!this.ctx) {
        console.error('无法获取Canvas上下文');
        return;
      }
      
      console.log('游戏初始化完成，开始游戏循环');
      
      // 确保之前的游戏循环被清除
      if (this.gameLoop) {
        clearInterval(this.gameLoop);
      }
      
      // 初始渲染一次游戏画面
      this.draw();
      
      // 开始游戏循环
      this.gameLoop = setInterval(() => {
        if (this.gameActive) {
          this.updateGame();
        }
      }, 150); // 加快游戏速度，使游戏更流畅

      this.initialized = true;
    },
    updateGame() {
      if (!this.gameActive) {
        console.log('游戏未激活，不更新');
        return;
      }
      
      // 更新方向
      this.direction = this.nextDirection;
      // 计算新的头部位置
      const head = {...this.snake[0]};

      // 根据方向移动头部
      switch(this.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
      }

      // 检查碰撞
      if(this.checkCollision(head)) {
        console.log('游戏结束：碰撞检测');
        this.$emit('game-over');
        return;
      }

      // 添加新头部
      this.snake.unshift(head);

      // 检查是否吃到食物
      if(head.x === this.food.x && head.y === this.food.y) {
        // 吃到食物，增加分数，生成新食物
        this.score += 10;
        this.$emit('score-update', this.score);
        this.generateFood();
      } else {
        // 没吃到食物，移除尾部
        this.snake.pop();
      }

      // 绘制画面
      this.draw();
    },
    draw() {
      if (!this.ctx || !this.$refs.gameCanvas) {
        console.error('绘制失败：上下文或Canvas不存在');
        return;
      }
      
      // 清空画布
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

      // 绘制网格(可选)
      if (this.debugMode) {
        this.drawGrid();
      }

      // 绘制食物
      this.drawFood();
      
      // 绘制蛇
      this.drawSnake();
    },
    drawSnake() {
      if (this.snake.length === 0) return;
      
      // 计算每个蛇身段的位置和类型（头、身体、尾）
      const segments = this.snake.map((segment, index) => {
        let type = 'body';
        if (index === 0) type = 'head';
        else if (index === this.snake.length - 1) type = 'tail';
        return { ...segment, type };
      });
      
      // 计算每个蛇身段的方向
      segments.forEach((segment, index) => {
        if (index === 0) {
          // 头部方向就是当前移动方向
          segment.direction = this.direction;
        } else {
          // 计算当前段与前一段的相对位置，确定方向
          const prev = segments[index - 1];
          if (prev.x < segment.x) segment.direction = 'left';
          else if (prev.x > segment.x) segment.direction = 'right';
          else if (prev.y < segment.y) segment.direction = 'up';
          else if (prev.y > segment.y) segment.direction = 'down';
        }
      });
      
      // 绘制每个蛇身段
      segments.forEach(segment => {
        this.drawSnakeSegment(segment);
      });
    },
    drawSnakeSegment(segment) {
      const { x, y, type, direction } = segment;
      const size = this.gridSize - 2;
      
      // 基本位置
      const centerX = x * this.gridSize + this.gridSize / 2;
      const centerY = y * this.gridSize + this.gridSize / 2;
      
      // 设置基本颜色
      if (type === 'head') {
        // 蛇头为亮绿色
        this.ctx.fillStyle = '#2ecc71';
      } else if (type === 'tail') {
        // 蛇尾为深绿色
        this.ctx.fillStyle = '#27ae60';
      } else {
        // 蛇身为中绿色
        this.ctx.fillStyle = '#2abd6c';
      }
      
      // 绘制圆角矩形作为基本形状
      this.drawRoundedRect(
        x * this.gridSize + 1,
        y * this.gridSize + 1,
        size,
        size,
        4
      );
      
      // 为蛇头添加眼睛和舌头
      if (type === 'head') {
        // 眼睛的位置根据方向调整
        let eyeX1, eyeY1, eyeX2, eyeY2;
        
        switch (direction) {
          case 'right':
            eyeX1 = centerX + 2;
            eyeY1 = centerY - 3;
            eyeX2 = centerX + 2;
            eyeY2 = centerY + 3;
            break;
          case 'left':
            eyeX1 = centerX - 2;
            eyeY1 = centerY - 3;
            eyeX2 = centerX - 2;
            eyeY2 = centerY + 3;
            break;
          case 'up':
            eyeX1 = centerX - 3;
            eyeY1 = centerY - 2;
            eyeX2 = centerX + 3;
            eyeY2 = centerY - 2;
            break;
          case 'down':
            eyeX1 = centerX - 3;
            eyeY1 = centerY + 2;
            eyeX2 = centerX + 3;
            eyeY2 = centerY + 2;
            break;
        }
        
        // 绘制眼睛
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制眼球
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(eyeX1, eyeY1, 1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(eyeX2, eyeY2, 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 添加舌头
        let tongueStartX, tongueStartY, tongueMidX, tongueMidY, tongueEnd1X, tongueEnd1Y, tongueEnd2X, tongueEnd2Y;
        
        switch (direction) {
          case 'right':
            tongueStartX = centerX + 8;
            tongueStartY = centerY;
            tongueMidX = centerX + 10;
            tongueMidY = centerY;
            tongueEnd1X = centerX + 12;
            tongueEnd1Y = centerY - 2;
            tongueEnd2X = centerX + 12;
            tongueEnd2Y = centerY + 2;
            break;
          case 'left':
            tongueStartX = centerX - 8;
            tongueStartY = centerY;
            tongueMidX = centerX - 10;
            tongueMidY = centerY;
            tongueEnd1X = centerX - 12;
            tongueEnd1Y = centerY - 2;
            tongueEnd2X = centerX - 12;
            tongueEnd2Y = centerY + 2;
            break;
          case 'up':
            tongueStartX = centerX;
            tongueStartY = centerY - 8;
            tongueMidX = centerX;
            tongueMidY = centerY - 10;
            tongueEnd1X = centerX - 2;
            tongueEnd1Y = centerY - 12;
            tongueEnd2X = centerX + 2;
            tongueEnd2Y = centerY - 12;
            break;
          case 'down':
            tongueStartX = centerX;
            tongueStartY = centerY + 8;
            tongueMidX = centerX;
            tongueMidY = centerY + 10;
            tongueEnd1X = centerX - 2;
            tongueEnd1Y = centerY + 12;
            tongueEnd2X = centerX + 2;
            tongueEnd2Y = centerY + 12;
            break;
        }
        
        // 绘制舌头
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(tongueStartX, tongueStartY);
        this.ctx.lineTo(tongueMidX, tongueMidY);
        this.ctx.lineTo(tongueEnd1X, tongueEnd1Y);
        this.ctx.moveTo(tongueMidX, tongueMidY);
        this.ctx.lineTo(tongueEnd2X, tongueEnd2Y);
        this.ctx.stroke();
      }
      
      // 为蛇身添加花纹
      if (type === 'body') {
        this.ctx.fillStyle = '#27ae60';
        
        // 根据方向决定花纹的方向
        if (direction === 'up' || direction === 'down') {
          // 水平花纹
          this.ctx.fillRect(
            x * this.gridSize + size/4,
            y * this.gridSize + size/2 - 1,
            size/2,
            2
          );
        } else {
          // 垂直花纹
          this.ctx.fillRect(
            x * this.gridSize + size/2 - 1,
            y * this.gridSize + size/4,
            2,
            size/2
          );
        }
      }
      
      // 为蛇尾添加三角形尾巴
      if (type === 'tail') {
        this.ctx.fillStyle = '#16a085';
        
        let tailX, tailY, tailWidth, tailHeight;
        
        switch (direction) {
          case 'right':
            tailX = x * this.gridSize + 1;
            tailY = y * this.gridSize + 1;
            tailWidth = size / 3;
            tailHeight = size;
            break;
          case 'left':
            tailX = (x + 1) * this.gridSize - size / 3 - 1;
            tailY = y * this.gridSize + 1;
            tailWidth = size / 3;
            tailHeight = size;
            break;
          case 'up':
            tailX = x * this.gridSize + 1;
            tailY = (y + 1) * this.gridSize - size / 3 - 1;
            tailWidth = size;
            tailHeight = size / 3;
            break;
          case 'down':
            tailX = x * this.gridSize + 1;
            tailY = y * this.gridSize + 1;
            tailWidth = size;
            tailHeight = size / 3;
            break;
        }
        
        // 绘制尾部标志
        this.ctx.fillRect(tailX, tailY, tailWidth, tailHeight);
      }
    },
    drawRoundedRect(x, y, width, height, radius) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + radius, y);
      this.ctx.lineTo(x + width - radius, y);
      this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.ctx.lineTo(x + width, y + height - radius);
      this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      this.ctx.lineTo(x + radius, y + height);
      this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.ctx.lineTo(x, y + radius);
      this.ctx.quadraticCurveTo(x, y, x + radius, y);
      this.ctx.closePath();
      this.ctx.fill();
    },
    drawFood() {
      const x = this.food.x * this.gridSize + 1;
      const y = this.food.y * this.gridSize + 1;
      const size = this.gridSize - 2;
      const centerX = x + size / 2;
      const centerY = y + size / 2;
      
      // 绘制苹果形状
      this.ctx.fillStyle = '#e74c3c';
      this.drawRoundedRect(x, y, size, size, 5);
      
      // 绘制苹果高光
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 2, centerY - 2, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // 绘制苹果柄
      this.ctx.fillStyle = '#7f8c8d';
      this.ctx.fillRect(centerX - 1, y - 1, 2, 3);
      
      // 绘制苹果叶
      this.ctx.fillStyle = '#2ecc71';
      this.ctx.beginPath();
      this.ctx.ellipse(centerX + 2, y, 3, 2, Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fill();
    },
    drawGrid() {
      // 在调试模式下绘制网格
      this.ctx.strokeStyle = '#34495e';
      this.ctx.lineWidth = 0.5;

      // 绘制垂直线
      for (let i = 0; i <= this.gridCount; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(i * this.gridSize, 0);
        this.ctx.lineTo(i * this.gridSize, this.canvasSize);
        this.ctx.stroke();
      }

      // 绘制水平线
      for (let i = 0; i <= this.gridCount; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, i * this.gridSize);
        this.ctx.lineTo(this.canvasSize, i * this.gridSize);
        this.ctx.stroke();
      }
    },
    handleKeyPress(e) {
      if (!this.gameActive) return;
      
      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        // 添加WASD键作为备选
        'w': 'up',
        's': 'down',
        'a': 'left',
        'd': 'right'
      };

      const newDirection = keyMap[e.key];
      if (!newDirection) return; // 如果按键不是方向键，直接返回

      const opposite = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
      };
      
      // 情况1：蛇长度为1，允许任意方向变化
      if (this.snake.length === 1) {
        this.nextDirection = newDirection;
        return;
      }
      
      // 情况2：不是相反方向，正常改变方向
      if (this.direction !== opposite[newDirection]) {
        this.nextDirection = newDirection;
        return;
      }
      
      // 情况3：是相反方向，执行原地掉头
      console.log('尝试原地掉头', this.direction, '->', newDirection);
      this.executeTurnAround(newDirection);
    },
    preventScrolling(e) {
      // 阻止方向键导致的页面滚动
      if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
          'Space', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
    },
    generateFood() {
      // 生成新的食物位置，确保不在蛇身上
      let newFood;
      do {
        newFood = {
          x: Math.floor(Math.random() * this.gridCount),
          y: Math.floor(Math.random() * this.gridCount)
        };
      } while(this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
      
      this.food = newFood;
    },
    checkCollision(head) {
      // 检查是否撞到边界
      if (head.x < 0 || head.x >= this.gridCount || head.y < 0 || head.y >= this.gridCount) {
        return true;
      }
      
      // 检查是否撞到自己（除了头部）
      return this.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    },
    executeTurnAround(newDirection) {
      // 记录状态变化
      console.log('执行原地掉头', this.direction, '->', newDirection);
      
      // 立即停止当前游戏循环
      if (this.gameLoop) {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
      }
      
      // 创建一个新的蛇身数组，反转顺序
      const newSnake = [...this.snake].reverse();
      
      // 直接更新状态
      this.snake = newSnake;
      this.direction = newDirection;
      this.nextDirection = newDirection;
      
      // 立即重绘一次
      this.draw();
      
      // 为了确保掉头后立即移动，手动执行一次更新
      // 使用setTimeout确保DOM更新后再执行
      setTimeout(() => {
        // 确保游戏仍然激活
        if (this.gameActive) {
          // 手动执行一次游戏更新
          this.updateGame();
          
          // 重新启动游戏循环
          if (!this.gameLoop) {
            this.gameLoop = setInterval(() => {
              if (this.gameActive) {
                this.updateGame();
              }
            }, 150);
          }
        }
      }, 50); // 使用更短的延迟确保快速响应
    }
  }
}
</script>

<style scoped>
.game-container {
  border: 2px solid #409eff;
  border-radius: 12px;
  margin: 20px auto;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  background: transparent; /* 移除渐变背景 */
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  transform-origin: center center;
  max-width: 600px; /* 限制最大宽度 */
  aspect-ratio: 1; /* 保持容器为正方形 */
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1; /* 确保wrapper是正方形 */
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: transparent; /* 移除深色背景 */
}

canvas {
  display: block;
  position: relative;
  z-index: 1;
  width: 100%; /* 使canvas填充wrapper */
  height: 100%;
  touch-action: none; /* 禁止触摸操作导致的页面移动 */
  transform: translateZ(0);
  image-rendering: pixelated; /* 像素化渲染，使游戏更清晰 */
  image-rendering: crisp-edges;
}

.debug-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 2;
}

/* 阻止页面滚动时的抖动 */
body.game-active {
  overscroll-behavior: none;
}

/* 媒体查询确保在小屏幕上游戏板仍然可见 */
@media (max-width: 768px) {
  .game-container {
    max-width: 90vw;
    padding: 15px;
  }
}
</style>