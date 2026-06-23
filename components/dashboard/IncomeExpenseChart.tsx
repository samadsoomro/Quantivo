'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

interface MonthlyData {
  month: string
  income: number
  expenses: number
}

export function IncomeExpenseChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Income vs Expenses</h3>
          <p className="text-xs text-muted-foreground">Last 6 months</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barGap={4} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) =>
              new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)
            }
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
          <Bar dataKey="income" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} name="income" />
          <Bar dataKey="expenses" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} name="expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
