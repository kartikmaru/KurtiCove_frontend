'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

/* ── Palette ── */
const ROSE   = '#E05C88'
const BERRY  = '#7B2447'
const MAUVE  = '#6B4553'
const PINK   = '#F8A5B5'
const CREAM  = '#FCFAE0'
const BORDER = '#F5C8D4'
const CARD   = '#FFFAF5'

/* ── Input with optional eye toggle for password fields ── */
function InputField({ label, type: initialType = 'text', name, value, onChange, placeholder, required, autoComplete }) {
  const [showPwd, setShowPwd] = useState(false)
  const isPassword = initialType === 'password'
  const fieldType  = isPassword ? (showPwd ? 'text' : 'password') : initialType

  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 font-sans tracking-wide uppercase"
             style={{ color: BERRY }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={fieldType} name={name} value={value} onChange={onChange}
          placeholder={placeholder} required={required} autoComplete={autoComplete}
          className="w-full border rounded-xl px-4 py-3 text-sm font-sans outline-none transition-all"
          style={{
            borderColor: BORDER,
            color:       BERRY,
            background:  CARD,
            paddingRight: isPassword ? '2.75rem' : '1rem',
          }}
          onFocus={(e) => { e.target.style.borderColor = ROSE; e.target.style.boxShadow = `0 0 0 3px ${ROSE}1A` }}
          onBlur={(e)  => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none' }}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={showPwd ? 'Hide password' : 'Show password'}
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
            style={{ color: showPwd ? ROSE : PINK }}
          >
            {showPwd ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form,    setForm]    = useState({ name: '', email: '', password: '', mobile: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required.'); return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.'); return
    }
    setLoading(true)
    try {
      const res = await API.post('/user/create', form)
      if (res.data.success) {
        toast.success('Account created! Check your email for OTP.')
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4"
          style={{ background: `linear-gradient(160deg, ${CREAM} 0%, #fffaf5 100%)` }}>
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl px-8 py-10"
             style={{ border: `1.5px solid ${BORDER}`, boxShadow: `0 8px 40px rgba(224,92,136,0.10)` }}>

          {/* Brand mark */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ background: `linear-gradient(135deg, ${PINK}, ${ROSE})` }}>
              <span className="text-white font-cursive text-2xl font-bold">K</span>
            </div>
            <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: BERRY }}>Join Kurti Cove</h1>
            <p className="font-sans text-sm" style={{ color: MAUVE }}>
              Create your account and start shopping
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Full Name" name="name" value={form.name}
              onChange={handleChange} placeholder="Enter your full name"
              autoComplete="name" required
            />
            <InputField
              label="Email" type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="Enter your email"
              autoComplete="email" required
            />
            <InputField
              label="Mobile" type="tel" name="mobile" value={form.mobile}
              onChange={handleChange} placeholder="Enter your mobile number (optional)"
              autoComplete="tel"
            />
            <InputField
              label="Password" type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="Create a password (min 6 characters)"
              autoComplete="new-password" required
            />

            <button
              type="submit" disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ background: ROSE }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: BORDER }} />
            <span className="text-xs font-sans" style={{ color: PINK }}>or</span>
            <div className="flex-1 h-px" style={{ background: BORDER }} />
          </div>

          <p className="text-center font-sans text-sm mt-5" style={{ color: MAUVE }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold transition-colors" style={{ color: ROSE }}>
              Sign In →
            </Link>
          </p>
        </div>

        <p className="text-center mt-5 font-sans text-xs" style={{ color: PINK }}>
          Join 10,000+ women celebrating Indian ethnic wear
        </p>
      </div>
    </main>
  )
}
