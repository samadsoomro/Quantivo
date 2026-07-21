export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="var(--color-accent)"/>
        <text x="16" y="22" textAnchor="middle" fill="white" fontSize="17" fontWeight="700" fontFamily="Space Grotesk, sans-serif">$</text>
      </svg>
      <span style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize: size * 0.56, color:'var(--text-heading)' }}>Quantivo</span>
    </div>
  )
}
