'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/supabase/client'
import { Flame, Heart, Zap, Star, Target, Coffee, BookOpen, Dumbbell, Pencil, Trash2 } from 'lucide-react'

function localDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Habit {
  id: string
  title: string
  description: string | null
  icon: string
  color: string
  frequency: 'daily' | 'weekly'
  current_streak: number
  longest_streak: number
  is_active: boolean
  created_at: string
}

interface Completion {
  habit_id: string
  completed_at: string
}

const COLORS = ['var(--color-primary)', '#4edea3', '#fa8c00', '#ffb4ab', '#ff33aa', '#ffcc02', '#00acfe', '#a78bfa']
const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  flame: Flame, heart: Heart, zap: Zap, star: Star,
  target: Target, coffee: Coffee, book: BookOpen, dumbbell: Dumbbell,
}
const ICON_KEYS = Object.keys(ICON_MAP)

function getWeeksGrid(): string[][] {
  const grid: string[][] = []
  const today = new Date()
  const dayOfWeek = today.getDay()
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + (6 - dayOfWeek))
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - (52 * 7 - 1))

  let current = new Date(startDate)
  let week: string[] = []
  while (current <= endDate) {
    week.push(localDate(current))
    if (week.length === 7) {
      grid.push(week)
      week = []
    }
    current.setDate(current.getDate() + 1)
  }
  if (week.length > 0) grid.push(week)
  return grid
}

