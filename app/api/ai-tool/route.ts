import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const PROMPTS: Record<string, (input: string) => string> = {
  'terms': (name) => `Generate a comprehensive Terms and Conditions document for "${name}". Include: acceptance of terms, user obligations, prohibited uses, intellectual property, liability limitations, termination, governing law, and contact information. Format with clear headers and professional legal language.`,
  
  'privacy': (name) => `Generate a comprehensive Privacy Policy for "${name}". Include: what data is collected, how it's used, third-party sharing, cookies, user rights (GDPR/CCPA compliant), data retention, security measures, and contact information. Format with clear headers.`,
  
  'code-explain': (code) => `Explain the following code clearly and concisely. Describe what it does step by step, any algorithms or patterns used, potential issues, and suggestions for improvement:\n\n\`\`\`\n${code}\n\`\`\``,
  
  'product-desc': (input) => {
    const [product, ...rest] = input.split('|')
    const audience = rest[0] || 'general consumers'
    const tone = rest[1] || 'professional'
    return `Write a compelling product description for: "${product}". Target audience: ${audience}. Tone: ${tone}. Include: attention-grabbing headline, key benefits (not just features), emotional appeal, social proof mention, and a clear call to action. Format with sections.`
  }
}

export async function POST(req: NextRequest) {
  try {
    const { toolId, input } = await req.json()
    
    if (!toolId || !input) {
      return NextResponse.json({ error: 'Missing toolId or input' }, { status: 400 })
    }

    const promptFn = PROMPTS[toolId]
    if (!promptFn) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = promptFn(input)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional business writer and technical expert. Provide thorough, well-formatted, production-ready content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2048,
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq API error:', err)
      return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({ content })
  } catch (error) {
    console.error('AI tool error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
