import Link from 'next/link'
import { format } from 'date-fns'
import type { Transaction } from '@/types'

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="lg:col-span-2 bg-[#131b2e] border border-[#464554] rounded-lg flex flex-col">
      <div className="p-4 flex justify-between items-center border-b border-[#464554]">
        <h3 className="text-base font-semibold text-[#dae2fd]">Recent Transactions</h3>
        <Link href="/finances" className="text-xs text-[#c0c1ff] hover:text-[#e1e0ff] transition-colors">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#464554] bg-[#222a3d]/50">
              <th className="py-2 px-4 text-xs font-medium text-[#c7c4d7]">Date</th>
              <th className="py-2 px-4 text-xs font-medium text-[#c7c4d7]">Merchant</th>
              <th className="py-2 px-4 text-xs font-medium text-[#c7c4d7]">Category</th>
              <th className="py-2 px-4 text-xs font-medium text-[#c7c4d7] text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-[#c7c4d7]">
                  No transactions yet. Add your first transaction!
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-[#464554]/50 hover:bg-[#222a3d] transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-[#c7c4d7]">
                    {format(new Date(tx.date), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[#31394d] flex items-center justify-center border border-[#464554]">
                        <span className="material-symbols-outlined text-[16px] text-[#dae2fd]">
                          {tx.type === 'income' ? 'work' : 'shopping_cart'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#dae2fd]">{tx.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#c7c4d7]">
                    {tx.categories?.name ?? 'Uncategorized'}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono text-sm ${
                    tx.type === 'income' ? 'text-[#4edea3]' : 'text-[#dae2fd]'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}
                    {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(Number(tx.amount))}
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
