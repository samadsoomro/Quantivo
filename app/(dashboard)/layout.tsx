import { createClient } from '@/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <div style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!user && (
          <div style={{ background: '#7c7fff', color: '#ffffff', padding: '10px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span>You're exploring as a guest. Your data won't be saved.</span>
            <Link href="/signup" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}>Sign up free →</Link>
          </div>
        )}
        <TopBar user={user} profile={profile} />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
