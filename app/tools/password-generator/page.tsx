'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'

const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
const labelStyle = { color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
  ambiguous: 'Il1O0'
}

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean; excludeAmbiguous: boolean }) {
  let chars = ''
  if (opts.upper) chars += CHARSETS.uppercase
  if (opts.lower) chars += CHARSETS.lowercase
  if (opts.numbers) chars += CHARSETS.numbers
  if (opts.symbols) chars += CHARSETS.symbols
  if (opts.excludeAmbiguous) {
    CHARSETS.ambiguous.split('').forEach(c => { chars = chars.replaceAll(c, '') })
  }
  if (!chars) return ''
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function getStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return { label: 'Weak', color: '#f87171', pct: 25 }
  if (score <= 4) return { label: 'Fair', color: '#fa8c00', pct: 50 }
  if (score <= 5) return { label: 'Good', color: '#60a5fa', pct: 75 }
  return { label: 'Strong', color: '#4ade80', pct: 100 }
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [nums, setNums] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [passwords, setPasswords] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  const generate = () => {
    const generated = Array.from({ length: quantity }, () =>
      generatePassword(length, { upper, lower, numbers: nums, symbols, excludeAmbiguous })
    )
    setPasswords(generated)
  }

  const copyToClipboard = (pwd: string) => {
    navigator.clipboard.writeText(pwd)
    setCopied(pwd)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = () => {
    navigator.clipboard.writeText(passwords.join('\n'))
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  const strength = passwords[0] ? getStrength(passwords[0]) : null

  const toggleStyle = (active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
    borderRadius: '10px', border: `1px solid ${active ? 'var(--color-primary)' : 'var(--border-color)'}`,
    background: active ? 'rgba(192,193,255,0.05)' : 'var(--bg-card)',
    cursor: 'pointer', transition: 'all 0.15s', color: 'var(--text-primary)', fontSize: '14px'
  }) as React.CSSProperties

  return (
    <ToolLayout>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>Password Generator</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Generate secure, cryptographically random passwords with custom rules.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Options */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Password Length: {length}</label>
              <input type="range" min={4} max={128} value={length} onChange={e => setLength(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)', marginBottom: '8px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace' }}>
                <span>4</span><span>32</span><span>64</span><span>128</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Uppercase (A-Z)', value: upper, set: setUpper },
                { label: 'Lowercase (a-z)', value: lower, set: setLower },
                { label: 'Numbers (0-9)', value: nums, set: setNums },
                { label: 'Symbols (!@#...)', value: symbols, set: setSymbols },
                { label: 'Exclude Ambiguous', value: excludeAmbiguous, set: setExcludeAmbiguous },
              ].map(opt => (
                <div key={opt.label} onClick={() => opt.set(!opt.value)} style={toggleStyle(opt.value)}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${opt.value ? 'var(--color-primary)' : 'var(--border-color)'}`, background: opt.value ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {opt.value && <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--bg-canvas)' }}>check</span>}
                  </div>
                  {opt.label}
                </div>
              ))}

              <div>
                <label style={labelStyle}>Quantity</label>
                <input type="number" min={1} max={50} value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))} style={inputStyle} />
              </div>
            </div>

            <button onClick={generate} style={{ background: '#fa8c00', color: '#000', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              Generate Password{quantity > 1 ? 's' : ''}
            </button>
          </div>

          {/* Results */}
          {passwords.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Generated {passwords.length > 1 ? `${passwords.length} Passwords` : 'Password'}
                </h3>
                {passwords.length > 1 && (
                  <button onClick={copyAll} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>copy_all</span>
                    Copy All
                  </button>
                )}
              </div>

              {strength && passwords.length === 1 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Strength</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: strength.color }}>{strength.label}</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '999px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${strength.pct}%`, background: strength.color, borderRadius: '999px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {passwords.map((pwd, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px 16px' }}>
                    <code style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--text-primary)', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{pwd}</code>
                    <button onClick={() => copyToClipboard(pwd)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === pwd ? '#4ade80' : 'var(--text-muted)', flexShrink: 0, transition: 'color 0.2s' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{copied === pwd ? 'check' : 'content_copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
