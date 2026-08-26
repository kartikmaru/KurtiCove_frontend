'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import API from '../../utils/Helper'
import { syncAndLoadCart } from '../../utils/cartHelper'
import toast from 'react-hot-toast'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
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
        await syncAndLoadCart(dispatch)
        toast.success('Email verified! Welcome to Kurti Cove 🌸')
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
    <>
      <main className="min-h-screen bg-gradient-to-b from-[#FAF5FF] to-white flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[20px] border border-[#E9D5FF] shadow-card p-8 text-center">
            <span className="text-5xl block mb-4">📧</span>
            <h1 className="font-cursive text-3xl font-bold text-[#3B0764] mb-2">Verify Your Email</h1>
            <p className="font-sans text-sm text-[#C084FC] mb-2">
              We sent a 6-digit OTP to
            </p>
            <p className="font-sans text-sm font-semibold text-[#3B0764] mb-6 bg-[#F3E8FF] px-3 py-1.5 rounded-full inline-block">
              {email}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP inputs */}
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl font-sans text-[#3B0764] focus:outline-none transition-all ${
                      digit ? 'border-[#A855F7] bg-[#FAF5FF]' : 'border-[#E9D5FF] bg-white focus:border-[#A855F7]'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg"
              >
                {loading ? 'Verifying...' : 'Verify OTP ✓'}
              </button>
            </form>

            <div className="mt-5">
              {countdown > 0 ? (
                <p className="font-sans text-xs text-[#C084FC]">
                  Resend OTP in <span className="font-bold text-[#A855F7]">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="font-sans text-sm text-[#A855F7] hover:text-[#9333EA] font-medium transition-colors"
                >
                  {resending ? 'Sending...' : 'Resend OTP →'}
                </button>
              )}
            </div>

            <p className="font-sans text-xs text-[#C084FC] mt-4">
              OTP is valid for 10 minutes. Check spam folder if not received.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
