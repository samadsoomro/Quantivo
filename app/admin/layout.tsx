import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { Navbar } from '@/components/layout/Navbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <AdminSidebar />
      <div style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar variant="dashboard" user={user} profile={profile} />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
