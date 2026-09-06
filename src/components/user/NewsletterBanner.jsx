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
        /* Soft pastel gradient — cream → peach → gentle rose wash */
        background: 'linear-gradient(135deg, #FCFAE0 0%, #FEF0E3 50%, #fce8ee 100%)',
      }}
    >
      {/* Subtle rose radial bloom at the bottom */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(224,92,136,0.10) 0%, transparent 70%)' }}
           aria-hidden="true" />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">

        {/* Eyebrow */}
        <span className="font-sans text-xs uppercase tracking-[0.25em] font-semibold"
              style={{ color: '#E05C88' }}>
          Stay in the loop
        </span>

        {/* Heading */}
        <h2 className="font-cursive text-4xl md:text-5xl font-bold mt-2 mb-3"
            style={{ color: '#7B2447' }}>
          Join the List
        </h2>

        {/* Subtext */}
        <p className="font-sans text-sm md:text-base mb-8 leading-relaxed"
           style={{ color: '#6B4553' }}>
          Subscribe for exclusive early access to new collections, style tips, and members-only offers.{' '}
          <span style={{ color: '#E05C88', fontWeight: 600 }}>No spam, ever.</span>
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-sans text-sm font-semibold"
               style={{ background: '#B5EDDB', color: '#7B2447', border: '1px solid #8ED8C3' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round">
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
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 rounded-full font-sans text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.80)',
                border: '1.5px solid #F5C8D4',
                color: '#7B2447',
              }}
              onFocus={(e)  => { e.target.style.borderColor = '#E05C88'; e.target.style.boxShadow = '0 0 0 3px rgba(224,92,136,0.12)' }}
              onBlur={(e)   => { e.target.style.borderColor = '#F5C8D4'; e.target.style.boxShadow = 'none' }}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 rounded-full font-sans font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap text-white disabled:opacity-70"
              style={{ background: '#E05C88' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#C94A74' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E05C88' }}
            >
              {loading ? '…' : 'Subscribe'}
            </button>
          </form>
        )}

        <p className="font-sans text-xs mt-4" style={{ color: '#6B4553', opacity: 0.7 }}>
          Join 10,000+ kurti lovers. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
