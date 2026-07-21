'use client'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'
import { TOOLS } from '@/lib/tools'

const totalTools = TOOLS.reduce((s, cat) => s + cat.items.length, 0)

export default function ToolsIndexPage() {
  return (
    <ToolLayout>
      {/* Hero */}
      <div style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 24px 56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(250,140,0,0.1)', border: '1px solid rgba(250,140,0,0.3)', fontSize: '11px', color: '#fa8c00', fontWeight: 700, fontFamily: 'monospace', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>build</span>
            {totalTools} FREE TOOLS
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.03em' }}>
            Professional Tools,<br />
            <span style={{ color: '#fa8c00' }}>Zero Cost.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6 }}>
            Finance calculators, document generators, AI writing tools — all free, no login required.
          </p>
        </div>
      </div>

      {/* Tool Grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 24px' }}>
        {TOOLS.map(category => (
          <div key={category.category} style={{ marginBottom: '48px' }}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: category.color }} />
              <h2 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', margin: 0 }}>{category.category}</h2>
              {category.badge && (
                <span style={{ padding: '2px 8px', borderRadius: '999px', background: 'rgba(192,129,252,0.1)', border: '1px solid rgba(192,129,252,0.3)', fontSize: '10px', color: '#c084fc', fontWeight: 700, fontFamily: 'monospace' }}>✦ {category.badge}</span>
              )}
            </div>

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {category.items.map(tool => (
                <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
                  <div
                    className="tool-card"
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      borderRadius: '16px', padding: '24px', cursor: 'pointer',
                      transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px',
                      position: 'relative', overflow: 'hidden'
                    }}>
                    {tool.badge && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(192,129,252,0.15)', border: '1px solid rgba(192,129,252,0.3)', fontSize: '10px', color: '#c084fc', fontWeight: 700, fontFamily: 'monospace' }}>✦ {tool.badge}</div>
                    )}
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${category.color}18`, border: `1px solid ${category.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '22px', color: category.color }}>{tool.icon}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'Space Grotesk, sans-serif' }}>{tool.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{tool.desc}</p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: category.color, fontSize: '13px', fontWeight: 600 }}>
                      Use Free <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* CTA Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb),0.08) 0%, rgba(192,129,252,0.05) 100%)',
          border: '1px solid rgba(var(--color-primary-rgb),0.2)', borderRadius: '24px', padding: '48px',
          textAlign: 'center', marginTop: '16px'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginBottom: '12px' }}>Want Unlimited Access?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
            Sign up free to use all tools unlimited times. No credit card required.
          </p>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px',
            borderRadius: '999px', background: 'var(--color-primary)', color: 'var(--bg-canvas)',
            fontWeight: 700, fontSize: '15px', textDecoration: 'none', transition: 'all 0.2s'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
            Create Free Account
          </Link>
        </div>
      </div>

      <style>{`
        .tool-card:hover {
          border-color: rgba(var(--color-primary-rgb), 0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
      `}</style>
    </ToolLayout>
  )
}
