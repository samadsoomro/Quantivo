import type { DashboardStats } from '@/types'

interface KPICardsProps {
  stats: DashboardStats
}

function Sparkline({ color, path }: { color: string; path: string }) {
  return (
    <div className="absolute bottom-4 right-4 w-16 h-8 opacity-40">
      <svg className="w-full h-full fill-none stroke-2" style={{ stroke: color }} preserveAspectRatio="none" viewBox="0 0 100 30">
        <path d={path} />
      </svg>
    </div>
  )
}

export function KPICards({ stats }: KPICardsProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const cards = [
    {
      label: 'Total Balance',
      value: fmt(stats.totalBalance),
      change: stats.savingsChange,
      positive: true,
      icon: 'account_balance_wallet',
      sparkColor: '#4edea3',
      sparkPath: 'M0 25 L20 20 L40 28 L60 15 L80 18 L100 5',
    },
    {
      label: 'Total Income',
      value: fmt(stats.totalIncome),
      change: stats.incomeChange,
      positive: stats.incomeChange >= 0,
      icon: 'arrow_downward',
      sparkColor: '#4edea3',
      sparkPath: 'M0 28 L20 22 L40 25 L60 12 L80 15 L100 2',
    },
    {
      label: 'Total Expenses',
      value: fmt(stats.totalExpenses),
      change: stats.expenseChange,
      positive: stats.expenseChange <= 0,
      icon: 'arrow_upward',
      sparkColor: '#ffb4ab',
      sparkPath: 'M0 5 L20 15 L40 10 L60 22 L80 18 L100 28',
    },
    {
      label: 'Savings Rate',
      value: stats.totalIncome > 0
        ? `${(((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100).toFixed(1)}%`
        : '0%',
      change: stats.savingsChange,
      positive: true,
      icon: 'savings',
      sparkColor: 'var(--color-primary)',
      sparkPath: 'M0 25 L20 20 L40 22 L60 10 L80 12 L100 5',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[#131b2e] border border-[#464554] rounded-lg p-4 relative overflow-hidden hover:bg-[#222a3d] transition-colors duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-[#c7c4d7] uppercase tracking-wider">{card.label}</span>
            <span className="material-symbols-outlined text-[20px] text-[#c7c4d7]">{card.icon}</span>
          </div>
          <div className="font-mono text-2xl font-semibold text-[#dae2fd] mb-1">{card.value}</div>
          <div className="flex items-center gap-1">
            <span className={`material-symbols-outlined text-[16px] ${card.positive ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}`}>
              {card.positive ? 'trending_up' : 'trending_down'}
            </span>
            <span className={`font-mono text-xs ${card.positive ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}`}>
              {card.change >= 0 ? '+' : ''}{card.change.toFixed(1)}%
            </span>
            <span className="text-xs text-[#c7c4d7]">vs last month</span>
          </div>
          <Sparkline color={card.sparkColor} path={card.sparkPath} />
        </div>
      ))}
    </div>
  )
}
