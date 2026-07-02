'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { createClient } from '@/supabase/client'

/* ── helpers ── */
const fmt = (n: number, cur = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(n)

/* ── Statement Generator types ── */
interface StatementTx {
  date: string
  description: string
  credit: number
  debit: number
}

import QRCode from 'qrcode'

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'pdf' | 'statement' | 'qr' | 'currency' | 'loan'>('pdf')
  const [toast, setToast] = useState<string | null>(null)

  // ── PDF Converter state ──
  const [htmlInput, setHtmlInput] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f3f4f6; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <h1>Sample Report</h1>
  <p>This is a preview of your HTML-to-PDF conversion.</p>
  <table>
    <tr><th>Item</th><th>Amount</th></tr>
    <tr><td>Revenue Q1</td><td>$12,400</td></tr>
    <tr><td>Expenses Q1</td><td>$8,200</td></tr>
    <tr><td><strong>Net</strong></td><td><strong>$4,200</strong></td></tr>
  </table>
</body>
</html>`)
  const [pdfConverting, setPdfConverting] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // ── Statement Generator state ──
  const [stmtName, setStmtName] = useState('')
  const [stmtPeriod, setStmtPeriod] = useState('')
  const [stmtTxs, setStmtTxs] = useState<StatementTx[]>([
    { date: '', description: '', credit: 0, debit: 0 }
  ])
  const [stmtLoading, setStmtLoading] = useState(false)
  const [stmtFromDB, setStmtFromDB] = useState(false)
  const [dbLoading, setDbLoading] = useState(false)

  // ── QR Code Generator state ──
  const [qrUrl, setQrUrl] = useState('https://quantivo.dev')
  const [qrDataUrl, setQrDataUrl] = useState('')

  // ── Currency Converter state ──
  const [currencyAmount, setCurrencyAmount] = useState<number>(1000)

  // ── Loan Calculator state ──
  const [loanPrincipal, setLoanPrincipal] = useState<number>(100000)
  const [loanRate, setLoanRate] = useState<number>(5)
  const [loanYears, setLoanYears] = useState<number>(30)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  /* ── PDF Converter ── */
  const handleConvertPDF = async () => {
    setPdfConverting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })

      // Use iframe srcdoc to get rendered content, then use html2canvas approach via jsPDF html()
      const iframe = iframeRef.current
      if (!iframe || !iframe.contentDocument) {
        showToast('Preview not ready — try again in a moment.')
        setPdfConverting(false)
        return
      }

      const element = iframe.contentDocument.body
      await (doc as any).html(element, {
        callback: (doc: any) => {
          doc.save('converted-document.pdf')
          showToast('PDF downloaded successfully!')
          setPdfConverting(false)
        },
        x: 40,
        y: 40,
        width: 515,
        windowWidth: 794,
        autoPaging: 'text'
      })
    } catch (e) {
      console.error(e)
      showToast('PDF conversion failed. Try simplifying the HTML.')
      setPdfConverting(false)
    }
  }

  /* ── Statement Generator ── */
  const loadFromDatabase = async () => {
    setDbLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setDbLoading(false); return }

    const { data, error } = await supabase
      .from('transactions')
      .select('date, title, amount, type')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .limit(50)

    if (!error && data && data.length > 0) {
      setStmtTxs(data.map(tx => ({
        date: tx.date,
        description: tx.title || '',
        credit: tx.type === 'income' ? Number(tx.amount) : 0,
        debit: tx.type === 'expense' ? Number(tx.amount) : 0
      })))
      setStmtFromDB(true)
      showToast(`Loaded ${data.length} transactions from database.`)
    } else {
      showToast('No transactions found in database.')
    }
    setDbLoading(false)
  }

  const addStmtRow = () => setStmtTxs(prev => [...prev, { date: '', description: '', credit: 0, debit: 0 }])

  const updateStmtRow = (i: number, field: keyof StatementTx, value: string | number) => {
    setStmtTxs(prev => prev.map((tx, idx) => idx === i ? { ...tx, [field]: value } : tx))
  }

  const removeStmtRow = (i: number) => {
    if (stmtTxs.length === 1) return
    setStmtTxs(prev => prev.filter((_, idx) => idx !== i))
  }

  const totalCredits = stmtTxs.reduce((s, tx) => s + Number(tx.credit || 0), 0)
  const totalDebits = stmtTxs.reduce((s, tx) => s + Number(tx.debit || 0), 0)
  const netBalance = totalCredits - totalDebits

  const generateStatement = async () => {
    setStmtLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      
      const el = document.getElementById('statement-pdf-template')
      if (!el) {
        showToast('Template not found.')
        setStmtLoading(false)
        return
      }

      // Ensure the element is temporarily visible for html2canvas
      el.style.display = 'block'
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      el.style.display = 'none'

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Statement-${stmtName || 'Account'}.pdf`)
      showToast('Statement PDF downloaded!')
    } catch (e) {
      console.error(e)
      showToast('Error generating statement. Please try again.')
    }
    setStmtLoading(false)
  }

  const glassPanel = {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px'
  } as const

  const inputStyle = {
    background: 'rgba(1,15,31,0.7)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '1440px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#e1dfff', margin: 0 }}>Tools</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>Productivity tools for financial documents.</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', background: 'rgba(1,15,31,0.5)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
        {[
          { key: 'pdf', label: '📄 PDF Converter' },
          { key: 'statement', label: '🧾 Statement Generator' },
          { key: 'qr', label: '📱 QR Code Generator' },
          { key: 'currency', label: '💱 Currency Converter' },
          { key: 'loan', label: '💰 Loan Calculator' }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: 500, transition: 'all 0.2s',
              background: activeTab === tab.key ? 'rgba(192,193,255,0.15)' : 'transparent',
              color: activeTab === tab.key ? '#c0c1ff' : 'var(--text-muted)'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* PDF Converter */}
      {activeTab === 'pdf' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Editor */}
          <div style={{ ...glassPanel, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e1dfff', margin: 0 }}>HTML Editor</h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>paste any HTML</span>
            </div>
            <textarea
              value={htmlInput}
              onChange={e => setHtmlInput(e.target.value)}
              style={{ ...inputStyle, height: '420px', resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', lineHeight: 1.6 }}
              spellCheck={false}
            />
            <button onClick={handleConvertPDF} disabled={pdfConverting || !htmlInput.trim()}
              style={{ padding: '12px', borderRadius: '10px', background: '#c0c1ff', color: 'var(--bg-canvas)', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: pdfConverting ? 0.6 : 1 }}>
              {pdfConverting ? 'Converting…' : '⬇ Download as PDF'}
            </button>
          </div>

          {/* Preview */}
          <div style={{ ...glassPanel, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e1dfff', margin: 0 }}>Live Preview</h2>
              <span style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(192,193,255,0.1)', color: '#c0c1ff', borderRadius: '999px', border: '1px solid rgba(192,193,255,0.2)' }}>RENDERED</span>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={htmlInput}
              style={{ flex: 1, minHeight: '420px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'white' }}
              sandbox="allow-same-origin"
              title="HTML Preview"
            />
          </div>
        </div>
      )}

      {/* Statement Generator */}
      {activeTab === 'statement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header fields */}
          <div style={{ ...glassPanel, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e1dfff', margin: 0 }}>Statement Details</h2>
              <button onClick={loadFromDatabase} disabled={dbLoading}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(192,193,255,0.1)', color: '#c0c1ff', border: '1px solid rgba(192,193,255,0.2)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                {dbLoading ? 'Loading…' : '↓ Load from Database'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Holder Name</label>
                <input style={inputStyle} placeholder="e.g. John Smith" value={stmtName} onChange={e => setStmtName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statement Period</label>
                <input style={inputStyle} placeholder="e.g. Jan 2024 – Jun 2024" value={stmtPeriod} onChange={e => setStmtPeriod(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Total Credits', value: fmt(totalCredits), color: '#4ade80' },
              { label: 'Total Debits', value: fmt(totalDebits), color: '#f87171' },
              { label: 'Net Balance', value: fmt(netBalance), color: netBalance >= 0 ? '#4ade80' : '#f87171' }
            ].map(kpi => (
              <div key={kpi.label} style={{ ...glassPanel, padding: '20px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: kpi.color, margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Transactions Table */}
          <div style={{ ...glassPanel, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e1dfff', margin: 0 }}>Transactions {stmtFromDB && <span style={{ fontSize: '11px', color: '#c0c1ff', marginLeft: '8px' }}>• from database</span>}</h3>
              <button onClick={addStmtRow} style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(192,193,255,0.1)', color: '#c0c1ff', border: '1px solid rgba(192,193,255,0.2)', fontSize: '13px', cursor: 'pointer' }}>+ Add Row</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Date', 'Description', 'Credit ($)', 'Debit ($)', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stmtTxs.map((tx, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 16px' }}><input type="date" style={{ ...inputStyle, width: '140px' }} value={tx.date} onChange={e => updateStmtRow(i, 'date', e.target.value)} /></td>
                      <td style={{ padding: '8px 16px' }}><input style={inputStyle} placeholder="Description" value={tx.description} onChange={e => updateStmtRow(i, 'description', e.target.value)} /></td>
                      <td style={{ padding: '8px 16px' }}><input type="number" step="0.01" style={{ ...inputStyle, width: '120px', color: '#4ade80' }} placeholder="0.00" value={tx.credit || ''} onChange={e => updateStmtRow(i, 'credit', parseFloat(e.target.value) || 0)} /></td>
                      <td style={{ padding: '8px 16px' }}><input type="number" step="0.01" style={{ ...inputStyle, width: '120px', color: '#f87171' }} placeholder="0.00" value={tx.debit || ''} onChange={e => updateStmtRow(i, 'debit', parseFloat(e.target.value) || 0)} /></td>
                      <td style={{ padding: '8px 16px' }}>
                        <button onClick={() => removeStmtRow(i)} disabled={stmtTxs.length === 1} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generate Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={generateStatement} disabled={stmtLoading}
              style={{ padding: '14px 32px', borderRadius: '999px', background: '#c0c1ff', color: 'var(--bg-canvas)', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', opacity: stmtLoading ? 0.6 : 1 }}>
              {stmtLoading ? 'Generating…' : '⬇ Download Statement PDF'}
            </button>
          </div>
        </div>
      )}

      {/* QR Code Generator */}
      {activeTab === 'qr' && (
        <div style={{ ...glassPanel, padding: '32px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e1dfff', margin: 0 }}>QR Code Generator</h2>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target URL / Text</label>
            <input style={inputStyle} value={qrUrl} onChange={e => setQrUrl(e.target.value)} placeholder="https://..." />
          </div>
          <button onClick={async () => {
            if (!qrUrl) return
            try {
              const url = await QRCode.toDataURL(qrUrl, { width: 300, margin: 2, color: { dark: 'var(--bg-canvas)', light: '#ffffff' } })
              setQrDataUrl(url)
              showToast('QR Code Generated')
            } catch (err) {
              showToast('Error generating QR code')
            }
          }} style={{ padding: '12px', borderRadius: '10px', background: '#c0c1ff', color: 'var(--bg-canvas)', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Generate QR Code</button>
          
          {qrDataUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <img src={qrDataUrl} alt="QR Code" style={{ borderRadius: '12px', border: '4px solid white' }} />
              <a href={qrDataUrl} download="quantivo-qr.png" style={{ color: '#c0c1ff', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>⬇ Download Image</a>
            </div>
          )}
        </div>
      )}

      {/* Currency Converter */}
      {activeTab === 'currency' && (
        <div style={{ ...glassPanel, padding: '32px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e1dfff', margin: 0 }}>Currency Converter (from USD)</h2>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount in USD ($)</label>
            <input type="number" style={{ ...inputStyle, fontSize: '24px', padding: '16px' }} value={currencyAmount} onChange={e => setCurrencyAmount(parseFloat(e.target.value) || 0)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            {[
              { cur: 'EUR', rate: 0.92, sym: '€' },
              { cur: 'GBP', rate: 0.79, sym: '£' },
              { cur: 'CAD', rate: 1.36, sym: 'C$' },
              { cur: 'AUD', rate: 1.52, sym: 'A$' }
            ].map(c => (
              <div key={c.cur} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{c.cur}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#e1dfff' }}>{c.sym}{(currencyAmount * c.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loan Calculator */}
      {activeTab === 'loan' && (
        <div style={{ ...glassPanel, padding: '32px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e1dfff', margin: 0 }}>Loan Calculator</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Principal Amount ($)</label>
              <input type="number" style={inputStyle} value={loanPrincipal} onChange={e => setLoanPrincipal(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Interest Rate (%)</label>
              <input type="number" step="0.1" style={inputStyle} value={loanRate} onChange={e => setLoanRate(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Loan Term (Years)</label>
              <input type="number" style={inputStyle} value={loanYears} onChange={e => setLoanYears(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          
          {(() => {
            const p = loanPrincipal;
            const r = loanRate / 100 / 12;
            const n = loanYears * 12;
            const monthlyPayment = p > 0 && r > 0 && n > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
            const totalPayment = monthlyPayment * n;
            const totalInterest = totalPayment - p;
            
            return (
              <div style={{ marginTop: '16px', background: 'rgba(74,222,128,0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(74,222,128,0.2)' }}>
                <div style={{ fontSize: '13px', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Estimated Monthly Payment</div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#4ade80', marginBottom: '16px' }}>${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(74,222,128,0.2)', paddingTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Principal</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#e1dfff' }}>${p.toLocaleString('en-US')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Interest</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#f87171' }}>${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 200, background: 'rgba(13,28,45,0.95)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 20px', color: '#e1dfff', fontSize: '14px', backdropFilter: 'blur(12px)' }}>
          {toast}
        </div>
      )}

      {/* Hidden PDF Template for html2canvas */}
      <div id="statement-pdf-template" style={{ display: 'none', position: 'absolute', top: 0, left: '-9999px', width: '800px', backgroundColor: 'white', color: '#111827', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>STATEMENT</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Generated: {new Date().toLocaleDateString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>Q</div>
              Quantivo
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Account Holder</h3>
            <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{stmtName || 'Unknown User'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Statement Period</h3>
            <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{stmtPeriod || 'N/A'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ flex: 1, background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px' }}>Total Credits</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{fmt(totalCredits)}</div>
          </div>
          <div style={{ flex: 1, background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px' }}>Total Debits</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>{fmt(totalDebits)}</div>
          </div>
          <div style={{ flex: 1, background: '#eef2ff', padding: '16px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#4f46e5', marginBottom: '4px' }}>Net Balance</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: netBalance >= 0 ? '#10b981' : '#ef4444' }}>{fmt(netBalance)}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', background: '#f9fafb', color: '#374151', borderBottom: '2px solid #e5e7eb', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px 16px', background: '#f9fafb', color: '#374151', borderBottom: '2px solid #e5e7eb', fontWeight: 600 }}>Description</th>
              <th style={{ padding: '12px 16px', background: '#f9fafb', color: '#374151', borderBottom: '2px solid #e5e7eb', fontWeight: 600, textAlign: 'right' }}>Credit</th>
              <th style={{ padding: '12px 16px', background: '#f9fafb', color: '#374151', borderBottom: '2px solid #e5e7eb', fontWeight: 600, textAlign: 'right' }}>Debit</th>
              <th style={{ padding: '12px 16px', background: '#f9fafb', color: '#374151', borderBottom: '2px solid #e5e7eb', fontWeight: 600, textAlign: 'right' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let running = 0;
              return stmtTxs.map((tx, i) => {
                running += Number(tx.credit || 0) - Number(tx.debit || 0)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px', color: '#4b5563' }}>{tx.date || '-'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{tx.description || '-'}</td>
                    <td style={{ padding: '12px 16px', color: '#10b981', textAlign: 'right', fontFamily: 'monospace' }}>{tx.credit ? fmt(tx.credit) : '-'}</td>
                    <td style={{ padding: '12px 16px', color: '#ef4444', textAlign: 'right', fontFamily: 'monospace' }}>{tx.debit ? fmt(tx.debit) : '-'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(running)}</td>
                  </tr>
                )
              })
            })()}
          </tbody>
        </table>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
          This statement is computer-generated by Quantivo. For official use, please verify with your financial institution.
        </div>
      </div>
    </div>
  )
}
