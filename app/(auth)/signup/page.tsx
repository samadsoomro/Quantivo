'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

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
  const [error, setError] = useState<string | null>(null)
  
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
    width: '100%', background: 'var(--bg-canvas)', border: '1px solid var(--border-color)',
    borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }

  const validateSignup = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Please enter a valid email address."
    if (password.length < 8) return "Password must be at least 8 characters long."
    if (password !== confirmPassword) return "Passwords do not match."
    return null
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateSignup()
    if (validationError) { setError(validationError); return }
    
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    
    if (error) { setError(error.message); setLoading(false); return }

    if (data?.user?.identities?.length === 0) {
      setError("An account with this email already exists. Please log in instead.")
      setLoading(false)
      return
    }
    
    setStep('otp')
    setCooldown(30)
    setLoading(false)
  }

  const handleResendCode = async () => {
    if (cooldown > 0) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setCooldown(30)
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = otp.join('')
    if (token.length !== 6) return
    
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    if (error) { setError(error.message); setLoading(false); return }
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

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px',
    padding: '32px', boxShadow: '0 24px 48px rgba(0,0,0,0.1)'
  }

  if (step === 'otp') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '48px', background: '#c0c1ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ color: '#1000a9', fontWeight: 800, fontSize: '20px' }}>Q</span>
            </div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Check your email</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              We sent a 6-digit code to{' '}
              <strong style={{ color: '#c0c1ff' }}>{email}</strong>
            </p>
          </div>
          <div style={cardStyle}>
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div style={{ background: '#ffb4ab18', border: '1px solid #ffb4ab44', borderRadius: '8px', padding: '10px 14px', color: '#ffb4ab', fontSize: '13px' }}>
                  {error}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '16px', textAlign: 'center' }}>
                  Enter your 6-digit verification code
                </label>
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
                        width: '45px', height: '56px', background: 'var(--bg-canvas)', border: '2px solid var(--border-color)', 
                        borderRadius: '10px', color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, 
                        textAlign: 'center', outline: 'none' 
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#c0c1ff' }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)' }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                style={{ width: '100%', background: '#c0c1ff', color: '#1000a9', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: otp.join('').length !== 6 ? 'not-allowed' : 'pointer', opacity: (loading || otp.join('').length !== 6) ? 0.6 : 1 }}
              >
                {loading ? 'Verifying...' : 'Verify & Enter Dashboard'}
              </button>
              
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={cooldown > 0 || loading}
                  style={{ background: 'none', border: 'none', color: '#c0c1ff', fontSize: '13px', cursor: (cooldown > 0 || loading) ? 'not-allowed' : 'pointer', textDecoration: 'underline', padding: 0, opacity: (cooldown > 0 || loading) ? 0.6 : 1 }}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setStep('signup'); setOtp(['','','','','','']); setError(null) }}
                style={{ background: 'none', border: 'none', color: '#c0c1ff', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginTop: '-8px' }}
              >
                Back to signup
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: '48px', height: '48px', background: '#c0c1ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', cursor: 'pointer' }}>
              <span style={{ color: '#1000a9', fontWeight: 800, fontSize: '20px' }}>Q</span>
            </div>
          </Link>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Start tracking your finances today</p>
        </div>
        <div style={cardStyle}>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ background: '#ffb4ab18', border: '1px solid #ffb4ab44', borderRadius: '8px', padding: '10px 14px', color: '#ffb4ab', fontSize: '13px' }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Your name" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} onChange={e => setPassword(e.target.value)} required 
                  placeholder="Minimum 8 characters" 
                  style={{ ...inputStyle, paddingRight: '40px' }} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required 
                  placeholder="Repeat password" 
                  style={{ ...inputStyle, paddingRight: '40px' }} 
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#c0c1ff', color: '#1000a9', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '20px', marginBottom: 0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#c0c1ff', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
