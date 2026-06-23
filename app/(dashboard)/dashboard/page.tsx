import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { KPICards } from '@/components/dashboard/KPICards'
import { CashFlowChart } from '@/components/dashboard/CashFlowChart'
import { ExpenseBreakdown } from '@/components/dashboard/ExpenseBreakdown'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { ActiveGoals } from '@/components/dashboard/ActiveGoals'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

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
      supabase.from('transactions').select('*, categories(name,color,icon)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
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
    savingsChange: 0,
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
  const categoryData = Object.values(catMap).sort((a, b) => b.amount - a.amount).slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#dae2fd]">Dashboard Overview</h2>
          <p className="text-sm text-[#c7c4d7] mt-1">Real-time financial telemetry.</p>
        </div>
        <span className="text-sm text-[#c7c4d7]">{format(now, 'MMMM yyyy')}</span>
      </div>
      <KPICards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CashFlowChart data={monthlyChartData} />
        <ExpenseBreakdown data={categoryData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentTransactions transactions={recentTx ?? []} />
        <ActiveGoals goals={goals ?? []} />
      </div>
    </div>
  )
}
