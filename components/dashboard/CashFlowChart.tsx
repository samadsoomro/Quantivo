'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface MonthlyData {
  month: string
  income: number
  expenses: number
}

export function CashFlowChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="lg:col-span-2 bg-[#131b2e] border border-[#464554] rounded-lg p-4 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6 border-b border-[#464554] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[#dae2fd]">Cash Flow</h3>
          <p className="text-xs text-[#c7c4d7]">Income vs Expenses (Last 6 Months)</p>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#464554" vertical={false} opacity={0.4} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#c7c4d7', fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#c7c4d7', fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#171f33',
                border: '1px solid #464554',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#dae2fd',
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)
              }
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px', color: '#c7c4d7' }}
              formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <Bar dataKey="income" fill="#c0c1ff" radius={[4, 4, 0, 0]} name="income" />
            <Bar dataKey="expenses" fill="#31394d" radius={[4, 4, 0, 0]} name="expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
