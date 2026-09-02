'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import API from '../../utils/Helper'
import { syncAndLoadCart } from '../../utils/cartHelper'
import toast from 'react-hot-toast'
import { AlertCircle } from 'lucide-react'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const CREAM    = '#FCFAE0'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'
const CARD     = '#FFFAF5'

function InputField({ label, type, name, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 font-sans" style={{ color: BERRY }}>
        {label}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="w-full border rounded-xl px-4 py-3 text-sm font-sans outline-none transition-all"
        style={{ borderColor: BORDER, color: BERRY, background: CARD }}
        onFocus={(e)  => { e.target.style.borderColor = ROSE; e.target.style.boxShadow = `0 0 0 3px ${ROSE}22` }}
        onBlur={(e)   => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const dispatch     = useDispatch()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const errorParam = searchParams.get('error')
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields.'); return }
    setLoading(true)
    try {
      const res = await API.post('/user/login', form)
      if (res.data.success) {
        const { token, user } = res.data.data
        localStorage.setItem('kc_token', token)
        localStorage.setItem('kc_user', JSON.stringify(user))
        document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 3600}`
        window.dispatchEvent(new Event('kc-auth-changed'))
        await syncAndLoadCart(dispatch)
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
        router.push(searchParams.get('redirect') || '/')
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4"
          style={{ background: `linear-gradient(160deg, ${CREAM} 0%, #fff7f0 100%)` }}>
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-[20px] p-8"
             style={{ border: `1.5px solid ${BORDER}`, boxShadow: `0 8px 32px rgba(224,92,136,0.12)` }}>

          {/* Brand mark */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: `linear-gradient(135deg, ${PINK}, ${ROSE})` }}
            >
              <span className="text-white font-cursive text-2xl font-bold">K</span>
            </div>
            <h1 className="font-serif text-3xl font-bold mb-1" style={{ color: BERRY }}>Welcome Back</h1>
            <p className="font-sans text-sm" style={{ color: MAUVE }}>
              Sign in to your Kurti Cove account
            </p>
          </div>

          {/* Error banner */}
          {errorParam === 'unauthorized' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-sans mb-5">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              Admin access required. Please login with an admin account.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Email Address" type="email" name="email"
              value={form.email} onChange={handleChange} placeholder="priya@example.com" required />
            <InputField label="Password" type="password" name="password"
              value={form.password} onChange={handleChange} placeholder="Your password" required />

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 mt-2"
              style={{ background: ROSE }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center font-sans text-sm mt-6" style={{ color: MAUVE }}>
            New to Kurti Cove?{' '}
            <Link href="/register"
              className="font-semibold transition-colors"
              style={{ color: ROSE }}>
              Create Account →
            </Link>
          </p>
        </div>

        {/* Social proof */}
        <div className="text-center mt-5 font-sans text-xs" style={{ color: PINK }}>
          Trusted by 10,000+ women across India
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: ROSE, borderTopColor: 'transparent' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
