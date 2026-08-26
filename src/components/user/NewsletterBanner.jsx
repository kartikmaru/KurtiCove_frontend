'use client'
import { useState } from 'react'

export default function NewsletterBanner() {
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setLoading(true)
    setTimeout(() => {
      setSubscribed(true)
      setEmail('')
      setLoading(false)
    }, 800)
  }

  return (
    <section
      className="relative overflow-hidden py-16"
      style={{
        backgroundImage:    'url(/bg%20image/salebg.jpg)',
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundRepeat:   'no-repeat',
      }}
    >
      {/* Dark purple-tinted overlay for contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(59,7,100,0.72)' }}
        aria-hidden="true"
      />
      {/* Soft inner glow so it doesn't feel completely flat */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.25) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <span className="font-sans text-[#E9D5FF] text-sm uppercase tracking-widest font-medium">Stay in the loop</span>
        <h2 className="font-cursive text-4xl md:text-5xl font-bold text-white mt-2 mb-3">
          Join the List
        </h2>
        <p className="font-sans text-[#E9D5FF]/80 text-base mb-8 leading-relaxed">
          Subscribe for exclusive early access to new collections, style tips, and members-only offers. No spam, ever.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-6 py-3.5 font-sans text-sm font-semibold text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C084FC]"><polyline points="20 6 9 17 4 12"/></svg>
            You&apos;re on the list! Thank you.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="flex-1 px-5 py-3.5 rounded-full border-2 border-white/30 bg-white/15 backdrop-blur-sm font-sans text-sm text-white placeholder-white/50 outline-none focus:border-[#C084FC] focus:ring-2 focus:ring-[#A855F7]/30 transition-all"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-70 text-white px-7 py-3.5 rounded-full font-sans font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#A855F7]/40 hover:-translate-y-0.5 whitespace-nowrap"
            >
              {loading ? '...' : 'Subscribe'}
            </button>
          </form>
        )}

        <p className="font-sans text-xs text-white/40 mt-4">
          Join 10,000+ kurti lovers. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
