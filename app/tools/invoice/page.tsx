'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { checkToolUsage, recordToolUsage } from '@/lib/usage'
import { ToolUsageBanner } from '@/components/ToolUsageBanner'

export default function PublicInvoiceToolPage() {
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [logoBase64, setLogoBase64] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [usageCount, setUsageCount] = useState(0)
  const [canUse, setCanUse] = useState(true)
  
  useEffect(() => {
    const savedLogo = localStorage.getItem('invoice_logo')
    if (savedLogo) setLogoBase64(savedLogo)
    
    checkToolUsage('invoice').then(res => {
      setUsageCount(res.count)
      setCanUse(res.allowed)
    })
  }, [])
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setLogoBase64(base64)
        localStorage.setItem('invoice_logo', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [currency, setCurrency] = useState('USD ($)')
  const [lineItems, setLineItems] = useState([
    { id: '1', description: 'Web Development Services', qty: 5, rate: 120 }
  ])
  const [taxRate, setTaxRate] = useState(5)
  const [notes, setNotes] = useState('Thank you for your business.')
  const [watermarkText, setWatermarkText] = useState('DRAFT')
  const [watermarkColor, setWatermarkColor] = useState('#9ca3af')
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.15)
  const [watermarkSize, setWatermarkSize] = useState(72)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000) }

  const getSymbol = (c: string) => {
    if (c.includes('EUR')) return '€'
    if (c.includes('GBP')) return '£'
    return '$'
  }
  const symbol = getSymbol(currency)

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.rate), 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const handleAddItem = () => {
    setLineItems([...lineItems, { id: Math.random().toString(), description: '', qty: 1, rate: 0 }])
  }

  const handleUpdateItem = (id: string, field: 'description' | 'qty' | 'rate', value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        if (field === 'qty') return { ...item, qty: Math.max(1, parseInt(value) || 0) }
        if (field === 'rate') return { ...item, rate: Math.max(0, parseFloat(value) || 0) }
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleRemoveItem = (id: string) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const presetColors = [
    { label: 'DRAFT', color: '#9ca3af' },
    { label: 'PAID', color: '#4ade80' },
    { label: 'VOID', color: '#f87171' },
    { label: 'COPY', color: '#60a5fa' }
  ]

  const handleDownloadPDF = async () => {
    if (!canUse) {
      showToast('Limit reached. Sign up to unlock.')
      return
    }
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      // Basic PDF Layout
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 20, 20, 40, 20)
        } catch(e) {}
      }
      
      doc.setFontSize(24)
      doc.text("INVOICE", 150, 30)
      doc.setFontSize(10)
      doc.text("INV-001", 150, 38)
      
      doc.setFontSize(10)
      doc.text("FROM:", 20, 60)
      doc.setFontSize(12)
      doc.text(companyName || 'Your Company', 20, 66)
      doc.setFontSize(10)
      doc.text((companyAddress || 'Your Address').split('\n'), 20, 72)
      
      doc.text("TO:", 120, 60)
      doc.setFontSize(12)
      doc.text(clientName || 'Client Name', 120, 66)
      doc.setFontSize(10)
      if (clientEmail) doc.text(clientEmail, 120, 72)
      doc.text((clientAddress || 'Client Address').split('\n'), 120, clientEmail ? 78 : 72)

      doc.text(`Issue Date: ${issueDate}`, 20, 100)
      doc.text(`Due Date: ${dueDate}`, 80, 100)
      doc.text(`Currency: ${currency}`, 140, 100)

      let startY = 120
      doc.setFontSize(10)
      doc.text("Description", 20, startY)
      doc.text("Qty", 120, startY)
      doc.text("Rate", 140, startY)
      doc.text("Amount", 170, startY)
      
      startY += 10
      doc.line(20, startY-5, 190, startY-5)
      
      lineItems.forEach(item => {
        doc.text(item.description, 20, startY)
        doc.text(item.qty.toString(), 120, startY)
        doc.text(`${symbol}${item.rate.toFixed(2)}`, 140, startY)
        doc.text(`${symbol}${(item.qty * item.rate).toFixed(2)}`, 170, startY)
        startY += 10
      })
      
      doc.line(20, startY, 190, startY)
      startY += 10
      
      doc.text(`Subtotal: ${symbol}${subtotal.toFixed(2)}`, 140, startY)
      doc.text(`Tax (${taxRate}%): ${symbol}${taxAmount.toFixed(2)}`, 140, startY+10)
      doc.setFontSize(12)
      doc.text(`Total: ${symbol}${total.toFixed(2)}`, 140, startY+20)

      doc.setFontSize(10)
      doc.text("Notes:", 20, startY)
      doc.text(notes.split('\n'), 20, startY+10)

      // Watermark
      if (watermarkText) {
        doc.setFontSize(watermarkSize)
        doc.setTextColor(watermarkColor)
        const gstate = new (doc as any).GState({opacity: watermarkOpacity})
        doc.setGState(gstate)
        // Draw diagonal center
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        doc.text(watermarkText, pageWidth / 2, pageHeight / 2, { angle: 35, align: 'center' })
      }

      doc.save(`Invoice_${companyName || 'Draft'}.pdf`)
      
      await recordToolUsage('invoice')
      setUsageCount(prev => prev + 1)
      if (usageCount + 1 >= 3) setCanUse(false)
    } catch(err) {
      console.error(err)
      showToast('Error generating PDF')
    }
  }

  const handleDownloadCSV = async () => {
    if (!canUse) {
      showToast('Limit reached. Sign up to unlock.')
      return
    }
    const headers = ['Description', 'Qty', 'Rate', 'Amount']
    const rows = lineItems.map(item => [item.description, item.qty, item.rate, item.qty*item.rate])
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "invoice_data.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    await recordToolUsage('invoice')
    setUsageCount(prev => prev + 1)
    if (usageCount + 1 >= 3) setCanUse(false)
  }

  return (
    <>
      <style>{`
        .glass-panel {
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
        }
        .input-glass {
          background: rgba(1, 15, 31, 0.6);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
        }
        .input-glass:focus {
          outline: none;
          border-color: #c0c1ff;
          box-shadow: 0 0 0 3px rgba(192, 193, 255, 0.15);
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          pointer-events: none;
          white-space: nowrap;
          z-index: 0;
        }
      `}</style>

      {/* Top Navbar */}
      <nav className="w-full sticky top-0 z-50 bg-[var(--bg-canvas)]/80 backdrop-blur-lg border-b border-[var(--border-color)] flex justify-between items-center h-16 px-12">
        <Link href="/" className="font-headline-lg text-xl font-bold text-[var(--text-primary)] tracking-tight">
          Quantivo
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-body-sm text-sm transition-colors px-4 py-2 rounded-full">
            Log In
          </Link>
          <Link href="/signup" className="bg-[var(--color-primary)] text-[var(--bg-canvas)] font-body-sm text-sm font-bold px-6 py-2 rounded-full hover:brightness-110 transition-all">
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-6">
        <ToolUsageBanner toolName="Invoice Generator" usageCount={usageCount} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL: Editor */}
          <div className="glass-panel p-6 flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-[var(--border-color)] pb-4">
              <h1 className="font-headline-lg text-2xl font-bold text-[var(--text-primary)]">New Invoice</h1>
              <span className="font-mono text-xs text-[var(--text-secondary)]">INV-001</span>
            </div>

            {/* Company Info & Logo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-[var(--border-color)] pb-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">From (Your Company)</label>
                  <button onClick={() => logoInputRef.current?.click()} className="text-xs text-[var(--color-primary)] hover:underline font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">upload</span> Upload Logo
                  </button>
                  <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" />
                </div>
                {logoBase64 && (
                  <div className="relative w-max mb-2 group">
                    <img src={logoBase64} alt="Company Logo" className="h-12 object-contain rounded" />
                    <button onClick={() => { setLogoBase64(null); localStorage.removeItem('invoice_logo') }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                  </div>
                )}
                <input
                  className="input-glass rounded-lg px-4 py-2 text-sm"
                  placeholder="Your Company Name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <textarea
                  className="input-glass rounded-lg px-4 py-2 text-xs resize-none"
                  placeholder="Your Address / Details"
                  rows={2}
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </div>

              {/* Client Info */}
              <div className="flex flex-col gap-4">
                <label className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">Billed To (Client)</label>
                <input
                  className="input-glass rounded-lg px-4 py-2 text-sm"
                  placeholder="Client Name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
                <input
                  className="input-glass rounded-lg px-4 py-2 text-xs"
                  placeholder="Client Email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
                <textarea
                  className="input-glass rounded-lg px-4 py-2 text-xs resize-none"
                  placeholder="Client Address"
                  rows={2}
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Dates & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-[var(--border-color)] py-6">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[var(--text-secondary)]">Issue Date</label>
                <input
                  className="input-glass rounded-lg px-4 py-2 text-xs font-mono"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[var(--text-secondary)]">Due Date</label>
                <input
                  className="input-glass rounded-lg px-4 py-2 text-xs font-mono"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[var(--text-secondary)]">Currency</label>
                <select
                  className="input-glass rounded-lg px-4 py-2 text-xs font-mono"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="flex flex-col gap-4">
              <h3 className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] font-mono text-xs text-[var(--text-secondary)]">
                      <th className="pb-2 pl-2 w-1/2">Description</th>
                      <th className="pb-2 px-2 text-right w-1/6">Qty</th>
                      <th className="pb-2 px-2 text-right w-1/6">Rate</th>
                      <th className="pb-2 pr-2 text-right w-1/6">Amount</th>
                      <th className="pb-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-[var(--border-color)]/50">
                        <td className="py-2 pr-2">
                          <input
                            className="input-glass rounded-lg px-3 py-1 w-full text-xs"
                            placeholder="Item description"
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            className="input-glass rounded-lg px-3 py-1 w-full text-right font-mono text-xs"
                            min="1"
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            className="input-glass rounded-lg px-3 py-1 w-full text-right font-mono text-xs"
                            placeholder="0.00"
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleUpdateItem(item.id, 'rate', e.target.value)}
                          />
                        </td>
                        <td className="py-2 pl-2 text-right font-mono text-xs text-[var(--text-primary)]">
                          {symbol}{(item.qty * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[var(--text-secondary)] hover:text-[#ff4433] transition-colors"
                            disabled={lineItems.length === 1}
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleAddItem}
                className="self-start flex items-center gap-2 text-[#fa8c00] hover:text-[var(--text-primary)] transition-colors font-mono text-xs py-2"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add Row
              </button>
            </div>

            {/* Totals & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto pt-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[var(--text-secondary)]">Notes / Terms</label>
                <textarea
                  className="input-glass rounded-lg px-4 py-2 text-xs resize-none"
                  placeholder="Thank you for your business."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 bg-[var(--bg-elevated)]/50 rounded-lg p-4 border border-[var(--border-color)]">
                <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span className="font-mono">{symbol}{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
                  <div className="flex items-center gap-2">
                    <span>Tax Rate</span>
                    <input
                      className="input-glass rounded px-2 py-0.5 w-12 text-right font-mono text-xs"
                      placeholder="0"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                    <span>%</span>
                  </div>
                  <span className="font-mono">{symbol}{taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-[var(--text-primary)]">Total</span>
                  <span className="font-mono font-bold text-[#fa8c00]">{symbol}{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Advanced Watermark Options */}
            <div className="flex flex-col gap-4 border-t border-[var(--border-color)] pt-6 mt-2">
              <h3 className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">branding_watermark</span> 
                Watermark Options
              </h3>
              
              <div className="flex gap-2">
                {presetColors.map(preset => (
                  <button 
                    key={preset.label}
                    onClick={() => { setWatermarkText(preset.label); setWatermarkColor(preset.color) }}
                    className="px-3 py-1 text-[10px] font-bold rounded"
                    style={{ background: preset.color + '22', color: preset.color, border: `1px solid ${preset.color}44` }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-[var(--text-secondary)]">Watermark Text</label>
                  <input
                    className="input-glass rounded-lg px-4 py-2 text-xs"
                    placeholder="QUANTIVO FREE"
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-[var(--text-secondary)]">Color</label>
                  <input
                    type="color"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="h-[34px] w-full bg-transparent border border-[var(--border-color)] rounded cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-[var(--text-secondary)]">Watermark Size: {watermarkSize}px</label>
                  <input
                    type="range"
                    min="40" max="120" step="1"
                    value={watermarkSize}
                    onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                    className="mt-2 w-full accent-[var(--color-primary)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-[var(--text-secondary)]">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                  <input
                    type="range"
                    min="0.05" max="0.30" step="0.01"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="mt-2 w-full accent-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Live Preview */}
          <div className="glass-panel p-6 flex flex-col relative overflow-hidden h-full min-h-[600px]">
            <div className="flex justify-between items-center mb-8 border-b border-[var(--border-color)] pb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--text-secondary)] text-sm">visibility</span>
                <h2 className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">Live Preview</h2>
              </div>
              <span className="bg-[#fa8c00]/10 px-3 py-1 rounded-full font-mono text-xs text-[#fa8c00] border border-[#fa8c00]/20">FREE TRIAL</span>
            </div>

            {/* Invoice Preview Canvas */}
            <div className="flex-1 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-color)] p-6 flex flex-col gap-6 relative z-10 overflow-hidden">
              <div className="watermark font-bold tracking-widest text-center" style={{ color: watermarkColor, opacity: watermarkOpacity, fontSize: `${watermarkSize/1.5}px` }}>
                {watermarkText}
              </div>
              <div className="flex justify-between items-start relative z-10">
                {logoBase64 ? (
                  <img src={logoBase64} alt="Company Logo" className="h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-black/5 rounded-lg border border-[var(--border-color)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--text-muted)] text-[20px]">image</span>
                  </div>
                )}
                <div className="text-right">
                  <div className="font-headline text-lg font-bold text-[var(--text-primary)]">INVOICE</div>
                  <div className="font-mono text-xs text-[var(--text-secondary)]">INV-001</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs relative z-10">
                <div>
                  <div className="font-mono text-[var(--text-secondary)] mb-2 uppercase tracking-wider">FROM</div>
                  <div className="font-bold text-[var(--text-primary)] mb-1">{companyName || '[Your Company]'}</div>
                  <div className="text-[var(--text-secondary)] whitespace-pre-wrap">{companyAddress || '[Your Details]'}</div>
                </div>
                <div>
                  <div className="font-mono text-[var(--text-secondary)] mb-2 uppercase tracking-wider">TO</div>
                  <div className="font-bold text-[var(--text-primary)] mb-1">{clientName || '[Client Name]'}</div>
                  {clientEmail && <div className="text-[var(--text-secondary)] mb-1">{clientEmail}</div>}
                  <div className="text-[var(--text-secondary)] whitespace-pre-wrap">{clientAddress || '[Client Details]'}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs border-y border-[var(--border-color)] py-4 relative z-10">
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">Issue Date</div>
                  <div className="font-mono text-[var(--text-primary)]">{issueDate || '—'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">Due Date</div>
                  <div className="font-mono text-[var(--text-primary)]">{dueDate || '—'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">Currency</div>
                  <div className="font-mono text-[#fa8c00]">{currency}</div>
                </div>
              </div>

              <div className="w-full text-xs relative z-10">
                <div className="grid grid-cols-12 gap-2 border-b border-[var(--border-color)] pb-2 mb-2 font-mono text-[var(--text-secondary)] uppercase tracking-wider">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 pb-2 border-b border-[var(--border-color)]/30 text-[var(--text-primary)]">
                    <div className="col-span-6 truncate">{item.description || '[Item Description]'}</div>
                    <div className="col-span-2 text-right font-mono">{item.qty}</div>
                    <div className="col-span-2 text-right font-mono">{symbol}{item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="col-span-2 text-right font-mono">{symbol}{(item.qty * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex justify-between items-end pt-6 border-t border-[var(--border-color)] text-xs relative z-10">
                <div className="w-1/2">
                  <div className="font-mono text-[var(--text-secondary)] mb-1 uppercase tracking-wider">NOTES</div>
                  <div className="text-[var(--text-secondary)] whitespace-pre-wrap">{notes || '—'}</div>
                </div>
                <div className="w-1/3 space-y-2">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span>
                    <span className="font-mono">{symbol}{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Tax ({taxRate}%)</span>
                    <span className="font-mono">{symbol}{taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[var(--text-primary)] pt-2 border-t border-[var(--border-color)]">
                    <span>Total</span>
                    <span className="font-mono text-[#fa8c00]">{symbol}{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-2">
          <button
            onClick={handleDownloadCSV}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-[var(--border-color)] text-[var(--text-primary)] font-body-md text-sm hover:bg-[var(--bg-elevated)] transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">csv</span>
            Download CSV
          </button>
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#fa8c00] text-black font-bold font-body-md text-sm hover:brightness-110 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(250,140,0,0.3)]"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Download PDF
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto border-t border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center py-6 px-12 bg-[var(--footer-bg)]">
        <div className="font-headline text-lg text-[var(--footer-text)] mb-4 md:mb-0">
          Quantivo
        </div>
        <div className="text-[var(--footer-text)]/70 text-xs mb-4 md:mb-0">
          © {new Date().getFullYear()} Quantivo Analytics. All rights reserved.
        </div>
        <div className="flex gap-6 text-xs text-[var(--footer-text)]/70">
          <a href="#" className="hover:text-[var(--footer-text)] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--footer-text)] transition-colors">Terms of Service</a>
        </div>
      </footer>
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 200, background: 'rgba(13,28,45,0.95)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 20px', color: '#e1dfff', fontSize: '14px', backdropFilter: 'blur(12px)' }}>
          {toastMsg}
        </div>
      )}
    </>
  )
}
