'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

interface DashboardChartsProps {
  monthlyChartData: Array<{ month: string; income: number; expenses: number }>
  categoryData: Array<{ name: string; amount: number; color: string }>
}

export function DashboardCharts({ monthlyChartData, categoryData }: DashboardChartsProps) {
  const categoryTotal = categoryData.reduce((s, c) => s + c.amount, 0) || 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Left Chart (Bar Chart) */}
      <div className="lg:col-span-2 glass-panel rounded-xl p-6 glass-panel-hover flex flex-col h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline-md text-[20px] font-bold text-[#dae2fd]">Income vs Expenses</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#c0c1ff]"></span>
              <span className="font-body-sm text-[var(--text-secondary)] text-sm">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#fa8c00]"></span>
              <span className="font-body-sm text-[var(--text-secondary)] text-sm">Expenses</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(0) + 'k' : val}`} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ background: "var(--bg-canvas)", border: "1px solid rgba(124,127,255,0.2)", borderRadius: 12, color: "var(--text-primary)", backdropFilter: 'blur(16px)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: any, name: any) => [formatCurrency(Number(value)), String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
              />
              <Bar dataKey="income" fill="#c0c1ff" radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="expenses" fill="#fa8c00" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Chart (Donut) */}
      <div className="lg:col-span-1 glass-panel rounded-xl p-6 glass-panel-hover flex flex-col h-[400px]">
        <h3 className="font-headline-md text-[20px] font-bold text-[#dae2fd] mb-6">Expense Breakdown</h3>
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData.length > 0 ? categoryData : [{ name: 'None', amount: 1, color: 'var(--border-color)' }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="amount"
                stroke="none"
              >
                {categoryData.length > 0
                  ? categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || 'var(--text-muted)'} />
                    ))
                  : <Cell fill="var(--border-color)" />}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--bg-canvas)", border: "1px solid rgba(124,127,255,0.2)", borderRadius: 12, color: "var(--text-primary)", backdropFilter: 'blur(16px)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-data-display text-[24px] font-bold text-[#dae2fd]">100%</span>
            <span className="font-label-caps text-[10px] text-[var(--text-secondary)]">TOTAL</span>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {categoryData.length === 0 ? (
            <div className="text-center text-xs text-[var(--text-secondary)] py-4">No expense categories this month</div>
          ) : (
            categoryData.map((cat, idx) => (
              <div className="flex justify-between items-center text-sm" key={cat.name}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || (idx === 0 ? '#c0c1ff' : idx === 1 ? '#fa8c00' : '#ff4433') }}></span>
                  <span className="font-body-sm text-[var(--text-secondary)]">{cat.name}</span>
                </div>
                <span className="font-data-display text-[#dae2fd]">{((cat.amount / categoryTotal) * 100).toFixed(0)}%</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
