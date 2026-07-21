'use client'

import { useState } from 'react'
import { deleteUserAccount, updateUserPlan } from './actions'

type Profile = {
  id: string
  full_name: string
  email: string
  plan: string
  created_at: string
}

export function CustomersTable({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')

  const filtered = profiles.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                          p.email?.toLowerCase().includes(search.toLowerCase())
    const matchesPlan = filterPlan === 'all' || p.plan === filterPlan
    return matchesSearch && matchesPlan
  })

  const handlePlanToggle = async (id: string, currentPlan: string) => {
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro'
    // Optimistic update
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, plan: newPlan } : p))
    const res = await updateUserPlan(id, newPlan)
    if (res.error) {
      alert(`Error updating plan: ${res.error}`)
      // Revert on error
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, plan: currentPlan } : p))
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their data.')) return
    
    // Optimistic update
    setProfiles(prev => prev.filter(p => p.id !== id))
    const res = await deleteUserAccount(id)
    if (res.error) {
      alert(`Error deleting user: ${res.error}`)
      // Could refresh the page to restore the state
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] w-full max-w-sm focus:outline-none focus:border-[var(--color-primary)]"
        />
        <select 
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--bg-elevated)]/50 border-b border-[var(--border)]">
            <tr>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Name</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Email</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Plan</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">MRR</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Joined</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                <td className="p-4 text-sm text-[var(--text-primary)] font-medium">{user.full_name || 'Unnamed'}</td>
                <td className="p-4 text-sm text-[var(--text-secondary)]">{user.email}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.plan === 'pro' ? 'bg-[rgba(var(--color-primary-rgb),0.2)] text-[var(--color-primary)]' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'}`}>
                    {user.plan || 'free'}
                  </span>
                </td>
                <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">
                  {user.plan === 'pro' ? '$12.00' : '$0.00'}
                </td>
                <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm text-right space-x-2">
                  <button 
                    onClick={() => handlePlanToggle(user.id, user.plan)}
                    className="text-xs bg-[var(--bg-elevated)] hover:bg-[var(--border)] text-[var(--text-primary)] px-2 py-1 rounded transition-colors"
                  >
                    Toggle Plan
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)] text-sm">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
