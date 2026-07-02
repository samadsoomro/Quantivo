'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'

export default function QRCodePage() {
  const [text, setText] = useState('https://quantivo.app')
  const [size, setSize] = useState(300)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [qrType, setQrType] = useState<'url' | 'text' | 'email' | 'phone' | 'wifi'>('url')

  const [wifiSsid, setWifiSsid] = useState('')
  const [wifiPass, setWifiPass] = useState('')
  const [wifiSec, setWifiSec] = useState('WPA')
  const [emailAddr, setEmailAddr] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [phone, setPhone] = useState('')

  const getQRContent = () => {
    switch (qrType) {
      case 'wifi': return `WIFI:T:${wifiSec};S:${wifiSsid};P:${wifiPass};;`
      case 'email': return `mailto:${emailAddr}?subject=${encodeURIComponent(emailSubject)}`
      case 'phone': return `tel:${phone}`
      default: return text
    }
  }

  const generateQR = async () => {
    const content = getQRContent()
    if (!content) return
    setGenerating(true)
    try {
      const QRCode = (await import('qrcode')).default
      const dataUrl = await QRCode.toDataURL(content, {
        width: size,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: 'H',
        margin: 2
      })
      setQrDataUrl(dataUrl)
    } catch (e) {
      console.error(e)
    }
    setGenerating(false)
  }

  useEffect(() => { generateQR() }, [text, size, fgColor, bgColor, qrType, wifiSsid, wifiPass, wifiSec, emailAddr, emailSubject, phone])

  const download = (fmt: 'png' | 'svg') => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qrcode.${fmt}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
  const labelStyle = { color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }

  const TYPES = [
    { id: 'url', label: 'URL', icon: 'link' },
    { id: 'text', label: 'Text', icon: 'text_fields' },
    { id: 'email', label: 'Email', icon: 'email' },
    { id: 'phone', label: 'Phone', icon: 'call' },
    { id: 'wifi', label: 'WiFi', icon: 'wifi' },
  ]

  return (
    <ToolLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>QR Code Generator</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Generate custom QR codes for URLs, text, WiFi, email, and phone numbers.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          {/* Left - Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Type tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setQrType(t.id as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '999px',
                    background: qrType === t.id ? 'var(--color-primary)' : 'var(--bg-card)',
                    color: qrType === t.id ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                    border: `1px solid ${qrType === t.id ? 'transparent' : 'var(--border-color)'}`,
                    cursor: 'pointer', fontSize: '13px', fontWeight: qrType === t.id ? 700 : 400, transition: 'all 0.15s'
                  }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content fields */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(qrType === 'url' || qrType === 'text') && (
                <div>
                  <label style={labelStyle}>{qrType === 'url' ? 'Website URL' : 'Text Content'}</label>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: 'none' }}
                    placeholder={qrType === 'url' ? 'https://example.com' : 'Enter any text...'}
                  />
                </div>
              )}
              {qrType === 'wifi' && (
                <>
                  <div>
                    <label style={labelStyle}>Network Name (SSID)</label>
                    <input style={inputStyle} value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} placeholder="MyHomeNetwork" />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <input type="password" style={inputStyle} value={wifiPass} onChange={e => setWifiPass(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={labelStyle}>Security</label>
                    <select style={inputStyle} value={wifiSec} onChange={e => setWifiSec(e.target.value)}>
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None</option>
                    </select>
                  </div>
                </>
              )}
              {qrType === 'email' && (
                <>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" style={inputStyle} value={emailAddr} onChange={e => setEmailAddr(e.target.value)} placeholder="contact@example.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>Subject (optional)</label>
                    <input style={inputStyle} value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Hello" />
                  </div>
                </>
              )}
              {qrType === 'phone' && (
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" />
                </div>
              )}
            </div>

            {/* Customization */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Customization</h3>
              <div>
                <label style={labelStyle}>Size: {size}×{size}px</label>
                <input type="range" min={100} max={600} step={50} value={size} onChange={e => setSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Foreground Color</label>
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ ...inputStyle, padding: '6px', height: '40px', cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={labelStyle}>Background Color</label>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ ...inputStyle, padding: '6px', height: '40px', cursor: 'pointer' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{ fg: '#000000', bg: '#ffffff' }, { fg: '#c0c1ff', bg: '#051424' }, { fg: '#4ade80', bg: '#052014' }, { fg: '#f87171', bg: '#1c0505' }].map((p, i) => (
                  <button key={i} onClick={() => { setFgColor(p.fg); setBgColor(p.bg) }}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', background: p.bg, border: `3px solid ${p.fg}`, cursor: 'pointer' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Right - Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Preview</h3>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" style={{ width: '100%', maxWidth: '260px', borderRadius: '8px', imageRendering: 'pixelated' }} />
              ) : (
                <div style={{ width: '260px', height: '260px', background: 'var(--bg-elevated)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Enter content above</span>
                </div>
              )}
            </div>

            <button onClick={() => download('png')} disabled={!qrDataUrl}
              style={{ width: '100%', background: '#fa8c00', color: '#000', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: qrDataUrl ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: qrDataUrl ? 1 : 0.5, transition: 'all 0.2s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
