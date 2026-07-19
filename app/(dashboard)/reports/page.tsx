'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import { formatCurrency } from '@/lib/currency'

interface CategoryBreakdown {
  name: string
  amount: number
  color: string
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [categories, setCategories] = useState<CategoryBreakdown[]>([])
  const [range, setRange] = useState('7m')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchReportData = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // Fetch all transactions
    const { data: txData, error } = await supabase
      .from('transactions')
      .select('amount, type, categories(name,color)')
      .eq('user_id', user.id)

    if (!error && txData) {
      let inc = 0
      let exp = 0
      const catMap: Record<string, { name: string; amount: number; color: string }> = {}

      txData.forEach(tx => {
        const amt = Number(tx.amount)
        if (tx.type === 'income') {
          inc += amt
        } else {
          exp += amt
          const cat = (Array.isArray(tx.categories) ? tx.categories[0] : tx.categories) as { name: string; color: string } | null
          const key = cat?.name ?? 'Other'
          if (!catMap[key]) {
            catMap[key] = { name: key, amount: 0, color: cat?.color ?? 'var(--text-muted)' }
          }
          catMap[key].amount += amt
        }
      })

      setTotalIncome(inc)
      setTotalExpenses(exp)

      const sortedCats = Object.values(catMap)
        .sort((a, b) => b.amount - a.amount)
      setCategories(sortedCats)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReportData()
  }, [])

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
  const totalCatExpenses = categories.reduce((s, c) => s + c.amount, 0) || 1

  return (
    <>
      <style>{`
        .glass-panel {
          background-color: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
        }
        .chart-grid-line {
          stroke: rgba(255, 255, 255, 0.05);
          stroke-width: 1;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto pb-12 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="font-headline-xl text-3xl font-bold text-white tracking-tight">Reports & Analytics</h2>
            <p className="font-body-md text-sm text-[var(--text-secondary)] mt-2">Comprehensive financial breakdown and predictive modeling.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="glass-panel text-white border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c0c1ff] appearance-none cursor-pointer pr-10 relative bg-[var(--bg-canvas)]"
            >
              <option value="7m">Last 7 Months</option>
              <option value="1y">Last 1 Year</option>
              <option value="ytd">YTD</option>
            </select>
            <button
              onClick={() => {
                const csv = `Category,Amount\n${categories.map(c => `${c.name},${c.amount}`).join('\n')}`
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = 'report.csv'; a.click()
                URL.revokeObjectURL(url)
                showToast('CSV downloaded!')
              }}
              className="bg-[#fa8c00] text-[#231b00] px-6 py-2 rounded-full font-medium text-sm hover:brightness-110 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              CSV
            </button>
            <button
              onClick={() => showToast('PDF export — use the Reports PDF feature in the Tools page.')}
              className="bg-[#c0c1ff] text-[#292b5e] px-6 py-2 rounded-full font-medium text-sm hover:brightness-110 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              PDF
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Card 1 */}
          <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-[160px] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#22c55e]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start">
              <span className="font-body-sm text-xs text-[var(--text-secondary)] uppercase tracking-wider">Total Income</span>
              <div className="w-8 h-8 rounded-full bg-[#22c55e]/10 flex items-center justify-center border border-[#22c55e]/20">
                <span className="material-symbols-outlined text-[#22c55e] text-[16px]">trending_up</span>
              </div>
            </div>
            {loading ? (
              <span className="text-sm text-[var(--text-secondary)]">Loading...</span>
            ) : (
              <div>
                <div className="font-data-lg text-[32px] font-bold leading-tight text-white">{formatCurrency(totalIncome)}</div>
                <div className="text-[#22c55e] font-mono text-xs mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  Live Telemetry
                </div>
              </div>
            )}
          </div>

          {/* Stat Card 2 */}
          <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-[160px] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start">
              <span className="font-body-sm text-xs text-[var(--text-secondary)] uppercase tracking-wider">Total Expenses</span>
              <div className="w-8 h-8 rounded-full bg-[#ef4444]/10 flex items-center justify-center border border-[#ef4444]/20">
                <span className="material-symbols-outlined text-[#ef4444] text-[16px]">trending_down</span>
              </div>
            </div>
            {loading ? (
              <span className="text-sm text-[var(--text-secondary)]">Loading...</span>
            ) : (
              <div>
                <div className="font-data-lg text-[32px] font-bold leading-tight text-white">{formatCurrency(totalExpenses)}</div>
                <div className="text-[#ef4444] font-mono text-xs mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  Live Telemetry
                </div>
              </div>
            )}
          </div>

          {/* Stat Card 3 */}
          <div className="glass-panel rounded-xl p-6 flex flex-col justify-between h-[160px] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c0c1ff]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start">
              <span className="font-body-sm text-xs text-[var(--text-secondary)] uppercase tracking-wider">Net Savings Rate</span>
              <div className="w-8 h-8 rounded-full bg-[#c0c1ff]/10 flex items-center justify-center border border-[#c0c1ff]/20">
                <span className="material-symbols-outlined text-[#c0c1ff] text-[16px]">account_balance_wallet</span>
              </div>
            </div>
            {loading ? (
              <span className="text-sm text-[var(--text-secondary)]">Loading...</span>
            ) : (
              <div>
                <div className="font-data-lg text-[32px] font-bold leading-tight text-white">{savingsRate.toFixed(1)}%</div>
                <div className="text-[#c0c1ff] font-mono text-xs mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Optimized tier
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bento Grid Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="xl:col-span-2 glass-panel rounded-xl p-6 flex flex-col h-[450px]">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="font-headline text-lg font-bold text-white">Income & Savings Velocity</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#c0c1ff]"></div>
                  <span className="font-mono text-xs text-[var(--text-secondary)]">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#fa8c00]"></div>
                  <span className="font-mono text-xs text-[var(--text-secondary)]">Savings</span>
                </div>
              </div>
            </div>
            <div className="flex-1 relative w-full h-full pt-4">
              {/* Mock SVG Chart */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
                <defs>
                  <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.4"></stop>
                    <stop offset="100%" stopColor="#c0c1ff" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line className="chart-grid-line" x1="50" x2="780" y1="50" y2="50"></line>
                <line className="chart-grid-line" x1="50" x2="780" y1="125" y2="125"></line>
                <line className="chart-grid-line" x1="50" x2="780" y1="200" y2="200"></line>
                <line className="chart-grid-line" x1="50" x2="780" y1="275" y2="275"></line>
                {/* Y Axis Labels */}
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="40" y="55">25k</text>
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="40" y="130">20k</text>
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="40" y="205">15k</text>
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="40" y="280">10k</text>
                {/* X Axis Labels */}
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="50" y="295">Jan</text>
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="171" y="295">Feb</text>
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="292" y="295">Mar</text>
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="414" y="295">Apr</text>
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="535" y="295">May</text>
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="657" y="295">Jun</text>
                <text fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="780" y="295">Jul</text>
                {/* Income Area (Violet) */}
                <path d="M50,220 C100,210 120,180 171,150 C220,120 250,140 292,130 C340,120 370,80 414,90 C460,100 490,110 535,80 C580,50 610,60 657,40 C700,20 740,30 780,20 L780,275 L50,275 Z" fill="url(#incomeGradient)"></path>
                <path d="M50,220 C100,210 120,180 171,150 C220,120 250,140 292,130 C340,120 370,80 414,90 C460,100 490,110 535,80 C580,50 610,60 657,40 C700,20 740,30 780,20" fill="none" stroke="#c0c1ff" strokeWidth="2"></path>
                {/* Savings Line (Amber) */}
                <path d="M50,260 C100,255 120,240 171,230 C220,220 250,210 292,200 C340,190 370,170 414,150 C460,130 490,120 535,100 C580,80 610,90 657,70 C700,50 740,60 780,40" fill="none" stroke="#fa8c00" strokeDasharray="6,4" strokeWidth="2"></path>
                {/* Data Points */}
                <circle cx="780" cy="20" fill="var(--bg-canvas)" r="4" stroke="#c0c1ff" strokeWidth="2"></circle>
                <circle cx="780" cy="40" fill="var(--bg-canvas)" r="4" stroke="#fa8c00" strokeWidth="2"></circle>
              </svg>
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="flex flex-col gap-6">
            {/* AI Insight Card (Locked) */}
            <div className="glass-panel rounded-xl p-6 relative overflow-hidden h-[213px] border-[#c0c1ff]/30 shadow-[0_0_15px_rgba(192,193,255,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c0c1ff]/5 to-transparent z-0"></div>
              <div className="relative z-10 filter blur-sm select-none">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#c0c1ff]">auto_awesome</span>
                  <h4 className="font-headline text-[18px] text-[#c0c1ff] font-bold">Quantos Insight</h4>
                </div>
                <p className="font-body-md text-xs text-[var(--text-secondary)] leading-relaxed">
                  Your savings rate has improved by <strong className="text-white font-medium">12%</strong> following subscription optimization. We project an additional $4,200 in surplus capital by year end if current velocity holds.
                </p>
              </div>
              {/* Lock Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--bg-canvas)]/80 backdrop-blur-[2px]">
                <span className="material-symbols-outlined text-[#c0c1ff]/50 text-[32px] mb-2">lock</span>
                <button
                  onClick={() => showToast('Upgrade to Pro to unlock AI-powered financial insights.')}
                  className="bg-[#c0c1ff] text-[#292b5e] px-6 py-2 rounded-full font-medium text-xs hover:brightness-110 transition-all shadow-lg flex items-center gap-2"
                >
                  Unlock Pro Insights
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Spend Intensity Heatmap Mini */}
            <div className="glass-panel rounded-xl p-6 flex flex-col h-[213px]">
              <h4 className="font-body-md font-medium text-white mb-4 border-b border-white/10 pb-2">Spend Intensity Heatmap</h4>
              <div className="flex-1 grid grid-cols-7 grid-rows-4 gap-1">
                {/* Visual heat map squares */}
                <div className="bg-[#c0c1ff]/20 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/10 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/40 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/20 rounded-sm"></div>
                <div className="bg-[#fa8c00]/40 rounded-sm"></div>
                <div className="bg-[#fa8c00]/60 rounded-sm"></div>
                <div className="bg-[#fa8c00]/30 rounded-sm"></div>

                <div className="bg-[#c0c1ff]/10 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/30 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/20 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/50 rounded-sm"></div>
                <div className="bg-[#fa8c00]/20 rounded-sm"></div>
                <div className="bg-[#fa8c00]/80 rounded-sm"></div>
                <div className="bg-[#fa8c00]/40 rounded-sm"></div>

                <div className="bg-[#c0c1ff]/40 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/20 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/60 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/30 rounded-sm"></div>
                <div className="bg-[#fa8c00]/50 rounded-sm"></div>
                <div className="bg-[#fa8c00]/90 rounded-sm"></div>
                <div className="bg-[#fa8c00]/60 rounded-sm"></div>

                <div className="bg-[#c0c1ff]/20 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/40 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/10 rounded-sm"></div>
                <div className="bg-[#c0c1ff]/20 rounded-sm"></div>
                <div className="bg-[#fa8c00]/30 rounded-sm"></div>
                <div className="bg-[#fa8c00]/70 rounded-sm"></div>
                <div className="bg-[#fa8c00]/50 rounded-sm"></div>
              </div>
              <div className="flex justify-between mt-2 font-mono text-[10px] text-[var(--text-secondary)]/50">
                <span>Low (Mon)</span>
                <span>High (Sun)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="glass-panel rounded-xl mt-6 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-headline text-lg font-bold text-white">Category Breakdown</h3>
            <button
              onClick={fetchReportData}
              className="text-[#c0c1ff] text-sm hover:underline font-medium"
            >
              Refresh
            </button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)] font-medium tracking-wide">Category</th>
                  <th className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)] font-medium tracking-wide">Amount</th>
                  <th className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)] font-medium tracking-wide">% Share</th>
                  <th className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)] font-medium tracking-wide w-1/3">Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-[var(--text-secondary)]">Loading categories...</td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-[var(--text-secondary)]">No categories recorded</td>
                  </tr>
                ) : (
                  categories.map((cat) => {
                    const share = ((cat.amount / totalCatExpenses) * 100).toFixed(1)
                    return (
                      <tr key={cat.name} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            <span className="font-mono text-xs text-white">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-sm text-white">{formatCurrency(cat.amount)}</td>
                        <td className="py-4 px-6 font-mono text-sm text-[var(--text-secondary)]">{share}%</td>
                        <td className="py-4 px-6">
                          <div className="w-full h-1.5 bg-[var(--bg-canvas)] rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-[#c0c1ff] to-[#fa8c00]" style={{ width: `${share}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 200, background: 'rgba(13,28,45,0.95)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 20px', color: '#e1dfff', fontSize: '14px', backdropFilter: 'blur(12px)' }}>
          {toast}
        </div>
      )}
    </>
  )
}
