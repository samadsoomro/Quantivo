'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'

const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
const labelStyle = { color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }

export default function BarcodeGeneratorPage() {
  const [text, setText] = useState('1234567890')
  const [format, setFormat] = useState('CODE128')
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [showText, setShowText] = useState(true)
  const [lineColor, setLineColor] = useState('#000000')
  const [background, setBackground] = useState('#ffffff')
  const [svgContent, setSvgContent] = useState('')
  const [error, setError] = useState('')

  const FORMATS = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'ITF14', 'MSI', 'pharmacode']

  const generate = async () => {
    if (!text) return
    try {
      const JsBarcode = (await import('jsbarcode')).default
      const canvas = document.createElement('canvas')
      JsBarcode(canvas, text, {
        format,
        width,
        height,
        displayValue: showText,
        lineColor,
        background,
        margin: 10,
        fontSize: 14,
      })
      setSvgContent(canvas.toDataURL('image/png'))
      setError('')
    } catch (e: any) {
      setError(e?.message || 'Invalid input for selected format')
      setSvgContent('')
    }
  }

  useEffect(() => { generate() }, [text, format, width, height, showText, lineColor, background])

  const download = () => {
    if (!svgContent) return
    const a = document.createElement('a')
    a.href = svgContent
    a.download = `barcode_${format}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const FORMAT_EXAMPLES: Record<string, string> = {
    CODE128: '1234567890',
    CODE39: 'CODE39',
    EAN13: '5901234123457',
    EAN8: '96385074',
    UPC: '012345678905',
    ITF14: '10012345678902',
    MSI: '1234567',
    pharmacode: '1234',
  }

  return (
    <ToolLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>Barcode Generator</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Generate professional barcodes in 8 formats. Download as PNG for print or digital use.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Barcode Format</label>
                <select style={inputStyle} value={format} onChange={e => { setFormat(e.target.value); setText(FORMAT_EXAMPLES[e.target.value] || text) }}>
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Content</label>
                <input style={inputStyle} value={text} onChange={e => setText(e.target.value)} placeholder="Enter barcode content..." />
                {error && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>⚠ {error}</p>}
              </div>
              <div>
                <label style={labelStyle}>Bar Width: {width}px</label>
                <input type="range" min={1} max={5} step={0.5} value={width} onChange={e => setWidth(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
              </div>
              <div>
                <label style={labelStyle}>Height: {height}px</label>
                <input type="range" min={40} max={250} step={10} value={height} onChange={e => setHeight(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Bar Color</label>
                  <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} style={{ ...inputStyle, padding: '6px', height: '40px', cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={labelStyle}>Background</label>
                  <input type="color" value={background} onChange={e => setBackground(e.target.value)} style={{ ...inputStyle, padding: '6px', height: '40px', cursor: 'pointer' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setShowText(!showText)}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${showText ? 'var(--color-primary)' : 'var(--border-color)'}`, background: showText ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
                  {showText && <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--bg-canvas)' }}>check</span>}
                </div>
                <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Show text below barcode</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minHeight: '200px' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, alignSelf: 'flex-start' }}>Preview</h3>
              {svgContent ? (
                <div style={{ background: background, padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <img src={svgContent} alt="Barcode" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {error || 'Enter content to generate'}
                </div>
              )}
            </div>

            <button onClick={download} disabled={!svgContent}
              style={{ background: svgContent ? '#fa8c00' : 'rgba(250,140,0,0.3)', color: '#000', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: svgContent ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              Download PNG
            </button>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Format Examples</p>
              {Object.entries(FORMAT_EXAMPLES).map(([fmt, ex]) => (
                <div key={fmt} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '4px', color: format === fmt ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: format === fmt ? 700 : 400 }}>{fmt}</span>
                  <span style={{ fontFamily: 'monospace', opacity: 0.7 }}>{ex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
