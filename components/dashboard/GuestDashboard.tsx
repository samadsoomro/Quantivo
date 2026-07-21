'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, subMonths } from 'date-fns'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { GoalsSummary } from '@/components/dashboard/GoalsSummary'

export function GuestDashboard() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    incomeChange: 0,
    expenseChange: 0,
    savingsChange: 0,
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])

  useEffect(() => {
    const txData = localStorage.getItem('qv-guest-transactions')
    const goalsData = localStorage.getItem('qv-guest-goals')
    
    let parsedTx: any[] = []
    if (txData) parsedTx = JSON.parse(txData)
    if (goalsData) setGoals(JSON.parse(goalsData))

    // Set recent transactions
    setTransactions(parsedTx.slice(0, 5))

    // Calculate stats
    const now = new Date()
    const monthStart = startOfMonth(now)
    const thisMonthTx = parsedTx.filter(t => new Date(t.date) >= monthStart)
    const thisMonthIncome = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const thisMonthExpenses = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

    setStats({
      totalBalance: thisMonthIncome - thisMonthExpenses,
      totalIncome: thisMonthIncome,
      totalExpenses: thisMonthExpenses,
      totalSavings: thisMonthIncome - thisMonthExpenses,
      incomeChange: 0,
      expenseChange: 0,
      savingsChange: 0,
    })

    // Category Pie Chart Data
    const categoryMap: Record<string, { name: string; amount: number; color: string }> = {}
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      const key = t.categories?.name ?? 'Other'
      if (!categoryMap[key]) categoryMap[key] = { name: key, amount: 0, color: t.categories?.color ?? '#6b7280' }
      categoryMap[key].amount += Number(t.amount)
    })
    setCategoryData(Object.values(categoryMap).sort((a, b) => b.amount - a.amount).slice(0, 6))

    // Monthly Chart Data (Last 6 Months)
    const monthlyMap: Record<string, { income: number; expenses: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const key = format(subMonths(now, i), 'MMM')
      monthlyMap[key] = { income: 0, expenses: 0 }
    }
    parsedTx.forEach(t => {
      const key = format(new Date(t.date), 'MMM')
      if (monthlyMap[key]) {
        if (t.type === 'income') monthlyMap[key].income += Number(t.amount)
        else monthlyMap[key].expenses += Number(t.amount)
      }
    })
    setMonthlyChartData(Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data })))
  }, [])

  const now = new Date()

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Dashboard (Guest)</h1>
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
        <RecentTransactions transactions={transactions} />
        <GoalsSummary goals={goals} />
      </div>
    </div>
  )
}
