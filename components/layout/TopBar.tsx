'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

interface TopBarProps {
  user: User
  profile: Profile | null
}

export function TopBar({ user, profile }: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? 'U'

  return (
    <header className="sticky top-0 bg-[#0b1326] border-b border-[#464554] z-40 ml-64">
      <div className="flex justify-between items-center h-16 px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2 text-[#c7c4d7] text-[18px]">search</span>
            <input
              className="w-full bg-[#131b2e] border border-[#464554] rounded-lg pl-9 pr-4 py-2 text-sm text-[#dae2fd] placeholder:text-[#c7c4d7] focus:outline-none focus:border-[#c0c1ff] transition-colors"
              placeholder="Search transactions, goals..."
              type="text"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#ffb4ab] rounded-full ring-2 ring-[#0b1326]"></span>
          </button>

          <div className="h-8 w-px bg-[#464554]"></div>

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
            <div className="absolute right-0 top-10 w-48 bg-[#171f33] border border-[#464554] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-[#464554]">
                <p className="text-sm font-medium text-[#dae2fd]">{profile?.full_name ?? 'User'}</p>
                <p className="text-xs text-[#c7c4d7] truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-3 py-2 text-sm text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd] rounded transition-colors"
                >
                  Settings
                </button>
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
