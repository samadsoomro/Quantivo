'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('qv-theme')
    const isDark = saved ? saved === 'dark' : true
    setDark(isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('qv-theme', next ? 'dark' : 'light')
    
    if (next) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-all text-sm"
      title="Toggle theme"
    >
      <span className="material-symbols-outlined text-[16px]">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}
