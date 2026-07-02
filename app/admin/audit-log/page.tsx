import { createServiceClient } from '@/supabase/server'

export default async function AdminAuditLogPage() {
  const supabase = await createServiceClient()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id ( full_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-[1440px] mx-auto pb-12 space-y-6">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-headline-xl text-3xl font-bold text-[#c0c1ff] mb-2">Audit Log</h1>
          <p className="font-body-md text-sm text-[var(--text-secondary)]">System activity and admin actions.</p>
        </div>
      </div>

      <div className="bg-[rgba(18,33,49,0.6)] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Timestamp</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">User</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Action</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Entity</th>
              <th className="p-4 text-xs font-mono text-[var(--text-secondary)] uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs?.map(log => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 text-sm text-[var(--text-secondary)] font-mono whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-4 text-sm text-white">
                  {log.profiles?.full_name || log.profiles?.email || 'System / Unknown'}
                </td>
                <td className="p-4 text-sm font-medium text-[#ffb77a]">
                  {log.action}
                </td>
                <td className="p-4 text-sm text-white font-mono">
                  {log.entity}
                </td>
                <td className="p-4 text-xs text-[var(--text-secondary)] font-mono truncate max-w-[200px]">
                  {log.details ? JSON.stringify(log.details) : '-'}
                </td>
              </tr>
            ))}
            {!logs?.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)] text-sm">No audit logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
