'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'

interface AIToolPageProps {
  toolId: string
  title: string
  description: string
  inputLabel: string
  inputPlaceholder: string
  inputType?: 'text' | 'textarea' | 'code'
  extraFields?: Array<{ label: string; placeholder: string; id: string }>
  icon: string
  outputLabel?: string
}

export function AIToolPage({
  toolId, title, description, inputLabel, inputPlaceholder,
  inputType = 'textarea', extraFields = [], icon, outputLabel
}: AIToolPageProps) {
  const [input, setInput] = useState('')
  const [extras, setExtras] = useState<Record<string, string>>({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const combinedInput = extraFields.length > 0
        ? `${input}|${extraFields.map(f => extras[f.id] || '').join('|')}`
        : input

      const res = await fetch('/api/ai-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, input: combinedInput })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setOutput(data.content)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${toolId}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box', resize: 'none' } as React.CSSProperties
  const labelStyle = { color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }

  return (
    <ToolLayout>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', marginBottom: '8px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(var(--color-primary-rgb),0.1)', border: '1px solid rgba(var(--color-primary-rgb),0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--color-primary)' }}>{icon}</span>
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(var(--color-primary-rgb),0.1)', border: '1px solid rgba(var(--color-primary-rgb),0.2)', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'monospace', marginBottom: '4px' }}>
              ✦ AI-POWERED · GROQ
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{description}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Input */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>{inputLabel}</label>
              {inputType === 'code' ? (
                <textarea rows={8} style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }} value={input} onChange={e => setInput(e.target.value)} placeholder={inputPlaceholder} />
              ) : (
                <textarea rows={4} style={inputStyle} value={input} onChange={e => setInput(e.target.value)} placeholder={inputPlaceholder} />
              )}
            </div>

            {extraFields.map(field => (
              <div key={field.id}>
                <label style={labelStyle}>{field.label}</label>
                <input style={{ ...inputStyle, resize: undefined }} value={extras[field.id] || ''} onChange={e => setExtras(prev => ({ ...prev, [field.id]: e.target.value }))} placeholder={field.placeholder} />
              </div>
            ))}

            <button
              onClick={generate}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() ? 'var(--color-primary)' : 'rgba(var(--color-primary-rgb),0.2)',
                color: input.trim() ? 'var(--bg-canvas)' : 'var(--text-muted)',
                border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 700, fontSize: '15px',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                {loading ? 'autorenew' : 'auto_awesome'}
              </span>
              {loading ? 'Generating with AI...' : 'Generate with AI'}
            </button>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#f87171' }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Output */}
          {output && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label style={{ ...labelStyle, margin: 0 }}>{outputLabel || 'Generated Content'}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: copied ? '#4ade80' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', transition: 'color 0.2s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{copied ? 'check' : 'content_copy'}</span>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={download} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                    Download
                  </button>
                  <button onClick={generate} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                    Regenerate
                  </button>
                </div>
              </div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '20px', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-primary)', maxHeight: '600px', overflowY: 'auto', fontFamily: toolId === 'code-explain' ? 'JetBrains Mono, monospace' : 'inherit' }}>
                {output}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </ToolLayout>
  )
}
