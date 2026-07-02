import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/supabase/server'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { formatCurrency } from '@/lib/currency'
import { DashboardCharts } from '@/components/DashboardCharts'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const lastMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
  const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
  const sixMonthsAgo = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd')

  const [{ data: txThisMonth }, { data: txLastMonth }, { data: recentTx }, { data: goals }, { data: chartTx }] =
    await Promise.all([
      supabase.from('transactions').select('amount, type, categories(name,color)').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd),
      supabase.from('transactions').select('amount, type').eq('user_id', user.id).gte('date', lastMonthStart).lte('date', lastMonthEnd),
      supabase.from('transactions').select('*, categories(name,color,icon)').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').limit(4),
      supabase.from('transactions').select('amount, type, date').eq('user_id', user.id).gte('date', sixMonthsAgo).order('date', { ascending: true }),
    ])

  const thisIncome = txThisMonth?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const thisExpenses = txThisMonth?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const lastIncome = txLastMonth?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const lastExpenses = txLastMonth?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0

  const stats = {
    totalBalance: thisIncome - thisExpenses,
    totalIncome: thisIncome,
    totalExpenses: thisExpenses,
    totalSavings: thisIncome - thisExpenses,
    incomeChange: lastIncome > 0 ? ((thisIncome - lastIncome) / lastIncome) * 100 : 0,
    expenseChange: lastExpenses > 0 ? ((thisExpenses - lastExpenses) / lastExpenses) * 100 : 0,
    savingsChange: lastIncome - lastExpenses > 0 ? (((thisIncome - thisExpenses) - (lastIncome - lastExpenses)) / (lastIncome - lastExpenses)) * 100 : 0,
  }

  const monthlyMap: Record<string, { income: number; expenses: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const key = format(subMonths(now, i), 'MMM')
    monthlyMap[key] = { income: 0, expenses: 0 }
  }
  chartTx?.forEach(t => {
    const key = format(new Date(t.date), 'MMM')
    if (monthlyMap[key]) {
      if (t.type === 'income') monthlyMap[key].income += Number(t.amount)
      else monthlyMap[key].expenses += Number(t.amount)
    }
  })
  const monthlyChartData = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }))

  const catMap: Record<string, { name: string; amount: number; color: string }> = {}
  txThisMonth?.filter(t => t.type === 'expense').forEach(t => {
    const cat = (Array.isArray(t.categories) ? t.categories[0] : t.categories) as { name: string; color: string } | null
    const key = cat?.name ?? 'Other'
    if (!catMap[key]) catMap[key] = { name: key, amount: 0, color: cat?.color ?? '#6b7280' }
    catMap[key].amount += Number(t.amount)
  })
  const categoryData = Object.values(catMap).sort((a, b) => b.amount - a.amount).slice(0, 3)
  const categoryTotal = categoryData.reduce((s, c) => s + c.amount, 0) || 1

  // Chart scaling
  const maxVal = Math.max(...monthlyChartData.map(d => Math.max(d.income, d.expenses)), 1)

  return (
    <>
      <style>{`
        .glass-panel {
          background-color: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
        }
        .glass-panel-hover:hover {
          transform: translateY(-3px);
          transition: transform 200ms ease-out;
        }
        @keyframes progress {
          0% { background-position: 1rem 0; }
          100% { background-position: 0 0; }
        }
      `}</style>

      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <div className="mb-10">
          <h2 className="font-headline-md text-3xl font-bold text-[var(--text-primary)]">Dashboard Overview</h2>
          <p className="font-body-md text-sm text-[var(--text-secondary)] mt-1">Monitor your financial health and growth</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="glass-panel rounded-xl p-6 glass-panel-hover flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-[var(--text-secondary)] font-body-sm text-sm">Total Balance</span>
              <span className={`font-label-caps text-xs flex items-center gap-1 px-2 py-1 rounded-full ${stats.savingsChange >= 0 ? 'text-[#00cc4b] bg-[#00cc4b]/10' : 'text-[#ff4433] bg-[#ff4433]/10'}`}>
                <span className="material-symbols-outlined text-[14px]">{stats.savingsChange >= 0 ? 'trending_up' : 'trending_down'}</span>
                {stats.savingsChange >= 0 ? '+' : ''}{stats.savingsChange.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-data-display text-[28px] font-bold text-[var(--text-primary)] tracking-tight">{formatCurrency(stats.totalBalance)}</span>
              <svg className="stroke-[#c0c1ff] fill-none" height="30" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 60 30" width="60">
                <path d="M0,25 L10,20 L20,28 L30,15 L40,18 L50,5 L60,10" />
              </svg>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-xl p-6 glass-panel-hover flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-[var(--text-secondary)] font-body-sm text-sm">Monthly Income</span>
              <span className={`font-label-caps text-xs flex items-center gap-1 px-2 py-1 rounded-full ${stats.incomeChange >= 0 ? 'text-[#00cc4b] bg-[#00cc4b]/10' : 'text-[#ff4433] bg-[#ff4433]/10'}`}>
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                {stats.incomeChange >= 0 ? '+' : ''}{stats.incomeChange.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-data-display text-[28px] font-bold text-[var(--text-primary)] tracking-tight">{formatCurrency(stats.totalIncome)}</span>
              <svg className="stroke-[#00cc4b] fill-none" height="30" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 60 30" width="60">
                <path d="M0,28 L15,15 L30,20 L45,5 L60,2" />
              </svg>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-xl p-6 glass-panel-hover flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-[var(--text-secondary)] font-body-sm text-sm">Monthly Expenses</span>
              <span className={`font-label-caps text-xs flex items-center gap-1 px-2 py-1 rounded-full ${stats.expenseChange <= 0 ? 'text-[#00cc4b] bg-[#00cc4b]/10' : 'text-[#ff4433] bg-[#ff4433]/10'}`}>
                <span className="material-symbols-outlined text-[14px]">{stats.expenseChange <= 0 ? 'trending_down' : 'trending_up'}</span>
                {stats.expenseChange >= 0 ? '+' : ''}{stats.expenseChange.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-data-display text-[28px] font-bold text-[var(--text-primary)] tracking-tight">{formatCurrency(stats.totalExpenses)}</span>
              <svg className="stroke-[#ff4433] fill-none" height="30" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 60 30" width="60">
                <path d="M0,5 L15,10 L30,25 L45,15 L60,28" />
              </svg>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-panel rounded-xl p-6 glass-panel-hover flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-[var(--text-secondary)] font-body-sm text-sm">Savings Rate</span>
              <span className="text-[#c0c1ff] font-label-caps text-xs flex items-center gap-1 bg-[#c0c1ff]/10 px-2 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">savings</span> Safe
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-data-display text-[28px] font-bold text-[var(--text-primary)] tracking-tight">
                {stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome * 100).toFixed(1) : '0'}%
              </span>
              <svg className="stroke-[#c0c1ff] fill-none" height="30" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 60 30" width="60">
                <path d="M0,20 L15,22 L30,15 L45,18 L60,5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Middle Grid */}
        <DashboardCharts monthlyChartData={monthlyChartData} categoryData={categoryData} />

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Table */}
          <div className="lg:col-span-2 glass-panel rounded-xl p-6 glass-panel-hover flex flex-col h-[400px] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-[20px] font-bold text-[var(--text-primary)]">Recent Transactions</h3>
              <Link href="/finances" className="text-[#c0c1ff] hover:text-white font-label-caps text-xs tracking-wider transition-colors">VIEW ALL</Link>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <table className="w-full text-left border-collapse">
                <tbody className="font-body-sm text-[var(--text-secondary)]">
                  {!recentTx || recentTx.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-[var(--text-secondary)]">No recent transactions</td>
                    </tr>
                  ) : (
                    recentTx.map((tx) => {
                      const isIncome = tx.type === 'income'
                      const category = tx.categories as { name: string; color: string; icon: string } | null
                      return (
                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-2 w-16">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-primary)]">
                              <span className="material-symbols-outlined text-[20px]">
                                {category?.icon || (isIncome ? 'arrow_downward' : 'shopping_cart')}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="font-medium text-[var(--text-primary)]">{tx.title ?? tx.description}</div>
                            <div className="text-xs mt-1">{format(new Date(tx.date), 'MMM dd, yyyy')}</div>
                          </td>
                          <td className="py-4 px-2">
                            <span className="px-2 py-1 rounded-full font-label-caps text-[10px]" style={{ backgroundColor: `${category?.color || 'var(--text-muted)'}20`, color: category?.color || 'var(--text-muted)', border: `1px solid ${category?.color || 'var(--text-muted)'}30` }}>
                              {category?.name?.toUpperCase() || 'OTHER'}
                            </span>
                          </td>
                          <td className={`py-4 px-2 text-right font-data-display font-medium ${isIncome ? 'text-[#00cc4b]' : 'text-[#ff4433]'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Goals */}
          <div className="lg:col-span-1 glass-panel rounded-xl p-6 glass-panel-hover flex flex-col h-[400px]">
            <h3 className="font-headline-md text-[20px] font-bold text-[var(--text-primary)] mb-6">Active Goals</h3>
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
              {!goals || goals.length === 0 ? (
                <div className="text-center text-sm text-[var(--text-secondary)] py-12">No active goals</div>
              ) : (
                goals.map((g) => {
                  const current = Number(g.current_amount || 0)
                  const target = Number(g.target_amount || 1)
                  const pct = Math.min(100, Math.round((current / target) * 100))
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-body-sm font-medium text-[var(--text-primary)]">{g.name}</span>
                        <span className="font-data-display text-sm text-[#c0c1ff]">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full bg-[#c0c1ff] rounded-full" style={{ width: `${pct}%`, transition: 'width 1s ease-in-out' }}>
                          <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <Link href="/goals" className="mt-4 w-full py-2 border border-white/10 rounded-full text-center text-[var(--text-secondary)] font-label-caps text-xs hover:bg-white/5 hover:text-white transition-all block">
              ADD NEW GOAL
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
