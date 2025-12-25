<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatHeader from '@/components/ChatHeader.vue'
import MessageList from '@/components/MessageList.vue'
import ChatInput from '@/components/ChatInput.vue'
import PROMPTS from '@/constants/prompt'

type Role = 'user' | 'assistant'

type Message = {
  id: number
  role: Role
  content: string
  createdAt: number
}

const route = useRoute()
const router = useRouter()

const handleEndTeaching = () => {
  router.push('/settlement')
}

const subject = computed(() => (route.query.subject as string) || '待定课题')
const mode = computed(() => (route.query.mode as string) || 'beginner')

const initialMessage = computed(() => {
  if (mode.value === 'expert') {
    return `你好。我是你的同行评审员。听说你今天要跟我探讨关于“${subject.value}”的专业见解？请开始你的陈述，我会根据专业标准进行评估。`
  } else if (mode.value === 'intermediate') {
    return `老师好！听说今天要教我“${subject.value}”？我已经准备好思考了，不过我可能会问一些比较深入的问题来理清逻辑哦。`
  } else {
    return `老师好！我是 5 岁的小爱。听说今天要教我“${subject.value}”？那是什么呀？能用我听得懂的话告诉我吗？`
  }
})

const messages = ref<Message[]>([
  {
    id: 1,
    role: 'assistant',
    content: initialMessage.value,
    createdAt: Date.now(),
  },
])

const composer = ref('')
const isResponding = ref(false)
const currentTopic = ref(subject.value)
const understandingScore = ref(0)
const STORAGE_KEY = 'chat_state'

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.messages && parsed.messages.length > 0) {
        messages.value = parsed.messages
      }
      if (parsed.topic) currentTopic.value = parsed.topic
      if (typeof parsed.score === 'number') understandingScore.value = parsed.score
    } catch (e) {
      console.error('Failed to load chat history', e)
    }
  } else {
    // If no saved state, ensure we have the initial message (already set by default)
  }
})

watch(
  [messages, currentTopic, understandingScore],
  () => {
    const state = {
      messages: messages.value,
      topic: currentTopic.value,
      score: understandingScore.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    // Also sync legacy key for settlement view if it still relies on it?
    // SettlementView uses 'chat_messages'. We should update SettlementView to use 'chat_state' or sync it.
    // Let's check SettlementView.
    // Ideally we update SettlementView to read 'chat_state'.
    // For now, let's ALSO save to 'chat_messages' to avoid breaking SettlementView immediately,
    // or just update SettlementView in next step.
    localStorage.setItem('chat_messages', JSON.stringify(messages.value))
  },
  { deep: true },
)

const conversations = ref([
  { id: 1, title: '物理作业辅导', date: '今天' },
  { id: 2, title: '历史论文大纲', date: '昨天' },
  { id: 3, title: '微积分习题', date: '昨天' },
  { id: 4, title: '英语口语练习', date: '前天' },
  { id: 5, title: 'Python 基础入门', date: '7天前' },
])

const handleNewChat = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('chat_messages')

  // Reset state
  messages.value = [
    {
      id: Date.now(),
      role: 'assistant',
      content: initialMessage.value, // Re-compute initial message?
      // initialMessage is computed based on subject/mode.
      // If user wants "New Chat" does it mean keep subject/mode or reset completely?
      // Usually "New Chat" in this context implies "Restart this session".
      createdAt: Date.now(),
    },
  ]
  currentTopic.value = subject.value
  understandingScore.value = 0
}

const handleSelectChat = (id: number) => {
  // Logic to select chat
  console.log('Select chat', id)
}

const VITE_MIMO_KEY = import.meta.env.VITE_MIMO_KEY
const VITE_MIMO_MODEL = import.meta.env.VITE_MIMO_MODEL
const VITE_MIMO_BASE_URL = import.meta.env.VITE_MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1'
// 生产环境代理 URL（用于解决跨域问题）
// 如果设置了 VITE_PROXY_URL，生产环境将使用该代理；否则直接调用 API（可能遇到跨域问题）
const VITE_PROXY_URL = import.meta.env.VITE_PROXY_URL

