'use client'

import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import DotField from '@/components/DotField'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { HeroGraph } from '@/components/HeroGraph'

export function LandingPage({ siteConfig }: { siteConfig: Record<string, string> }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    )
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        body { background-color: var(--bg-canvas); color: var(--text-primary); overflow-x: hidden; }
        .glass-card {
          background: rgba(18, 33, 49, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .stagger-1 { transition-delay: 50ms; }
        .stagger-2 { transition-delay: 100ms; }
        .stagger-3 { transition-delay: 150ms; }
        .stagger-4 { transition-delay: 200ms; }
        .stagger-5 { transition-delay: 250ms; }
        .stagger-6 { transition-delay: 300ms; }
        .stagger-7 { transition-delay: 350ms; }
        .stagger-8 { transition-delay: 400ms; }
        
        .hover-lift { transition: transform 200ms ease-out; }
        .hover-lift:hover { transform: translateY(-3px); }
        .animated-gradient-text {
          background: linear-gradient(to right, #7c7fff, #c0c1ff, #ffb77a);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% auto;
          animation: textGradient 5s linear infinite;
        }
        @keyframes textGradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--rotation, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--rotation, 0deg)); }
        }
        .floating-tag { animation: float 6s ease-in-out infinite; }
        .nav-link {
          color: var(--text-secondary);
          font-family: Inter, sans-serif;
          font-size: 15px;
          font-weight: 300;
          text-decoration: none;
          transition: color 200ms ease-out, transform 200ms ease-out;
        }
        .nav-link:hover { color: #e1dfff; transform: translateY(-2px); }
        .btn-violet {
          background: #7c7fff; /* Fix 5 */
          color: #ffffff;
          padding: 10px 28px;
          border-radius: 9999px;
          font-family: Inter, sans-serif;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 200ms ease-out, background 200ms ease-out;
        }
        .btn-violet:hover { transform: translateY(-3px); background: #6869e8; }
        .btn-violet:active { transform: scale(0.97); }
        .btn-amber {
          background: #fa8c00;
          color: #1a0f00;
          padding: 10px 28px;
          border-radius: 9999px;
          font-family: Inter, sans-serif;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          transition: transform 200ms ease-out;
        }
        .btn-amber:hover { transform: translateY(-3px); }
        .btn-ghost {
          background: transparent;
          color: #7c7fff;
          padding: 10px 28px;
          border-radius: 9999px;
          border: 1px solid #7c7fff;
          font-family: Inter, sans-serif;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 200ms ease-out, background 200ms ease-out;
        }
        .btn-ghost:hover { transform: translateY(-3px); background: rgba(124,127,255,0.08); }
        .tool-card {
          background: rgba(18, 33, 49, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(250, 140, 0, 0.25);
          border-radius: 16px;
          padding: 28px;
          transition: transform 200ms ease-out, border-color 200ms ease-out;
        }
        .tool-card:hover { transform: translateY(-3px); border-color: rgba(250,140,0,0.5); }
        .tool-card-disabled {
          border-color: rgba(255, 204, 2, 0.15);
        }
        .tool-card-disabled:hover { transform: translateY(-3px); border-color: rgba(255, 204, 2, 0.4); }
        .faq-content { max-height: 0; overflow: hidden; transition: max-height 400ms ease-out; }
        .faq-content.open { max-height: 200px; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
        
        /* Mobile Hamburger & Grid */
        .mobile-menu {
          display: none;
        }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-menu.open { display: flex; flex-direction: column; background: var(--bg-canvas); padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .tool-grid { grid-template-columns: 1fr !important; }
          .hero-headline { font-size: clamp(32px, 8vw, 64px) !important; }
          .floating-tags { display: none !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
        }
      `}</style>

      {/* TopNavBar */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, background: 'rgba(5,20,36,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: '#e1dfff', letterSpacing: '-0.02em' }}>
            <Logo /> Quantivo
          </div>
          <div className="nav-links-desktop" style={{ display: 'flex', gap: '32px' }}>
            <a className="nav-link" href="#features">Features</a>
            <a className="nav-link" href="#tools">Free Tools</a>
            <a className="nav-link" href="#pricing">Pricing</a>
            <a className="nav-link" href="#faq">FAQ</a>
          </div>
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle />
            <Link href="/login" className="btn-ghost">Log In</Link>
            <Link href="/signup" className="btn-violet">Get Started →</Link>
          </div>
          <div className="mobile-menu-btn" style={{ display: 'none' }}>
            <MobileMenu />
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '96px', paddingBottom: '80px', background: 'var(--bg-canvas)' }}>
        {/* Hero Section */}
        <section style={{ position: 'relative', paddingTop: '120px', paddingBottom: '80px', overflow: 'hidden' }}>
          {/* DotField interactive background */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <DotField
              dotRadius={1.5}
              dotSpacing={18}
              bulgeStrength={60}
              glowRadius={180}
              gradientFrom="rgba(124, 127, 255, 0.4)"
              gradientTo="rgba(124, 127, 255, 0.15)"
              glowColor="var(--bg-canvas)"
              bulgeOnly
            />
          </div>
          {/* Hero content on top */}
          <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '600px', background: 'radial-gradient(circle, rgba(124,127,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Floating Candy Tags */}
            <div className="floating-tags" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div className="floating-tag" style={{ position: 'absolute', top: '10%', left: '8%', padding: '6px 14px', borderRadius: '9999px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', background: 'rgba(255,68,51,0.15)', color: '#ff4433', border: '1px solid #ff4433', '--rotation': '-8deg' } as React.CSSProperties}>Groceries 🛒</div>
              <div className="floating-tag" style={{ position: 'absolute', top: '20%', right: '12%', padding: '6px 14px', borderRadius: '9999px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', background: 'rgba(255,204,2,0.15)', color: '#ffcc02', border: '1px solid #ffcc02', animationDelay: '1s', '--rotation': '12deg' } as React.CSSProperties}>Savings 💰</div>
              <div className="floating-tag" style={{ position: 'absolute', bottom: '25%', left: '18%', padding: '6px 14px', borderRadius: '9999px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', background: 'rgba(0,172,254,0.15)', color: '#00acfe', border: '1px solid #00acfe', animationDelay: '2s', '--rotation': '5deg' } as React.CSSProperties}>Travel ✈️</div>
              <div className="floating-tag" style={{ position: 'absolute', bottom: '35%', right: '8%', padding: '6px 14px', borderRadius: '9999px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', background: 'rgba(0,204,75,0.15)', color: '#00cc4b', border: '1px solid #00cc4b', animationDelay: '0.5s', '--rotation': '-12deg' } as React.CSSProperties}>Income 💼</div>
              <div className="floating-tag" style={{ position: 'absolute', top: '5%', left: '40%', padding: '6px 14px', borderRadius: '9999px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', background: 'rgba(255,100,200,0.15)', color: '#ff64c8', border: '1px solid #ff64c8', animationDelay: '1.5s', '--rotation': '5deg' } as React.CSSProperties}>Netflix 📺</div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-12" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ flex: 1, textAlign: 'left', maxWidth: '600px' }}>
                <h1 className="hero-headline" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '64px', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '24px' }}>
                  <span className="animated-gradient-text">{siteConfig?.hero_headline || 'Your Money. Your Goals. Finally Under Control.'}</span>
                </h1>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px' }}>
                  {siteConfig?.hero_subheadline || 'The all-in-one finance tracker, invoice generator, and productivity suite built for freelancers and professionals.'}
                </p>
                
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                  <Link href="/signup" className="btn-violet" style={{ fontSize: '17px', padding: '12px 36px', width: '100%', maxWidth: '240px' }}>Get Started Free</Link>
                  <Link href="/login" className="btn-ghost" style={{ fontSize: '17px', padding: '12px 36px', width: '100%', maxWidth: '240px' }}>View Demo</Link>
                </div>

                {/* Trust Strip */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                  {['Free forever', 'No credit card', '2-minute setup'].map(t => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter', fontSize: '13px', color: '#918f9a' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#00cc4b' }}>check</span>
                      {t}
                    </div>
                  ))}
                </div>

                {/* Social Proof */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '48px' }}>
                  <div style={{ display: 'flex', position: 'relative' }}>
                    {['A','J','M','S','R'].map((initial, i) => (
                      <div key={i} style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: ['#ff4433', '#ffcc02', '#00acfe', '#00cc4b', '#ff64c8'][i],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--bg-canvas)', fontWeight: 700, fontSize: '12px',
                        marginLeft: i > 0 ? '-8px' : '0', border: '2px solid var(--bg-canvas)', zIndex: 10-i
                      }}>
                        {initial}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: '14px', color: 'var(--text-secondary)' }}>Join 120,000+ professionals tracking smarter</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
                <HeroGraph />
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section id="tools" style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '36px', fontWeight: 700, color: '#e1dfff', marginBottom: '12px' }}>Professional Tools</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 300, color: 'var(--text-secondary)' }}>Accelerate your workflow with precision utilities. Free to try, unlimited with Pro.</p>
          </div>

          <div className="tool-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: 'receipt_long', name: 'Invoice Generator', desc: 'Create professional, compliant invoices in seconds. Export directly to PDF.', href: '/tools/invoice', badge: '2/3 free uses', active: true },
              { icon: 'picture_as_pdf', name: 'PDF Converter', desc: 'Convert financial CSVs and raw data directly into formatted, presentation-ready PDFs.', href: '/login', badge: '2/3 free uses', active: true },
              { icon: 'account_balance', name: 'Bank Statement Generator', desc: 'Generate mock or normalized bank statements for testing and reconciliation.', href: '/login', badge: '2/3 free uses', active: true },
              { icon: 'summarize', name: 'Expense Report', desc: 'Automate weekly expense reports.', href: '/tools/expense-report', badge: 'Coming Soon', active: false },
              { icon: 'calculate', name: 'Budget Planner', desc: 'Plan and forecast annual budgets.', href: '/tools/budget', badge: 'Coming Soon', active: false },
              { icon: 'qr_code', name: 'QR Code Generator', desc: 'Payment QR codes on the fly.', href: '/login', badge: '2/3 free uses', active: true },
              { icon: 'currency_exchange', name: 'Currency Converter', desc: 'Real-time FX rates.', href: '/login', badge: '2/3 free uses', active: true },
              { icon: 'percent', name: 'Loan Calculator', desc: 'Amortization schedules and more.', href: '/login', badge: '2/3 free uses', active: true },
              { icon: 'table_chart', name: 'CSV to Excel', desc: 'Format conversions in browser.', href: '/tools/csv-excel', badge: 'Coming Soon', active: false },
            ].map((tool, i) => (
              <div key={tool.name} className={`tool-card fade-up ${i > 0 ? ' stagger-' + Math.min(i, 8) : ''} ${!tool.active ? 'tool-card-disabled' : ''}`} style={{ opacity: tool.active ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: tool.active ? '#fa8c00' : 'var(--text-secondary)', fontVariationSettings: "'FILL' 0" }}>{tool.icon}</span>
                  <span style={{ 
                    background: tool.active ? 'rgba(250,140,0,0.12)' : 'rgba(255,204,2,0.1)', 
                    color: tool.active ? '#fa8c00' : '#ffcc02', 
                    border: `1px solid ${tool.active ? 'rgba(250,140,0,0.4)' : 'rgba(255,204,2,0.4)'}`, 
                    padding: '4px 12px', borderRadius: '9999px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' 
                  }}>{tool.badge}</span>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{tool.name}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>{tool.desc}</p>
                {tool.active && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link href={tool.href} className="btn-amber" style={{ flex: 1, textAlign: 'center', padding: '9px 16px', fontSize: '14px' }}>Try Free →</Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="fade-up" style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
            <Link href="/signup" style={{ color: '#7c7fff', fontFamily: 'Inter', fontSize: '16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View All 50+ Tools →
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto', background: 'rgba(18,33,49,0.2)' }}>
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '36px', fontWeight: 700, color: '#e1dfff', marginBottom: '12px' }}>Everything You Need</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 300, color: 'var(--text-secondary)' }}>A complete command center for your financial life.</p>
          </div>
          <div className="tool-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: 'insights', title: 'Predictive Analytics', desc: 'AI-powered forecasts based on your spending patterns and market data.' },
              { icon: 'account_balance_wallet', title: 'Universal Sync', desc: 'Connect all your accounts, investments, and crypto in one place.' },
              { icon: 'security', title: 'Bank-Grade Security', desc: 'AES-256 encryption and zero-knowledge architecture protect your data.' },
              { icon: 'trending_up', title: 'Goal Tracking', desc: 'Set, visualize, and automatically fund your financial milestones.' },
              { icon: 'receipt_long', title: 'Invoice & Billing', desc: 'Create, send, and track professional invoices with one click.' },
              { icon: 'bar_chart', title: 'Advanced Reports', desc: 'Export detailed reports and tax-ready summaries in seconds.' },
            ].map((feature, i) => (
              <div key={feature.title} className={`glass-card hover-lift fade-up ${i > 0 ? ' stagger-' + Math.min(i, 8) : ''}`} style={{ padding: '28px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#7c7fff', marginBottom: '16px', display: 'block' }}>{feature.icon}</span>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>{feature.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '36px', fontWeight: 700, color: '#e1dfff', marginBottom: '12px' }}>Simple Pricing</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 300, color: 'var(--text-secondary)' }}>Start free. Scale when you need to.</p>
          </div>
          <div className="tool-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '720px', margin: '0 auto' }}>
            {/* Free */}
            <div className="glass-card fade-up" style={{ padding: '36px' }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Free</h3>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '40px', fontWeight: 400, color: '#7c7fff', marginBottom: '24px' }}>$0<span style={{ fontSize: '16px', color: '#918f9a' }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Up to 50 transactions/mo', '3 tool uses/day', 'Basic dashboard', '1 goal'].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 300, color: 'var(--text-secondary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#00cc4b' }}>check_circle</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-ghost" style={{ width: '100%', textAlign: 'center', display: 'flex', boxSizing: 'border-box' }}>Get Started</Link>
            </div>
            {/* Pro */}
            <div className="glass-card fade-up stagger-1" style={{ padding: '36px', border: '1px solid rgba(124,127,255,0.4)', boxShadow: '0 0 40px rgba(124,127,255,0.08)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#7c7fff', color: '#ffffff', padding: '4px 16px', borderRadius: '9999px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em' }}>MOST POPULAR</div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: '#7c7fff', marginBottom: '8px' }}>Pro</h3>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '40px', fontWeight: 400, color: '#7c7fff', marginBottom: '24px' }}>$12<span style={{ fontSize: '16px', color: '#918f9a' }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Unlimited transactions', 'Unlimited tool uses', 'Advanced analytics', 'Unlimited goals', 'AI insights', 'Priority support'].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 300, color: 'var(--text-primary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#7c7fff' }}>check_circle</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-violet" style={{ width: '100%', textAlign: 'center', display: 'flex', boxSizing: 'border-box' }}>Start Free Trial</Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" style={{ padding: '80px 24px', maxWidth: '800px', margin: '0 auto' }}>
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '36px', fontWeight: 700, color: '#e1dfff', marginBottom: '12px' }}>FAQs</h2>
          </div>
          {[
            { q: 'Is my financial data secure?', a: 'Yes. We use AES-256 encryption and never sell your data. All connections use read-only bank-level OAuth.' },
            { q: 'Can I use the tools without signing up?', a: 'Yes! You get 3 free uses per day per tool with no account required. Sign up to unlock unlimited access.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards and PayPal. All billing is handled securely through Stripe.' },
            { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel from Settings at any time with no cancellation fees and no questions asked.' },
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px 40px', background: 'rgba(1,15,31,0.6)' }}>
        <div className="tool-grid" style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: '#e1dfff', marginBottom: '12px' }}><Logo /> Quantivo</div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 300, color: '#918f9a', lineHeight: 1.7 }}>The precision financial command center for modern professionals.</p>
          </div>
          {[
            { heading: 'Product', links: ['Features', 'Tools', 'Pricing', 'Changelog'] },
            { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
            { heading: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Status'] },
          ].map((col) => (
            <div key={col.heading}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>{col.heading}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {col.links.map((link) => (
                  <a key={link} href="#" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 300, color: '#918f9a', textDecoration: 'none', transition: 'color 200ms ease-out' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#7c7fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#918f9a')}
                  >{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 300, color: '#918f9a' }}>© {new Date().getFullYear()} Quantivo Analytics. All rights reserved.</span>
          <Link href="/signup" className="btn-violet" style={{ fontSize: '14px', padding: '9px 24px' }}>Start Free →</Link>
        </div>
      </footer>
    </>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass-card" style={{ marginBottom: '12px', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ width: '100%', textAlign: 'left', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{question}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#7c7fff', transition: 'transform 200ms ease-out', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
      </button>
      <div style={{ maxHeight: open ? '200px' : '0', overflow: 'hidden', transition: 'max-height 300ms ease-out' }}>
        <div style={{ padding: '0 24px 20px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{answer}</div>
      </div>
    </div>
  )
}

function MobileMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#e1dfff', cursor: 'pointer' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{open ? 'close' : 'menu'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, width: '250px', background: 'rgba(5,20,36,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <a className="nav-link" href="#features" onClick={() => setOpen(false)}>Features</a>
          <a className="nav-link" href="#tools" onClick={() => setOpen(false)}>Free Tools</a>
          <a className="nav-link" href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
          <a className="nav-link" href="#faq" onClick={() => setOpen(false)}>FAQ</a>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
          <Link href="/login" className="btn-ghost" style={{ textAlign: 'center', width: '100%' }}>Log In</Link>
          <Link href="/signup" className="btn-violet" style={{ textAlign: 'center', width: '100%' }}>Get Started →</Link>
        </div>
      )}
    </div>
  )
}
