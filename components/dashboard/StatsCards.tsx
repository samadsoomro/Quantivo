'use client'

import { TrendingUp, TrendingDown, Wallet, ArrowDownCircle, ArrowUpCircle, PiggyBank } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardStats } from '@/types'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const currency = 'USD' // TODO: from profile

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

  const cards = [
    {
      label: 'Total Balance',
      value: fmt(stats.totalBalance),
      change: null,
      icon: Wallet,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Income',
      value: fmt(stats.totalIncome),
      change: stats.incomeChange,
      icon: ArrowUpCircle,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      label: 'Expenses',
      value: fmt(stats.totalExpenses),
      change: stats.expenseChange,
      icon: ArrowDownCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      invertChange: true, // higher expenses = bad
    },
    {
      label: 'Savings',
      value: fmt(stats.totalSavings),
      change: stats.savingsChange,
      icon: PiggyBank,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const isPositive = card.invertChange
          ? (card.change ?? 0) < 0
          : (card.change ?? 0) >= 0

        return (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="section-label">{card.label}</span>
              <div className={cn('rounded-lg p-2', card.bg)}>
                <card.icon className={cn('h-4 w-4', card.color)} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
              {card.change !== null && (
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-secondary" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={isPositive ? 'text-secondary' : 'text-destructive'}>
                    {Math.abs(card.change).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
