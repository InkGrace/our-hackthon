<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import markdownit from 'markdown-it'

const router = useRouter()
const md = markdownit()

const isLoading = ref(true)
const report = ref<{
  grade: string
  score: number
  mastery: number // 0-5
  summary: string
  blindSpots: string[]
} | null>(null)

const VITE_MIMO_KEY = import.meta.env.VITE_MIMO_KEY
const VITE_MIMO_MODEL = import.meta.env.VITE_MIMO_MODEL

const generateReport = async () => {
  const savedMessages = localStorage.getItem('chat_messages')
  if (!savedMessages) {
    isLoading.value = false
    return
  }

  const messages = JSON.parse(savedMessages)
  // Filter only user and assistant messages to save context window tokens if needed
  // limit to last 20 messages or so if context is too long, but for now take all.

  const prompt = `Based on the following conversation history between a student (user) and an AI (you), where the user is "teaching" you a concept, please generate a "Teaching Settlement Report".

  The user is exercising the Feynman Technique.

  Return ONLY a valid JSON object with the following structure:
  {
    "grade": "string (e.g., A+, B, C-)",
    "score": number (0-100),
    "mastery": number (0-5 integer),
    "summary": "A short summary of what the user taught and how well they explained it.",
    "blindSpots": ["Point 1", "Point 2", "Point 3"] (Suggestions for improvement or areas they missed)
  }

  Conversation History:
  ${JSON.stringify(messages)}
  `

  try {
    const response = await fetch('/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VITE_MIMO_KEY}`,
      },
      body: JSON.stringify({
        model: VITE_MIMO_MODEL,
        messages: [
          { role: 'system', content: 'You are an educational assessment expert.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    report.value = JSON.parse(content)
  } catch (e) {
    console.error('Failed to generate report', e)
    // Fallback Mock Data for demo if API fails or no key
    report.value = {
      grade: 'B+',
      score: 85,
      mastery: 4,
      summary:
        'API Generation Failed (Mock): You explained the concept clearly but missed some edge cases.',
      blindSpots: ['Review the boundary conditions', 'Use more concrete examples'],
    }
  } finally {
    isLoading.value = false
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
              {{ spot }}
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
</style>
