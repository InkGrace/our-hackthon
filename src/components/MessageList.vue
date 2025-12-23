<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'

type Role = 'user' | 'assistant'

type Message = {
  id: number
  role: Role
  content: string
  createdAt: number
}

const props = defineProps<{
  messages: Message[]
  isResponding: boolean
}>()

const messagePane = ref<HTMLElement | null>(null)

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

const renderMarkdown = (text: string) => {
  return md.render(text)
}

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))

const scrollToBottom = async () => {
  await nextTick()
  if (messagePane.value) {
    messagePane.value.scrollTo({
      top: messagePane.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

watch(
  () => props.messages.length,
  () => {
    scrollToBottom()
  },
  { deep: true },
)

watch(
  () => props.messages[props.messages.length - 1]?.content,
  () => {
    scrollToBottom()
  },
)

onMounted(() => {
  scrollToBottom()
})

defineExpose({ scrollToBottom })
</script>

<template>
  <main class="chat-body" ref="messagePane">
    <div v-for="message in messages" :key="message.id" class="message-row" :class="message.role">
      <!-- Avatar hidden via CSS for cleaner doc look -->
      <!-- <div class="avatar" :class="message.role">
        <span>{{ message.role === 'assistant' ? '生' : '师' }}</span>
      </div> -->
      <div class="bubble">
        <div class="bubble-header">
          <span class="sender">{{
            message.role === 'assistant' ? '费曼 (新手)' : '教授 (我)'
          }}</span>
          <span class="timestamp">{{ formatTime(message.createdAt) }}</span>
        </div>
        <div class="bubble-text markdown-body" v-html="renderMarkdown(message.content)"></div>
      </div>
    </div>

    <div v-if="isResponding" class="message-row assistant typing-row">
      <!-- <div class="avatar assistant"><span>生</span></div> -->
      <div class="bubble typing">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p
          class="bubble-text muted"
          style="font-family: sans-serif; font-size: 0.9rem; color: #6b7280"
        >
          🤔 嗯... 费曼正在挠头思考...
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.chat-body {
  padding: 2rem 15%; /* Centered reading experience */
  overflow-y: auto;
  overflow-x: hidden; /* Fix horizontal scroll */
  display: flex;
  flex-direction: column;
  gap: 3rem;
  flex: 1;
  background: #fdfbf7; /* Global paper tint */
}

.message-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  transition: all 0.3s ease;
  box-sizing: border-box; /* Ensure padding doesn't overflow width */
}

.message-row.user {
  align-items: flex-start;
}

.message-row.assistant {
  align-items: flex-end;
  padding-right: 2rem;
}

/* Professor/Tutor Bubble */
.message-row.user .bubble {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); /* Clean textbook look */
  max-width: 90%;
  font-family: 'Georgia', serif; /* Academic font */
  line-height: 1.8;
  position: relative;
}

.message-row.user .bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: #3b82f6; /* Blue spine */
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

/* Novice Student Bubble (Sticky Note) */
.message-row.assistant .bubble {
  background: #fef3c7; /* Sticky yellow */
  color: #4b5563;
  padding: 1.2rem;
  border-radius: 2px;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 70%;
  transform: rotate(1deg); /* Imperfect placement */
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; /* Handwritten notes */
  font-size: 1.05rem;
  border: none;
}

.message-row.assistant .bubble::after {
  display: none;
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.sender {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.message-row.user .sender {
  color: #3b82f6;
}

.message-row.assistant .sender {
  color: #d97706; /* Amber */
}

/* Avatar - Integrated into header for cleaner look */
.avatar {
  display: none;
}

/* Animations */
.message-row.assistant {
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9) rotate(5deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(1deg);
  }
}

.typing-row .bubble {
  background: #e5e7eb; /* Grey thought interaction */
  transform: rotate(0);
  box-shadow: none;
  color: #6b7280;
}

.typing-dots span {
  background: #9ca3af;
}
</style>
