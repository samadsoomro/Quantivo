import { createServiceClient } from '@/supabase/server'
import { CustomersTable } from './CustomersTable'

export default async function AdminCustomersPage() {
  const supabase = await createServiceClient()

  // Fetch all profiles
  // Note: we fetch all here for simplicity. In production with thousands of users, we'd paginate.
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-[1440px] mx-auto pb-12 space-y-6">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-headline-xl text-3xl font-bold text-[#c0c1ff] mb-2">Customers</h1>
          <p className="font-body-md text-sm text-[var(--text-secondary)]">Manage user accounts and subscriptions.</p>
        </div>
      </div>

      <CustomersTable initialProfiles={profiles || []} />
    </div>
  )
}
