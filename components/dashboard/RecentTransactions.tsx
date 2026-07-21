import Link from 'next/link'
import { format } from 'date-fns'
import type { Transaction } from '@/types'

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="lg:col-span-2 stat-card p-0 flex flex-col overflow-hidden">
      <div className="p-5 flex justify-between items-center border-b border-[var(--border)]">
        <h3 className="font-semibold">Recent Transactions</h3>
        <Link href="/finances" className="text-xs text-primary hover:text-primary-hover transition-colors">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/50">
              <th className="py-2 px-4 text-xs font-medium text-[var(--text-secondary)] w-28">Date</th>
              <th className="py-2 px-4 text-xs font-medium text-[var(--text-secondary)]">Merchant</th>
              <th className="py-2 px-4 text-xs font-medium text-[var(--text-secondary)] w-32 hidden sm:table-cell">Category</th>
              <th className="py-2 px-4 text-xs font-medium text-[var(--text-secondary)] text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-[var(--text-secondary)]">
                  No transactions yet. Add your first transaction!
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-[var(--text-secondary)]">
                    {format(new Date(tx.date), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[var(--bg-elevated)] shrink-0 flex items-center justify-center border border-[var(--border)]">
                        <span className="material-symbols-outlined text-[16px] text-[var(--text-primary)]">
                          {tx.type === 'income' ? 'work' : 'shopping_cart'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate block">{tx.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--text-secondary)] truncate hidden sm:table-cell">
                    {tx.categories?.name ?? 'Uncategorized'}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono text-sm truncate ${
                    tx.type === 'income' ? 'text-secondary' : 'text-primary'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(tx.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
