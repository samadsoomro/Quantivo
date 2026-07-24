'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/supabase/client'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

interface NavbarProps {
  variant: 'landing' | 'tools' | 'dashboard'
  user: User | null
  profile?: Profile | null
}

interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

interface SearchResult {
  id: string
  type: 'transaction' | 'goal' | 'habit'
  label: string
  sub: string
  href: string
}

export function Navbar({ variant, user, profile }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // ── Mobile Menu ───────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ── Notifications ──────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('quantivo_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotifs(data)
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length)
    }
  }, [user?.id])

  useEffect(() => {
    if (variant === 'dashboard') {
      fetchNotifs()
    }
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [fetchNotifs, variant])

  const markAllRead = async () => {
    if (!user) return
    await supabase.from('quantivo_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  // ── Global Search ───────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(async (q: string) => {
    if (!user) return
    if (q.trim().length < 2) { setSearchResults([]); setSearchOpen(false); return }
    setSearching(true)
    const trimmed = q.trim()

    const [{ data: txData }, { data: goalData }, { data: habitData }] = await Promise.all([
      supabase.from('transactions').select('id,title,amount,type').eq('user_id', user.id).ilike('title', `%${trimmed}%`).limit(5),
      supabase.from('goals').select('id,title,target_amount').eq('user_id', user.id).ilike('title', `%${trimmed}%`).limit(3),
      supabase.from('habits').select('id,title,frequency').eq('user_id', user.id).ilike('title', `%${trimmed}%`).limit(3),
    ])

    const results: SearchResult[] = [
      ...(txData ?? []).map((t: any) => ({ id: t.id, type: 'transaction' as const, label: t.title, sub: `${t.type === 'income' ? '+' : '-'}$${Number(t.amount).toFixed(2)}`, href: '/finances' })),
      ...(goalData ?? []).map((g: any) => ({ id: g.id, type: 'goal' as const, label: g.title, sub: `Target $${Number(g.target_amount).toFixed(0)}`, href: '/goals' })),
      ...(habitData ?? []).map((h: any) => ({ id: h.id, type: 'habit' as const, label: h.title, sub: h.frequency, href: '/habits' })),
    ]

    setSearchResults(results)
    setSearchOpen(results.length > 0)
    setSearching(false)
  }, [user?.id])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => runSearch(q), 300)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? 'G'

  const typeIcon: Record<string, string> = { transaction: 'payments', goal: 'ads_click', habit: 'repeat_on' }

  // ── Render Helpers ───────────────────────────────────────────────
  const isDashboard = variant === 'dashboard'
  const isLandingOrTools = variant === 'landing' || variant === 'tools'

  const renderNavLinks = () => (
    <>
      <a className="nav-link" href="/#features">Features</a>
      <a className="nav-link" href="/tools">Tools</a>
      <a className="nav-link" href="/#pricing">Pricing</a>
      <a className="nav-link" href="/#faq">FAQ</a>
    </>
  )

  const renderUserMenu = () => {
    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm text-[var(--text-nav)] hover:text-white transition-colors" style={{ color: 'var(--text-nav)' }}>
            Log in
          </Link>
          <Link href="/tools" className="btn-violet px-4 py-1.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all">
            Get Started →
          </Link>
        </div>
      )
    }

    return (
      <div className="relative group flex items-center gap-4">
        {isLandingOrTools && (
          <Link href="/tools/tracker/finances" className="text-sm font-medium hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>
            My Tracker →
          </Link>
        )}
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center border border-[var(--border-color)]">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          {isDashboard && (
            <span className="text-sm text-[var(--text-primary)] hidden md:block">
              {profile?.full_name ?? user.email?.split('@')[0]}
            </span>
          )}
        </button>
        {/* Dropdown */}
        <div className="absolute right-0 top-10 w-52 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-3 border-b border-[var(--border-color)]">
            <p className="text-sm font-medium text-[var(--text-primary)]">{profile?.full_name ?? 'User'}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
            {profile?.is_admin && (
              <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-wider bg-[#ffb77a]/20 text-[#ffb77a] px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
          <div className="p-1">
            <button onClick={() => router.push('/settings')} className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] rounded transition-colors">
              Settings
            </button>
            {profile?.is_admin && (
              <button onClick={() => router.push('/admin/overview')} className="w-full text-left px-3 py-2 text-sm text-[#ffb77a] hover:bg-[var(--bg-surface)] rounded transition-colors">
                Admin Portal
              </button>
            )}
            <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-[#ffb4ab] hover:bg-[var(--bg-surface)] rounded transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .nav-link {
          color: var(--text-nav);
          font-family: Inter, sans-serif;
          font-size: 15px;
          font-weight: 300;
          text-decoration: none;
          transition: color 200ms ease-out, transform 200ms ease-out;
        }
        .nav-link:hover { color: var(--color-primary); transform: translateY(-2px); }
        .btn-violet {
          background: var(--violet-text-readable, #7c7fff);
          color: #ffffff;
          padding: 10px 28px;
          border-radius: 9999px;
          font-family: Inter, sans-serif;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 200ms ease-out, background 200ms ease-out;
        }
        .btn-violet:hover { transform: translateY(-3px); filter: brightness(1.1); }
      `}</style>
      <header className={`sticky top-0 z-40 ${isDashboard ? 'bg-[var(--bg-canvas)] border-b border-[var(--border-color)] ml-64' : 'bg-[var(--bg-nav)] backdrop-blur-lg border-b border-[var(--border-color)] w-full'}`}>
        <div className={`flex justify-between items-center h-16 px-6 ${isDashboard ? '' : 'max-w-[1280px] mx-auto'}`}>
          
          {/* Logo (for non-dashboard) */}
          {!isDashboard && (
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-[var(--text-primary)] font-['Space_Grotesk',sans-serif]" style={{ textDecoration: 'none' }}>
              <Logo size={24} />
            </Link>
          )}

          {/* Nav Links (for landing/tools) */}
          {!isDashboard && (
            <div className="hidden md:flex gap-8 items-center">
              {renderNavLinks()}
            </div>
          )}

          {/* Search (for dashboard) */}
          {isDashboard && (
            <div className="flex-1 max-w-md" ref={searchRef}>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2 text-[var(--text-muted)] text-[18px]">search</span>
                <input
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder={user ? "Search transactions, goals, habits..." : "Sign in to search..."}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                  disabled={!user}
                />
                {searching && <span className="absolute right-3 text-[var(--text-muted)] text-xs animate-pulse">...</span>}
                {/* Search Dropdown */}
                {searchOpen && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50">
                    {searchResults.map(r => (
                      <button key={r.id} onClick={() => { router.push(r.href); setSearchOpen(false); setSearchQuery('') }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors text-left">
                        <span className="material-symbols-outlined text-[var(--color-primary)] text-[18px]">{typeIcon[r.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)] font-medium truncate">{r.label}</p>
                          <p className="text-xs text-[var(--text-muted)]">{r.sub}</p>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-black/5 text-[var(--text-muted)] px-2 py-0.5 rounded">{r.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* Notifications (dashboard only) */}
            {isDashboard && user && (
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setNotifOpen(o => !o); if (!notifOpen) fetchNotifs() }} className="text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors relative flex items-center">
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#ff4433] text-white rounded-full text-[9px] font-bold flex items-center justify-center px-0.5 ring-2 ring-[var(--bg-canvas)]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-10 w-80 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-[var(--color-primary)] hover:text-[var(--text-primary)] transition-colors">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <div className="p-6 text-center">
                          <span className="material-symbols-outlined text-3xl text-[var(--border-color)] block mb-2">notifications_off</span>
                          <p className="text-sm text-[var(--text-muted)]">No notifications yet</p>
                        </div>
                      ) : notifs.map(n => (
                        <div key={n.id} className={`p-4 border-b border-[var(--border-color)]/50 hover:bg-black/[0.02] transition-colors ${!n.is_read ? 'bg-[var(--color-primary)]/5' : ''}`}>
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${n.is_read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>{n.title}</p>
                              <p className="text-xs text-[var(--text-muted)] mt-1">{n.message}</p>
                            </div>
                            {!n.is_read && <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full shrink-0 mt-1" />}
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] mt-2 font-mono">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isDashboard && <div className="h-8 w-px bg-[var(--border-color)]" />}

            {/* User menu or Guest buttons */}
            <div className="hidden md:block">
              {renderUserMenu()}
            </div>
            
            {/* Mobile Menu Button */}
            {!isDashboard && (
              <button className="md:hidden text-[var(--text-primary)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {!isDashboard && mobileMenuOpen && (
          <div className="md:hidden bg-[var(--bg-canvas)] border-b border-[var(--border-color)] p-4 flex flex-col gap-4">
            {renderNavLinks()}
            <div className="h-px bg-[var(--border-color)] w-full" />
            <div className="flex justify-center w-full">
              {renderUserMenu()}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
