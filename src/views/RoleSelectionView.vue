<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const presetRoles = [
  { id: '5yo', emoji: '🧒', label: '5岁小朋友', description: '充满好奇，喜欢问"为什么"' },
  { id: 'farmer', emoji: '👨‍🌾', label: '古代农夫', description: '没有现代知识背景，需要从零开始' },
  { id: 'highschool', emoji: '🎓', label: '高中生', description: '有一定基础，但理解较浅' },
  { id: 'business', emoji: '👨‍💼', label: '商务人士', description: '注重实用性和应用场景' },
]

const selectedRole = ref('')
const customRole = ref('')
const showCustomInput = ref(false)

const selectPreset = (roleId: string) => {
  selectedRole.value = roleId
  showCustomInput.value = false
  customRole.value = ''
}

const selectCustom = () => {
  selectedRole.value = 'custom'
  showCustomInput.value = true
}

const startChat = () => {
  let roleParam = ''

  if (selectedRole.value === 'custom' && customRole.value.trim()) {
    roleParam = customRole.value.trim()
  } else if (selectedRole.value) {
    const preset = presetRoles.find((r) => r.id === selectedRole.value)
    roleParam = preset?.label || ''
  }

  if (roleParam) {
    router.push({ path: '/chat', query: { role: roleParam } })
  }
}

const canStart = () => {
  if (selectedRole.value === 'custom') {
    return customRole.value.trim().length > 0
  }
  return selectedRole.value !== ''
}
</script>

<template>
  <div class="role-selection-container">
    <div class="content">
      <div class="header">
        <h2>选择学生角色</h2>
        <p class="hint">费曼会扮演这个角色来向你学习</p>
      </div>

      <div class="roles-grid">
        <div
          v-for="role in presetRoles"
          :key="role.id"
          class="role-card"
          :class="{ selected: selectedRole === role.id }"
          @click="selectPreset(role.id)"
        >
          <span class="role-emoji">{{ role.emoji }}</span>
          <h3>{{ role.label }}</h3>
          <p>{{ role.description }}</p>
        </div>

        <div
          class="role-card custom-card"
          :class="{ selected: selectedRole === 'custom' }"
          @click="selectCustom"
        >
          <span class="role-emoji">✨</span>
          <h3>自定义角色</h3>
          <p>创建独特的学生身份</p>
        </div>
      </div>

      <div v-if="showCustomInput" class="custom-input-section">
        <textarea
          v-model="customRole"
          placeholder="例如：一个对科技充满好奇的中世纪骑士..."
          rows="3"
        ></textarea>
      </div>

      <div class="actions">
        <button class="back-btn" @click="$router.push('/')">← 返回</button>
        <button class="confirm-btn" :disabled="!canStart()" @click="startChat">确认角色 →</button>
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

.role-card {
  background: #fff;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.role-card:hover {
  border-color: #fbbf24;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.role-card.selected {
  border-color: #10b981;
  background: #f0fdf4;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.role-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.1rem;
  color: #111827;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.role-card p {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.custom-card {
  border-style: dashed;
}

.custom-input-section {
  margin-bottom: 2rem;
}

textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

textarea:focus {
  outline: none;
  border-color: #10b981;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.back-btn,
.confirm-btn {
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  background: #f3f4f6;
  color: #6b7280;
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
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
    font-size: 2rem;
  }
}
</style>
