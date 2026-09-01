'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { Flame, Clock, BadgePercent, ShoppingBag, Sparkles, Star } from 'lucide-react'
import { addToCartWithSync } from '../../utils/cartHelper'

/* ─────────────────────────────────────────────────────────────────────────────
   MARQUEE TICKER
   Pure CSS scroll — zero JS, accessible, pause on hover
───────────────────────────────────────────────────────────────────────────── */
const TICKER_MESSAGES = [
  'Flat Discounts on Every Style',
  'Limited Stock — Don\'t Miss Out',
  'Free Shipping on Orders ₹999+',
  'Handpicked Festive Favourites',
  'Sale Prices for a Limited Time',
  'Exclusive Deals — Today Only',
]

function Ticker() {
  // Duplicate the list so the scroll loop is seamless
  const items = [...TICKER_MESSAGES, ...TICKER_MESSAGES]
  return (
    <div
      className="w-full overflow-hidden border-y border-[#E9D5FF] bg-[#F3E8FF]/60"
      style={{ '--ticker-duration': '28s' }}
    >
      <div
        className="flex items-center gap-0 whitespace-nowrap"
        style={{
          animation: 'tickerScroll var(--ticker-duration) linear infinite',
          willChange: 'transform',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {items.map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-8 py-2.5">
            <BadgePercent size={13} className="text-[#A855F7] flex-shrink-0" />
            <span className="font-sans text-xs font-semibold tracking-wide text-[#6B21A8]">{msg}</span>
            <span className="w-1 h-1 rounded-full bg-[#C084FC] flex-shrink-0" />
          </span>
        ))}
      </div>

      {/* Keyframe injected via style tag — Tailwind can't define custom keyframes without config */}
      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTDOWN TIMER BOX
───────────────────────────────────────────────────────────────────────────── */
function TimerUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#A855F7] text-white rounded-xl px-3.5 py-2 min-w-[52px] text-center shadow-lg shadow-[#A855F7]/30">
        <span className="font-mono text-2xl md:text-3xl font-bold leading-none tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-[#C084FC] mt-1.5">
        {label}
      </span>
    </div>
  )
}

