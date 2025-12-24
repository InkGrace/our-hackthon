<script setup lang="ts">
defineProps<{
  topic: string
  score: number
}>()
</script>

<template>
  <header class="chat-header">
    <div class="header-left">
      <div>
        <span class="topic-label">当前主题:</span>
        <span class="topic-value">{{ topic }}</span>
      </div>
    </div>

    <div class="header-center">
      <span class="gauge-label">理解程度:</span>
      <div class="gauge-container">
        <div class="gauge-bar" :style="{ width: score + '%' }"></div>
      </div>
      <span class="gauge-label">{{ score }}%</span>
    </div>

    <div class="header-right">
      <span class="brain-icon">📑</span>
    </div>
  </header>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #fffbeb; /* Cream/Parchment */
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topic-label {
  font-size: 0.85rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.topic-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  font-family: 'Georgia', serif;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  max-width: 400px;
}

.gauge-container {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.gauge-bar {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #10b981); /* Knowledge gradient */
  width: 15%; /* Initial state: confused */
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.gauge-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #059669;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brain-icon {
  font-size: 1.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>
