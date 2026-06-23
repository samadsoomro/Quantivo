'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/finances', label: 'Finances', icon: 'payments' },
  { href: '/goals', label: 'Goals', icon: 'ads_click' },
  { href: '/habits', label: 'Habits', icon: 'repeat_on' },
  { href: '/invoices', label: 'Invoices', icon: 'description' },
  { href: '/subscriptions', label: 'Subscriptions', icon: 'subscriptions' },
  { href: '/reports', label: 'Reports', icon: 'analytics' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 bg-[#060e20] border-r border-[#464554] z-50 flex flex-col">
      <div className="flex flex-col h-full py-6">
        {/* Logo */}
        <div className="px-6 mb-12">
          <h1 className="text-2xl font-bold text-[#dae2fd]">Quantivo</h1>
          <p className="text-xs text-[#c7c4d7] mt-1 tracking-wide">Premium Analytics</p>
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
                    ? 'bg-[#2d3449] text-[#c0c1ff] border-[#c0c1ff]'
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

        {/* Settings */}
        <div className="mt-auto px-2 pt-4 border-t border-[#464554]">
          <Link
            href="/settings"
            className="flex items-center gap-4 px-4 py-2 border-l-2 border-transparent text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd] transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
