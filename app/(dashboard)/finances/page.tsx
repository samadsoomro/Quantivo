'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import { formatCurrency } from '@/lib/currency'
import { format } from 'date-fns'

interface Transaction {
  id: string
  date: string
  title: string
  amount: number
  type: 'income' | 'expense'
  categories?: {
    name: string
    color: string
  } | null
}

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [addModal, setAddModal] = useState<{ isOpen: boolean, type: 'income' | 'expense' }>({ isOpen: false, type: 'income' })
  const [addForm, setAddForm] = useState({ desc: '', amount: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const itemsPerPage = 10

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const fetchTransactions = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .select('id, date, title, amount, type, categories(name,color)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (!error && data) {
      const formatted = (data as any[]).map(tx => ({
        id: tx.id,
        date: tx.date,
        title: tx.title,
        amount: Number(tx.amount),
        type: tx.type,
        categories: Array.isArray(tx.categories) ? tx.categories[0] : tx.categories
      }))
      setTransactions(formatted)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const openAddModal = (type: 'income' | 'expense') => {
    setAddModal({ isOpen: true, type })
    setAddForm({ desc: '', amount: '' })
  }

  const submitAddTransaction = async () => {
    const { type } = addModal
    const amt = parseFloat(addForm.amount)
    if (!addForm.desc || isNaN(amt)) return

    setIsAdding(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsAdding(false)
      return
    }

    const { data: catData } = await supabase.from('categories').select('id').limit(1).single()
    const category_id = catData?.id || null

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      title: addForm.desc,
      amount: amt,
      type,
      date: format(new Date(), 'yyyy-MM-dd'),
      category_id
    })

    if (error) {
      showToast(`Error creating transaction: ${error.message}`)
    } else {
      fetchTransactions()
      setAddModal({ isOpen: false, type: 'income' })
    }
    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      showToast(`Error deleting transaction: ${error.message}`)
    } else {
      fetchTransactions()
    }
    setDeleteConfirm(null)
  }

  // Filter & Search Logic
  const filteredTransactions = transactions
    .filter(tx => {
      if (filter === 'income' && tx.type !== 'income') return false
      if (filter === 'expense' && tx.type !== 'expense') return false
      if (searchTerm && !tx.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  // Pagination
  const pageCount = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setPage(1)
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
        }
        .glass-input:focus {
          outline: none;
          border-color: rgba(225, 223, 255, 0.5);
          box-shadow: 0 0 0 2px rgba(225, 223, 255, 0.2);
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto pb-12 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display-lg text-[40px] font-bold text-white mb-2 tracking-tight">Finances</h2>
            <p className="text-[var(--text-secondary)]">Manage and track your operational cash flow.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAddModal('income')}
              className="bg-[#c0c1ff] text-[var(--bg-canvas)] px-6 py-2.5 rounded-full font-medium flex items-center gap-2 hover:brightness-110 hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Income
            </button>
            <button
              onClick={() => openAddModal('expense')}
              className="bg-[#fa8c00] text-[var(--bg-canvas)] px-6 py-2.5 rounded-full font-medium flex items-center gap-2 hover:brightness-110 hover:shadow-[0_0_20px_rgba(250,140,0,0.3)] transition-all"
            >
              <span className="material-symbols-outlined text-sm">remove</span>
              Add Expense
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center bg-[#010f1f]/50 rounded-lg p-1 border border-white/5 self-start">
            {(['all', 'income', 'expense'] as const).map(type => (
              <button
                key={type}
                onClick={() => { setFilter(type); setPage(1) }}
                className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${filter === type ? 'bg-white/10 text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm">search</span>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                className="glass-input text-white rounded-lg pl-9 pr-4 py-2 text-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[var(--text-secondary)] font-mono text-xs uppercase tracking-wider">
                  <th
                    onClick={() => toggleSort('date')}
                    className="py-4 px-6 font-medium cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <span className={`material-symbols-outlined text-[16px] transition-transform ${sortField === 'date' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${sortOrder === 'asc' && sortField === 'date' ? 'rotate-180' : ''}`}>
                        arrow_downward
                      </span>
                    </div>
                  </th>
                  <th className="py-4 px-6 font-medium">Description</th>
                  <th className="py-4 px-6 font-medium">Category</th>
                  <th
                    onClick={() => toggleSort('amount')}
                    className="py-4 px-6 font-medium text-right cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Amount
                      <span className={`material-symbols-outlined text-[16px] transition-transform ${sortField === 'amount' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${sortOrder === 'asc' && sortField === 'amount' ? 'rotate-180' : ''}`}>
                        arrow_downward
                      </span>
                    </div>
                  </th>
                  <th className="py-4 px-6 font-medium text-center">Type</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[var(--text-secondary)]">Loading transactions...</td>
                  </tr>
                ) : paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[var(--text-secondary)]">No transactions found</td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => {
                    const isIncome = tx.type === 'income'
                    const catColor = tx.categories?.color || 'var(--text-muted)'
                    const catName = tx.categories?.name || 'Other'
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6 font-mono text-sm text-[var(--text-secondary)]">{tx.date}</td>
                        <td className="py-4 px-6 font-body-md text-white font-medium">{tx.title}</td>
                        <td className="py-4 px-6">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: `${catColor}15`,
                              borderColor: `${catColor}30`,
                              color: catColor
                            }}
                          >
                            {catName}
                          </span>
                        </td>
                        <td className={`py-4 px-6 font-mono text-right font-medium ${isIncome ? 'text-emerald-400' : 'text-[#ff4433]'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`material-symbols-outlined text-[20px] ${isIncome ? 'text-emerald-400' : 'text-[#ff4433]'}`}>
                            {isIncome ? 'arrow_circle_up' : 'arrow_circle_down'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setDeleteConfirm(tx.id)}
                            className="text-[var(--text-secondary)] hover:text-[#ff4433] p-1 transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <span className="font-mono text-sm text-[var(--text-secondary)]">
                Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded font-mono text-sm border flex items-center justify-center transition-colors ${page === i + 1 ? 'bg-[#c0c1ff]/20 text-[#c0c1ff] border-[#c0c1ff]/30' : 'border-white/10 text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={page === pageCount}
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                  className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Dialog */}
      {addModal.isOpen && (
        <div className="fixed inset-0 bg-[var(--bg-canvas)]/80 z-50 flex items-center justify-center p-4" onClick={() => setAddModal({ isOpen: false, type: 'income' })}>
          <div className="glass-modal w-full max-w-md p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="font-display text-xl font-bold text-white">Add {addModal.type.charAt(0).toUpperCase() + addModal.type.slice(1)}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Enter transaction details below.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Client Payment"
                  className="glass-input rounded-lg px-4 py-3 text-sm text-white"
                  value={addForm.desc}
                  onChange={(e) => setAddForm(prev => ({ ...prev, desc: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="glass-input rounded-lg pl-8 pr-4 py-3 text-sm text-white w-full"
                    value={addForm.amount}
                    onChange={(e) => setAddForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAddModal({ isOpen: false, type: 'income' })}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                onClick={submitAddTransaction}
                disabled={!addForm.desc || !addForm.amount || isAdding}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${addModal.type === 'income' ? 'bg-[#c0c1ff] text-[var(--bg-canvas)] hover:shadow-[0_0_15px_rgba(192,193,255,0.3)]' : 'bg-[#fa8c00] text-[var(--bg-canvas)] hover:shadow-[0_0_15px_rgba(250,140,0,0.3)]'} disabled:opacity-50 disabled:pointer-events-none`}
              >
                {isAdding ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-[var(--bg-canvas)]/80 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="glass-modal w-full max-w-sm p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ff4433]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ff4433]">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Transaction</h3>
                <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#ff4433] text-white hover:brightness-110 transition-all">Delete</button>
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
