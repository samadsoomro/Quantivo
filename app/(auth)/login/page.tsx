'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef, KeyboardEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/supabase/client'
import { Eye, EyeOff } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function LoginPage() {
  const supabase = createClient()
  const [step, setStep] = useState<'login' | 'forgot_email' | 'forgot_otp' | 'forgot_reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  
  const [errors, setErrors] = useState<{ form?: string, email?: string, password?: string, newPassword?: string, confirmNewPassword?: string }>({})
  const [resendCooldown, setResendCooldown] = useState(0)
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) { 
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setErrors({ form: 'Please verify your email. Check your inbox.' })
      } else {
        setErrors({ form: 'Incorrect email or password.' })
      }
      setLoading(false)
      return 
    }
    
    window.location.href = '/dashboard'
  }

  const handleResendConfirm = async () => {
    setLoading(true)
    setErrors({})
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) {
      setErrors({ form: error.message })
    } else {
      setErrors({ form: 'Verification code resent. Check your inbox.' })
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://quantivo-living-with-ease.vercel.app/auth/callback' }
    })
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    
    // As per previous instruction, though using resetPasswordForEmail is safer to get a 'recovery' type OTP
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    
    if (error) { setErrors({ form: error.message }); setLoading(false); return }
    
    setStep('forgot_otp')
    setLoading(false)
  }

  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 6) return
    
    setLoading(true)
    setErrors({})
    
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' })
    if (error) { 
      setErrors({ form: 'Invalid or expired code.' })
      setOtp(['','','','','',''])
      setLoading(false)
      return 
    }
    
    setStep('forgot_reset')
    setLoading(false)
  }

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters long.' })
      return
    }
    if (newPassword !== confirmNewPassword) {
      setErrors({ confirmNewPassword: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    setErrors({})

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      setErrors({ form: error.message })
      setLoading(false)
      return
    }

    setErrors({ form: 'Password updated! Redirecting...' })
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 2000)
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

  if (step === 'forgot_otp') {
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
              We sent a 6-digit recovery code to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
            </p>
          </div>
          <div style={cardStyle}>
            <form onSubmit={handleVerifyForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <button
                type="button"
                onClick={() => { setStep('login'); setOtp(['','','','','','']); setErrors({}) }}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '13px', cursor: 'pointer', textDecoration: 'none', padding: 0, marginTop: '-8px' }}
              >
                Back to login
              </button>
            </form>
          </div>
        </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (step === 'forgot_reset') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
        <Navbar variant="landing" user={null} profile={null} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
              <Logo size={48} />
            </div>
            <h1 style={{ color: 'var(--text-heading)', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Set new password</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Create a strong password for your account</p>
          </div>
          <div style={cardStyle}>
            <form onSubmit={handleSetNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {errors.form && (
                <div style={{ color: errors.form.includes('updated') ? '#00cc4b' : '#ffb4ab', fontSize: '13px', textAlign: 'center' }}>
                  {errors.form}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} required 
                    placeholder="Minimum 8 characters" 
                    style={{ ...inputStyle, paddingRight: '40px', borderColor: errors.newPassword ? '#ffb4ab' : 'var(--input-border)' }} 
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && <div style={{ color: '#ffb4ab', fontSize: '12px', marginTop: '4px' }}>{errors.newPassword}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmNewPassword ? "text" : "password"} 
                    value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required 
                    placeholder="Repeat new password" 
                    style={{ ...inputStyle, paddingRight: '40px', borderColor: errors.confirmNewPassword ? '#ffb4ab' : 'var(--input-border)' }} 
                  />
                  <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmNewPassword && <div style={{ color: '#ffb4ab', fontSize: '12px', marginTop: '4px' }}>{errors.confirmNewPassword}</div>}
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--color-accent)', color: '#ffffff', border: 'none', borderRadius: '9999px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px', transition: 'background 200ms ease, transform 200ms ease' }}>
                {loading ? 'Updating...' : 'Set Password'}
              </button>
            </form>
          </div>
        </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (step === 'forgot_email') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
        <Navbar variant="landing" user={null} profile={null} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
              <Logo size={48} />
            </Link>
            <h1 style={{ color: 'var(--text-heading)', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Reset your password</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Enter your email to receive a recovery code</p>
          </div>
          <div style={cardStyle}>
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {errors.form && (
                <div style={{ color: '#ffb4ab', fontSize: '13px', textAlign: 'center' }}>
                  {errors.form}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--color-accent)', color: '#ffffff', border: 'none', borderRadius: '9999px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px', transition: 'background 200ms ease, transform 200ms ease' }}>
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '20px', marginBottom: 0 }}>
              <button type="button" onClick={() => { setStep('login'); setErrors({}) }} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', padding: 0, fontWeight: 500, cursor: 'pointer' }}>Back to login</button>
            </p>
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
          <h1 style={{ color: 'var(--text-heading)', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Sign in to your account</p>
        </div>
        <div style={cardStyle}>
          <button onClick={handleGoogleLogin} className="google-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">— or sign in with email —</div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errors.form && (
              <div style={{ color: errors.form.includes('verify') ? 'var(--text-primary)' : '#ffb4ab', fontSize: '13px', textAlign: 'center', background: errors.form.includes('verify') ? 'var(--bg-elevated)' : 'transparent', padding: errors.form.includes('verify') ? '12px' : '0', borderRadius: '8px' }}>
                {errors.form}
                {errors.form.includes('verify') && (
                  <div style={{ marginTop: '8px' }}>
                    <button type="button" onClick={handleResendConfirm} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                      Resend code →
                    </button>
                  </div>
                )}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Password</label>
                <button type="button" onClick={() => { setStep('forgot_email'); setErrors({}) }} style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} onChange={e => setPassword(e.target.value)} required 
                  placeholder="Your password" 
                  style={{ ...inputStyle, paddingRight: '40px' }} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--color-accent)', color: '#ffffff', border: 'none', borderRadius: '9999px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px', transition: 'background 200ms ease, transform 200ms ease' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '20px', marginBottom: 0 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>Sign up free →</Link>
          </p>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  )
}
