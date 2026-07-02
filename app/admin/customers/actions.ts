'use server'

import { createServiceClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteUserAccount(userId: string) {
  const supabase = await createServiceClient()
  // This deletes the user from auth.users (which cascades to profiles)
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) {
    return { error: error.message }
  }
  revalidatePath('/admin/customers')
  revalidatePath('/admin/overview')
  return { success: true }
}

export async function updateUserPlan(userId: string, newPlan: 'free' | 'pro') {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ plan: newPlan })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }
  revalidatePath('/admin/customers')
  revalidatePath('/admin/overview')
  return { success: true }
}
