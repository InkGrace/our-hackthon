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
        <p class="bubble-text muted">正在思考...</p>
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
  gap: 1.5rem;
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
}

.message-row.user .bubble {
  order: 1;
  margin-left: auto;
  background: linear-gradient(135deg, #2dd4bf, #0d9488);
  color: #fff;
  border: none;
  box-shadow: 0 8px 20px rgba(13, 148, 136, 0.25);
  border-bottom-right-radius: 4px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #0f172a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

.avatar.assistant {
  background: #0f172a;
  color: #fff;
}

.bubble {
  background: #fff;
  border-radius: 20px;
  border-top-left-radius: 4px;
  padding: 1rem 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  min-width: 0;
  transition: transform 0.2s;
}

.bubble:hover {
  transform: translateY(-1px);
}

.bubble-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.sender {
  font-weight: 700;
  color: #0f172a;
}

.timestamp {
  color: #94a3b8;
  font-size: 0.75rem;
}

.message-row.user .sender {
  color: rgba(255, 255, 255, 0.95);
}

.message-row.user .timestamp {
  color: rgba(255, 255, 255, 0.8);
}

.message-row.user .bubble-header {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.bubble-text {
  margin: 0;
  line-height: 1.7;
  font-size: 0.95rem;
}

.markdown-body :deep(p) {
  margin: 0.6em 0;
}

.markdown-body :deep(p:first-child) {
  margin-top: 0;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(pre) {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  overflow-x: auto;
  margin: 0.8em 0;
  border: 1px solid #e2e8f0;
}

.markdown-body :deep(code) {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 6px;
  color: #0f172a;
}

.markdown-body :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.message-row.user .markdown-body :deep(pre) {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
}

.message-row.user .markdown-body :deep(code) {
  background: rgba(0, 0, 0, 0.15);
  color: #fff;
}

.bubble-text.muted {
  color: #94a3b8;
}

.typing {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: #0d9488;
}
</style>
