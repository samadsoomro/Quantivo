import Link from 'next/link'
import { Logo } from '@/components/Logo'

export function Footer() {
  return (
    <>
      <style>{`
        .footer-link {
          font-family: Inter, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: color 200ms ease-out;
        }
        .footer-link:hover {
          color: rgba(255, 255, 255, 0.9);
        }
        .btn-violet {
          background: #7c7fff;
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
        .btn-violet:hover {
          transform: translateY(-3px);
          filter: brightness(1.1);
        }
      `}</style>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 24px 40px', background: '#030e1a' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '12px' }}>
              <Logo size={24} />
              <span>Quantivo</span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '280px' }}>
              The precision financial command center for modern professionals.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
            {[
              { heading: 'Product', links: ['Features', 'Tools', 'Pricing', 'Changelog'] },
              { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { heading: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Status'] },
            ].map((col) => (
              <div key={col.heading} style={{ minWidth: '120px' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                  {col.heading}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map((link) => (
                    <a key={link} href="#" className="footer-link">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>
            © {new Date().getFullYear()} Quantivo Analytics. All rights reserved.
          </span>
          <Link href="/signup" className="btn-violet" style={{ fontSize: '14px', padding: '9px 24px' }}>
            Start Free →
          </Link>
        </div>
      </footer>
    </>
  )
}
