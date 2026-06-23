import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { GoalsSummary } from '@/components/dashboard/GoalsSummary'
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns'

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

  // Fetch this month's transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(name, color, icon)')
    .eq('user_id', user.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .order('date', { ascending: false })

  // Fetch last month for comparison
  const { data: lastMonthTx } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', user.id)
    .gte('date', lastMonthStart)
    .lte('date', lastMonthEnd)

  // Fetch recent 5 transactions (any date)
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('*, categories(name, color, icon)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch active goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(4)

  // Fetch last 6 months data for chart
  const sixMonthsAgo = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd')
  const { data: chartData } = await supabase
    .from('transactions')
    .select('amount, type, date')
    .eq('user_id', user.id)
    .gte('date', sixMonthsAgo)
    .order('date', { ascending: true })

  // Calculate KPIs
  const thisMonthIncome = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const thisMonthExpenses = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const lastMonthIncome = lastMonthTx?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const lastMonthExpenses = lastMonthTx?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0

  const stats = {
    totalBalance: thisMonthIncome - thisMonthExpenses,
    totalIncome: thisMonthIncome,
    totalExpenses: thisMonthExpenses,
    totalSavings: thisMonthIncome - thisMonthExpenses,
    incomeChange: lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0,
    expenseChange: lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0,
    savingsChange: 0,
  }

  // Build monthly chart series
  const monthlyMap: Record<string, { income: number; expenses: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const key = format(subMonths(now, i), 'MMM')
    monthlyMap[key] = { income: 0, expenses: 0 }
  }
  chartData?.forEach(t => {
    const key = format(new Date(t.date), 'MMM')
    if (monthlyMap[key]) {
      if (t.type === 'income') monthlyMap[key].income += Number(t.amount)
      else monthlyMap[key].expenses += Number(t.amount)
    }
  })
  const monthlyChartData = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }))

  // Category breakdown for pie
  const categoryMap: Record<string, { name: string; amount: number; color: string }> = {}
  transactions?.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.categories
    const key = cat?.name ?? 'Other'
    if (!categoryMap[key]) categoryMap[key] = { name: key, amount: 0, color: cat?.color ?? '#6b7280' }
    categoryMap[key].amount += Number(t.amount)
  })
  const categoryData = Object.values(categoryMap).sort((a, b) => b.amount - a.amount).slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{format(now, 'MMMM yyyy')}</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={monthlyChartData} />
        </div>
        <CategoryPieChart data={categoryData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions transactions={recentTransactions ?? []} />
        <GoalsSummary goals={goals ?? []} />
      </div>
    </div>
  )
}
