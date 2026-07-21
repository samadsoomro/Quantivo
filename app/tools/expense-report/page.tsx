'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'

const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
const labelStyle = { color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }
const card = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' } as React.CSSProperties

const CATEGORIES = ['Travel', 'Meals', 'Accommodation', 'Office Supplies', 'Software', 'Marketing', 'Entertainment', 'Other']

type Expense = { id: string; date: string; description: string; category: string; amount: number; receipt: string }

export default function ExpenseReportPage() {
  const [companyName, setCompanyName] = useState('Acme Corp')
  const [employeeName, setEmployeeName] = useState('John Doe')
  const [department, setDepartment] = useState('Engineering')
  const [reportTitle, setReportTitle] = useState('Monthly Expense Report')
  const [currency, setCurrency] = useState('USD')
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', date: '', description: 'Flight to NYC', category: 'Travel', amount: 420, receipt: 'REC-001' },
    { id: '2', date: '', description: 'Team Lunch', category: 'Meals', amount: 85, receipt: 'REC-002' },
    { id: '3', date: '', description: 'Hotel (2 nights)', category: 'Accommodation', amount: 280, receipt: 'REC-003' },
  ])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const today = new Date()
    setExpenses(prev => prev.map((e, i) => ({
      ...e,
      date: new Date(today.getFullYear(), today.getMonth(), i + 1).toISOString().split('T')[0]
    })))
  }, [])

  const addExpense = () => setExpenses(prev => [...prev, {
    id: Math.random().toString(), date: new Date().toISOString().split('T')[0],
    description: '', category: 'Other', amount: 0, receipt: ''
  }])

  const updateExpense = (id: string, field: keyof Expense, value: any) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  // Group by category
  const byCategory = CATEGORIES.map(cat => ({
    cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const pw = doc.internal.pageSize.getWidth()

      // Header
      doc.setFillColor(5, 20, 36)
      doc.rect(0, 0, pw, 44, 'F')
      doc.setTextColor(212, 228, 250)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(companyName, 20, 16)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(reportTitle, 20, 26)
      doc.setFontSize(9)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35)

      // Employee info
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(10)
      let y = 56
      doc.text(`Employee: ${employeeName}`, 20, y)
      doc.text(`Department: ${department}`, 100, y)
      doc.text(`Currency: ${currency}`, 170, y)
      y += 14

      // Category summary
      doc.setFillColor(245, 247, 250)
      doc.rect(20, y, pw - 40, byCategory.length * 8 + 16, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Category Summary', 24, y + 8)
      doc.setFont('helvetica', 'normal')
      byCategory.forEach((c, i) => {
        doc.text(c.cat, 24, y + 16 + i * 8)
        doc.text(`${currency} ${c.total.toFixed(2)}`, 150, y + 16 + i * 8)
      })
      y += byCategory.length * 8 + 24

      // Table
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setFillColor(220, 230, 245)
      doc.rect(20, y - 5, pw - 40, 10, 'F')
      doc.text('DATE', 22, y)
      doc.text('DESCRIPTION', 46, y)
      doc.text('CATEGORY', 110, y)
      doc.text('RECEIPT', 150, y)
      doc.text('AMOUNT', 175, y)
      y += 10

      doc.setFont('helvetica', 'normal')
      expenses.forEach((exp, i) => {
        if (y > 270) { doc.addPage(); y = 20 }
        if (i % 2 === 0) { doc.setFillColor(252, 252, 254); doc.rect(20, y - 5, pw - 40, 9, 'F') }
        doc.setTextColor(80, 80, 80)
        doc.text(exp.date, 22, y)
        doc.text((exp.description || 'N/A').substring(0, 35), 46, y)
        doc.text(exp.category, 110, y)
        doc.text(exp.receipt || '-', 150, y)
        doc.text(`${currency} ${exp.amount.toFixed(2)}`, 170, y)
        y += 9
      })

      y += 8
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(50, 50, 50)
      doc.text(`TOTAL: ${currency} ${total.toFixed(2)}`, 130, y)

      doc.save(`Expense_Report_${employeeName.replace(/\s/g, '_')}.pdf`)
    } catch(e) { console.error(e) }
    setGenerating(false)
  }

  return (
    <ToolLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>Expense Report Generator</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Create professional expense reports with category summaries and PDF export.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Report Info */}
          <div style={card}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Report Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {([['Report Title', reportTitle, setReportTitle], ['Company Name', companyName, setCompanyName], ['Employee Name', employeeName, setEmployeeName], ['Department', department, setDepartment]] as [string, string, (v: string) => void][]).map(([l, v, s]) => (
                <div key={l}><label style={labelStyle}>{l}</label><input style={inputStyle} value={v} onChange={e => s(e.target.value)} /></div>
              ))}
              <div>
                <label style={labelStyle}>Currency</label>
                <select style={inputStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
                  {['USD', 'EUR', 'GBP', 'PKR', 'AED', 'CAD', 'AUD', 'JPY', 'INR'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {byCategory.map(({ cat, total: catTotal }) => (
              <div key={cat} style={{ ...card, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{cat}</span>
                <span style={{ color: '#fa8c00', fontFamily: 'monospace', fontWeight: 700 }}>{currency} {catTotal.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ ...card, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb),0.05)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Total</span>
              <span style={{ color: 'var(--color-primary)', fontFamily: 'monospace', fontWeight: 700, fontSize: '20px' }}>{currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Expense Table */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Expenses</h3>
            <button onClick={addExpense} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fa8c00', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Add Expense
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                  {['Date', 'Description', 'Category', 'Receipt #', 'Amount', ''].map(h => <th key={h} style={{ padding: '8px', textAlign: 'left' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px 8px' }}><input type="date" style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', width: '130px' }} value={exp.date} onChange={e => updateExpense(exp.id, 'date', e.target.value)} /></td>
                    <td style={{ padding: '6px 8px' }}><input style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', minWidth: '150px' }} value={exp.description} onChange={e => updateExpense(exp.id, 'description', e.target.value)} /></td>
                    <td style={{ padding: '6px 8px' }}>
                      <select style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', width: '120px' }} value={exp.category} onChange={e => updateExpense(exp.id, 'category', e.target.value)}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '6px 8px' }}><input style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', width: '90px' }} value={exp.receipt} onChange={e => updateExpense(exp.id, 'receipt', e.target.value)} /></td>
                    <td style={{ padding: '6px 8px' }}><input type="number" style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', width: '90px', textAlign: 'right', color: '#fa8c00' }} value={exp.amount} onChange={e => updateExpense(exp.id, 'amount', parseFloat(e.target.value) || 0)} /></td>
                    <td style={{ padding: '6px 8px' }}><button onClick={() => setExpenses(prev => prev.filter(e => e.id !== exp.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button onClick={handleGenerate} disabled={generating}
            style={{ background: '#fa8c00', color: '#000', border: 'none', borderRadius: '12px', padding: '14px 32px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            {generating ? 'Generating...' : 'Download PDF Report'}
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
