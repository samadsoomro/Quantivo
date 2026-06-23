import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#0b1326]">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopBar user={user} profile={profile} />
        <main className="flex-1 p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
