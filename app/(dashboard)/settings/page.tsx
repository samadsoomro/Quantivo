'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/supabase/client'

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const initials = name
    ? name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#c0c1ff] to-[#7b7fff] text-[var(--bg-canvas)] font-bold text-2xl">
      {initials}
    </div>
  )
}

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [currency, setCurrency] = useState('usd')
  const [timezone, setTimezone] = useState('est')
  const [activeSection, setActiveSection] = useState('profile')
  const [accentColor, setAccentColor] = useState('violet')
  const [theme, setTheme] = useState('dark')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProfile = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setEmail(user.email ?? '')

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && profile) {
      setFullName(profile.full_name ?? '')
      setAvatarUrl(profile.avatar_url ?? null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfile()
    const isLight = document.documentElement.classList.contains('light')
    setTheme(isLight ? 'light' : 'dark')
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) {
      showToast(`Error saving profile: ${error.message}`, 'error')
    } else {
      showToast('Profile updated successfully!')
    }
    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1_048_576) {
      showToast('File too large (max 1MB)', 'error')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      showToast(`Upload error: ${uploadError.message}`, 'error')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('user-content')
      .getPublicUrl(path)

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    setAvatarUrl(publicUrl)
    showToast('Avatar updated!')
    setUploading(false)
  }

  const handleRemoveAvatar = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
    setAvatarUrl(null)
    showToast('Avatar removed.')
  }

  const handleSectionClick = (id: string) => {
    setActiveSection(id)
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('qv-theme', newTheme)
    if (newTheme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  return (
    <>
      <style>{`
        .glass-panel {
          background-color: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
        }
        .ghost-input {
          background-color: rgba(1, 15, 31, 0.6);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
        }
        .ghost-input:focus {
          outline: none;
          border-color: #c0c1ff;
          box-shadow: 0 0 0 3px rgba(192, 193, 255, 0.15);
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto pb-12 flex gap-12 relative">
        {/* Left Sub-Nav */}
        <aside className="w-[200px] shrink-0 sticky top-24 self-start space-y-1 z-30">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'billing', label: 'Billing & Plan' },
            { id: 'appearance', label: 'Appearance' },
            { id: 'danger', label: 'Danger Zone' }
          ].map(section => {
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`w-full text-left block px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'text-[#c0c1ff] font-semibold bg-white/5 border-l-2 border-[#c0c1ff]'
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{section.label}</span>
                  {isActive && <span className="material-symbols-outlined text-sm">chevron_right</span>}
                </div>
              </button>
            )
          })}
        </aside>

        {/* Right Main Content */}
        <div className="flex-1 max-w-4xl space-y-16 pb-32">
          {/* Section: Profile */}
          {activeSection === 'profile' && (
          <section id="profile" className="scroll-mt-24">
            <div className="mb-8 border-b border-white/10 pb-4">
              <h3 className="font-headline text-2xl font-bold text-white">Public Profile</h3>
              <p className="font-body-sm text-xs text-[var(--text-secondary)] mt-1">This information will be displayed publicly across your workspaces.</p>
            </div>
            <div className="glass-panel p-8 rounded-xl">
              {/* Avatar Upload */}
              <div className="flex items-center gap-8 mb-10 border-b border-white/5 pb-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#c0c1ff]/30 group-hover:border-[#c0c1ff] transition-colors">
                    <Avatar name={fullName} avatarUrl={avatarUrl} />
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <span className="material-symbols-outlined text-white">
                      {uploading ? 'hourglass_empty' : 'photo_camera'}
                    </span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <div>
                  <div className="flex gap-4 mb-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors font-body-sm text-xs font-semibold disabled:opacity-50"
                    >
                      {uploading ? 'Uploading…' : 'Change Avatar'}
                    </button>
                    {avatarUrl && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="px-6 py-2 rounded-full bg-transparent text-[var(--text-secondary)] hover:text-white transition-colors font-body-sm text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="font-body-sm text-[var(--text-secondary)] opacity-70 text-[10px]">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider block">Full Name</label>
                  <input
                    className="ghost-input w-full px-4 py-3 rounded-full font-body-md text-sm transition-all"
                    type="text"
                    value={loading ? 'Loading...' : fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                    Email Address
                    <span className="material-symbols-outlined text-[#c0c1ff] text-[14px]" title="Verified">verified</span>
                  </label>
                  <input
                    className="ghost-input w-full px-4 py-3 rounded-full font-body-md text-sm transition-all opacity-60"
                    readOnly
                    type="email"
                    value={loading ? 'Loading...' : email}
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider block">Default Currency</label>
                  <div className="relative">
                    <select
                      className="ghost-input w-full px-4 py-3 rounded-full font-body-md text-sm appearance-none pr-10"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="usd">USD ($) - US Dollar</option>
                      <option value="eur">EUR (€) - Euro</option>
                      <option value="gbp">GBP (£) - British Pound</option>
                      <option value="cad">CAD ($) - Canadian Dollar</option>
                      <option value="aud">AUD ($) - Australian Dollar</option>
                      <option value="jpy">JPY (¥) - Japanese Yen</option>
                      <option value="chf">CHF (Fr) - Swiss Franc</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider block">Timezone</label>
                  <div className="relative">
                    <select
                      className="ghost-input w-full px-4 py-3 rounded-full font-body-md text-sm appearance-none pr-10"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="est">(GMT-05:00) Eastern Time</option>
                      <option value="pst">(GMT-08:00) Pacific Time</option>
                      <option value="utc">(UTC) Coordinated Universal Time</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-8 py-3 rounded-full bg-[#c0c1ff] text-[var(--bg-canvas)] hover:bg-white transition-colors font-semibold text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>
          )}

          {/* Section: Billing & Plan */}
          {activeSection === 'billing' && (
          <section id="billing" className="scroll-mt-24">
            <div className="mb-8 border-b border-white/10 pb-4">
              <h3 className="font-headline text-2xl font-bold text-white">Billing & Plan</h3>
              <p className="font-body-sm text-xs text-[var(--text-secondary)] mt-1">Manage your subscription, payment methods, and billing history.</p>
            </div>
            <div className="glass-panel p-8 rounded-xl mb-8 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#c0c1ff]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-headline text-lg font-bold text-white">Professional Tier</h4>
                    <span className="px-2 py-1 rounded-full bg-[#c0c1ff]/20 border border-[#c0c1ff]/30 text-[#c0c1ff] font-mono text-[10px] tracking-widest uppercase">Pro</span>
                  </div>
                  <p className="font-body-sm text-xs text-[var(--text-secondary)]">Billed $12.00 monthly. Next charge on Nov 15, {new Date().getFullYear()}.</p>
                </div>
                <div className="text-right">
                  <div className="font-headline text-3xl font-bold text-white">$12<span className="font-body-sm text-sm text-[var(--text-secondary)]">/mo</span></div>
                </div>
              </div>
              <div className="bg-[var(--bg-canvas)]/50 rounded-xl p-6 border border-[#c0c1ff]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-8 relative">
                <div>
                  <h5 className="font-headline font-bold text-white text-sm mb-1">Unlock Enterprise Features</h5>
                  <ul className="flex flex-wrap gap-4 font-mono text-[11px] text-[var(--text-secondary)] mt-2">
                    <li className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#c0c1ff]">check</span> Unlimited API</li>
                    <li className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#c0c1ff]">check</span> Custom ML</li>
                    <li className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#c0c1ff]">check</span> Priority Support</li>
                  </ul>
                </div>
                <button onClick={() => showToast('Enterprise upgrade — contact sales@quantivo.app')} className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors font-body-sm text-xs font-semibold whitespace-nowrap z-10">
                  Upgrade to Enterprise
                </button>
              </div>
            </div>

            {/* Billing History Table */}
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <h4 className="font-headline font-bold text-white text-sm">Billing History</h4>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 font-mono text-xs text-[var(--text-secondary)] uppercase">Date</th>
                    <th className="px-6 py-4 font-mono text-xs text-[var(--text-secondary)] uppercase">Description</th>
                    <th className="px-6 py-4 font-mono text-xs text-[var(--text-secondary)] uppercase text-right">Amount</th>
                    <th className="px-6 py-4 font-mono text-xs text-[var(--text-secondary)] uppercase text-center">Status</th>
                    <th className="px-6 py-4 font-mono text-xs text-[var(--text-secondary)] uppercase text-center">Invoice</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-xs text-[var(--text-secondary)]">
                  {[
                    { date: `${new Date().getFullYear()}-10-15`, desc: 'Pro Plan - Monthly Subscription', amt: '$12.00' },
                    { date: `${new Date().getFullYear()}-09-15`, desc: 'Pro Plan - Monthly Subscription', amt: '$12.00' },
                    { date: `${new Date().getFullYear()}-08-15`, desc: 'Pro Plan - Monthly Subscription', amt: '$12.00' }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-[var(--text-secondary)]">{row.date}</td>
                      <td className="px-6 py-4 text-white font-medium">{row.desc}</td>
                      <td className="px-6 py-4 font-mono text-right text-white">{row.amt}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] font-mono text-[9px] uppercase">Paid</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => showToast('Invoice download feature coming soon.')} className="text-[var(--text-secondary)] hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          )}

          {/* Section: Appearance */}
          {activeSection === 'appearance' && (
          <section id="appearance" className="scroll-mt-24">
            <div className="mb-8 border-b border-white/10 pb-4">
              <h3 className="font-headline text-2xl font-bold text-white">Appearance</h3>
              <p className="font-body-sm text-xs text-[var(--text-secondary)] mt-1">Customize the interface theme and accent colors.</p>
            </div>
            <div className="glass-panel p-8 rounded-xl space-y-8">
              {/* Theme toggler */}
              <div>
                <label className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider block mb-4">Interface Theme</label>
                <div className="flex gap-6">
                  {/* Dark Mode */}
                  <div
                    onClick={() => handleThemeChange('dark')}
                    className={`cursor-pointer flex flex-col items-center gap-3 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <div className={`w-40 h-28 rounded-xl border-2 bg-[var(--bg-canvas)] p-2 relative overflow-hidden transition-all ${theme === 'dark' ? 'border-[#c0c1ff] shadow-[0_0_20px_rgba(192,193,255,0.15)]' : 'border-transparent'}`}>
                      <div className="w-full h-full flex flex-col gap-2 opacity-80">
                        <div className="w-full h-3 bg-white/5 rounded-sm flex items-center px-1 gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]"></div>
                        </div>
                        <div className="flex flex-1 gap-2">
                          <div className="w-6 h-full bg-white/5 rounded-sm"></div>
                          <div className="flex-1 bg-white/5 rounded-sm p-1"></div>
                        </div>
                      </div>
                      {theme === 'dark' && (
                        <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#c0c1ff] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[var(--bg-canvas)] text-[12px] font-bold">check</span>
                        </div>
                      )}
                    </div>
                    <span className="font-body-sm text-xs text-white font-medium">Dark Mode</span>
                  </div>

                  {/* Light Mode */}
                  <div
                    onClick={() => handleThemeChange('light')}
                    className={`cursor-pointer flex flex-col items-center gap-3 transition-opacity ${theme === 'light' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <div className={`w-40 h-28 rounded-xl border-2 bg-white p-2 relative overflow-hidden transition-all ${theme === 'light' ? 'border-[#c0c1ff] shadow-[0_0_20px_rgba(192,193,255,0.15)]' : 'border-transparent'}`}>
                      <div className="w-full h-full flex flex-col gap-2 opacity-80">
                        <div className="w-full h-3 bg-black/5 rounded-sm flex items-center px-1 gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        </div>
                        <div className="flex flex-1 gap-2">
                          <div className="w-6 h-full bg-black/5 rounded-sm"></div>
                          <div className="flex-1 bg-black/5 rounded-sm p-1"></div>
                        </div>
                      </div>
                      {theme === 'light' && (
                        <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#c0c1ff] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[var(--bg-canvas)] text-[12px] font-bold">check</span>
                        </div>
                      )}
                    </div>
                    <span className="font-body-sm text-xs text-white font-medium">Light Mode</span>
                  </div>
                </div>
              </div>

              {/* Accent Color picker */}
              <div>
                <label className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider block mb-4">Accent Color</label>
                <div className="flex gap-4">
                  {[
                    { id: 'violet', color: '#c0c1ff' },
                    { id: 'blue', color: '#60a5fa' },
                    { id: 'green', color: '#34d399' },
                    { id: 'amber', color: '#fa8c00' }
                  ].map((accent) => (
                    <button
                      key={accent.id}
                      onClick={() => setAccentColor(accent.id)}
                      className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ring-2 ring-offset-2 ring-offset-background"
                      style={{
                        backgroundColor: accent.color,
                        boxShadow: accentColor === accent.id ? `0 0 0 2px ${accent.color}` : 'none'
                      }}
                    >
                      {accentColor === accent.id && (
                        <span className="material-symbols-outlined text-background text-[18px] font-bold">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
          )}

          {/* Section: Danger Zone */}
          {activeSection === 'danger' && (
          <section id="danger" className="scroll-mt-24">
            <div className="mb-8 border-b border-red-500/20 pb-4">
              <h3 className="font-headline text-2xl font-bold text-red-500">Danger Zone</h3>
              <p className="font-body-sm text-xs text-[var(--text-secondary)] mt-1">Irreversible and destructive actions concerning your account data.</p>
            </div>
            <div className="glass-panel p-8 border border-red-500/20 bg-red-500/5 rounded-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-red-500/10">
                <div className="max-w-xl">
                  <h4 className="font-headline font-bold text-white text-sm mb-2">Export My Data</h4>
                  <p className="font-body-sm text-xs text-[var(--text-secondary)] opacity-80">Download a complete copy of all your financial data, reports, and settings in CSV and JSON formats.</p>
                </div>
                <button onClick={() => showToast('Data export requested. An email will be sent to you shortly.')} className="px-6 py-2 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors font-body-sm text-xs font-semibold shrink-0">
                  Request Export
                </button>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                  <h4 className="font-headline font-bold text-white text-sm mb-2">Delete Account</h4>
                  <p className="font-body-sm text-xs text-[var(--text-secondary)] opacity-80">Permanently remove your account and all associated data. <strong className="text-red-500 font-medium">This action cannot be undone.</strong></p>
                </div>
                <button onClick={() => showToast('To delete your account, contact support@quantivo.app', 'error')} className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transition-colors font-body-sm text-xs font-semibold shrink-0">
                  Delete Account
                </button>
              </div>
            </div>
          </section>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl backdrop-blur-md border ${
          toast.type === 'error'
            ? 'bg-red-500/90 border-red-400/30 text-white'
            : 'bg-[var(--bg-surface)]/95 border-white/10 text-[#e1dfff]'
        }`}>
          {toast.msg}
        </div>
      )}
    </>
  )
}
