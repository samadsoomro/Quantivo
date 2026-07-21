'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/supabase/client'
import { Eye, EyeOff } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function SignupPage() {
  const supabase = createClient()
  const [step, setStep] = useState<'signup' | 'otp'>('signup')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  
  // Validation errors
  const [errors, setErrors] = useState<{ form?: string, fullName?: string, email?: string, password?: string, confirmPassword?: string }>({})
  
  const [cooldown, setCooldown] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)',
    borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 200ms ease'
  }
  
  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px',
    padding: '32px', boxShadow: '0 24px 48px rgba(0,0,0,0.1)'
  }

  const validateSignup = () => {
    let newErrors: typeof errors = {}
    if (!fullName.trim()) newErrors.fullName = "Full name is required."
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Please enter a valid email address."
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters long."
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateSignup()) return
    
    setLoading(true)
    setErrors({})

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    
    if (error) { 
      setErrors({ form: error.message })
      setLoading(false)
      return 
    }

    if (data?.user?.identities?.length === 0) {
      setErrors({ form: "Account exists. Log in instead →" })
      setLoading(false)
      return
    }
    
    setStep('otp')
    setCooldown(30)
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://quantivo-living-with-ease.vercel.app/auth/callback' }
    })
  }

  const handleResendCode = async () => {
    if (cooldown > 0) return
    setLoading(true)
    setErrors({})
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    if (error) { setErrors({ form: error.message }); setLoading(false); return }
    setCooldown(30)
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 6) return
    
    setLoading(true)
    setErrors({})
    
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    if (error) { 
      setErrors({ form: "Invalid or expired code." })
      setOtp(['','','','','',''])
      setLoading(false)
      return 
    }
    window.location.href = '/dashboard'
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasteData) {
      const newOtp = [...otp]
      for (let i = 0; i < pasteData.length; i++) {
        newOtp[i] = pasteData[i]
      }
      setOtp(newOtp)
      const nextFocus = Math.min(pasteData.length, 5)
      otpRefs.current[nextFocus]?.focus()
    }
  }

  if (step === 'otp') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
        <Navbar variant="landing" user={null} profile={null} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
              <Logo size={48} />
            </div>
            <h1 style={{ color: 'var(--text-heading)', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Check your email ✉️</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              We sent a 6-digit code to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
            </p>
          </div>
          <div style={cardStyle}>
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {errors.form && (
                <div style={{ color: '#ffb4ab', fontSize: '13px', textAlign: 'center' }}>
                  {errors.form}
                </div>
              )}
              <div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { otpRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      autoFocus={index === 0}
                      style={{ 
                        width: '48px', height: '56px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', 
                        borderRadius: '8px', color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, 
                        textAlign: 'center', outline: 'none', transition: 'border-color 200ms ease'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)' }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                style={{ width: '100%', background: 'var(--color-accent)', color: '#ffffff', border: 'none', borderRadius: '9999px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: otp.join('').length !== 6 ? 'not-allowed' : 'pointer', opacity: (loading || otp.join('').length !== 6) ? 0.6 : 1, transition: 'background 200ms ease, transform 200ms ease' }}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={cooldown > 0 || loading}
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '13px', cursor: (cooldown > 0 || loading) ? 'not-allowed' : 'pointer', padding: 0, opacity: (cooldown > 0 || loading) ? 0.6 : 1 }}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s...` : 'Resend code'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
      <Navbar variant="landing" user={null} profile={null} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .google-btn {
          background: #ffffff;
          color: #374151;
          border: 1px solid var(--border-strong);
          border-radius: 9999px;
          padding: 12px;
          width: 100%;
          font-family: Inter, sans-serif;
          font-size: 15px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .google-btn:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateY(-1px);
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          margin: 24px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }
        .divider::before { margin-right: .5em; }
        .divider::after { margin-left: .5em; }
        .input-error { color: #ffb4ab; font-size: 12px; margin-top: 4px; }
      `}</style>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
            <Logo size={48} />
          </Link>
          <h1 style={{ color: 'var(--text-heading)', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Start tracking your finances today</p>
        </div>
        
        <div style={cardStyle}>
          <button onClick={handleGoogleSignup} className="google-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">— or sign up with email —</div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errors.form && (
              <div style={{ color: errors.form.includes('exists') ? 'var(--text-secondary)' : '#ffb4ab', fontSize: '13px', textAlign: 'center' }}>
                {errors.form.includes('exists') ? (
                  <Link href="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>{errors.form}</Link>
                ) : errors.form}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} onBlur={validateSignup} required placeholder="Your name" style={{...inputStyle, borderColor: errors.fullName ? '#ffb4ab' : 'var(--input-border)'}} />
              {errors.fullName && <div className="input-error">{errors.fullName}</div>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={validateSignup} required placeholder="you@example.com" style={{...inputStyle, borderColor: errors.email ? '#ffb4ab' : 'var(--input-border)'}} />
              {errors.email && <div className="input-error">{errors.email}</div>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} onChange={e => setPassword(e.target.value)} onBlur={validateSignup} required 
                  placeholder="Minimum 8 characters" 
                  style={{ ...inputStyle, paddingRight: '40px', borderColor: errors.password ? '#ffb4ab' : 'var(--input-border)' }} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="input-error">{errors.password}</div>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onBlur={validateSignup} required 
                  placeholder="Repeat password" 
                  style={{ ...inputStyle, paddingRight: '40px', borderColor: errors.confirmPassword ? '#ffb4ab' : 'var(--input-border)' }} 
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--color-accent)', color: '#ffffff', border: 'none', borderRadius: '9999px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px', transition: 'background 200ms ease, transform 200ms ease' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '20px', marginBottom: 0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>Log in →</Link>
          </p>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  )
}