// 获取 API 端点：开发环境使用代理，生产环境根据配置选择
const getApiEndpoint = (path: string) => {
  if (import.meta.env.DEV) {
    // 开发环境使用 Vite 代理
    return `/api${path}`
  } else {
    // 生产环境：如果配置了代理 URL，使用代理；否则直接调用 API
    if (VITE_PROXY_URL) {
      // 使用外部代理服务（解决跨域问题）
      return `${VITE_PROXY_URL}${path}`
    } else {
      // 直接调用 API（可能遇到跨域问题，需要 API 服务器支持 CORS）
      return `${VITE_MIMO_BASE_URL}${path}`
    }
  }
}

const SYSTEM_PROMPT = computed(() => {
  const modePrompt = PROMPTS[mode.value as keyof typeof PROMPTS] || PROMPTS.beginner
  return `${modePrompt}

今天的课题是：${subject.value}

你的目标是向用户（你的老师）学习。
行为准则：
1. 始终保持在该模式的设定下。
2. 如果不懂，不要假装懂。指出解释中的盲点或瑕疵。
3. 当你最终理解时，表达出该模式下特有的反馈感。
4. 称呼用户为"老师"或"教授"。

IMPORTANT: at the end of your response, strictly output your current understanding score and topic using these tags:
[TOPIC: the concept being discussed]
[SCORE: number 0-100]

Example:
[TOPIC: ${subject.value}]
[SCORE: 15]`
})

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
  messages.value.push({
    id: assistantId,
    role: 'assistant',
    content: '',
    createdAt: Date.now(),
  })
  // Get the reactive message object from the array
  const assistantMessage = messages.value[messages.value.length - 1]
  if (!assistantMessage) return // Should not happen

  isResponding.value = true

  try {
    if (!VITE_MIMO_KEY) {
      throw new Error('No API key found. Please set VITE_MIMO_KEY in your .env file.')
    }

    const endpoint = getApiEndpoint('/chat/completions')

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VITE_MIMO_KEY}`,
      },
      body: JSON.stringify({
        model: VITE_MIMO_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT.value },
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
          if (!trimmed) continue

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6)

            if (dataStr === '[DONE]') {
              done = true
              break
            }

            try {
              const data = JSON.parse(dataStr)
              const content = data.choices[0]?.delta?.content || ''
              if (content) {
                // Buffer the full content to check for metadata at the end
                assistantMessage.content += content

                // Check for Topic
                const topicRegex = /\[TOPIC:\s*(.*?)\]/
                const topicMatch = assistantMessage.content.match(topicRegex)
                if (topicMatch) {
                  // @ts-expect-error - topicMatch is not undefined
                  const newTopic = topicMatch[1].trim()
                  if (newTopic) currentTopic.value = newTopic
                  assistantMessage.content = assistantMessage.content
                    .replace(topicMatch[0], '')
                    .trim()
                }

                // Check for Score
                const scoreRegex = /\[SCORE:\s*(\d+)\]/
                const scoreMatch = assistantMessage.content.match(scoreRegex)
                if (scoreMatch) {
                  // @ts-expect-error - scoreMatch is not undefined
                  const newScore = parseInt(scoreMatch[1], 10)
                  if (!isNaN(newScore)) understandingScore.value = newScore
                  assistantMessage.content = assistantMessage.content
                    .replace(scoreMatch[0], '')
                    .trim()
                }
              }
            } catch (e) {
              console.error('Error parsing stream chunks', e)
            }
          }
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        messages.value.push({
          id: Date.now(),
          role: 'assistant',
          content: '请求已取消',
          createdAt: Date.now(),
        })
      } else {
        messages.value.push({
          id: Date.now(),
          role: 'assistant',
          content: `发生错误: ${err.message}`,
          createdAt: Date.now(),
        })
      }
    }
  } finally {
    isResponding.value = false
  }
}

const handleToggleSidebar = () => {
  // Logic to toggle sidebar if needed, or remove if not used
  // currently sidebar manages its own state, but we can emit from header if we want global control.
  // For now, let's just log it or implement a global state if resizing is needed.
  console.log('Toggle sidebar')
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
      <ChatHeader
        :topic="currentTopic"
        :score="understandingScore"
        @toggle-sidebar="handleToggleSidebar"
        @end-teaching="handleEndTeaching"
      />

      <MessageList :messages="messages" :is-responding="isResponding" :mode="mode" />

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
