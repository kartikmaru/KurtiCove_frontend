'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Sparkles, BadgePercent, Percent, Star, ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

function discountPct(product) {
  if (!product.discountPrice || product.discountPrice >= product.price) return 0
  return Math.round(((product.price - product.discountPrice) / product.price) * 100)
}

/* ── 2-per-view snap slider (reuses same pattern as SimilarProducts) ── */
function TwoPerViewSlider({ products }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef  = useRef(null)
  const cardRefs  = useRef([])

  useEffect(() => {
    if (!trackRef.current) return
    const observers = []
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIdx(i) },
        { root: trackRef.current, threshold: 0.6 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [products.length])

  const scrollTo = (i) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  return (
    <div className="relative z-10">
      {/* Track */}
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory pb-1"
        style={{ gap: '12px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <style>{`.deals-track::-webkit-scrollbar{display:none}`}</style>
        {products.map((p, i) => (
          <div
            key={p._id}
            ref={(el) => { cardRefs.current[i] = el }}
            className="flex-shrink-0 snap-start deals-track"
            style={{ width: 'calc(50% - 6px)' }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Dots */}
      {products.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === activeIdx ? 22 : 8,
                height:     8,
                background: i === activeIdx ? '#E05C88' : 'rgba(255,255,255,0.5)',
                flexShrink: 0,
              }}
              aria-label={`Go to deal ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FloatDeco({ className, size = 16, Icon = Sparkles, stroke = 1.5 }) {
  return <Icon size={size} strokeWidth={stroke}
    className={`absolute pointer-events-none select-none opacity-20 ${className}`} aria-hidden="true" />
}

/* Skeleton cards for loading state */
function SkeletonSlide() {
  return (
    <div className="relative z-10 flex gap-3">
      {[1, 2].map(i => (
        <div key={i} className="flex-1 flex flex-col gap-2 animate-pulse">
          <div className="aspect-[3/4] rounded-2xl" style={{ background: 'rgba(224,92,136,0.15)' }} />
          <div className="h-4 rounded-full" style={{ background: 'rgba(224,92,136,0.10)' }} />
          <div className="h-3 rounded-full w-2/3" style={{ background: 'rgba(224,92,136,0.08)' }} />
          <div className="h-8 rounded-xl" style={{ background: 'rgba(224,92,136,0.10)' }} />
        </div>
      ))}
    </div>
  )
}

export default function OfferSection() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch(`${BASE}product?limit=100`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          /* Only ≥60% discount, sort highest first, max 4 */
          const qualifying = (d.data || [])
            .filter(p => {
              if (!p.discountPrice || p.discountPrice <= 0 || p.discountPrice >= p.price) return false
              return discountPct(p) >= 60
            })
            .sort((a, b) => discountPct(b) - discountPct(a))
            .slice(0, 4)
          setProducts(qualifying)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* Hide whole section when no qualifying products and not loading */
  if (!loading && products.length === 0) return null

  const maxPct = products.length > 0 ? discountPct(products[0]) : 60

  return (
    <section className="w-full px-4 md:px-8 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-card-hover"
             style={{ border: '1px solid #F5C8D4', minHeight: 320 }}>

          {/* LEFT PANEL — rose→peach gradient */}
          <div className="relative flex-shrink-0 lg:w-[38%] flex flex-col justify-center overflow-hidden px-8 py-10 md:px-12"
               style={{ background: 'linear-gradient(135deg, #E05C88 0%, #F8A5B5 45%, #FBDBBB 100%)' }}>
            <FloatDeco Icon={Sparkles}     size={52} className="top-4 left-4 rotate-12" />
            <FloatDeco Icon={Sparkles}     size={28} className="bottom-8 right-6 -rotate-6" />
            <FloatDeco Icon={BadgePercent} size={76} className="top-1/2 -translate-y-1/2 right-0 translate-x-6" />
            <FloatDeco Icon={Star}         size={18} className="top-14 right-10" />
            <FloatDeco Icon={Star}         size={13} className="bottom-14 left-1/3" />
            <FloatDeco Icon={Percent}      size={26} className="bottom-4 left-4" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 mb-4"
                   style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <BadgePercent size={12} strokeWidth={2} style={{ color: '#fff' }} />
                <span className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-white">Exclusive Deal</span>
              </div>

              <div className="mb-2 leading-none">
                <p className="font-serif text-white leading-none"
                   style={{ fontFamily: 'var(--font-playfair),serif', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 800 }}>
                  Up to
                </p>
                <p className="font-serif leading-none"
                   style={{
                     fontFamily: 'var(--font-playfair),serif',
                     fontSize: 'clamp(3.5rem,8vw,6.5rem)',
                     fontWeight: 900,
                     background: 'linear-gradient(90deg,#ffffff,#FCFAE0)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     backgroundClip: 'text',
                   }}>
                  {maxPct}% OFF
                </p>
              </div>

              <p className="font-serif italic mb-1 text-white/90"
                 style={{ fontFamily: 'var(--font-playfair),serif', fontSize: 'clamp(1rem,2vw,1.35rem)' }}>
                on selected styles
              </p>
              <p className="font-sans text-xs mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                * Limited time offer. While stocks last.
              </p>

              <Link href="/shop"
                className="inline-flex items-center gap-2 font-sans font-bold text-sm px-7 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: '#fff', color: '#E05C88' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FCFAE0' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
                Shop Now <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* RIGHT PANEL — 2-per-view slider */}
          {(loading || products.length > 0) && (
            <div className="relative flex-1 overflow-hidden flex flex-col justify-center px-5 py-8 md:px-8"
                 style={{ background: 'linear-gradient(135deg, #FBDBBB 0%, #FCFAE0 100%)' }}>

              <FloatDeco Icon={Star}     size={16} className="top-6 left-6"    style={{ color: '#E05C88' }} />
              <FloatDeco Icon={Star}     size={10} className="top-16 right-16" style={{ color: '#E05C88' }} />
              <FloatDeco Icon={Sparkles} size={22} className="bottom-5 left-14" style={{ color: '#F8A5B5' }} />
              <FloatDeco Icon={Sparkles} size={13} className="top-3 left-1/2"  style={{ color: '#F8A5B5' }} />

              <div className="relative z-10 mb-4">
                <p className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: '#6B4553' }}>
                  Handpicked Deals
                </p>
                <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight"
                    style={{ fontFamily: 'var(--font-playfair),serif', color: '#7B2447' }}>
                  Big Discounts,<br className="hidden md:block" /> Bigger Style
                </h3>
              </div>

              {loading ? <SkeletonSlide /> : <TwoPerViewSlider products={products} />}

              <div className="relative z-10 mt-4">
                <Link href="/shop"
                  className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold transition-colors"
                  style={{ color: '#E05C88' }}>
                  View all deals <ArrowRight size={11} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
