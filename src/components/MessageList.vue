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
      <div class="avatar" :class="message.role">
        <span>{{ message.role === 'assistant' ? '生' : '师' }}</span>
      </div>
      <div class="bubble">
        <div class="bubble-header">
          <span class="sender">{{ message.role === 'assistant' ? 'AI 学员' : '老师(我)' }}</span>
          <span class="timestamp">{{ formatTime(message.createdAt) }}</span>
        </div>
        <div class="bubble-text markdown-body" v-html="renderMarkdown(message.content)"></div>
      </div>
    </div>

    <div v-if="isResponding" class="message-row assistant typing-row">
      <div class="avatar assistant">
        <span>生</span>
      </div>
      <div class="bubble typing">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p class="bubble-text muted" style="font-family: sans-serif; font-size: 0.9rem">
          🙋‍♂️ 小爱正在举手回答...
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.chat-body {
  padding: 1.5rem 2rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
}

.message-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: flex-start;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.message-row.user {
  grid-template-columns: 1fr auto;
}

.message-row.user .avatar {
  order: 2;
  background: #f59e0b; /* Teacher Orange */
  color: #fff;
  border: 2px solid #fff;
}

.message-row.user .bubble {
  order: 1;
  margin-left: auto;
  background: #fef3c7; /* Sticky Note Yellow */
  color: #451a03;
  border: none;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  transform: rotate(-1deg);
  border-radius: 2px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #0f172a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
  font-size: 1rem;
}

.avatar.assistant {
  background: #3b82f6; /* Student Blue */
  color: #fff;
}

.bubble {
  background: #fdfbf7; /* Paper Off-white */
  border-radius: 2px;
  padding: 1.5rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 0;
  position: relative;
  /* Lined paper effect */
  background-image: linear-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 100% 1.8rem;
  line-height: 1.8rem;
  border-left: 2px solid #ef4444; /* Margin line */
}

/* Align text to lines */
.bubble-text,
.markdown-body p {
  line-height: 1.8rem;
  margin: 0;
  font-family: 'Georgia', serif;
  font-size: 1.05rem;
  color: #1f2937;
}

.bubble-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #cbd5e1;
  font-family: sans-serif;
}

.sender {
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

.timestamp {
  color: #94a3b8;
  font-size: 0.75rem;
}

.message-row.user .sender {
  color: #78350f;
}

.message-row.user .timestamp {
  color: #92400e;
  opacity: 0.7;
}

.message-row.user .bubble-header {
  border-bottom: 1px dashed rgba(146, 64, 14, 0.2);
}

.message-row.user .bubble-text,
.message-row.user .markdown-body p {
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; /* Teacher Handwriting */
  font-size: 1rem;
  line-height: 1.5;
}

/* User bubble reset background image */
.message-row.user .bubble {
  background-image: none;
  border-left: none;
  padding: 1rem 1.5rem;
}

.markdown-body :deep(p) {
  margin: 0;
}

/* Code blocks on paper */
.markdown-body :deep(pre) {
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0.9rem 0;
  border: 1px solid #cbd5e1;
  font-family: monospace;
  line-height: 1.4;
}

.markdown-body :deep(code) {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}

.typing {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
  background: transparent;
  box-shadow: none;
  background-image: none;
  border: none;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: #3b82f6;
}
</style>
