'use client'

import { format } from 'date-fns'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { GoalsSummary } from '@/components/dashboard/GoalsSummary'

export function GuestDashboard() {
  const now = new Date()

  const stats = {
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    incomeChange: 0,
    expenseChange: 0,
    savingsChange: 0,
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Dashboard (Guest)</h1>
        <p className="text-sm text-muted-foreground">{format(now, 'MMMM yyyy')}</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={[]} />
        </div>
        <CategoryPieChart data={[]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions transactions={[]} />
        <GoalsSummary goals={[]} />
      </div>
    </div>
  )
}
