'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AdBanner } from '@/components/AdBanner'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface ToolLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ToolLayout({ children, title }: ToolLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      <Navbar variant="tools" user={user} profile={profile} />
      <main className="flex-1 w-full flex flex-col items-center">
        <div className="w-full max-w-[1100px] px-6">
          <AdBanner slot="horizontal" />
        </div>
        <div className="w-full">
          {children}
        </div>
        <div className="w-full max-w-[1100px] px-6">
          <AdBanner slot="horizontal" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
