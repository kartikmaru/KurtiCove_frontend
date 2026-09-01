'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import API from '../../utils/Helper'
import { syncAndLoadCart } from '../../utils/cartHelper'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()

  const [form, setForm] = useState({ email: '', password: '' })
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
        // Notify Header (and any other listener) that auth state changed
        window.dispatchEvent(new Event('kc-auth-changed'))
        await syncAndLoadCart(dispatch)
        toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🌸`)
        const redirect = searchParams.get('redirect') || '/'
        router.push(redirect)
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-[#FAF5FF] to-white flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-[20px] border border-[#E9D5FF] shadow-card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <span className="text-4xl block mb-2">🌸</span>
              <h1 className="font-cursive text-3xl font-bold text-[#3B0764]">Welcome Back</h1>
              <p className="font-sans text-sm text-[#C084FC] mt-1">
                Join thousands of kurti lovers — sign in to your account
              </p>
            </div>

            {/* Error banner */}
            {errorParam === 'unauthorized' && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-sans mb-5 text-center">
                Admin access required. Please login with an admin account.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3B0764] mb-1.5 font-sans">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="priya@example.com"
                  required
                  className="w-full border border-[#E9D5FF] rounded-xl px-4 py-3 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3B0764] mb-1.5 font-sans">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  className="w-full border border-[#E9D5FF] rounded-xl px-4 py-3 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                {loading ? 'Signing in...' : 'Sign In 🌸'}
              </button>
            </form>

            <p className="text-center font-sans text-sm text-[#C084FC] mt-6">
              New to Kurti Cove?{' '}
              <Link href="/register" className="text-[#A855F7] hover:text-[#9333EA] font-semibold transition-colors">
                Create Account →
              </Link>
            </p>
          </div>

          {/* Social proof */}
          <div className="text-center mt-6 font-sans text-xs text-[#C084FC]">
            ✨ Trusted by 10,000+ women across India
          </div>
        </div>
      </main>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
