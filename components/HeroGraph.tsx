'use client'

import React from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
  { month: 'Jan', income: 5200, expenses: 3100 },
  { month: 'Feb', income: 4800, expenses: 2900 },
  { month: 'Mar', income: 6100, expenses: 3400 },
  { month: 'Apr', income: 5800, expenses: 3200 },
  { month: 'May', income: 7200, expenses: 3800 },
  { month: 'Jun', income: 6900, expenses: 3500 }
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(13, 28, 45, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        padding: '12px',
        borderRadius: '8px',
        color: 'var(--text-primary)'
      }}>
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ margin: 0, color: 'var(--color-accent)', fontWeight: 600, fontSize: '14px' }}>
            Income: ${payload[0].value.toLocaleString()}
          </p>
          <p style={{ margin: 0, color: '#fa8c00', fontWeight: 600, fontSize: '14px' }}>
            Expenses: ${payload[1].value.toLocaleString()}
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function HeroGraph() {
  return (
    <div style={{
      background: 'var(--graph-card-bg)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--graph-card-border)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      borderRadius: '24px',
      padding: '24px',
      width: '100%',
      maxWidth: '480px',
      position: 'relative',
      zIndex: 20
    }}>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Total Balance</p>
        <h3 style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'JetBrains Mono, monospace' }}>$12,485.00</h3>
      </div>
      
      <div style={{ height: '200px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncomeHero" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenseHero" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fa8c00" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#fa8c00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" hide />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncomeHero)" />
            <Area type="monotone" dataKey="expenses" stroke="#fa8c00" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenseHero)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 204, 75, 0.1)', padding: '6px 12px', borderRadius: '9999px', color: '#00cc4b', fontSize: '13px', fontWeight: 500 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_upward</span>
          Income $6,900
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 68, 51, 0.1)', padding: '6px 12px', borderRadius: '9999px', color: '#ff4433', fontSize: '13px', fontWeight: 500 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_downward</span>
          Expenses $3,500
        </div>
      </div>
    </div>
  )
}
