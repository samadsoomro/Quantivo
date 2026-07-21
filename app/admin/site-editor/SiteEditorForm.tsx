'use client'

import { useState } from 'react'
import { saveSiteConfig } from './actions'

export function SiteEditorForm({ initialConfig }: { initialConfig: Record<string, any> }) {
  const [headline, setHeadline] = useState(initialConfig.hero_headline || 'Your Money. Your Goals. Finally Under Control.')
  const [subhead, setSubhead] = useState(initialConfig.hero_subheadline || 'The all-in-one finance tracker, invoice generator, and productivity suite built for freelancers and professionals.')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    await saveSiteConfig('hero_headline', headline)
    await saveSiteConfig('hero_subheadline', subhead)
    
    setSaving(false)
    alert('Site configuration saved!')
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">Headline Text</label>
        <input 
          type="text" 
          value={headline}
          onChange={e => setHeadline(e.target.value)}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">Subheadline Text</label>
        <textarea 
          value={subhead}
          onChange={e => setSubhead(e.target.value)}
          rows={3}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <button 
        type="submit" 
        disabled={saving}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-[var(--bg-canvas)] font-medium py-3 rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
