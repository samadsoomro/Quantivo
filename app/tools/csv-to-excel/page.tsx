'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'

export default function CSVtoExcelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [converting, setConverting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [delimiter, setDelimiter] = useState(',')

  const parseCSV = (text: string, delim: string): string[][] => {
    return text.split('\n')
      .filter(row => row.trim())
      .map(row => {
        // Handle quoted fields
        const result: string[] = []
        let current = ''
        let inQuote = false
        for (let i = 0; i < row.length; i++) {
          if (row[i] === '"') {
            inQuote = !inQuote
          } else if (row[i] === delim && !inQuote) {
            result.push(current.trim())
            current = ''
          } else {
            current += row[i]
          }
        }
        result.push(current.trim())
        return result
      })
  }

  const handleFile = useCallback(async (f: File) => {
    setFile(f)
    const text = await f.text()
    const rows = parseCSV(text, delimiter)
    if (rows.length > 0) {
      setHeaders(rows[0])
      setPreview(rows.slice(1, 6)) // Preview first 5 rows
    }
  }, [delimiter])

  const handleConvert = async () => {
    if (!file) return
    setConverting(true)
    try {
      const XLSX = await import('xlsx')
      const text = await file.text()
      const rows = parseCSV(text, delimiter)
      const ws = XLSX.utils.aoa_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      // Style header row
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
        const cellAddr = XLSX.utils.encode_cell({ r: 0, c })
        if (ws[cellAddr]) {
          ws[cellAddr].s = { font: { bold: true }, fill: { fgColor: { rgb: 'DDEEFF' } } }
        }
      }
      XLSX.writeFile(wb, file.name.replace(/\.csv$/i, '.xlsx'))
    } catch(e) {
      console.error(e)
    }
    setConverting(false)
  }

  return (
    <ToolLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>CSV to Excel Converter</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Convert any CSV or TSV file to .xlsx format with bold headers. No data leaves your browser.</p>

        {/* Delimiter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '32px', marginRight: '4px' }}>Delimiter:</p>
          {[{ label: 'Comma (,)', val: ',' }, { label: 'Tab (\\t)', val: '\t' }, { label: 'Semicolon (;)', val: ';' }].map(d => (
            <button key={d.val} onClick={() => setDelimiter(d.val)}
              style={{ padding: '6px 14px', borderRadius: '999px', background: delimiter === d.val ? 'var(--color-primary)' : 'var(--bg-card)', border: `1px solid ${delimiter === d.val ? 'transparent' : 'var(--border-color)'}`, color: delimiter === d.val ? 'var(--bg-canvas)' : 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: delimiter === d.val ? 700 : 400 }}>
              {d.label}
            </button>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onClick={() => document.getElementById('csv-upload')?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'rgba(192,193,255,0.2)'}`,
            borderRadius: '16px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(192,193,255,0.03)' : 'var(--bg-card)',
            transition: 'all 0.2s', marginBottom: '24px'
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>table_chart</span>
          {file ? (
            <>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>{file.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{(file.size / 1024).toFixed(1)} KB · {headers.length} columns · Click to change</p>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Drop your CSV file here</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>or click to browse · .csv, .tsv supported</p>
            </>
          )}
          <input id="csv-upload" type="file" accept=".csv,.tsv,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>

        {/* Preview table */}
        {headers.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Preview (first 5 rows)</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)' }}>
                    {headers.map((h, i) => (
                      <th key={i} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {headers.map((_, ci) => (
                        <td key={ci} style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '12px' }}>
                          {row[ci] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || converting}
          style={{
            background: file ? '#fa8c00' : 'rgba(250,140,0,0.3)', color: '#000',
            border: 'none', borderRadius: '12px', padding: '14px 32px',
            fontWeight: 700, fontSize: '15px', cursor: file ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
          {converting ? 'Converting...' : 'Convert & Download .xlsx'}
        </button>
      </div>
    </ToolLayout>
  )
}
