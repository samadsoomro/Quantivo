'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface CategoryData {
  name: string
  amount: number
  color: string
}

export function ExpenseBreakdown({ data }: { data: CategoryData[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0)

  const defaultData = [
    { name: 'Housing', amount: 45, color: '#8083ff' },
    { name: 'Food & Dining', amount: 25, color: '#4edea3' },
    { name: 'Transport', amount: 15, color: '#ffb4ab' },
    { name: 'Other', amount: 15, color: '#dae2fd' },
  ]

  const chartData = data.length > 0 ? data : defaultData

  return (
    <div className="bg-[#131b2e] border border-[#464554] rounded-lg p-4 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6 border-b border-[#464554] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[#dae2fd]">Expense Breakdown</h3>
          <p className="text-xs text-[#c7c4d7]">Current Month</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="amount"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "var(--bg-canvas)", border: "1px solid rgba(124,127,255,0.2)", borderRadius: 12, color: "var(--text-primary)", backdropFilter: 'blur(16px)' }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: unknown) =>
                total > 0
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value))
                  : `${value}%`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-2">
        {chartData.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
              <span className="text-[#dae2fd] text-sm">{item.name}</span>
            </div>
            <span className="font-mono text-xs text-[#c7c4d7]">
              {total > 0 ? `${((item.amount / total) * 100).toFixed(0)}%` : `${item.amount}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
