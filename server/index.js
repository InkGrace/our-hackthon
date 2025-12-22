import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const deepseekKey = process.env.DEEPSEEK_API_KEY

async function callModel(prompt) {
  console.log('shenzhen prompt', prompt)
  console.log('shenzhen deepseekKey', deepseekKey)
  console.log('shenzhen baseURL', process.env.DEEPSEEK_BASE_URL ?? 'undefined')
  if (deepseekKey) {
    // Use official OpenAI SDK pointed at Deepseek (per provided example)
    const client = new OpenAI({
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      apiKey: deepseekKey,
    })

    const completion = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
    })

    return completion.choices?.[0]?.message?.content ?? String(completion)
  }

  // if (openaiKey) {
  //   const llm = new (await import('langchain/llms/openai')).OpenAI({
  //     openAIApiKey: openaiKey,
  //     modelName: process.env.LC_MODEL || 'gpt-4o-mini',
  //     temperature: 0.2,
  //   })
  //   return await llm.call(prompt)
  // }

  throw new Error('No model provider configured (set DEEPSEEK_API_KEY or OPENAI_API_KEY)')
}

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: 'prompt required' })
    const reply = await callModel(prompt)
    return res.json({ reply })
  } catch (err) {
    console.error('Chat error', err)
    return res.status(500).json({ error: 'internal_server_error', message: String(err) })
  }
})

const port = process.env.PORT || 5174
app.listen(port, () => {
  console.log(`LangChain proxy running on http://localhost:${port}`)
})
