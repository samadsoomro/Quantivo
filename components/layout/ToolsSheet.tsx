'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { TOOLS } from '@/lib/tools'
import Link from 'next/link'

interface ToolsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ToolsSheet({ open, onOpenChange }: ToolsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto bg-[var(--bg-canvas)] border-l-[var(--border-color)]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)]">Tools Library</SheetTitle>
          <SheetDescription className="text-[var(--text-secondary)]">
            Access free utilities and calculators without leaving your dashboard.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 pb-12">
          {TOOLS.map(category => (
            <div key={category.category}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded bg-current" style={{ color: category.color }} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">{category.category}</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {category.items.map(tool => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => onOpenChange(false)}
                    className="flex items-start gap-4 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-white/20 hover:bg-[#1a293d] transition-colors group"
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${category.color}18`, border: `1px solid ${category.color}30` }}
                    >
                      <span className="material-symbols-outlined" style={{ color: category.color, fontSize: '20px' }}>
                        {tool.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-white transition-colors">
                          {tool.title}
                        </h4>
                        {tool.badge && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(192,129,252,0.15)', border: '1px solid rgba(192,129,252,0.3)', color: '#c084fc' }}>
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-snug line-clamp-2">
                        {tool.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
