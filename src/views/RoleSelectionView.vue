<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const modes = [
  {
    id: 'beginner',
    emoji: '🧒',
    label: '初级模式',
    description: '教 5 岁小孩（AI 会装傻，需要极度通俗的解释）',
  },
  {
    id: 'intermediate',
    emoji: '🎓',
    label: '进阶模式',
    description: '教中学学生（AI 会使用苏格拉底反问法，挑战你的逻辑）',
  },
  {
    id: 'expert',
    emoji: '👨‍🔬',
    label: '专家模式',
    description: '同行评审（AI 会指出专业术语错误）',
  },
]

const subject = ref('')
const selectedMode = ref('beginner')

const selectMode = (modeId: string) => {
  selectedMode.value = modeId
}

const startChat = () => {
  if (subject.value.trim() && selectedMode.value) {
    router.push({
      path: '/chat',
      query: {
        subject: subject.value.trim(),
        mode: selectedMode.value,
      },
    })
  }
}

const canStart = () => {
  return subject.value.trim().length > 0 && selectedMode.value !== ''
}
</script>

<template>
  <div class="role-selection-container">
    <div class="content">
      <div class="header">
        <h2>设定课题</h2>
        <p class="hint">费曼会扮演不同的角色来向你学习</p>
      </div>

      <div class="subject-section">
        <label for="subject-input">今天要教我什么知识点？</label>
        <input
          id="subject-input"
          v-model="subject"
          type="text"
          placeholder="请输入课题名称，例如：勾股定理"
          class="subject-input"
        />
      </div>

      <div class="mode-selection-header">
        <h3>选择学习模式</h3>
      </div>

      <div class="roles-grid">
        <div
          v-for="mode in modes"
          :key="mode.id"
          class="role-card"
          :class="{ selected: selectedMode === mode.id }"
          @click="selectMode(mode.id)"
        >
          <span class="role-emoji">{{ mode.emoji }}</span>
          <h3>{{ mode.label }}</h3>
          <p>{{ mode.description }}</p>
        </div>
      </div>

      <div class="actions">
        <button class="back-btn" @click="$router.push('/')">← 返回</button>
        <button class="confirm-btn" :disabled="!canStart()" @click="startChat">开始教学 →</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-selection-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fdfbf7 0%, #fffbeb 100%);
  padding: 2rem;
}

.content {
  max-width: 900px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.hint {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.subject-section {
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.subject-section label {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.subject-input {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.subject-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.mode-selection-header {
  margin-bottom: 1.5rem;
}

.mode-selection-header h3 {
  font-size: 1.25rem;
  color: #374151;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.role-card {
  background: #fff;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.role-card:hover {
  border-color: #fbbf24;
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.role-card.selected {
  border-color: #10b981;
  background: #f0fdf4;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.role-emoji {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
}

h3 {
  font-size: 1.25rem;
  color: #111827;
  margin: 0 0 0.75rem 0;
  font-weight: 700;
}

.role-card p {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  margin-top: 2rem;
}

.back-btn,
.confirm-btn {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  background: #f3f4f6;
  color: #4b5563;
}

.back-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  background: #10b981;
  color: #fff;
  flex: 1;
}

.confirm-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
}

.confirm-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 640px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }

  h2 {
    font-size: 2.25rem;
  }
}
</style>
