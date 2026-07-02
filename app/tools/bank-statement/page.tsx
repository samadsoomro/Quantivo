'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'
import { checkToolUsage, recordToolUsage } from '@/lib/usage'

const card = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' } as React.CSSProperties
const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
const labelStyle = { color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }

export default function BankStatementPage() {
  const [bankName, setBankName] = useState('Global Bank')
  const [accountHolder, setAccountHolder] = useState('John Doe')
  const [accountNumber, setAccountNumber] = useState('****4821')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [openingBalance, setOpeningBalance] = useState(5000)
  const [currency, setCurrency] = useState('USD')
  const [transactions, setTransactions] = useState([
    { id: '1', date: '', description: 'Direct Deposit - Employer', credit: 3500, debit: 0 },
    { id: '2', date: '', description: 'Rent Payment', credit: 0, debit: 1200 },
    { id: '3', date: '', description: 'Grocery Store', credit: 0, debit: 85 },
    { id: '4', date: '', description: 'Netflix Subscription', credit: 0, debit: 15.99 },
    { id: '5', date: '', description: 'Freelance Payment', credit: 800, debit: 0 },
  ])
  const [usageCount, setUsageCount] = useState(0)
  const [canUse, setCanUse] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    checkToolUsage('bank-statement').then(r => { setUsageCount(r.count); setCanUse(r.allowed) })
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = today.toISOString().split('T')[0]
    setStartDate(firstDay)
    setEndDate(lastDay)
    setTransactions(prev => prev.map((t, i) => ({
      ...t,
      date: new Date(today.getFullYear(), today.getMonth(), i + 2).toISOString().split('T')[0]
    })))
  }, [])

  const runningBalances = transactions.reduce((acc: number[], t, i) => {
    const prev = i === 0 ? openingBalance : acc[i - 1]
    acc.push(prev + t.credit - t.debit)
    return acc
  }, [])

  const closingBalance = runningBalances[runningBalances.length - 1] ?? openingBalance
  const totalCredits = transactions.reduce((s, t) => s + t.credit, 0)
  const totalDebits = transactions.reduce((s, t) => s + t.debit, 0)

  const addTransaction = () => setTransactions(prev => [
    ...prev,
    { id: Math.random().toString(), date: endDate, description: '', credit: 0, debit: 0 }
  ])

  const updateTx = (id: string, field: string, value: any) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  const handleGenerate = async () => {
    if (!canUse) return
    setGenerating(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const pw = doc.internal.pageSize.getWidth()
      
      // Header
      doc.setFillColor(5, 20, 36)
      doc.rect(0, 0, pw, 40, 'F')
      doc.setTextColor(212, 228, 250)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(bankName, 20, 18)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('ACCOUNT STATEMENT', 20, 26)
      doc.text(`${startDate} — ${endDate}`, 20, 33)

      // Account info
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(10)
      doc.text('Account Holder:', 20, 52)
      doc.setFont('helvetica', 'bold')
      doc.text(accountHolder, 70, 52)
      doc.setFont('helvetica', 'normal')
      doc.text('Account No:', 20, 60)
      doc.setFont('helvetica', 'bold')
      doc.text(accountNumber, 70, 60)
      doc.setFont('helvetica', 'normal')
      doc.text('Currency:', 20, 68)
      doc.text(currency, 70, 68)

      // Summary box
      doc.setFillColor(245, 247, 250)
      doc.rect(20, 76, pw - 40, 24, 'F')
      doc.setFontSize(9)
      doc.text('Opening Balance', 25, 85)
      doc.text('Total Credits', 75, 85)
      doc.text('Total Debits', 120, 85)
      doc.text('Closing Balance', 163, 85)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`${currency} ${openingBalance.toFixed(2)}`, 25, 95)
      doc.setTextColor(0, 150, 0)
      doc.text(`${currency} ${totalCredits.toFixed(2)}`, 75, 95)
      doc.setTextColor(200, 0, 0)
      doc.text(`${currency} ${totalDebits.toFixed(2)}`, 120, 95)
      doc.setTextColor(50, 50, 50)
      doc.text(`${currency} ${closingBalance.toFixed(2)}`, 163, 95)

      // Table header
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      let y = 112
      doc.setFillColor(235, 240, 248)
      doc.rect(20, y - 5, pw - 40, 10, 'F')
      doc.text('DATE', 22, y)
      doc.text('DESCRIPTION', 48, y)
      doc.text('DEBIT', 130, y)
      doc.text('CREDIT', 155, y)
      doc.text('BALANCE', 175, y)
      y += 10

      transactions.forEach((tx, i) => {
        if (y > 270) { doc.addPage(); y = 20 }
        if (i % 2 === 0) { doc.setFillColor(252, 252, 254); doc.rect(20, y - 5, pw - 40, 9, 'F') }
        doc.setTextColor(80, 80, 80)
        doc.text(tx.date || '-', 22, y)
        doc.text((tx.description || 'Transaction').substring(0, 35), 48, y)
        if (tx.debit > 0) { doc.setTextColor(200, 0, 0); doc.text(tx.debit.toFixed(2), 130, y) }
        if (tx.credit > 0) { doc.setTextColor(0, 150, 0); doc.text(tx.credit.toFixed(2), 155, y) }
        doc.setTextColor(50, 50, 50)
        doc.text(runningBalances[i].toFixed(2), 175, y)
        y += 9
      })

      doc.save(`Bank_Statement_${accountHolder.replace(/\s+/g, '_')}.pdf`)
      await recordToolUsage('bank-statement')
      setUsageCount(p => p + 1)
      if (usageCount + 1 >= 3) setCanUse(false)
    } catch(e) { console.error(e) }
    setGenerating(false)
  }

  return (
    <ToolLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        <div style={{ marginTop: '16px', marginBottom: '8px', display: 'inline-block', padding: '4px 12px', borderRadius: '999px', background: 'rgba(250,140,0,0.1)', border: '1px solid rgba(250,140,0,0.3)', fontSize: '11px', color: '#fa8c00', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginLeft: '0' }}>Free Tool</div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginBottom: '8px' }}>Bank Statement Generator</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Create a professional PDF bank statement with custom transactions and running balances.</p>

        {usageCount >= 3 && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: '#f87171', margin: 0 }}>Daily limit reached. Sign up free for unlimited access.</p>
            <Link href="/signup" style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Sign up free</Link>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Account Info */}
          <div style={card}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Account Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                ['Bank Name', bankName, setBankName],
                ['Account Holder', accountHolder, setAccountHolder],
                ['Account Number', accountNumber, setAccountNumber],
              ].map(([label, value, setter]: any) => (
                <div key={String(label)}>
                  <label style={labelStyle}>{label}</label>
                  <input style={inputStyle} value={value} onChange={e => setter(e.target.value)} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Currency</label>
                <select style={inputStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
                  {['USD', 'EUR', 'GBP', 'PKR', 'AED', 'CAD', 'AUD', 'JPY', 'INR', 'SGD'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Opening Balance ({currency})</label>
                <input type="number" style={inputStyle} value={openingBalance} onChange={e => setOpeningBalance(parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          {/* Summary Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Opening Balance', val: openingBalance, color: 'var(--text-primary)' },
              { label: 'Total Credits', val: totalCredits, color: '#4ade80' },
              { label: 'Total Debits', val: totalDebits, color: '#f87171' },
              { label: 'Closing Balance', val: closingBalance, color: '#fa8c00' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ ...card, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{label}</span>
                <span style={{ color, fontFamily: 'monospace', fontWeight: 700, fontSize: '16px' }}>
                  {currency} {val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transactions</h3>
            <button onClick={addTransaction} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fa8c00', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Add Row
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                  {['Date', 'Description', 'Credit', 'Debit', 'Balance', ''].map(h => (
                    <th key={h} style={{ padding: '8px 8px', textAlign: h === 'Credit' || h === 'Debit' || h === 'Balance' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.9 }}>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="date" style={{ ...inputStyle, width: '130px', padding: '4px 8px', fontSize: '12px' }} value={tx.date} onChange={e => updateTx(tx.id, 'date', e.target.value)} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input style={{ ...inputStyle, minWidth: '200px', padding: '4px 8px', fontSize: '12px' }} value={tx.description} onChange={e => updateTx(tx.id, 'description', e.target.value)} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="number" style={{ ...inputStyle, width: '90px', textAlign: 'right', padding: '4px 8px', fontSize: '12px', color: '#4ade80' }} value={tx.credit} onChange={e => updateTx(tx.id, 'credit', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="number" style={{ ...inputStyle, width: '90px', textAlign: 'right', padding: '4px 8px', fontSize: '12px', color: '#f87171' }} value={tx.debit} onChange={e => updateTx(tx.id, 'debit', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', color: runningBalances[i] >= 0 ? '#4ade80' : '#f87171' }}>
                      {(runningBalances[i] ?? 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <button onClick={() => setTransactions(prev => prev.filter(t => t.id !== tx.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleGenerate}
            disabled={generating || !canUse}
            style={{ background: canUse ? '#fa8c00' : 'rgba(250,140,0,0.3)', color: '#000', border: 'none', borderRadius: '999px', padding: '14px 32px', fontWeight: 700, fontSize: '15px', cursor: canUse ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            {generating ? 'Generating...' : 'Download PDF Statement'}
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
