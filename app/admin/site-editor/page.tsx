import { createServiceClient } from '@/supabase/server'
import { SiteEditorForm } from './SiteEditorForm'

export default async function AdminSiteEditorPage() {
  const supabase = await createServiceClient()

  // Fetch current config
  const { data: configRows } = await supabase.from('site_config').select('*')
  
  // Transform to key-value pairs
  const config = configRows?.reduce((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {} as Record<string, any>) || {}

  return (
    <div className="max-w-[1440px] mx-auto pb-12 space-y-6">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-headline-xl text-3xl font-bold text-[#c0c1ff] mb-2">Site Editor</h1>
          <p className="font-body-md text-sm text-[var(--text-secondary)]">Manage landing page copy and configuration.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Hero Section</h2>
        <SiteEditorForm initialConfig={config} />
      </div>
    </div>
  )
}
