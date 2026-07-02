'use server'

import { createServiceClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSiteConfig(key: string, value: any) {
  const supabase = await createServiceClient()
  
  const { error } = await supabase
    .from('site_config')
    .upsert({ key, value }, { onConflict: 'key' })
    
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/')
  revalidatePath('/admin/site-editor')
  return { success: true }
}
