import Link from 'next/link'
import type { Goal } from '@/types'

export function ActiveGoals({ goals }: { goals: Goal[] }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-3">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Active Goals</h3>
        <Link href="/goals" className="text-xs text-primary hover:text-primary-hover transition-colors">
          View All
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[var(--text-secondary)]">No goals yet. Create your first goal!</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {goals.map((goal) => {
            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
            const barColor = pct >= 75 ? 'var(--color-primary)' : pct >= 40 ? '#4edea3' : '#908fa0'
            return (
              <div key={goal.id}>
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)] block truncate max-w-[150px] sm:max-w-[200px]">{goal.title}</span>
                    <span className="text-xs text-[var(--text-secondary)] block mt-0.5">
                      {fmt(goal.current_amount)} / {fmt(goal.target_amount)}
                    </span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: barColor }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
