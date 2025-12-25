// Vercel Serverless Function 代理
// 这个文件用于 Vercel 部署，解决跨域问题
// 部署到 Vercel 后，访问路径为：https://your-app.vercel.app/api/proxy
// 通过 vercel.json 配置，/api/chat/completions 会被重写到 /api/proxy

// Vercel Serverless Function 类型定义
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VercelRequest = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VercelResponse = any

// CORS 头设置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])
    res.setHeader('Access-Control-Max-Age', '86400') // 24 小时
    return res.status(200).end()
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 设置 CORS 头（在所有响应中）
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods'])
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers'])

  // 获取 API 密钥和配置
  const apiKey = process.env.VITE_MIMO_KEY
  const baseUrl = process.env.VITE_MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1'
  const model = process.env.VITE_MIMO_MODEL || 'mimo-v2-flash'

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    // 获取请求体
    const requestBody = {
      ...req.body,
      model: req.body?.model || model,
    }

    // 转发请求到 Xiaomi MiMo API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return res.status(response.status).json(errorData)
    }

    // 如果是流式响应，需要特殊处理
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/event-stream') || requestBody.stream) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      if (!response.body) {
        return res.status(500).json({ error: 'Stream not available' })
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // 流式传输数据
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            res.end()
            break
          }
          const chunk = decoder.decode(value, { stream: true })
          res.write(chunk)
        }
      } catch (streamError) {
        console.error('Stream error:', streamError)
        res.end()
      }
    } else {
      const data = await response.json()
      return res.status(200).json(data)
    }
  } catch (error) {
    console.error('Proxy error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return res.status(500).json({ error: errorMessage })
  }
}
