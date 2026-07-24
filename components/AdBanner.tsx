export function AdBanner({ slot = 'horizontal' }: { slot?: 'horizontal' | 'sidebar' | 'square' }) {
  const sizes = {
    horizontal: { width: '100%', minHeight: '90px' },
    sidebar: { width: '300px', minHeight: '250px' },
    square: { width: '250px', minHeight: '250px' }
  }
  return (
    <div style={{ ...sizes[slot], background:'var(--bg-elevated)', border:'1px dashed var(--border-color)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', margin:'16px 0', flexDirection:'column', gap:'4px' }}>
      <span style={{ fontSize:'10px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Advertisement</span>
      {/* Replace with actual AdSense code: <ins className="adsbygoogle" ... /> */}
    </div>
  )
}
