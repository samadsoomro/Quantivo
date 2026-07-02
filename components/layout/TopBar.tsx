'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useState, useEffect, useRef, useCallback } from 'react'

interface TopBarProps {
  user: User
  profile: Profile | null
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

export function TopBar({ user, profile }: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  // ── Notifications ──────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
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
  }, [user.id])

  useEffect(() => {
    fetchNotifs()
    // Close notif dropdown when clicking outside
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [fetchNotifs])

  const markAllRead = async () => {
    await supabase
      .from('quantivo_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
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
  }, [user.id])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => runSearch(q), 300)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
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
    : user.email?.[0].toUpperCase() ?? 'U'

  const typeIcon: Record<string, string> = { transaction: 'payments', goal: 'ads_click', habit: 'repeat_on' }

  return (
    <header className="sticky top-0 bg-[#0b1326] border-b border-[#464554] z-40 ml-64">
      <div className="flex justify-between items-center h-16 px-6">
        {/* Search */}
        <div className="flex-1 max-w-md" ref={searchRef}>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2 text-[#c7c4d7] text-[18px]">search</span>
            <input
              className="w-full bg-[#131b2e] border border-[#464554] rounded-lg pl-9 pr-4 py-2 text-sm text-[#dae2fd] placeholder:text-[#c7c4d7] focus:outline-none focus:border-[#c0c1ff] transition-colors"
              placeholder="Search transactions, goals, habits..."
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
            />
            {searching && (
              <span className="absolute right-3 text-[#c7c4d7] text-xs animate-pulse">...</span>
            )}

            {/* Search Dropdown */}
            {searchOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-[#171f33] border border-[#464554] rounded-xl shadow-2xl overflow-hidden z-50">
                {searchResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { router.push(r.href); setSearchOpen(false); setSearchQuery('') }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#222a3d] transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[#c0c1ff] text-[18px]">{typeIcon[r.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{r.label}</p>
                      <p className="text-xs text-[#c7c4d7]">{r.sub}</p>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-white/5 text-[#c7c4d7] px-2 py-0.5 rounded">{r.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(o => !o); if (!notifOpen) fetchNotifs() }}
              className="text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#ff4433] text-white rounded-full text-[9px] font-bold flex items-center justify-center px-0.5 ring-2 ring-[#0b1326]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-[#171f33] border border-[#464554] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-[#464554]">
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-[#c0c1ff] hover:text-white transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="p-6 text-center">
                      <span className="material-symbols-outlined text-3xl text-[#464554] block mb-2">notifications_off</span>
                      <p className="text-sm text-[#c7c4d7]">No notifications yet</p>
                    </div>
                  ) : notifs.map(n => (
                    <div
                      key={n.id}
                      className={`p-4 border-b border-[#464554]/50 hover:bg-white/[0.02] transition-colors ${!n.is_read ? 'bg-[#c0c1ff]/5' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${n.is_read ? 'text-[#c7c4d7]' : 'text-white'}`}>{n.title}</p>
                          <p className="text-xs text-[#918f9a] mt-1">{n.message}</p>
                        </div>
                        {!n.is_read && <span className="w-2 h-2 bg-[#c0c1ff] rounded-full shrink-0 mt-1" />}
                      </div>
                      <p className="text-[10px] text-[#918f9a] mt-2 font-mono">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-[#464554]" />

          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-[#c0c1ff] flex items-center justify-center border border-[#464554]">
                <span className="text-xs font-bold text-[#1000a9]">{initials}</span>
              </div>
              <span className="text-sm text-[#dae2fd] hidden md:block">
                {profile?.full_name ?? user.email?.split('@')[0]}
              </span>
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 top-10 w-52 bg-[#171f33] border border-[#464554] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-[#464554]">
                <p className="text-sm font-medium text-[#dae2fd]">{profile?.full_name ?? 'User'}</p>
                <p className="text-xs text-[#c7c4d7] truncate">{user.email}</p>
                {profile?.is_admin && (
                  <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-wider bg-[#ffb77a]/20 text-[#ffb77a] px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </div>
              <div className="p-1">
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-3 py-2 text-sm text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd] rounded transition-colors"
                >
                  Settings
                </button>
                {profile?.is_admin && (
                  <button
                    onClick={() => router.push('/admin/overview')}
                    className="w-full text-left px-3 py-2 text-sm text-[#ffb77a] hover:bg-[#222a3d] rounded transition-colors"
                  >
                    Admin Portal
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-[#ffb4ab] hover:bg-[#222a3d] rounded transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
