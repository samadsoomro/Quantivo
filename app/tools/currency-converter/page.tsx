'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ToolLayout } from '@/components/ToolLayout'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
]

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState(1)
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('PKR')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true)
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD')
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (data.result === 'success') {
          setRates(data.rates)
          setLastUpdated(new Date(data.time_last_update_unix * 1000).toLocaleString())
        }
      } catch {
        // Fallback static rates
        setRates({
          USD: 1, EUR: 0.92, GBP: 0.79, PKR: 278.5, AED: 3.67, SAR: 3.75,
          CAD: 1.36, AUD: 1.52, JPY: 149.5, INR: 83.2, CNY: 7.24, KWD: 0.307,
          SGD: 1.34, CHF: 0.89, MYR: 4.65, TRY: 30.8, BRL: 4.97, MXN: 17.15,
          ZAR: 18.63, NGN: 780, EGP: 30.9, BDT: 110, PHP: 56.4, IDR: 15600,
          THB: 35.1, VND: 24500, KRW: 1325, HKD: 7.82, NOK: 10.55, SEK: 10.42
        })
        setLastUpdated('Static rates (offline)')
        setError('Live rates unavailable. Using approximate rates.')
      }
      setLoading(false)
    }
    fetchRates()
  }, [])

  const convertedAmount = rates[fromCurrency] && rates[toCurrency]
    ? (amount / rates[fromCurrency]) * rates[toCurrency]
    : 0

  const exchangeRate = rates[fromCurrency] && rates[toCurrency]
    ? rates[toCurrency] / rates[fromCurrency]
    : 0

  const swap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const popularPairs = [
    ['USD', 'EUR'], ['USD', 'GBP'], ['USD', 'PKR'], ['USD', 'AED'],
    ['EUR', 'GBP'], ['USD', 'INR'], ['USD', 'JPY'], ['GBP', 'PKR']
  ]

  const selStyle = {
    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
    borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', width: '100%'
  } as React.CSSProperties

  return (
    <ToolLayout>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/tools" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Tools</Link>
        <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>Currency Converter</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Convert between 30+ currencies with live exchange rates.
          {lastUpdated && <span style={{ fontSize: '12px' }}> · Updated: {lastUpdated}</span>}
        </p>

        {error && (
          <div style={{ background: 'rgba(250,140,0,0.1)', border: '1px solid rgba(250,140,0,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#fa8c00' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Main Converter */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '32px', marginBottom: '24px' }}>
          {/* Amount Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              style={{ background: 'var(--bg-elevated)', border: '2px solid var(--color-primary)', borderRadius: '12px', padding: '14px 18px', color: 'var(--text-primary)', fontSize: '24px', fontFamily: 'monospace', fontWeight: 700, width: '100%', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* From / Swap / To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>From</label>
              <select style={selStyle} value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>)}
              </select>
            </div>
            <button onClick={swap} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>swap_horiz</span>
            </button>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>To</label>
              <select style={selStyle} value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Result */}
          <div style={{ marginTop: '28px', padding: '24px', background: 'var(--bg-elevated)', borderRadius: '14px', textAlign: 'center' }}>
            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading rates...</div>
            ) : (
              <>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', fontFamily: 'monospace' }}>
                  {amount} {fromCurrency} =
                </div>
                <div style={{ fontSize: '40px', fontWeight: 800, color: '#fa8c00', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Amounts */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Quick Amounts</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[1, 10, 50, 100, 500, 1000, 5000, 10000].map(v => (
              <button key={v} onClick={() => setAmount(v)}
                style={{
                  padding: '6px 14px', borderRadius: '999px', background: amount === v ? 'var(--color-primary)' : 'var(--bg-card)',
                  border: '1px solid var(--border-color)', color: amount === v ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: amount === v ? 700 : 400, transition: 'all 0.15s'
                }}>
                {v.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Pairs */}
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Popular Pairs</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {popularPairs.map(([from, to]) => {
              const rate = rates[from] && rates[to] ? (rates[to] / rates[from]) : 0
              return (
                <button key={`${from}-${to}`} onClick={() => { setFromCurrency(from); setToCurrency(to) }}
                  style={{ background: 'var(--bg-card)', border: `1px solid ${fromCurrency === from && toCurrency === to ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: '12px', padding: '14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>{from} → {to}</div>
                  <div style={{ color: '#fa8c00', fontFamily: 'monospace', fontSize: '13px', marginTop: '4px' }}>
                    1 {from} = {rate > 0 ? rate.toFixed(4) : '...'} {to}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
