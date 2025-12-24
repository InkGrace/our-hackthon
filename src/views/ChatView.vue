<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
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
const STORAGE_KEY = 'chat_messages'

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

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.length > 0 && parsed[0].content === initialMessage.value) {
        messages.value = parsed
      }
    } catch (e) {
      console.error('Failed to load chat history', e)
    }
  }
})

watch(
  messages,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
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

const composer = ref('')
const isResponding = ref(false)
const currentTopic = ref(subject.value)
const understandingScore = ref(0)

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

IMPORTANT: At the very end of your response, you MUST output a metadata block strictly in this format:
<<<METADATA: {"topic": "string", "score": number}>>>
- "topic": The specific concept being discussed (in Chinese).
- "score": An integer 0-100 representing your current understanding of THIS topic. Start low (0-20). Increase only when the user explains clearly. If you are confused, lower it.
Example: <<<METADATA: {"topic": "${subject.value}", "score": 15}>>>`
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

                // Check for metadata pattern
                const metadataRegex = /<<<METADATA: ({.*})>>>/
                const match = assistantMessage.content.match(metadataRegex)

                if (match) {
                  try {
                    const metadata = JSON.parse(match[1])
                    if (metadata.topic) currentTopic.value = metadata.topic as string
                    if (typeof metadata.score === 'number')
                      understandingScore.value = metadata.score

                    // Remove metadata from display content
                    assistantMessage.content = assistantMessage.content.replace(match[0], '').trim()
                  } catch (e) {
                    console.error('Failed to parse metadata JSON', e)
                  }
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
      />

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
