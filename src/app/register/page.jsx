'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required.')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await API.post('/user/create', form)
      if (res.data.success) {
        toast.success('Account created! Check your email for OTP 📧')
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-[#FAF5FF] to-white flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[20px] border border-[#E9D5FF] shadow-card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <span className="text-4xl block mb-2">🌸</span>
              <h1 className="font-cursive text-3xl font-bold text-[#3B0764]">Join Kurti Cove</h1>
              <p className="font-sans text-sm text-[#C084FC] mt-1">
                Create your account and explore our ethnic wear collection
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3B0764] mb-1.5 font-sans">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Priya Sharma"
                  required
                  className="w-full border border-[#E9D5FF] rounded-xl px-4 py-3 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3B0764] mb-1.5 font-sans">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="priya@example.com"
                  required
                  className="w-full border border-[#E9D5FF] rounded-xl px-4 py-3 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3B0764] mb-1.5 font-sans">Mobile (optional)</label>
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full border border-[#E9D5FF] rounded-xl px-4 py-3 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3B0764] mb-1.5 font-sans">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  className="w-full border border-[#E9D5FF] rounded-xl px-4 py-3 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                {loading ? 'Creating Account...' : 'Create Account 🌸'}
              </button>
            </form>

            <p className="text-center font-sans text-sm text-[#C084FC] mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[#A855F7] hover:text-[#9333EA] font-semibold transition-colors">
                Sign In →
              </Link>
            </p>
          </div>

          <div className="text-center mt-6 font-sans text-xs text-[#C084FC]">
            ✨ Join 10,000+ women celebrating Indian ethnic wear
          </div>
        </div>
      </main>
    </>
  )
}
