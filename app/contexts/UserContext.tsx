'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/supabase/client'
import { User, Session } from '@supabase/supabase-js'

export type Tier = 'free' | 'pro'

type UserContextType = {
  user: User | null
  session: Session | null
  tier: Tier
  isLoading: boolean
  isGuest: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  tier: 'free',
  isLoading: true,
  isGuest: true
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [tier, setTier] = useState<Tier>('free')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        
        // For now, if logged in, tier is 'free'. In future, fetch tier from users table.
        setTier('free')
        setIsLoading(false)
      }
    }
    
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setTier('free')
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const isGuest = !isLoading && !user

  return (
    <UserContext.Provider value={{ user, session, tier, isLoading, isGuest }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
