import { createServiceClient } from '@/supabase/server'

export default async function AdminOverviewPage() {
  const supabase = await createServiceClient()

  // KPIs
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  // In a real app we'd check active subscriptions from Stripe or a subscriptions table
  const { count: activePro } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro')
  
  // MRR - Mock calculation for now (12/mo per pro user)
  const mrr = (activePro || 0) * 12
  const freeUsers = (totalUsers || 0) - (activePro || 0)

  // Recent signups
  const { data: recentSignups } = await supabase
    .from('profiles')
    .select('id, full_name, email, plan, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-[1440px] mx-auto pb-12 space-y-6">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-headline-xl text-3xl font-bold text-[#c0c1ff] mb-2">Admin Overview</h1>
          <p className="font-body-md text-sm text-[var(--text-secondary)]">Platform KPIs and recent activity.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Users', value: totalUsers || 0 },
          { label: 'Active Pro', value: activePro || 0 },
          { label: 'MRR', value: `$${mrr.toLocaleString()}` },
          { label: 'Free Users', value: freeUsers || 0 }
        ].map((kpi, i) => (
          <div key={i} className="bg-[rgba(18,33,49,0.6)] backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-wider mb-2">{kpi.label}</h3>
            <p className="text-3xl font-bold text-white font-mono">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Signups */}
      <div className="bg-[rgba(18,33,49,0.6)] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Recent Signups</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Name</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Email</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Plan</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentSignups?.map(user => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 text-sm text-white font-medium">{user.full_name || 'Unnamed'}</td>
                <td className="p-4 text-sm text-[var(--text-secondary)]">{user.email}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.plan === 'pro' ? 'bg-[#c0c1ff]/20 text-[#c0c1ff]' : 'bg-white/10 text-[var(--text-secondary)]'}`}>
                    {user.plan || 'free'}
                  </span>
                </td>
                <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!recentSignups?.length && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)] text-sm">No recent signups.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
