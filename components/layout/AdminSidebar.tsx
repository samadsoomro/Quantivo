'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'

const navItems = [
  { href: '/admin/overview', label: 'Overview', icon: 'monitoring' },
  { href: '/admin/customers', label: 'Customers', icon: 'group' },
  { href: '/admin/site-editor', label: 'Site Editor', icon: 'edit_document' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: 'history' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 bg-[var(--bg-canvas)] border-r border-[var(--border-color)] z-50 flex flex-col">
      <div className="flex flex-col h-full py-6">
        {/* Logo */}
        <div className="px-6 mb-12 flex flex-col">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <p className="text-xs text-red-400 mt-3 tracking-wide font-mono uppercase font-bold">Admin Portal</p>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto space-y-1 px-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-2 border-l-2 transition-all duration-200 group ${
                  active
                    ? 'bg-[var(--bg-elevated)] text-[#ffb77a] border-[#ffb77a]'
                    : 'text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${active ? 'icon-filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Back to User Dashboard */}
        <div className="mt-auto px-2 pt-4 border-t border-[var(--border)]">
          <Link
            href="/dashboard"
            className="flex items-center gap-4 px-4 py-2 border-l-2 border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm font-medium">Exit Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
