'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import API from '../../utils/Helper'
import { syncAndLoadCart } from '../../utils/cartHelper'
import toast from 'react-hot-toast'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const CREAM    = '#FCFAE0'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'
const CARD     = '#FFFAF5'

function VerifyOtpContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const dispatch     = useDispatch()
  const email        = searchParams.get('email') || ''

  const [otp,       setOtp]       = useState(['', '', '', '', '', ''])
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const newOtp = [...otp]
    newOtp[idx] = val
    setOtp(newOtp)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pasted.split('').forEach((d, i) => { newOtp[i] = d })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) { toast.error('Please enter the complete 6-digit OTP.'); return }
    setLoading(true)
    try {
      const res = await API.post('/user/verify-otp', { email, otp: Number(otpString) })
      if (res.data.success) {
        const { token, user } = res.data.data
        localStorage.setItem('kc_token', token)
        localStorage.setItem('kc_user', JSON.stringify(user))
        document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 3600}`
        window.dispatchEvent(new Event('kc-auth-changed'))
        await syncAndLoadCart(dispatch)
        toast.success('Email verified! Welcome to Kurti Cove.')
        router.push('/')
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    try {
      await API.post('/user/reset-otp', { email })
      toast.success('New OTP sent to your email.')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4"
          style={{ background: `linear-gradient(160deg, ${CREAM} 0%, #fff7f0 100%)` }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[20px] p-8 text-center"
             style={{ border: `1.5px solid ${BORDER}`, boxShadow: `0 8px 32px rgba(224,92,136,0.12)` }}>

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: `linear-gradient(135deg, ${PINK}, ${ROSE})` }}
          >
            <span className="text-white text-2xl">✉</span>
          </div>

          <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: BERRY }}>
            Verify Your Email
          </h1>
          <p className="font-sans text-sm mb-2" style={{ color: MAUVE }}>
            We sent a 6-digit OTP to
          </p>
          <p className="font-sans text-sm font-semibold mb-6 px-3 py-1.5 rounded-full inline-block"
             style={{ color: BERRY, background: PEACH_LT, border: `1px solid ${BORDER}` }}>
            {email}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP inputs */}
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-11 h-13 md:w-12 md:h-14 text-center text-xl font-bold border-2 rounded-xl font-sans outline-none transition-all"
                  style={{
                    borderColor: digit ? ROSE : BORDER,
                    background:  digit ? PEACH_LT : CARD,
                    color:       BERRY,
                    height: '3.5rem',
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-60"
              style={{ background: ROSE }}
            >
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
          </form>

          <div className="mt-5">
            {countdown > 0 ? (
              <p className="font-sans text-xs" style={{ color: MAUVE }}>
                Resend OTP in{' '}
                <span className="font-bold" style={{ color: ROSE }}>{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="font-sans text-sm font-medium transition-colors"
                style={{ color: ROSE }}
              >
                {resending ? 'Sending…' : 'Resend OTP →'}
              </button>
            )}
          </div>

          <p className="font-sans text-xs mt-4" style={{ color: MAUVE }}>
            OTP is valid for 10 minutes. Check spam folder if not received.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: ROSE, borderTopColor: 'transparent' }} />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
