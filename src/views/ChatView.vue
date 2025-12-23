<script setup lang="ts">
import { ref } from 'vue'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatHeader from '@/components/ChatHeader.vue'
import MessageList from '@/components/MessageList.vue'
import ChatInput from '@/components/ChatInput.vue'

type Role = 'user' | 'assistant'

type Message = {
  id: number
  role: Role
  content: string
  createdAt: number
}

const messages = ref<Message[]>([
  {
    id: 1,
    role: 'assistant',
    content: '老师好！我是您的学生小爱。今天我们要学习什么新知识呢？我已经迫不及待了！',
    createdAt: Date.now() - 1000 * 60 * 5,
  },
])

const conversations = ref([
  { id: 1, title: '物理作业辅导', date: '今天' },
  { id: 2, title: '历史论文大纲', date: '昨天' },
  { id: 3, title: '微积分习题', date: '昨天' },
  { id: 4, title: '英语口语练习', date: '前天' },
  { id: 5, title: 'Python 基础入门', date: '7天前' },
])

const composer = ref('')
const isResponding = ref(false)

const handleNewChat = () => {
  // Logic for new chat
  console.log('New chat')
}

const handleSelectChat = (id: number) => {
  // Logic to select chat
  console.log('Select chat', id)
}

const VITE_MIMO_KEY = import.meta.env.VITE_MIMO_KEY
const VITE_MIMO_MODEL = import.meta.env.VITE_MIMO_MODEL

const SYSTEM_PROMPT = `你是一个名叫"费曼"的好奇新手学生。
你的目标是向用户（你的老师）学习。
行为准则：
1. 像一个渴望学习但容易困惑的初学者一样表现。
2. 经常问"为什么？"和"你能举个例子吗？"。
3. 如果不懂，不要假装懂。指出解释中的盲点。
4. 当你最终理解时，表达出明确的"顿悟"（Aha!）时刻，并用简单的语言总结你学到的东西。
5. 保持回答简短、对话式，并专注于当前的概念。
6. 称呼用户为"老师"或"教授"。`

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

  const assistantId = Date.now() + 1
  const assistantMessage: Message = {
    id: assistantId,
    role: 'assistant',
    content: '',
    createdAt: Date.now(),
  }
  messages.value.push(assistantMessage)
  isResponding.value = true

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
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
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
    let buffer = ''

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // Keep the last part in the buffer as it might be incomplete
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6))
              const content = data.choices?.[0]?.delta?.content
              if (content) {
                assistantMessage.content += content
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
</script>

<template>
  <div class="layout-container">
    <ChatSidebar
      :conversations="conversations"
      @new-chat="handleNewChat"
      @select-chat="handleSelectChat"
    />

    <div class="chat-shell">
      <ChatHeader />

      <MessageList :messages="messages" :is-responding="isResponding" />

      <ChatInput
        v-model="composer"
        :disabled="isResponding"
        @send="sendMessage"
        @update:modelValue="composer = $event"
      />
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #0f172a;
}

.chat-shell {
  flex: 1;
  background: #f0f4f8; /* Base wall color */
  /* Wooden Desk Texture Gradient at bottom */
  background-image: linear-gradient(to bottom, #f0f4f8 0%, #e2e8f0 80%, #d4d4d8 100%);
  color: #0f172a;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  min-width: 0;
}
</style>
