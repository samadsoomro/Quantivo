import { createClient } from '@/supabase/client'

export function getDeviceId() {
  if (typeof window === 'undefined') return 'server'
  
  let id = localStorage.getItem('qv_device_id')
  if (!id) {
    const ua = navigator.userAgent
    const w = window.screen.width
    const h = window.screen.height
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    id = btoa(`${ua}-${w}x${h}-${tz}`).substring(0, 64) // hash
    localStorage.setItem('qv_device_id', id)
  }
  return id
}

export async function checkToolUsage(toolName: string): Promise<{ count: number, allowed: boolean }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    if (profile?.plan === 'pro' || profile?.plan === 'business') {
      return { count: 0, allowed: true } // Unlimited for paid plans
    }
  }

  const deviceId = getDeviceId()
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  // Query usage
  const { count } = await supabase
    .from('tool_usage')
    .select('*', { count: 'exact', head: true })
    .eq('tool_name', toolName)
    .eq('device_fingerprint', deviceId)
    .gte('used_at', todayIso)

  const currentCount = count || 0
  return { count: currentCount, allowed: currentCount < 3 }
}

export async function recordToolUsage(toolName: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    if (profile?.plan === 'pro' || profile?.plan === 'business') {
      return true // Don't track paid usage against the limit
    }
  }

  const deviceId = getDeviceId()
  await supabase.from('tool_usage').insert({
    tool_name: toolName,
    device_fingerprint: deviceId,
    used_at: new Date().toISOString()
  })
}
