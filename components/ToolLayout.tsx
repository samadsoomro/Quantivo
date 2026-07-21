'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
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
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
