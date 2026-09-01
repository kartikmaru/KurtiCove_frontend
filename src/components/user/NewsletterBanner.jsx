'use client'
import { useState } from 'react'

export default function NewsletterBanner() {
  const [email,      setEmail]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setLoading(true)
    setTimeout(() => { setSubscribed(true); setEmail(''); setLoading(false) }, 800)
  }

  return (
    <section
      className="relative overflow-hidden py-16"
      style={{
        backgroundImage:    'url(/bg%20image/offer%20image.jpg)',
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundRepeat:   'no-repeat',
      }}
    >
      {/* Rose-berry overlay */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'rgba(123,36,71,0.70)' }} aria-hidden="true" />
      {/* Soft glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(248,165,181,0.20) 0%, transparent 70%)' }}
           aria-hidden="true" />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <span className="font-sans text-sm uppercase tracking-widest font-medium"
              style={{ color: '#FBDBBB' }}>
          Stay in the loop
        </span>
        <h2 className="font-cursive text-4xl md:text-5xl font-bold text-white mt-2 mb-3">
          Join the List
        </h2>
        <p className="font-sans text-base mb-8 leading-relaxed"
           style={{ color: 'rgba(251,219,187,0.85)' }}>
          Subscribe for exclusive early access to new collections, style tips, and members-only offers. No spam, ever.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-sans text-sm font-semibold text-white"
               style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" style={{ color: '#B5EDDB' }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            You&apos;re on the list! Thank you.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="flex-1 px-5 py-3.5 rounded-full font-sans text-sm text-white outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.14)',
                border: '2px solid rgba(248,165,181,0.45)',
                placeholderColor: 'rgba(255,255,255,0.50)',
              }}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 rounded-full font-sans font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap text-white disabled:opacity-70"
              style={{ background: '#E05C88' }}
              onMouseEnter={e => e.currentTarget.style.background = '#C94A74'}
              onMouseLeave={e => e.currentTarget.style.background = '#E05C88'}
            >
              {loading ? '...' : 'Subscribe'}
            </button>
          </form>
        )}

        <p className="font-sans text-xs mt-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Join 10,000+ kurti lovers. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
