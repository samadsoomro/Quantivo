'use client'
export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'

const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
const labelStyle = { color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }
const card = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' } as React.CSSProperties

const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#60a5fa', Food: '#4ade80', Transport: '#fa8c00', Entertainment: '#c084fc',
  Healthcare: '#f87171', Education: '#34d399', Savings: '#fbbf24', Clothing: '#a78bfa',
  Utilities: '#38bdf8', Personal: '#fb923c', Debt: '#ef4444', Misc: '#94a3b8',
}

type BudgetItem = { id: string; name: string; category: string; budgeted: number; actual: number }

const DEFAULT_ITEMS: BudgetItem[] = [
  { id: '1', name: 'Rent / Mortgage', category: 'Housing', budgeted: 1500, actual: 1500 },
  { id: '2', name: 'Groceries', category: 'Food', budgeted: 400, actual: 380 },
  { id: '3', name: 'Car / Transport', category: 'Transport', budgeted: 200, actual: 220 },
  { id: '4', name: 'Netflix & Streaming', category: 'Entertainment', budgeted: 50, actual: 50 },
  { id: '5', name: 'Gym', category: 'Healthcare', budgeted: 40, actual: 0 },
  { id: '6', name: 'Emergency Fund', category: 'Savings', budgeted: 300, actual: 300 },
  { id: '7', name: 'Electricity / Water', category: 'Utilities', budgeted: 120, actual: 110 },
]

export default function BudgetPlannerPage() {
  const [income, setIncome] = useState(4000)
  const [currency, setCurrency] = useState('USD')
  const [items, setItems] = useState<BudgetItem[]>(DEFAULT_ITEMS)
  const CATEGORIES = Object.keys(CATEGORY_COLORS)

  const totalBudgeted = items.reduce((s, i) => s + i.budgeted, 0)
  const totalActual = items.reduce((s, i) => s + i.actual, 0)
  const remaining = income - totalBudgeted
  const savedVsSpent = income - totalActual

  const byCategory = useMemo(() => {
    return CATEGORIES.map(cat => ({
      cat,
      budgeted: items.filter(i => i.category === cat).reduce((s, i) => s + i.budgeted, 0),
      actual: items.filter(i => i.category === cat).reduce((s, i) => s + i.actual, 0),
    })).filter(c => c.budgeted > 0 || c.actual > 0)
  }, [items])

  const addItem = () => setItems(prev => [...prev, {
    id: Math.random().toString(), name: '', category: 'Misc', budgeted: 0, actual: 0
  }])

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <ToolLayout>
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>Budget Planner</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Plan your monthly budget with category breakdowns and real-time spending comparison.</p>

        {/* Income + Settings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={card}>
            <label style={labelStyle}>Monthly Income</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select style={{ ...inputStyle, width: '90px', flexShrink: 0 }} value={currency} onChange={e => setCurrency(e.target.value)}>
                {['USD', 'EUR', 'GBP', 'PKR', 'AED', 'CAD', 'AUD', 'INR'].map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" style={inputStyle} value={income} onChange={e => setIncome(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Budgeted', val: totalBudgeted, color: '#60a5fa' },
              { label: 'Unallocated', val: remaining, color: remaining >= 0 ? '#4ade80' : '#f87171' },
              { label: 'Saved/Surplus', val: savedVsSpent, color: savedVsSpent >= 0 ? '#4ade80' : '#f87171' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ ...card, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color, fontFamily: 'monospace' }}>{fmt(val)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Income bar */}
        <div style={{ ...card, marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>Budget allocation: {Math.min(100, (totalBudgeted / income * 100)).toFixed(1)}% of income</span>
            <span style={{ color: remaining >= 0 ? '#4ade80' : '#f87171' }}>
              {remaining >= 0 ? `${currency} ${fmt(remaining)} unallocated` : `⚠ Over budget by ${currency} ${fmt(Math.abs(remaining))}`}
            </span>
          </div>
          <div style={{ height: '10px', borderRadius: '999px', background: 'var(--bg-elevated)', overflow: 'hidden', position: 'relative' }}>
            {byCategory.map((cat, i) => {
              const pct = (cat.budgeted / income) * 100
              const left = (byCategory.slice(0, i).reduce((s, c) => s + c.budgeted, 0) / income) * 100
              return (
                <div key={cat.cat} title={`${cat.cat}: ${currency} ${fmt(cat.budgeted)}`} style={{
                  position: 'absolute', left: `${left}%`, width: `${pct}%`, height: '100%',
                  background: CATEGORY_COLORS[cat.cat] || '#94a3b8', transition: 'all 0.4s'
                }} />
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
            {byCategory.map(cat => (
              <span key={cat.cat} style={{ fontSize: '11px', color: CATEGORY_COLORS[cat.cat], fontFamily: 'monospace' }}>
                ● {cat.cat} ({((cat.budgeted / income) * 100).toFixed(0)}%)
              </span>
            ))}
          </div>
        </div>

        {/* Budget Table */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Budget Items</h3>
            <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fa8c00', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Add Item
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                  {['Name', 'Category', 'Budgeted', 'Actual', 'Diff', ''].map(h => (
                    <th key={h} style={{ padding: '8px', textAlign: h === 'Budgeted' || h === 'Actual' || h === 'Diff' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const diff = item.budgeted - item.actual
                  const color = CATEGORY_COLORS[item.category] || '#94a3b8'
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '6px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <input style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }} value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} placeholder="Item name" />
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <select style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', width: '110px' }} value={item.category} onChange={e => updateItem(item.id, 'category', e.target.value)}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input type="number" style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', width: '90px', textAlign: 'right' }} value={item.budgeted} onChange={e => updateItem(item.id, 'budgeted', parseFloat(e.target.value) || 0)} />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input type="number" style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', width: '90px', textAlign: 'right', color: item.actual > item.budgeted ? '#f87171' : 'var(--text-primary)' }} value={item.actual} onChange={e => updateItem(item.id, 'actual', parseFloat(e.target.value) || 0)} />
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', color: diff >= 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                        {diff >= 0 ? '+' : ''}{fmt(diff)}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                  <td colSpan={2} style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>Total</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#60a5fa' }}>{currency} {fmt(totalBudgeted)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#fa8c00' }}>{currency} {fmt(totalActual)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: (totalBudgeted - totalActual) >= 0 ? '#4ade80' : '#f87171' }}>
                    {(totalBudgeted - totalActual) >= 0 ? '+' : ''}{fmt(totalBudgeted - totalActual)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
