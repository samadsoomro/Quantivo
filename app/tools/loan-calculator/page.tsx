'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'

const card = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' } as React.CSSProperties
const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
const labelStyle = { color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(100000)
  const [interestRate, setInterestRate] = useState(8.5)
  const [loanTerm, setLoanTerm] = useState(360) // months
  const [termUnit, setTermUnit] = useState<'months' | 'years'>('months')

  const termMonths = termUnit === 'years' ? loanTerm * 12 : loanTerm
  const monthlyRate = interestRate / 100 / 12

  const monthlyPayment = monthlyRate === 0
    ? loanAmount / termMonths
    : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)

  const totalPayment = monthlyPayment * termMonths
  const totalInterest = totalPayment - loanAmount

  // Build amortization schedule (first 24 rows for display)
  const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = []
  let balance = loanAmount
  for (let m = 1; m <= Math.min(termMonths, 360); m++) {
    const intPay = balance * monthlyRate
    const prinPay = monthlyPayment - intPay
    balance = Math.max(0, balance - prinPay)
    schedule.push({ month: m, payment: monthlyPayment, principal: prinPay, interest: intPay, balance })
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <ToolLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>Loan Calculator</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Calculate monthly payments, total interest, and full amortization schedule for any loan.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Inputs */}
          <div style={card}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>Loan Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Loan Amount ($)</label>
                <input type="number" style={inputStyle} value={loanAmount} onChange={e => setLoanAmount(parseFloat(e.target.value) || 0)} />
                <input type="range" min={1000} max={5000000} step={1000} value={loanAmount} onChange={e => setLoanAmount(parseFloat(e.target.value))} style={{ width: '100%', marginTop: '8px', accentColor: 'var(--color-primary)' }} />
              </div>
              <div>
                <label style={labelStyle}>Annual Interest Rate (%)</label>
                <input type="number" style={inputStyle} value={interestRate} step="0.1" onChange={e => setInterestRate(parseFloat(e.target.value) || 0)} />
                <input type="range" min={0.1} max={30} step={0.1} value={interestRate} onChange={e => setInterestRate(parseFloat(e.target.value))} style={{ width: '100%', marginTop: '8px', accentColor: 'var(--color-primary)' }} />
              </div>
              <div>
                <label style={labelStyle}>Loan Term</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" style={inputStyle} value={loanTerm} onChange={e => setLoanTerm(parseInt(e.target.value) || 0)} />
                  <select style={inputStyle} value={termUnit} onChange={e => setTermUnit(e.target.value as any)}>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Monthly Payment', value: `$${fmt(monthlyPayment)}`, color: '#fa8c00', big: true },
              { label: 'Total Payment', value: `$${fmt(totalPayment)}`, color: 'var(--text-primary)' },
              { label: 'Total Interest', value: `$${fmt(totalInterest)}`, color: '#f87171' },
              { label: 'Principal', value: `$${fmt(loanAmount)}`, color: '#4ade80' },
            ].map(({ label, value, color, big }) => (
              <div key={label} style={{ ...card, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{label}</span>
                <span style={{ color, fontFamily: 'monospace', fontWeight: 700, fontSize: big ? '24px' : '18px' }}>{value}</span>
              </div>
            ))}

            {/* Visual split bar */}
            <div style={card}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}>Payment Split</p>
              <div style={{ height: '12px', borderRadius: '999px', overflow: 'hidden', background: 'var(--bg-elevated)', display: 'flex' }}>
                <div style={{ width: `${(loanAmount / totalPayment) * 100}%`, background: '#4ade80', transition: 'width 0.4s' }} />
                <div style={{ flex: 1, background: '#f87171' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ color: '#4ade80' }}>● Principal {((loanAmount / totalPayment) * 100).toFixed(1)}%</span>
                <span style={{ color: '#f87171' }}>● Interest {((totalInterest / totalPayment) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amortization Schedule */}
        <div style={{ ...card, marginTop: '24px' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Amortization Schedule {termMonths > 360 ? '(First 360 months shown)' : ''}
          </h3>
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'monospace' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)' }}>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  {['Month', 'Payment', 'Principal', 'Interest', 'Balance'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map(row => (
                  <tr key={row.month} style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.85 }}>
                    <td style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{row.month}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--text-primary)' }}>${fmt(row.payment)}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', color: '#4ade80' }}>${fmt(row.principal)}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', color: '#f87171' }}>${fmt(row.interest)}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', color: '#fa8c00' }}>${fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
