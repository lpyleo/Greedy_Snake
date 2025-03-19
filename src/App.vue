<script>
import GameBoard from './components/GameBoard.vue'
import { ElContainer, ElHeader, ElMain, ElButton, ElTag, ElMessage, ElCard } from 'element-plus'
import { VideoPlay, RefreshRight } from '@element-plus/icons-vue'

export default {
  components: {
    GameBoard,
    ElContainer,
    ElHeader,
    ElMain,
    ElButton,
    ElTag,
    ElCard,
    VideoPlay,
    RefreshRight
  },
  data() {
    return {
      score: 0,
      gameActive: false,
      gameKey: 0  // 添加一个key来强制重新渲染游戏组件
    }
  },
  watch: {
    gameActive: {
      handler(newVal) {
        // 当游戏状态改变时，添加或移除body类
        if (newVal) {
          document.body.classList.add('game-active');
        } else {
          document.body.classList.remove('game-active');
        }
      },
      immediate: true
    }
  },
  methods: {
    handleGameOver() {
      this.gameActive = false
      ElMessage({
        message: `游戏结束！得分：${this.score}`,
        type: 'warning',
        duration: 3000
      })
    },
    updateScore(newScore) {
      this.score = newScore
    },
    startGame() {
      console.log('点击开始游戏按钮')
      this.score = 0
      this.gameKey += 1  // 增加key值强制重新渲染
      
      // 使用setTimeout确保状态更新后再执行DOM操作
      setTimeout(() => {
        this.gameActive = true
        console.log('游戏开始', this.gameActive, this.gameKey)
        
        // 滚动到游戏区域
        this.$nextTick(() => {
          const gameCard = document.querySelector('.game-card')
          if (gameCard) {
            gameCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        })
      }, 10)
    },
    resetGame() {
      this.gameActive = false
      this.score = 0
      this.gameKey += 1  // 增加key值强制重新渲染
      ElMessage({
        message: '游戏已重置',
        type: 'info',
        duration: 1000
      })
    }
  }
}
</script>

<template>
  <div class="app-wrapper">
    <el-container class="container">
      <el-header class="header">
        <div class="header-content">
          <div class="game-title">
            <h1>贪吃蛇游戏</h1>
            <el-tag type="success" size="large" class="score-tag">得分：{{ score }}</el-tag>
          </div>
          <div class="controls">
            <button 
              class="custom-button primary-button"
              @click="startGame" 
              :disabled="gameActive"
            >
              <el-icon class="button-icon"><VideoPlay /></el-icon>
              <span>开始游戏</span>
            </button>
            <button 
              class="custom-button danger-button"
              @click="resetGame"
            >
              <el-icon class="button-icon"><RefreshRight /></el-icon>
              <span>重置游戏</span>
            </button>
          </div>
        </div>
      </el-header>
      <el-main class="main-content">
        <transition name="fade">
          <el-card v-if="gameActive" class="game-card">
            <template #header>
              <div class="card-header">
                <span>游戏区域</span>
              </div>
            </template>
            <GameBoard 
              :key="gameKey"
              @game-over="handleGameOver"
              @score-update="updateScore"
              :grid-size="20"
              :grid-count="25"
              :game-active="gameActive"
            />
          </el-card>
          <div v-else class="start-message">
            <el-card class="welcome-card">
              <template #header>
                <div class="welcome-header">
                  <span>欢迎来到贪吃蛇游戏</span>
                </div>
              </template>
              <div class="welcome-content">
                <p>点击上方"开始游戏"按钮开始游戏</p>
                <p>使用键盘方向键或WASD控制蛇的移动</p>
                <p>吃到食物得分，撞墙或自身则游戏结束</p>
                <div class="instructions">
                  <div class="key-instruction">
                    <div class="key">↑</div>
                    <span>向上移动</span>
                  </div>
                  <div class="key-row">
                    <div class="key-instruction">
                      <div class="key">←</div>
                      <span>向左移动</span>
                    </div>
                    <div class="key-instruction">
                      <div class="key">↓</div>
                      <span>向下移动</span>
                    </div>
                    <div class="key-instruction">
                      <div class="key">→</div>
                      <span>向右移动</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </transition>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.app-wrapper {
  /* background: linear-gradient(135deg, #f5f7fa 0%, #f5f7fa 0%); */
  min-height: 100vh;
  padding: 20px 0 50px;
  position: relative;
  overflow: hidden;
}

.app-wrapper::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  /* background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%); */
  border-radius: 50%;
  bottom: -100px;
  left: -100px;
  z-index: 0;
}

