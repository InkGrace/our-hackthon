<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import markdownit from 'markdown-it'
import PROMPTS from '@/constants/prompt'

const router = useRouter()
const md = markdownit()

const isLoading = ref(true)
const report = ref<{
  grade: string
  score: number
  mastery: number // 0-5
  summary: string
  blindSpots: string[]
}>({
  grade: '-',
  score: 0,
  mastery: 0,
  summary: '',
  blindSpots: [],
})

const VITE_MIMO_KEY = import.meta.env.VITE_MIMO_KEY
const VITE_MIMO_MODEL = import.meta.env.VITE_MIMO_MODEL
const VITE_MIMO_BASE_URL = import.meta.env.VITE_MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1'

// 获取 API 端点：开发环境使用代理，生产环境直接使用完整 URL
const getApiEndpoint = (path: string) => {
  if (import.meta.env.DEV) {
    // 开发环境使用代理
    return `/api${path}`
  } else {
    // 生产环境直接使用完整 URL
    return `${VITE_MIMO_BASE_URL}${path}`
  }
}

const generateReport = async () => {
  const savedMessages = localStorage.getItem('chat_messages')
  if (!savedMessages) {
    isLoading.value = false
    return
  }

  const messages = JSON.parse(savedMessages)

  // Prompt optimized for streaming parsing
  const prompt = `${PROMPTS.settlement}
  ${JSON.stringify(messages)}
  `

  try {
    if (!VITE_MIMO_KEY) throw new Error('Missing API Key')

    const response = await fetch(getApiEndpoint('/chat/completions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VITE_MIMO_KEY}`,
      },
      body: JSON.stringify({
        model: VITE_MIMO_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are an educational assessment expert. Output in the requested custom format.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        stream: true, // Enable streaming
        max_completion_tokens: 1024,
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    if (!response.body) throw new Error('ReadableStream not supported.')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let done = false
    let buffer = ''
    // const fullContent = ''

    // Parsing state
    // We process the accumulated text globally in handleStreamContent

    isLoading.value = false // Start showing content immediately

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep last partial line

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6)
            if (dataStr === '[DONE]') break

            try {
              const data = JSON.parse(dataStr)
              const content = data.choices[0]?.delta?.content || ''

              if (content) {
                handleStreamContent(content)
              }
            } catch (e) {
              console.error('Stream parse error', e)
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to generate report', e)
    // Fallback Mock Data
    report.value = {
      grade: 'B+',
      score: 85,
      mastery: 4,
      summary:
        'API Generation Failed (Mock): You explained the concept clearly but missed some edge cases.',
      blindSpots: ['Check network connection', 'Verify API Key'],
    }
    isLoading.value = false
  }
}

const accumulatedText = ref('')

const handleStreamContent = (chunk: string) => {
  accumulatedText.value += chunk
  parseAccumulatedText()
}

const parseAccumulatedText = () => {
  const text = accumulatedText.value

  if (!report.value) return

  // Extract Grade
  // Match "**教学评分**：A" or similar
  const gradeMatch = text.match(/\*\*教学评分\*\*：\s*([A-Z][+-]?)/i)
  if (gradeMatch && gradeMatch[1]) {
    report.value.grade = gradeMatch[1].trim()

    // Map grade to score approximately for the gauge (if displayed)
    const gradeScores: Record<string, number> = {
      'A+': 98,
      A: 95,
      'A-': 90,
      'B+': 85,
      B: 80,
      'B-': 75,
      'C+': 70,
      C: 65,
      'C-': 60,
      D: 50,
      F: 30,
    }
    const g = report.value.grade.toUpperCase()
    if (gradeScores[g]) report.value.score = gradeScores[g]
  }

  // Extract Mastery (Stars)
  // Match "**核心概念掌握度**：⭐⭐⭐⭐"
  const masteryMatch = text.match(/\*\*核心概念掌握度\*\*：\s*(.+)/)
  if (masteryMatch && masteryMatch[1]) {
    const starStr = masteryMatch[1]
    const fullStars = (starStr.match(/⭐/g) || []).length
    // Check for half star text or specific unicode if model uses usually just ⭐
    report.value.mastery = fullStars
  }

  // Extract Summary
  // Between "**🎓 总结**：" and "**🔍 待加强的盲区**："
  const summaryStartTags = ['**🎓 总结**：', '**🎓 总结**:', '## 🎓 总结', '### 🎓 总结']
  const blindSpotTags = [
    '**🔍 待加强的盲区**：',
    '**🔍 待加强的盲区**:',
    '## 🔍 待加强的盲区',
    '### 🔍 待加强的盲区',
  ]

  let sIndex = -1
  let summaryTagLen = 0
  for (const tag of summaryStartTags) {
    const idx = text.indexOf(tag)
    if (idx !== -1) {
      sIndex = idx
      summaryTagLen = tag.length
      break
    }
  }

  let bsIndex = -1
  let bsTagLen = 0
  for (const tag of blindSpotTags) {
    const idx = text.indexOf(tag)
    if (idx !== -1) {
      bsIndex = idx
      bsTagLen = tag.length
      break
    }
  }

  if (sIndex !== -1) {
    if (bsIndex !== -1 && bsIndex > sIndex) {
      report.value.summary = text.substring(sIndex + summaryTagLen, bsIndex).trim()
    } else {
      report.value.summary = text.substring(sIndex + summaryTagLen).trim()
    }
  }

  // Extract Blind Spots
  if (bsIndex !== -1) {
    const rawBs = text.substring(bsIndex + bsTagLen).trim()
    report.value.blindSpots = rawBs
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('*') || line.startsWith('-')) // Markdown list items
      .map((line) => line.replace(/^[\*\-]\s*/, '').trim())
  }
}

onMounted(() => {
  generateReport()
})

const handleHome = () => {
  localStorage.removeItem('chat_messages') // Optional: clear chat on exit?
  router.push('/')
}

const renderMarkdown = (text: string) => {
  return md.render(text)
}

const renderMarkdownInline = (text: string) => {
  return md.renderInline(text)
}
</script>

<template>
  <div class="settlement-container">
    <div class="settlement-card">
      <h1 class="title">🎉 教学结算 🎉</h1>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>AI 正在分析您的教学表现...</p>
      </div>

      <div v-else-if="report" class="report-content">
        <div class="grade-section">
          <div class="grade-circle">
            <span class="grade-label">教学评分</span>
            <span class="grade-value">{{ report.grade }}</span>
          </div>
          <div class="score-stars">
            <span class="mastery-label">核心概念掌握度</span>
            <div class="stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= report.mastery }"
                >⭐</span
              >
            </div>
          </div>
        </div>

        <div class="summary-section">
          <h3>📝 总结</h3>
          <div class="markdown-body" v-html="renderMarkdown(report.summary)"></div>
        </div>

        <div class="blindspots-section">
          <h3>🔍 待加强的盲区</h3>
          <ul>
            <li v-for="(spot, index) in report.blindSpots" :key="index">
              <span v-html="renderMarkdownInline(spot)"></span>
            </li>
          </ul>
        </div>

        <div class="actions">
          <button class="btn-primary" @click="handleHome">结束教学</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settlement-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
  background-image: linear-gradient(135deg, #f0f4f8 0%, #dbeafe 100%);
  padding: 2rem;
}

.settlement-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 600px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
  min-height: 200px;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.grade-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.grade-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.grade-label {
  font-size: 0.875rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.grade-value {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
}

.score-stars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mastery-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

.stars {
  font-size: 1.5rem;
}

.star {
  opacity: 0.3;
  filter: grayscale(1);
  transition: all 0.3s;
}

.star.filled {
  opacity: 1;
  filter: grayscale(0);
}

.summary-section,
.blindspots-section {
  text-align: left;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.75rem;
}

.blindspots-section ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  color: #475569;
}

.blindspots-section li {
  margin-bottom: 0.5rem;
}

.actions {
  margin-top: 2rem;
}

.btn-primary {
  background: #0f172a;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 99px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Markdown Styles */
:deep(.markdown-body) {
  font-size: 1rem;
  color: #334155;
  line-height: 1.6;
}

:deep(.markdown-body) strong {
  font-weight: 700;
  color: #0f172a;
}

:deep(.markdown-body) em {
  font-style: italic;
}

:deep(.markdown-body) p {
  margin-bottom: 0.75rem;
}

:deep(.markdown-body) ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

:deep(.markdown-body) li {
  margin-bottom: 0.25rem;
}
</style>
