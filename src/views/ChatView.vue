<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

type Role = 'user' | 'assistant'

type Message = {
  id: number
  role: Role
  content: string
  createdAt: number
}

const messagePane = ref<HTMLElement | null>(null)
const messages = ref<Message[]>([
  {
    id: 1,
    role: 'assistant',
    content: '你好，我是 Xiaomi MiMo。很高兴成为你的头脑风暴伙伴！',
    createdAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 2,
    role: 'user',
    content: '请帮我写一个模仿 Xiaomi MiMo 的前端聊天界面。',
    createdAt: Date.now() - 1000 * 60 * 4,
  },
  {
    id: 3,
    role: 'assistant',
    content:
      '没问题！右侧的演示就是本地版 Xiaomi MiMo 界面，包含消息气泡、时间戳、输入区和正在输出的动效。',
    createdAt: Date.now() - 1000 * 60 * 4 + 20 * 1000,
  },
])

const composer = ref('来描述一下你正在做的项目，我可以帮你梳理需求。')
const isResponding = ref(false)

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))

import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

const renderMarkdown = (text: string) => {
  return md.render(text)
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagePane.value) {
    messagePane.value.scrollTo({
      top: messagePane.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const VITE_MIMO_KEY = import.meta.env.VITE_MIMO_KEY
// const VITE_MIMO_BASE_URL = import.meta.env.VITE_MIMO_BASE_URL
const VITE_MIMO_MODEL = import.meta.env.VITE_MIMO_MODEL

const sendMessage = async () => {
  const text = composer.value.trim()
  if (!text || isResponding.value) return

  const userMessage: Message = {
    id: Date.now(),
    role: 'user',
    content: text,
    createdAt: Date.now(),
  }

  messages.value.push(userMessage)
  composer.value = ''
  await scrollToBottom()

  const assistantId = Date.now() + 1
  const assistantMessage: Message = {
    id: assistantId,
    role: 'assistant',
    content: '',
    createdAt: Date.now(),
  }
  messages.value.push(assistantMessage)
  isResponding.value = true
  await scrollToBottom()

  try {
    if (!VITE_MIMO_KEY) {
      throw new Error('No API key found. Please set VITE_MIMO_KEY in your .env file.')
    }

    const endpoint = '/api/chat/completions'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VITE_MIMO_KEY}`,
      },
      body: JSON.stringify({
        model: VITE_MIMO_MODEL,
        messages: [{ role: 'user', content: text }],
        max_completion_tokens: 1024,
        temperature: 0.3,
        top_p: 0.95,
        stream: true,
        stop: null,
        frequency_penalty: 0,
        presence_penalty: 0,
        extra_body: {
          thinking: { type: 'disabled' },
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
    }

    if (!response.body) throw new Error('ReadableStream not supported.')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6))
              const content = data.choices?.[0]?.delta?.content
              if (content) {
                assistantMessage.content += content
                await scrollToBottom()
              }
            } catch (e) {
              console.error('Error parsing stream chunk', e)
            }
          }
        }
      }
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    if (!assistantMessage.content) {
      assistantMessage.content = `Error: ${errMsg}`
    } else {
      assistantMessage.content += `\n[Error: ${errMsg}]`
    }
  } finally {
    isResponding.value = false
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="chat-shell">
    <header class="chat-header">
      <div class="header-left">
        <div class="brand-mark">
          <span>AI</span>
        </div>
        <div>
          <p class="title">Xiaomi MiMo 助手</p>
          <p class="subtitle">本地预览 · 无需后端</p>
        </div>
      </div>
      <div class="header-right">
        <span class="status-dot"></span>
        <span class="status-text">在线</span>
      </div>
    </header>

    <main class="chat-body" ref="messagePane">
      <div v-for="message in messages" :key="message.id" class="message-row" :class="message.role">
        <div class="avatar" :class="message.role">
          <span>{{ message.role === 'assistant' ? 'G' : '我' }}</span>
        </div>
        <div class="bubble">
          <div class="bubble-header">
            <span class="sender">{{ message.role === 'assistant' ? 'Xiaomi MiMo' : '你' }}</span>
            <span class="timestamp">{{ formatTime(message.createdAt) }}</span>
          </div>
          <div class="bubble-text markdown-body" v-html="renderMarkdown(message.content)"></div>
        </div>
      </div>

      <div v-if="isResponding" class="message-row assistant typing-row">
        <div class="avatar assistant">
          <span>G</span>
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

    <footer class="composer">
      <div class="input-wrapper">
        <textarea
          v-model="composer"
          rows="3"
          placeholder="与 Xiaomi MiMo 对话，Enter 发送，Shift+Enter 换行"
          @keydown="handleKeydown"
        ></textarea>
        <button
          class="send"
          type="button"
          :disabled="!composer.trim() || isResponding"
          @click="sendMessage"
        >
          发送
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.chat-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #0f172a;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffffdd;
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-mark {
  height: 42px;
  width: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #22c55e, #14b8a6);
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.title {
  font-weight: 700;
  margin: 0;
  font-size: 1.1rem;
}

.subtitle {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.header-right {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #16a34a;
  font-weight: 600;
}

.status-dot {
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
}

.chat-body {
  padding: 1.25rem 1.5rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: flex-start;
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
  background: #2563eb;
  color: #fff;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #e2e8f0;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #0f172a;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.1);
}

.avatar.assistant {
  background: #0f172a;
  color: #e2e8f0;
}

.bubble {
  background: #fff;
  border-radius: 18px;
  padding: 0.9rem 1rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
  min-width: 0;
}

.bubble-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.9rem;
  margin-bottom: 0.35rem;
}

.sender {
  font-weight: 700;
  color: #0f172a;
}

.timestamp {
  color: #94a3b8;
  font-size: 0.85rem;
}

.bubble-text {
  margin: 0;
  line-height: 1.6;
}

.markdown-body :deep(p) {
  margin: 0.5em 0;
}

.markdown-body :deep(p:first-child) {
  margin-top: 0;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(pre) {
  background: #f1f5f9;
  padding: 0.75rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-body :deep(code) {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

.markdown-body :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.message-row.user .markdown-body :deep(pre) {
  background: rgba(255, 255, 255, 0.2);
}

.message-row.user .markdown-body :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.bubble-text.muted {
  color: #94a3b8;
}

.quick-actions {
  padding: 0 1.75rem 1rem;
}

.prompt-label {
  margin: 0 0 0.5rem;
  color: #475569;
  font-weight: 600;
}

.chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chip {
  border: 1px solid #cbd5e1;
  background: #fff;
  padding: 0.4rem 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #0f172a;
}

.chip:hover {
  border-color: #2563eb;
  color: #2563eb;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
}

.composer {
  padding: 0.75rem 1.75rem 1.5rem;
  position: sticky;
  bottom: 0;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  padding: 0.75rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

textarea {
  flex: 1;
  border: none;
  resize: none;
  outline: none;
  font-size: 1rem;
  font-family: inherit;
  color: #0f172a;
  background: transparent;
}

.send {
  align-self: flex-end;
  border: none;
  border-radius: 12px;
  padding: 0.6rem 1.1rem;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    opacity 0.12s ease;
}

.send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.2);
}

.tip {
  margin: 0.6rem 0 0;
  color: #94a3b8;
  font-size: 0.95rem;
}

.typing {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.typing-dots {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.typing-dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #2563eb;
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

@media (max-width: 780px) {
  .chat-body {
    padding: 1rem 1.1rem;
  }
  .chat-header,
  .composer,
  .quick-actions {
    padding-left: 1.1rem;
    padding-right: 1.1rem;
  }
  .bubble {
    font-size: 0.97rem;
  }
  .input-wrapper {
    flex-direction: column;
  }
  .send {
    width: 100%;
  }
}
</style>