.app-wrapper::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(255, 117, 140, 0.1) 0%, rgba(255, 126, 179, 0.1) 100%);
  border-radius: 50%;
  top: 50px;
  right: -50px;
  z-index: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  background-color: white;
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  padding: 20px;
  height: auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.game-title {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-right: 20px;
}

.game-title h1 {
  color: white;
  margin: 0;
  font-size: 28px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.score-tag {
  font-size: 16px;
  padding: 8px 15px;
  margin-left: 15px;
}

.controls {
  display: flex;
  gap: 20px;
  margin-left: auto;
}

.custom-button {
  min-width: 120px;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.3s;
  outline: none;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.primary-button {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.primary-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.primary-button:disabled {
  background: linear-gradient(to right, #b2d7f5 0%, #a0e4e7 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.danger-button {
  background: linear-gradient(to right, #ff758c 0%, #ff7eb3 100%);
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.danger-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.danger-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.button-icon {
  font-size: 18px;
}

.main-content {
  padding: 30px;
  background: linear-gradient(to bottom, #ffffff 0%, #f0f6ff 100%);
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.main-content::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(79, 172, 254, 0.03) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(255, 117, 140, 0.03) 0%, transparent 60%),
    radial-gradient(circle at 10% 40%, rgba(162, 220, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 90% 90%, rgba(255, 196, 217, 0.05) 0%, transparent 50%);
  z-index: 0;
}

.game-card {
  max-width: 650px;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  border: none;
  position: relative;
  z-index: 1;
  background-color: white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2em;
  color: #409eff;
  padding: 15px 20px;
  background-color: #f0f9ff;
  border-bottom: 1px solid #e8f4ff;
}

.welcome-card {
  max-width: 650px;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  border: none;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
}

.welcome-header {
  font-size: 1.2em;
  color: #409eff;
  font-weight: bold;
  background-color: #f0f9ff;
  padding: 15px 20px;
  border-bottom: 1px solid #e8f4ff;
}

.welcome-content {
  padding: 40px;
  text-align: center;
  background-image: 
    radial-gradient(circle at 10% 90%, rgba(79, 172, 254, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 90% 10%, rgba(255, 117, 140, 0.05) 0%, transparent 50%);
  position: relative;
}

.welcome-content::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background-image: radial-gradient(rgba(79, 172, 254, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  top: 20px;
  left: 20px;
  z-index: 0;
}

.welcome-content::after {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  background-image: radial-gradient(rgba(255, 117, 140, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  bottom: 20px;
  right: 20px;
  z-index: 0;
}

.welcome-content p {
  margin: 15px 0;
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.start-message {
  margin: auto 0;
  position: relative;
  z-index: 1;
}

.instructions {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 251, 255, 0.9));
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.08);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(79, 172, 254, 0.1);
}

.instructions::before {
  content: '方向控制';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to right, #4facfe, #00f2fe);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.key-row {
  display: flex;
  gap: 25px;
}

.key-instruction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.key-instruction span {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.key {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  background: linear-gradient(145deg, #f0f0f0, #e6e6e6);
  box-shadow: 3px 3px 6px #d9d9d9, -3px -3px 6px #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: #4facfe;
  transition: all 0.2s;
  position: relative;
}

.key:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 8px #d9d9d9, -4px -4px 8px #ffffff;
}

.key::after {
  content: '';
  position: absolute;
  width: 60%;
  height: 60%;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 240, 240, 0.4));
  top: 8px;
  left: 8px;
  pointer-events: none;
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 25px;
    padding: 0 10px;
  }
  
  .game-title {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding-right: 0;
  }
  
  .score-tag {
    margin-left: 0;
  }
  
  .controls {
    width: 100%;
    justify-content: center;
    margin-left: 0;
  }
  
  .welcome-content {
    padding: 20px;
  }
  
  .key-row {
    gap: 15px;
  }
  
  .key {
    width: 40px;
    height: 40px;
  }
}
</style>
