'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { AdBanner } from '@/components/AdBanner'

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        const guestMode = localStorage.getItem('qv-guest-mode')
        if (guestMode === 'true') {
          setIsGuest(true)
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleGuest = () => {
    localStorage.setItem('qv-guest-mode', 'true')
    setIsGuest(true)
  }

  if (loading) return <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">Loading...</div>

  if (!user && !isGuest) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg-canvas)', display:'flex', alignItems:'center', justifyContent:'center', padding: '24px' }}>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'20px', padding:'48px', width:'100%', maxWidth:'450px', textAlign:'center' }}>
          <Logo size={40} />
          <h1 style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:'24px', fontWeight:700, color:'var(--text-heading)', margin:'24px 0 8px' }}>Personal Tracker</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', marginBottom:'32px' }}>Sign in to save your data. You can still try the tracker as a guest — data stays in your browser.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={handleGoogle} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'1px solid var(--border-color)', background:'var(--violet-text-readable, #7c7fff)', color:'#fff', fontFamily:'Inter,sans-serif', fontSize:'15px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', transition:'all 200ms' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ filter: 'brightness(0) invert(1)' }}><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign in with Google
            </button>
            <button onClick={handleGuest} style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'1px solid var(--border-color)', background:'transparent', color:'var(--text-primary)', fontFamily:'Inter,sans-serif', fontSize:'15px', fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 200ms' }}>
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    )
  }

  const links = [
    { name: 'Finances', href: '/tools/tracker/finances', icon: 'account_balance_wallet' },
    { name: 'Goals', href: '/tools/tracker/goals', icon: 'flag' },
    { name: 'Habits', href: '/tools/tracker/habits', icon: 'task_alt' },
    { name: 'Invoices', href: '/tools/tracker/invoices', icon: 'receipt' },
    { name: 'Subscriptions', href: '/tools/tracker/subscriptions', icon: 'event_repeat' },
    { name: 'Reports', href: '/tools/tracker/reports', icon: 'monitoring' },
  ]

  return (
    <div className="flex h-screen bg-[var(--bg-canvas)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/tools" className="flex items-center gap-2 font-bold text-xl tracking-tight text-[var(--text-primary)] font-['Space_Grotesk',sans-serif]">
            <Logo size={24} />
            <span>Tools Hub</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {links.map(l => {
            const active = pathname.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[rgba(var(--color-primary-rgb),0.1)] text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'}`}>
                <span className="material-symbols-outlined text-[20px]">{l.icon}</span>
                {l.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="text-xs text-[var(--text-muted)] mb-2 px-2">
            {user ? 'Logged in securely' : 'Guest Mode (Local Only)'}
          </div>
          <Link href="/tools" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Tools
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex md:hidden items-center justify-between">
          <Link href="/tools" className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <Logo size={20} />
          </Link>
          <span className="text-xs text-[var(--text-muted)]">{user ? 'Logged in' : 'Guest Mode'}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1440px] mx-auto px-6 pt-6">
            <AdBanner slot="horizontal" />
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
