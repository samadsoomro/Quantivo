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
            <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Quantivo</h1>
          </div>
          <p className="text-xs text-red-400 mt-1 tracking-wide font-mono uppercase font-bold">Admin Portal</p>
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
                    ? 'bg-[#2d3449] text-[#ffb77a] border-[#ffb77a]'
                    : 'text-[#c7c4d7] border-transparent hover:bg-[#222a3d] hover:text-[#dae2fd]'
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
        <div className="mt-auto px-2 pt-4 border-t border-[#464554]">
          <Link
            href="/dashboard"
            className="flex items-center gap-4 px-4 py-2 border-l-2 border-transparent text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd] transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm font-medium">Exit Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