function calcStreak(completions: string[]): number {
  if (completions.length === 0) return 0
  const sorted = [...completions].sort().reverse()
  const today = localDate()
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const key = localDate(d)
    if (sorted.includes(key)) {
      streak++
    } else if (i > 0) {
      break
    }
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)
  const [form, setForm] = useState({ title: '', icon: 'flame', color: 'var(--color-primary)', frequency: 'daily' as 'daily' | 'weekly' })
  const [saving, setSaving] = useState(false)
  const [completions, setCompletions] = useState<Completion[]>([])
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const weeksGrid = useMemo(() => getWeeksGrid(), [])
  const today = localDate()

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setHabits([])
      setCompletions([])
      setLoading(false)
      return
    }

    const [{ data: habitsData }, { data: completionsData }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('habit_completions').select('habit_id, completed_at').eq('user_id', user.id),
    ])
    setHabits(habitsData ?? [])
    setCompletions(completionsData ?? [])
    if (habitsData && habitsData.length > 0 && !selectedHabit) {
      setSelectedHabit(habitsData[0].id)
    }
    setLoading(false)
  }

  const addHabit = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setSaving(false)
      setShowAdd(false)
      showToast('Login required to save')
      return
    }

    const { error } = await supabase.from('habits').insert({ ...form, user_id: user.id })
    if (error) showToast(`Error: ${error.message}`)
    setShowAdd(false)
    setForm({ title: '', icon: 'flame', color: 'var(--color-primary)', frequency: 'daily' })
    loadAll()
    setSaving(false)
  }

  const updateHabit = async () => {
    if (!editHabit) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      setEditHabit(null)
      showToast('Login required to update')
      return
    }
    const { error } = await supabase.from('habits').update({
      title: form.title, icon: form.icon, color: form.color, frequency: form.frequency
    }).eq('id', editHabit.id)
    if (error) showToast(`Error: ${error.message}`)
    setEditHabit(null)
    setSaving(false)
    loadAll()
  }

  const deleteHabit = async (id: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setDeleteConfirm(null)
      showToast('Login required to delete')
      return
    }
    await supabase.from('habits').update({ is_active: false }).eq('id', id)
    setDeleteConfirm(null)
    if (selectedHabit === id) setSelectedHabit(null)
    loadAll()
  }

  const toggleCompletion = async (habitId: string, date: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Login required to log progress')
      return
    }
    const existing = completions.find(c => c.habit_id === habitId && c.completed_at === date)
    if (existing) {
      await supabase.from('habit_completions').delete().eq('habit_id', habitId).eq('completed_at', date)
    } else {
      await supabase.from('habit_completions').insert({ habit_id: habitId, user_id: user.id, completed_at: date })
    }
    loadAll()
  }

  const habitCompletionSet = useMemo(() => {
    if (!selectedHabit) return new Set<string>()
    return new Set(completions.filter(c => c.habit_id === selectedHabit).map(c => c.completed_at))
  }, [completions, selectedHabit])

  const getHabitStreak = (habitId: string) => {
    const dates = completions.filter(c => c.habit_id === habitId).map(c => c.completed_at)
    return calcStreak(dates)
  }

  const activeHabit = habits.find(h => h.id === selectedHabit)
  const completedToday = (habitId: string) => completions.some(c => c.habit_id === habitId && c.completed_at === today)
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary-hover)', margin: 0 }}>Habits</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Build streaks. Stay consistent.</p>
        </div>
        <button onClick={() => { setShowAdd(true); setForm({ title: '', icon: 'flame', color: 'var(--color-primary)', frequency: 'daily' }) }}
          style={{ background: 'var(--color-primary)', color: '#1000a9', border: 'none', borderRadius: '999px', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
          + Add Habit
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: '180px', background: 'var(--bg-card)', borderRadius: '16px', animation: 'pulse 2s infinite' }} />)}
        </div>
      ) : habits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(18,33,49,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔥</div>
          <h3 style={{ color: 'var(--color-primary-hover)', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No habits yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Start building your first streak today</p>
          <button onClick={() => setShowAdd(true)} style={{ background: 'var(--color-primary)', color: '#1000a9', border: 'none', borderRadius: '999px', padding: '10px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Add your first habit</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
          {/* Habit Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {habits.map(habit => {
              const done = completedToday(habit.id)
              const streak = getHabitStreak(habit.id)
              const isSelected = selectedHabit === habit.id
              const IconComp = ICON_MAP[habit.icon] || Flame
              return (
                <div key={habit.id}
                  onClick={() => setSelectedHabit(habit.id)}
                  style={{
                    background: 'var(--bg-card)',
                    border: `2px solid ${isSelected ? habit.color : done ? habit.color + '40' : 'var(--border-color)'}`,
                    borderRadius: '16px', padding: '20px', transition: 'all 0.2s', cursor: 'pointer', position: 'relative'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: habit.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp size={20} className="text-current" />
                      </div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary-hover)', margin: 0 }}>{habit.title}</p>
                        <span style={{
                          display: 'inline-block', fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
                          background: habit.frequency === 'daily' ? '#c0c1ff22' : '#fa8c0022',
                          color: habit.frequency === 'daily' ? 'var(--color-primary)' : '#fa8c00',
                          textTransform: 'uppercase', fontWeight: 600, marginTop: '4px'
                        }}>{habit.frequency}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditHabit(habit); setForm({ title: habit.title, icon: habit.icon, color: habit.color, frequency: habit.frequency }) }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(habit.id) }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Flame size={16} style={{ color: streak > 0 ? '#fa8c00' : '#464654' }} />
                        <span style={{ fontSize: '18px', fontWeight: 700, color: habit.color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{streak}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>day streak</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#c7c4d7', marginTop: '2px' }}>
                        Progress: <span style={{ fontWeight: 'bold', color: done ? '#00cc4b' : 'var(--color-primary-hover)' }}>{done ? '1' : '0'}/1</span> {habit.frequency === 'daily' ? 'today' : 'this week'}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleCompletion(habit.id, today) }}
                      style={{
                        padding: '8px 12px', borderRadius: '8px',
                        background: done ? 'rgba(0,204,75,0.1)' : 'rgba(var(--color-primary-rgb),0.1)',
                        border: done ? '1px solid rgba(0,204,75,0.2)' : '1px solid rgba(var(--color-primary-rgb),0.2)',
                        color: done ? '#00cc4b' : 'var(--color-primary)',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                      }}>
                      {done ? 'Completed' : 'Log progress'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* GitHub-style Contribution Grid */}
          {activeHabit && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeHabit.color }}></div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-primary-hover)', margin: 0 }}>{activeHabit.title} — Activity</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Less</span>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: activeHabit.color, opacity: 0.4 }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: activeHabit.color }}></div>
                  <span>More</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {/* Day labels column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginRight: '4px', paddingTop: '0px' }}>
                    {dayLabels.map((d, i) => (
                      <div key={i} style={{ width: '12px', height: '12px', fontSize: '9px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i % 2 === 1 ? d : ''}</div>
                    ))}
                  </div>
                  {/* Weeks columns */}
                  {weeksGrid.map((week, wi) => (
                    <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {week.map((date) => {
                        const completed = habitCompletionSet.has(date)
                        const isFuture = date > today
                        return (
                          <div
                            key={date}
                            onClick={() => !isFuture && toggleCompletion(activeHabit.id, date)}
                            title={date}
                            style={{
                              width: '12px', height: '12px', borderRadius: '2px',
                              background: isFuture ? 'transparent' : completed ? activeHabit.color : 'var(--bg-card)',
                              border: isFuture ? '1px solid rgba(255,255,255,0.03)' : '1px solid var(--border-color)',
                              cursor: isFuture ? 'default' : 'pointer',
                              transition: 'all 0.15s',
                              opacity: isFuture ? 0.3 : 1
                            }}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Habit Modal */}
      {(showAdd || editHabit) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}
          onClick={() => { setShowAdd(false); setEditHabit(null) }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: 'var(--color-primary-hover)', fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
              {editHabit ? 'Edit Habit' : 'New Habit'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
                <input style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Morning workout" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frequency</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['daily', 'weekly'] as const).map(f => (
                    <button key={f} onClick={() => setForm(prev => ({ ...prev, frequency: f }))}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid', borderColor: form.frequency === f ? 'var(--color-primary)' : 'var(--border-color)', background: form.frequency === f ? 'rgba(var(--color-primary-rgb),0.1)' : 'transparent', color: form.frequency === f ? 'var(--color-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ICON_KEYS.map(key => {
                    const Icon = ICON_MAP[key]
                    return (
                      <button key={key} onClick={() => setForm(f => ({ ...f, icon: key }))}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid', borderColor: form.icon === key ? 'var(--color-primary)' : 'var(--border-color)', background: form.icon === key ? 'rgba(var(--color-primary-rgb),0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: form.icon === key ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                        <Icon size={18} />
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {COLORS.map(color => (
                    <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, border: form.color === color ? '3px solid white' : '3px solid transparent', cursor: 'pointer', transition: 'border 0.15s' }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => { setShowAdd(false); setEditHabit(null) }} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={editHabit ? updateHabit : addHabit} disabled={!form.title || saving}
                style={{ flex: 2, padding: '11px', borderRadius: '8px', background: 'var(--color-primary)', color: '#1000a9', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px', opacity: !form.title ? 0.5 : 1 }}>
                {saving ? 'Saving...' : editHabit ? 'Save Changes' : 'Create Habit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '360px' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--color-primary-hover)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Delete Habit</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Are you sure? This will deactivate the habit.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={() => deleteHabit(deleteConfirm)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#ff4433', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 200, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 20px', color: 'var(--color-primary-hover)', fontSize: '14px' }}>
          {toastMsg}
        </div>
      )}
    </div>
  )
}