function TimerSep() {
  return (
    <span className="text-[#A855F7] text-2xl font-bold leading-none pb-4 select-none">:</span>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SALE PRODUCT CARD  — rich detail, oversized discount treatment
───────────────────────────────────────────────────────────────────────────── */
function StarRating({ rating, count }) {
  if (!rating) return null
  const full  = Math.floor(rating)
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {stars.map((s) => (
          <Star
            key={s}
            size={10}
            strokeWidth={1.5}
            fill={s <= full ? '#fbbf24' : 'none'}
            className={s <= full ? 'text-amber-400' : 'text-white/30'}
          />
        ))}
      </div>
      {count != null && (
        <span className="font-sans text-[9px] text-white/40 leading-none">({count})</span>
      )}
    </div>
  )
}

function SaleCard({ item }) {
  const dispatch      = useDispatch()
  const product       = item.productId
  const salePrice     = item.salePrice
  const originalPrice = product.price
  const savePct       = Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  const img           = product.images?.[0] || null

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCartWithSync(product, 1, dispatch)
  }

  return (
    <Link
      href={`/product/${product._id}`}
      className="group block rounded-2xl overflow-visible relative"
      style={{ isolation: 'isolate' }}
    >
      {/* ── OVERSIZED DISCOUNT BADGE — overlaps the top of the card ── */}
      <div className="absolute -top-3 -left-1 z-20 flex flex-col items-center leading-none pointer-events-none select-none">
        {/* Burst ring */}
        <div
          className="flex flex-col items-center justify-center rounded-full shadow-xl border-2 border-white/30"
          style={{
            width: 54,
            height: 54,
            background: 'linear-gradient(135deg,#f97316 0%,#ec4899 100%)',
          }}
        >
          <span className="font-sans font-black text-white leading-none"
                style={{ fontSize: 17, letterSpacing: '-0.03em' }}>
            {savePct}%
          </span>
          <span className="font-sans text-[7px] font-bold text-white/80 tracking-wider uppercase leading-none mt-0.5">
            OFF
          </span>
        </div>
      </div>

      {/* ── Card shell ── */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden hover:border-white/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 pt-4">

        {/* Image — square ratio keeps 2-col layout compact */}
        <div className="relative aspect-square mx-2 rounded-xl overflow-hidden bg-white/5">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={28} className="text-white/20" />
            </div>
          )}

          {/* Quick-add cart button — appears on hover */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#A855F7] hover:bg-[#9333EA] text-white p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0"
            title="Add to Cart"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={14} />
          </button>
        </div>

        {/* Card body */}
        <div className="px-3 pb-3 pt-2.5">

          {/* Product name — white, readable on dark bg */}
          <h3 className="font-sans text-xs font-bold text-white leading-snug mb-1 line-clamp-1">
            {product.name}
          </h3>

          {/* Short description — 2-line clamp */}
          {product.description && (
            <p
              className="font-sans leading-snug mb-1.5"
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.45)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.description}{' '}
              <span className="text-purple-300 underline underline-offset-2 font-medium">More</span>
            </p>
          )}

          {/* Star rating + review count */}
          {(product.rating || product.reviewCount) && (
            <div className="mb-1.5">
              <StarRating rating={product.rating} count={product.reviewCount} />
            </div>
          )}

          {/* Pricing — sale price large, original struck through */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-sans font-extrabold text-yellow-300 leading-none"
                  style={{ fontSize: 15 }}>
              ₹{salePrice.toLocaleString()}
            </span>
            <span className="font-sans text-[10px] text-white/35 line-through font-normal">
              ₹{originalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOBILE SWIPE SLIDER — one card visible at a time, snap-center
   Exactly mirrors the pattern used in NewArrivals / BestSellers.
   Each slide is 82% of the container width → ~18% peek of the next card.
───────────────────────────────────────────────────────────────────────────── */
function MobileSaleSlider({ items }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef                  = useRef(null)
  const cardRefs                  = useRef([])

  // IntersectionObserver: whichever card is ≥55% visible becomes active
  useEffect(() => {
    if (!trackRef.current) return
    const observers = []
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIdx(i) },
        { root: trackRef.current, threshold: 0.55 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [items.length])

  return (
    <div>
      {/*
        Outer shell clips the badge overflow on the leading/trailing edges
        but we still need the top overflow visible for the -top-3 badge.
        Solution: overflow-x-hidden + overflow-y-visible trick via a
        negative-margin compensated wrapper.
      */}
      <div className="relative overflow-hidden" style={{ paddingTop: 14 }}>
        {/* The actual scroll track — snap-x, one card per snap point */}
        <div
          ref={trackRef}
          className="flex overflow-x-auto snap-x snap-mandatory pb-2 gap-3"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((item, i) => {
            const product = item.productId
            return (
              <div
                key={product._id || i}
                ref={(el) => { cardRefs.current[i] = el }}
                /*
                  82% width → one card fills view with ~9% peek on each side.
                  flex-shrink-0 + snap-center keeps exactly one card centred.
                */
                className="flex-shrink-0 snap-center"
                style={{ width: '82%' }}
              >
                <SaleCard item={item} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Pagination dots — purple pill for active, small circle for rest */}
      <div className="flex justify-center gap-2 mt-5" aria-label="Festival sale slider navigation">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => {
              const el = cardRefs.current[i]
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }}
            className={[
              'rounded-full transition-all duration-300',
              i === activeIdx
                ? 'w-6 h-2.5 bg-[#A855F7]'
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SALE ENDED STATE
───────────────────────────────────────────────────────────────────────────── */
function SaleEndedBanner({ title }) {
  return (
    <div className="text-center py-10">
      <div className="inline-flex items-center gap-2 bg-[#F3E8FF] border border-[#E9D5FF] rounded-2xl px-6 py-4">
        <Clock size={18} className="text-[#C084FC]" />
        <span className="font-sans text-sm font-semibold text-[#6B21A8]">
          {title} has ended. Check back for future sales.
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   DARK BG VARIANTS (used inside the image-background section)
───────────────────────────────────────────────────────────────────────────── */
function TimerUnitDark({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-xl px-3.5 py-2 min-w-[52px] text-center shadow-lg">
        <span className="font-mono text-2xl md:text-3xl font-bold leading-none tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-white/50 mt-1.5">
        {label}
      </span>
    </div>
  )
}

function TimerSepDark() {
  return (
    <span className="text-white/50 text-2xl font-bold leading-none pb-4 select-none">:</span>
  )
}

function SaleEndedBannerDark({ title }) {
  return (
    <div className="text-center py-10">
      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-6 py-4">
        <Clock size={18} className="text-white/60" />
        <span className="font-sans text-sm font-semibold text-white/80">
          {title} has ended. Check back for future sales.
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN SECTION EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function FestivalSale() {
  const [sale,      setSale]      = useState(null)
  const [timeLeft,  setTimeLeft]  = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [saleEnded, setSaleEnded] = useState(false)
  const [loading,   setLoading]   = useState(true)

  /* ── Fetch active sale ── */
  useEffect(() => {
    const fetchSale = async () => {
      try {
        // Use the raw BASE URL + fetch (not the axios instance) so a 401
        // response from any auth interceptor never silently swallows the call.
        const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
        const res  = await fetch(`${BASE}sale/active`, { cache: 'no-store' })
        if (!res.ok) {
          console.warn('FestivalSale: API returned', res.status)
          setLoading(false)
          return
        }
        const data = await res.json()
        if (data.success && data.data) {
          setSale(data.data)
        }
      } catch (err) {
        // Network error (e.g. Render cold-start) — fail silently, section hidden
        console.warn('FestivalSale fetch error (section hidden):', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSale()
  }, [])

  /* ── Live countdown — ticks every second ── */
  const tick = useCallback(() => {
    if (!sale) return
    const remaining = Math.max(0, Math.floor((new Date(sale.endTime) - Date.now()) / 1000))
    if (remaining <= 0) {
      setSaleEnded(true)
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      return
    }
    const days    = Math.floor(remaining / 86400)
    const hours   = Math.floor((remaining % 86400) / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    const seconds = remaining % 60
    setTimeLeft({ days, hours, minutes, seconds })
  }, [sale])

  useEffect(() => {
    if (!sale) return
    tick() // immediate first tick
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [sale, tick])

  // Nothing to render while loading or no active sale
  if (loading || !sale) return null

  const saleProducts = sale.products?.filter((item) => item.productId) || []
  if (saleProducts.length === 0) return null

  const showDays = timeLeft.days > 0 || (sale && Math.floor((new Date(sale.endTime) - Date.now()) / 86400000) >= 1)

  return (
    <section className="relative w-full overflow-hidden">

      {/* ── Ticker strip ── */}
      <Ticker />

      {/* ── Main sale body — full background image with dark overlay ── */}
      <div
        className="relative py-14 px-4 md:px-8 lg:px-16"
        style={{
          backgroundImage:    'url(/bg%20image/best%20seller%20bg.jpg)',
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundRepeat:   'no-repeat',
        }}
      >
        {/* Dark overlay for text contrast — rgba(0,0,0,0.62) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.62)' }}
          aria-hidden="true"
        />

        {/* Optional: subtle purple tint on top of the black overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(59,7,100,0.18)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* ── Section header ── */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-10">

            {/* Left — title block */}
            <div className="flex-1">
              {/* "SALE" eyebrow with icon */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5">
                  <Flame size={14} className="text-[#E9D5FF]" strokeWidth={2.5} />
                  <span className="font-sans text-xs font-bold tracking-[0.25em] uppercase text-white/80">
                    Sale
                  </span>
                </div>
                <span className="w-10 h-px bg-gradient-to-r from-white/50 to-transparent" />
              </div>

              {/* Large sale title — white on dark bg */}
              <h2
                className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-2 text-white"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {sale.title}
              </h2>

              {/* Supporting line */}
              <p className="font-sans text-sm text-white/70 flex items-center gap-2">
                <Sparkles size={13} className="text-[#C084FC] flex-shrink-0" />
                {sale.subtitle || 'Limited time offers on handpicked styles'}
              </p>
            </div>

            {/* Right — countdown timer */}
            <div className="flex-shrink-0">
              {saleEnded ? (
                <SaleEndedBannerDark title={sale.title} />
              ) : (
                <div>
                  {/* "Offer Ends In" label */}
                  <div className="flex items-center gap-1.5 mb-3 lg:justify-end">
                    <Clock size={13} className="text-white/60" />
                    <span className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-white/60">
                      Offer Ends In
                    </span>
                  </div>

                  {/* Timer units */}
                  <div className="flex items-end gap-2">
                    {showDays && (
                      <>
                        <TimerUnitDark value={timeLeft.days}    label="Days" />
                        <TimerSepDark />
                      </>
                    )}
                    <TimerUnitDark value={timeLeft.hours}   label="Hrs" />
                    <TimerSepDark />
                    <TimerUnitDark value={timeLeft.minutes} label="Min" />
                    <TimerSepDark />
                    <TimerUnitDark value={timeLeft.seconds} label="Sec" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Visual divider ── */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-white/20" />
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1">
              <BadgePercent size={13} className="text-[#C084FC]" />
              <span className="font-sans text-[11px] font-bold text-white/80 tracking-wide uppercase">
                Exclusive Deals
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/20 to-white/20" />
          </div>

          {/* ── Sale ended body state ── */}
          {saleEnded ? (
            <SaleEndedBannerDark title={sale.title} />
          ) : (
            <>
              {/*
                ── MOBILE  : one-card swipe slider with dots  (hidden on md+)
                ── DESKTOP : 4-column grid, max 4 cards        (hidden below md)
                pt-6 on both layouts gives clearance for the -top-3 discount badge.
              */}

              {/* Mobile slider */}
              <div className="md:hidden pt-6">
                <MobileSaleSlider items={saleProducts.slice(0, 4)} />
              </div>

              {/* Desktop 4-column grid */}
              <div className="hidden md:grid md:grid-cols-4 gap-x-5 gap-y-8 pt-6">
                {saleProducts.slice(0, 4).map((item, idx) => (
                  <SaleCard key={item.productId._id || idx} item={item} />
                ))}
              </div>

              {/* Footer CTA */}
              <div className="text-center mt-10">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold text-sm px-8 py-3 rounded-full font-sans transition-all duration-200 hover:shadow-lg hover:shadow-[#A855F7]/40 hover:-translate-y-0.5"
                >
                  <ShoppingBag size={15} />
                  View All Sale Products
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
