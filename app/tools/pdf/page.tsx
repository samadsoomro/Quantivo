'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'
import { checkToolUsage, recordToolUsage } from '@/lib/usage'
import { useEffect } from 'react'

export default function PDFConverterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [canUse, setCanUse] = useState(true)

  useEffect(() => {
    checkToolUsage('pdf-converter').then(r => { setUsageCount(r.count); setCanUse(r.allowed) })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }, [])

  const handleConvert = async () => {
    if (!file || !canUse) return
    setConverting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      const ext = file.name.split('.').pop()?.toLowerCase()
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        const content = e.target?.result as string
        
        if (ext === 'txt') {
          doc.setFontSize(11)
          doc.setFont('helvetica', 'normal')
          // Split into pages
          const lines = doc.splitTextToSize(content, 170)
          const pageHeight = doc.internal.pageSize.getHeight() - 40
          const lineHeight = 6
          let y = 20
          
          lines.forEach((line: string) => {
            if (y > pageHeight) {
              doc.addPage()
              y = 20
            }
            doc.text(line, 20, y)
            y += lineHeight
          })
        } else if (ext === 'html') {
          // Strip HTML tags and render as text
          const stripped = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          const lines = doc.splitTextToSize(stripped, 170)
          doc.setFontSize(11)
          const pageHeight = doc.internal.pageSize.getHeight() - 40
          const lineHeight = 6
          let y = 20
          lines.forEach((line: string) => {
            if (y > pageHeight) { doc.addPage(); y = 20 }
            doc.text(line, 20, y)
            y += lineHeight
          })
        } else if (ext === 'csv') {
          doc.setFontSize(10)
          const rows = content.split('\n').map((r: string) => r.split(','))
          let y = 20
          const pageHeight = doc.internal.pageSize.getHeight() - 20
          rows.forEach((row: string[], i: number) => {
            if (y > pageHeight) { doc.addPage(); y = 20 }
            if (i === 0) doc.setFont('helvetica', 'bold')
            else doc.setFont('helvetica', 'normal')
            row.forEach((cell, ci) => {
              doc.text(cell.substring(0, 25), 20 + ci * 40, y)
            })
            y += 8
          })
        }

        doc.save(file.name.replace(/\.[^/.]+$/, '') + '.pdf')
        await recordToolUsage('pdf-converter')
        setUsageCount(prev => prev + 1)
        if (usageCount + 1 >= 3) setCanUse(false)
        setConverting(false)
      }
      
      reader.readAsText(file)
    } catch (err) {
      console.error(err)
      setConverting(false)
    }
  }

  const sty = {
    card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px' } as React.CSSProperties,
    dropzone: {
      border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'rgba(192,193,255,0.2)'}`,
      borderRadius: '12px', padding: '64px 24px', textAlign: 'center' as const,
      cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
      background: dragOver ? 'rgba(192,193,255,0.05)' : 'transparent', marginBottom: '24px'
    } as React.CSSProperties
  }

  return (
    <ToolLayout>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: '8px' }}>
          <Link href="/tools" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>← All Tools</Link>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(250,140,0,0.1)', border: '1px solid rgba(250,140,0,0.3)', fontSize: '11px', color: '#fa8c00', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>picture_as_pdf</span>
          Free Tool
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>PDF Converter</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '40px', lineHeight: 1.6 }}>
          Convert TXT, HTML, or CSV files to clean PDF documents instantly.
        </p>

        {usageCount >= 3 && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: '#f87171', margin: 0 }}>Daily limit reached (3/3). Sign up free for unlimited conversions.</p>
            <Link href="/signup" style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>Sign up free</Link>
          </div>
        )}

        <div style={sty.card}>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pdf-file-upload')?.click()}
            style={sty.dropzone}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>upload_file</span>
            {file ? (
              <>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>{file.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Drop your file here</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>or click to browse · TXT, HTML, CSV supported</p>
              </>
            )}
            <input id="pdf-file-upload" type="file" accept=".txt,.html,.csv" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <button
            onClick={handleConvert}
            disabled={!file || converting || !canUse}
            style={{
              width: '100%', background: !file || !canUse ? 'rgba(250,140,0,0.3)' : '#fa8c00',
              color: '#fff', border: 'none', borderRadius: '999px', padding: '14px',
              fontWeight: 700, fontSize: '15px', cursor: file && canUse ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{converting ? 'hourglass_empty' : 'picture_as_pdf'}</span>
            {converting ? 'Converting...' : canUse ? 'Convert & Download PDF' : 'Daily Limit Reached'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Want unlimited conversions?{' '}
          <Link href="/signup" style={{ color: 'var(--color-primary)' }}>Create free account →</Link>
        </p>
      </div>
    </ToolLayout>
  )
}
