'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/supabase/client'

interface Sub {
  id: string
  name: string
  amount: number
  billing_cycle: 'weekly' | 'monthly' | 'yearly'
  next_renewal_date: string | null
  category: string
  color: string
  is_active: boolean
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [form, setForm] = useState({ name: '', amount: '', billing_cycle: 'monthly' as 'weekly' | 'monthly' | 'yearly', next_renewal_date: '', category: 'Entertainment', color: '#c0c1ff' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadSubs() }, [])

  const loadSubs = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('subscriptions').select('*').eq('is_active', true).order('amount', { ascending: false })
    setSubs(data ?? [])
    setLoading(false)
  }

  const addSub = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('subscriptions').insert({ ...form, amount: parseFloat(form.amount), user_id: user.id })
    setShowAdd(false)
    setSaving(false)
    loadSubs()
  }

  const deleteSub = async (id: string) => {
    const supabase = createClient()
    await supabase.from('subscriptions').update({ is_active: false }).eq('id', id)
    loadSubs()
  }

  const totalMonthly = subs.reduce((sum, s) => {
    if (s.billing_cycle === 'monthly') return sum + s.amount
    if (s.billing_cycle === 'yearly') return sum + s.amount / 12
    if (s.billing_cycle === 'weekly') return sum + s.amount * 4.33
    return sum
  }, 0)

  const inp: React.CSSProperties = { width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  const CATEGORIES = ['Entertainment', 'Productivity', 'Health', 'Education', 'Finance', 'Shopping', 'Cloud', 'Other']

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#e1dfff', margin: 0 }}>Subscriptions</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Never get surprised by a renewal.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: '#c0c1ff', color: '#1000a9', border: 'none', borderRadius: '999px', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>+ Add Subscription</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          ['Monthly Cost', fmt(totalMonthly), '#c0c1ff'],
          ['Annual Cost', fmt(totalMonthly * 12), '#fa8c00'],
          ['Active Subscriptions', subs.length.toString(), '#4edea3'],
        ].map(([label, val, color]) => (
          <div key={label as string} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: color as string, fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Monthly/Yearly toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['monthly', 'yearly'] as const).map(b => (
          <button key={b} onClick={() => setBilling(b)}
            style={{ padding: '6px 16px', borderRadius: '999px', border: '1px solid', borderColor: billing === b ? '#c0c1ff' : 'var(--border-color)', background: billing === b ? 'rgba(192,193,255,0.1)' : 'transparent', color: billing === b ? '#c0c1ff' : 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' }}>
            {b}
          </button>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' }}>
            <h2 style={{ color: '#e1dfff', fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Add Subscription</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Name</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Netflix" /></div>
              <div><label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Amount (USD)</label><input style={inp} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="15.99" /></div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Billing Cycle</label>
                <select style={{ ...inp }} value={form.billing_cycle} onChange={e => setForm(f => ({ ...f, billing_cycle: e.target.value as 'weekly' | 'monthly' | 'yearly' }))}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
                <select style={{ ...inp }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Next Renewal Date</label><input style={inp} type="date" value={form.next_renewal_date} onChange={e => setForm(f => ({ ...f, next_renewal_date: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={addSub} disabled={!form.name || !form.amount || saving} style={{ flex: 2, padding: '11px', borderRadius: '8px', background: '#c0c1ff', color: '#1000a9', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px', opacity: !form.name || !form.amount ? 0.5 : 1 }}>
                {saving ? 'Saving...' : 'Add Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Grid */}
      {loading ? (
        <div style={{ height: '200px', background: 'rgba(18,33,49,0.4)', borderRadius: '16px' }} />
      ) : subs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(18,33,49,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
          <h3 style={{ color: '#e1dfff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No subscriptions tracked</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Add your recurring services to track spending</p>
          <button onClick={() => setShowAdd(true)} style={{ background: '#c0c1ff', color: '#1000a9', border: 'none', borderRadius: '999px', padding: '10px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Add first subscription</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {subs.map(sub => {
            const displayAmt = billing === 'yearly' ? sub.billing_cycle === 'monthly' ? sub.amount * 12 : sub.amount : sub.billing_cycle === 'yearly' ? sub.amount / 12 : sub.amount
            const daysUntil = sub.next_renewal_date ? Math.ceil((new Date(sub.next_renewal_date).getTime() - Date.now()) / 86400000) : null
            return (
              <div key={sub.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: sub.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: sub.color, fontWeight: 700 }}>
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: '#e1dfff', margin: 0 }}>{sub.name}</p>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#fa8c00', background: 'rgba(250,140,0,0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>notifications_active</span> Reminder
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0', textTransform: 'capitalize' }}>{sub.category}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteSub(sub.id)} style={{ background: 'none', border: 'none', color: '#464654', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '22px', fontWeight: 700, color: '#c0c1ff', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>{fmt(displayAmt)}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>/{billing === 'yearly' ? 'year' : 'month'}</p>
                  </div>
                  {daysUntil !== null && (
                    <div style={{ background: daysUntil <= 7 ? 'rgba(255,180,171,0.15)' : 'rgba(192,193,255,0.08)', borderRadius: '8px', padding: '4px 10px' }}>
                      <p style={{ fontSize: '11px', color: daysUntil <= 7 ? '#ffb4ab' : 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                        {daysUntil === 0 ? 'Renews today' : daysUntil < 0 ? 'Overdue' : `${daysUntil}d left`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
