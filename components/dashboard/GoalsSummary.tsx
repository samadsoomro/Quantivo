import Link from 'next/link'
import { Target } from 'lucide-react'
import type { Goal } from '@/types'

export function GoalsSummary({ goals }: { goals: Goal[] }) {
  return (
    <div className="stat-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Active Goals</h3>
        <Link href="/goals" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </div>
      {goals.length === 0 ? (
        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">No active goals yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
            return (
              <div key={goal.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded p-1" style={{ background: goal.color + '22' }}>
                      <Target className="h-3 w-3" style={{ color: goal.color }} />
                    </div>
                    <span className="text-sm font-medium">{goal.title}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: goal.color }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goal.current_amount)}
                  </span>
                  <span>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goal.target_amount)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
