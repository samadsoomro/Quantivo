import { createClient } from '@/supabase/server'
import { LandingPage } from './LandingPage'

export default async function Page() {
  const supabase = await createClient()

  // Fetch site config (no RLS needed if it's public, or bypass if service role, but createClient is anon for public)
  // We need to ensure we can read it. Let's use service client for simplicity if RLS is tight, 
  // but wait, createClient is anon/user. If RLS is enabled on site_config and we didn't add a policy, anon can't read it.
  // Wait, I created site_config without enabling RLS, so it's public readable by default in Supabase (if RLS is not explicitly enabled).
  const { data } = await supabase.from('site_config').select('*')
  
  const siteConfig = data?.reduce((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {} as Record<string, string>) || {}

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null }

  return <LandingPage siteConfig={siteConfig} user={user} profile={profile} />
}
