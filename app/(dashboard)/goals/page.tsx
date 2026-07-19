'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import { formatCurrency } from '@/lib/currency'

interface Goal {
  id: string
  title: string
  current_amount: number
  target_amount: number
  status: 'active' | 'completed' | 'paused'
  deadline?: string | null
}

const getGoalEmoji = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('house') || n.includes('home') || n.includes('real estate')) return '🏠'
  if (n.includes('car') || n.includes('tesla') || n.includes('vehicle')) return '🚗'
  if (n.includes('trip') || n.includes('japan') || n.includes('travel') || n.includes('vacation')) return '✈️'
  if (n.includes('ring') || n.includes('wedding') || n.includes('engagement')) return '💍'
  if (n.includes('retire') || n.includes('portfolio') || n.includes('invest') || n.includes('savings')) return '📈'
  return '🎯'
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ title: '', target: '', deadline: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [addMoneyModal, setAddMoneyModal] = useState<Goal | null>(null)
  const [addMoneyAmount, setAddMoneyAmount] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const fetchGoals = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const localData = localStorage.getItem('qv-guest-goals')
      if (localData) setGoals(JSON.parse(localData))
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setGoals(data.map(g => ({
        id: g.id,
        title: g.title,
        current_amount: Number(g.current_amount || 0),
        target_amount: Number(g.target_amount || 0),
        status: g.status as Goal['status'],
        deadline: g.deadline
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleAddGoal = async () => {
    const target = parseFloat(addForm.target)
    if (!addForm.title || isNaN(target) || target <= 0) return

    setIsAdding(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const newGoal = {
        id: Math.random().toString(36).substring(7),
        title: addForm.title,
        target_amount: target,
        current_amount: 0,
        deadline: addForm.deadline || null,
        status: 'active',
        created_at: new Date().toISOString()
      } as any
      const newGoals = [newGoal, ...goals]
      setGoals(newGoals)
      localStorage.setItem('qv-guest-goals', JSON.stringify(newGoals))
      setShowAddModal(false)
      setIsAdding(false)
      showToast('Saved locally (Guest)')
      return
    }

    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: addForm.title,
      target_amount: target,
      current_amount: 0,
      status: 'active',
      deadline: addForm.deadline || null
    })

    if (error) {
      showToast(`Error creating goal: ${error.message}`)
    } else {
      fetchGoals()
      setShowAddModal(false)
      setAddForm({ title: '', target: '', deadline: '' })
    }
    setIsAdding(false)
  }

  const handleAddMoney = async () => {
    if (!addMoneyModal) return
    const amt = parseFloat(addMoneyAmount)
    if (isNaN(amt) || amt <= 0) return

    const newCurrent = addMoneyModal.current_amount + amt
    const newStatus = newCurrent >= addMoneyModal.target_amount ? 'completed' : addMoneyModal.status

    const supabase = createClient()
    const { error } = await supabase
      .from('goals')
      .update({ current_amount: newCurrent, status: newStatus })
      .eq('id', addMoneyModal.id)

    if (error) {
      showToast(`Error updating goal: ${error.message}`)
    } else {
      fetchGoals()
      setAddMoneyModal(null)
      setAddMoneyAmount('')
    }
  }

  const handleToggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'paused' ? 'active' : 'paused'
    const supabase = createClient()
    const { error } = await supabase
      .from('goals')
      .update({ status: newStatus })
      .eq('id', goal.id)

    if (error) {
      showToast(`Error toggling goal status: ${error.message}`)
    } else {
      fetchGoals()
    }
  }

  return (
    <>
      <style>{`
        .glass-card {
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
        }
        .glass-modal {
          background: rgba(13, 28, 45, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
        }
        .glass-input {
          background: rgba(10, 20, 30, 0.8);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          width: 100%;
          outline: none;
          box-sizing: border-box;
          transition: border-color 200ms;
        }
        .glass-input:focus {
          border-color: rgba(225, 223, 255, 0.5);
          box-shadow: 0 0 0 2px rgba(225, 223, 255, 0.2);
        }
        .progress-ring__circle {
          transition: stroke-dashoffset 0.35s;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto pb-12 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-headline-xl text-3xl font-bold text-[#c0c1ff] mb-2">Financial Goals</h1>
            <p className="font-body-md text-sm text-[var(--text-secondary)]">Track your savings milestones and strategic objectives.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-[#c0c1ff] text-[var(--bg-canvas)] px-6 py-3 rounded-full font-body-md text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add New Goal
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-sm text-[var(--text-secondary)]">Loading goals...</div>
          ) : (
            <>
              {goals.map((goal) => {
                const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
                const strokeOffset = 251.2 - (251.2 * pct) / 100
                const emoji = getGoalEmoji(goal.title)
                const isCompleted = goal.status === 'completed'
                const isPaused = goal.status === 'paused'

                return (
                  <div key={goal.id} className={`glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden group ${isCompleted ? 'border-[#fee089]/20' : ''}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c0c1ff]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-6 z-10">
                      <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center text-2xl shadow-inner">
                        {emoji}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {goal.deadline && (
                          <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[var(--text-secondary)] font-mono text-[10px]">
                              Due: {goal.deadline}
                            </span>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              new Date(goal.deadline) < new Date() ? 'bg-[rgba(255,68,51,0.15)] text-[#ff4433]' : 'bg-[rgba(192,193,255,0.1)] text-[#c0c1ff]'
                            }`}>
                              {new Date(goal.deadline) < new Date() ? 'Overdue' : `${Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}d left`}
                            </span>
                          </div>
                        )}
                        <span className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase ${isCompleted ? 'bg-[#fee089]/10 border border-[#fee089]/20 text-[#fee089]' : isPaused ? 'bg-white/5 border border-white/10 text-[var(--text-secondary)]' : 'bg-[#c0c1ff]/10 border border-[#c0c1ff]/20 text-[#c0c1ff]'}`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-headline-lg text-xl font-bold text-white mb-1 z-10">{goal.title}</h3>
                    <p className="font-body-sm text-xs text-[var(--text-secondary)] mb-6 z-10">
                      {isCompleted ? 'Goal fully completed!' : isPaused ? 'Goal currently paused' : 'Accumulating savings'}
                    </p>

                    <div className="flex flex-col gap-3 mb-8 z-10">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="font-mono text-2xl font-bold text-white leading-none mb-1">{formatCurrency(goal.current_amount)}</span>
                          <span className="font-mono text-xs text-[var(--text-secondary)]">of {formatCurrency(goal.target_amount)}</span>
                        </div>
                        <span className={`font-mono text-lg font-bold ${isCompleted ? 'text-[#fee089]' : 'text-[#c0c1ff]'}`}>{pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-[#fee089]' : 'bg-[#c0c1ff]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto z-10 flex gap-2">
                      {!isCompleted ? (
                        <>
                          <button
                            onClick={() => { setAddMoneyModal(goal); setAddMoneyAmount('') }}
                            className="flex-1 py-2.5 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 transition-all font-body-sm text-sm flex items-center justify-center gap-2 group-hover:border-[#c0c1ff]/50"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Add Money
                          </button>
                          <button
                            onClick={() => handleToggleStatus(goal)}
                            className="px-3 py-2.5 rounded-full bg-transparent border border-white/10 text-[var(--text-secondary)] hover:bg-white/5 transition-all font-body-sm text-sm"
                            title={isPaused ? 'Resume Goal' : 'Pause Goal'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isPaused ? 'play_arrow' : 'pause'}
                            </span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full py-2.5 rounded-full bg-transparent border border-[#fee089]/20 text-[#fee089] font-body-sm text-sm flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Goal Reached
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Track New Goal Placeholder Card */}
              <div
                onClick={() => setShowAddModal(true)}
                className="rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-[#c0c1ff]/30 bg-black/10 hover:bg-[#c0c1ff]/5 transition-all cursor-pointer min-h-[280px] group"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-3xl text-[var(--text-secondary)] group-hover:text-[#c0c1ff] transition-colors">add</span>
                </div>
                <h3 className="font-headline-lg text-lg font-bold text-white mb-2">Track New Goal</h3>
                <p className="font-body-sm text-xs text-[var(--text-secondary)] text-center max-w-[200px]">Define a new financial objective and start allocating funds.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Goal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[var(--bg-canvas)]/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="glass-modal w-full max-w-md p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-xl font-bold text-white">Add New Goal</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Define your savings target and timeline.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dream House Fund"
                  className="glass-input"
                  value={addForm.title}
                  onChange={(e) => setAddForm(prev => ({ ...prev, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Target Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="50000"
                  className="glass-input"
                  value={addForm.target}
                  onChange={(e) => setAddForm(prev => ({ ...prev, target: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Deadline (optional)</label>
                <input
                  type="date"
                  className="glass-input"
                  value={addForm.deadline}
                  onChange={(e) => setAddForm(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                disabled={isAdding}
              >Cancel</button>
              <button
                onClick={handleAddGoal}
                disabled={!addForm.title || !addForm.target || isAdding}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#c0c1ff] text-[var(--bg-canvas)] hover:shadow-[0_0_15px_rgba(192,193,255,0.3)] disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                {isAdding ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Dialog */}
      {addMoneyModal && (
        <div className="fixed inset-0 bg-[var(--bg-canvas)]/80 z-50 flex items-center justify-center p-4" onClick={() => setAddMoneyModal(null)}>
          <div className="glass-modal w-full max-w-sm p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-lg font-bold text-white">Add Money</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Allocate funds to <strong className="text-[#c0c1ff]">{addMoneyModal.title}</strong></p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="glass-input"
                value={addMoneyAmount}
                onChange={(e) => setAddMoneyAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setAddMoneyModal(null)} className="px-5 py-2.5 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleAddMoney} disabled={!addMoneyAmount} className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#c0c1ff] text-[var(--bg-canvas)] hover:shadow-[0_0_15px_rgba(192,193,255,0.3)] disabled:opacity-50 disabled:pointer-events-none transition-all">
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 glass-modal px-5 py-3 text-sm text-white animate-in slide-in-from-bottom-5 duration-300">
          {toastMsg}
        </div>
      )}
    </>
  )
}
