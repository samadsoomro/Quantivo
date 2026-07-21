'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface CategoryData {
  name: string
  amount: number
  color: string
}

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0)

  if (data.length === 0) {
    return (
      <div className="stat-card flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No expense data yet</p>
      </div>
    )
  }

  return (
    <div className="stat-card">
      <div className="mb-4">
        <h3 className="font-semibold">Expenses by Category</h3>
        <p className="text-xs text-muted-foreground">This month</p>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="amount"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "var(--bg-canvas)", border: "1px solid rgba(124,127,255,0.2)", borderRadius: 12, color: "var(--text-primary)", backdropFilter: 'blur(16px)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            formatter={(value: unknown) => [
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value)),
              'Amount'
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 space-y-1.5">
        {data.slice(0, 5).map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium">{total > 0 ? ((item.amount / total) * 100).toFixed(0) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
