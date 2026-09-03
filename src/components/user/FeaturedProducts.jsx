'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, BadgePercent, Percent, Star, ArrowRight, Tag } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

function discountPct(product) {
  if (!product.discountPrice || product.discountPrice >= product.price) return 0
  return Math.round(((product.price - product.discountPrice) / product.price) * 100)
}

function OfferTile({ product }) {
  const pct = discountPct(product)
  const img = product.images?.[0] || null
  return (
    <Link href={`/product/${product._id}`}
      className="group flex-shrink-0 flex flex-col items-center gap-2 w-[34%] sm:w-[32%] md:flex-1 md:min-w-0 md:w-auto snap-start">
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md border"
           style={{ background: '#FEF0E3', borderColor: '#F5C8D4' }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={22} style={{ color: '#F5C8D4' }} />
          </div>
        )}
        {/* Discount burst */}
        <div className="absolute top-1.5 right-1.5 w-9 h-9 rounded-full flex flex-col items-center justify-center shadow-md"
             style={{ background: '#E05C88' }}>
          <span className="font-sans text-[8px] font-black text-white leading-none">{pct}%</span>
          <span className="font-sans text-[6px] font-bold leading-none" style={{ color: 'rgba(255,255,255,0.8)' }}>OFF</span>
        </div>
        <Sparkles size={11} className="absolute bottom-1.5 left-1.5 pointer-events-none"
          style={{ color: 'rgba(251,219,187,0.7)' }} strokeWidth={1.5} />
      </div>
      <div className="rounded-full px-2 py-1 w-full text-center border"
           style={{ background: 'rgba(251,219,187,0.4)', borderColor: '#F5C8D4' }}>
        <p className="font-sans text-[10px] font-semibold line-clamp-1 leading-snug" style={{ color: '#7B2447' }}>
          {product.name}
        </p>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span className="font-sans text-[10px] font-bold" style={{ color: '#E05C88' }}>
            ₹{product.discountPrice.toLocaleString()}
          </span>
          <span className="font-sans text-[9px] line-through" style={{ color: '#6B4553' }}>
            ₹{product.price.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}

function FloatDeco({ className, size=16, Icon=Sparkles, stroke=1.5 }) {
  return <Icon size={size} strokeWidth={stroke}
    className={`absolute pointer-events-none select-none opacity-20 ${className}`} aria-hidden="true" />
}

export default function OfferSection() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch(`${BASE}product?limit=100`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          /* ── Only show products with ≥60% discount ── */
          const qualifying = (d.data || [])
            .filter(p => {
              if (!p.discountPrice || p.discountPrice <= 0 || p.discountPrice >= p.price) return false
              return discountPct(p) >= 60
            })
            .sort((a, b) => discountPct(b) - discountPct(a))
            .slice(0, 3)
          setProducts(qualifying)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* Hide entire section (not just right panel) if no qualifying products */
  if (!loading && products.length === 0) return null

  const maxPct = products.length > 0 ? discountPct(products[0]) : 60

  return (
    <section className="w-full px-4 md:px-8 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-card-hover min-h-[320px]"
             style={{ border: '1px solid #F5C8D4' }}>

          {/* LEFT PANEL — rose→peach gradient */}
          <div className="relative flex-shrink-0 lg:w-[42%] flex flex-col justify-center overflow-hidden px-8 py-10 md:px-12"
               style={{ background: 'linear-gradient(135deg, #E05C88 0%, #F8A5B5 45%, #FBDBBB 100%)' }}>
            <FloatDeco Icon={Sparkles}     size={52} className="top-4 left-4 rotate-12"   style={{ color:'rgba(255,255,255,0.3)' }} />
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
                   style={{ fontFamily:'var(--font-playfair),serif', fontSize:'clamp(2.5rem,5vw,4rem)', fontWeight:800 }}>
                  Up to
                </p>
                <p className="font-serif leading-none"
                   style={{
                     fontFamily:'var(--font-playfair),serif',
                     fontSize:'clamp(3.5rem,8vw,6.5rem)',
                     fontWeight:900,
                     background:'linear-gradient(90deg,#ffffff,#FCFAE0)',
                     WebkitBackgroundClip:'text',
                     WebkitTextFillColor:'transparent',
                     backgroundClip:'text',
                   }}>
                  {maxPct}% OFF
                </p>
              </div>

              <p className="font-serif italic mb-1 text-white/90"
                 style={{ fontFamily:'var(--font-playfair),serif', fontSize:'clamp(1rem,2vw,1.35rem)' }}>
                on your first order
              </p>
              <p className="font-sans text-xs mb-6" style={{ color:'rgba(255,255,255,0.55)' }}>
                * T&amp;C apply. Limited time offer.
              </p>

              <Link href="/shop"
                className="inline-flex items-center gap-2 font-sans font-bold text-sm px-7 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ background:'#fff', color:'#E05C88' }}
                onMouseEnter={e => e.currentTarget.style.background='#FCFAE0'}
                onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                Shop Now <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* RIGHT PANEL — only rendered when loading or qualifying products exist */}
          {(loading || products.length > 0) && (
            <div className="relative flex-1 overflow-hidden flex flex-col justify-center px-5 py-8 md:px-8"
                 style={{ background: 'linear-gradient(135deg, #FBDBBB 0%, #FCFAE0 100%)' }}>

              <FloatDeco Icon={Star}     size={16} className="top-6 left-6"   style={{ color:'#E05C88' }} />
              <FloatDeco Icon={Star}     size={10} className="top-16 right-16" style={{ color:'#E05C88' }} />
              <FloatDeco Icon={Sparkles} size={22} className="bottom-5 left-14" style={{ color:'#F8A5B5' }} />
              <FloatDeco Icon={Sparkles} size={13} className="top-3 left-1/2"   style={{ color:'#F8A5B5' }} />

              <div className="relative z-10 mb-4">
                <p className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color:'#6B4553' }}>
                  Handpicked Deals
                </p>
                <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight"
                    style={{ fontFamily:'var(--font-playfair),serif', color:'#7B2447' }}>
                  Big Discounts,<br className="hidden md:block" /> Bigger Style
                </h3>
              </div>

              {loading ? (
                <div className="relative z-10 flex gap-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex-1 flex flex-col gap-2 animate-pulse">
                      <div className="aspect-[3/4] rounded-xl" style={{ background:'rgba(224,92,136,0.15)' }} />
                      <div className="h-7 rounded-full" style={{ background:'rgba(224,92,136,0.10)' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative z-10 flex gap-2 md:gap-3">
                  {products.map(p => <OfferTile key={p._id} product={p} />)}
                </div>
              )}

              <div className="relative z-10 mt-4">
                <Link href="/shop"
                  className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold transition-colors"
                  style={{ color:'#E05C88' }}>
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
