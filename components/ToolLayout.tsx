'use client'
import Link from 'next/link'

interface ToolLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ToolLayout({ children, title }: ToolLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <nav className="w-full sticky top-0 z-50 backdrop-blur-lg border-b flex justify-between items-center h-16 px-6 md:px-12"
        style={{ background: 'var(--nav-bg)', borderColor: 'var(--border-color)' }}>
        <Link href="/" className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
          Quantivo
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/tools" className="text-sm transition-colors hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
            All Tools
          </Link>
          <Link href="/login" className="text-sm transition-colors px-4 py-2 rounded-full" style={{ color: 'var(--text-secondary)' }}>
            Log In
          </Link>
          <Link href="/signup" className="text-sm font-bold px-5 py-2 rounded-full transition-all hover:brightness-110"
            style={{ background: 'var(--color-primary)', color: 'var(--bg-canvas)' }}>
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t flex flex-col md:flex-row justify-between items-center py-6 px-12"
        style={{ background: 'var(--footer-bg)', borderColor: 'var(--border-color)' }}>
        <div className="font-bold text-lg mb-4 md:mb-0" style={{ color: 'var(--footer-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
          Quantivo
        </div>
        <div className="text-xs mb-4 md:mb-0" style={{ color: 'var(--footer-text)', opacity: 0.7 }}>
          © {new Date().getFullYear()} Quantivo Analytics. All rights reserved.
        </div>
        <div className="flex gap-6 text-xs" style={{ color: 'var(--footer-text)', opacity: 0.7 }}>
          <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
        </div>
      </footer>
    </div>
  )
}
