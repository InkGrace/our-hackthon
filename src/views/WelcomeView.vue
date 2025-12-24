<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startTeaching = () => {
  router.push('/select-role')
}
</script>

<template>
  <div class="welcome-container">
    <div class="content">
      <div class="hero">
        <div class="icon">
          <img width="128px" height="128px" src="/public/琢玉GPT.png" alt="" />
        </div>
        <h1>琢玉 GPT</h1>
        <p class="subtitle">费曼技巧驱动的生成式反向教学智能体</p>
      </div>

      <div class="features">
        <div class="feature-card">
          <!-- <span class="feature-icon">🔄</span> -->
          <h3>角色互换</h3>
          <p>打破传统，你是老师，AI 是学生。通过输出来倒逼输入。</p>
        </div>
        <div class="feature-card">
          <!-- <span class="feature-icon">🧠</span> -->
          <h3>掌握度追踪</h3>
          <p>实时可视化的"理解仪表盘"，让你的教学效果一目了然。</p>
        </div>
        <div class="feature-card">
          <!-- <span class="feature-icon">⚡️</span> -->
          <h3>苏格拉底提问</h3>
          <p>AI 不会轻易"听懂"，它会像好奇的新手一样不断追问"为什么"。</p>
        </div>
      </div>

      <button class="start-btn" @click="startTeaching">
        开始
        <span class="arrow">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fdfbf7 0%, #fffbeb 100%);
  color: #1f2937;
  padding: 2rem;
}

.content {
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.hero {
  text-align: center;
}

.icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(to right, #1f2937, #4b5563);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.5rem;
  color: #6b7280;
  margin-top: 1rem;
  font-weight: 300;
  letter-spacing: 0.1em;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  width: 100%;
}

.feature-card {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  text-align: center;
  transition: transform 0.2s;
  border: 1px solid #e5e7eb;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: #fbbf24;
}

.feature-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.2rem;
  color: #111827;
  margin-bottom: 0.5rem;
}

p {
  font-size: 0.95rem;
  color: #6b7280;
  line-height: 1.6;
}

.start-btn {
  background: #10b981;
  color: #fff;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.start-btn:hover {
  background: #059669;
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
}

.arrow {
  transition: transform 0.2s;
}

.start-btn:hover .arrow {
  transform: translateX(5px);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 640px) {
  h1 {
    font-size: 2.5rem;
  }
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
