'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, BadgePercent, Percent, Star, ArrowRight, Tag } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

/* ─────────────────────────────────────────────────────────────────────────────
   Compute discount % from a product object
───────────────────────────────────────────────────────────────────────────── */
function discountPct(product) {
  if (!product.discountPrice || product.discountPrice >= product.price) return 0
  return Math.round(((product.price - product.discountPrice) / product.price) * 100)
}

/* ─────────────────────────────────────────────────────────────────────────────
   RIGHT-PANEL PRODUCT TILE  — compact, max 3 fit side-by-side
───────────────────────────────────────────────────────────────────────────── */
function OfferTile({ product }) {
  const pct = discountPct(product)
  const img = product.images?.[0] || null

  return (
    <Link
      href={`/product/${product._id}`}
      /* On mobile each tile is ~36% of the container width so 3 fit with gaps.
         On desktop they stretch equally inside a flex row. */
      className="group flex-shrink-0 flex flex-col items-center gap-2
                 w-[34%] sm:w-[32%] md:flex-1 md:min-w-0 md:w-auto
                 snap-start"
    >
      {/* Image tile */}
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-white/10 border border-white/20 shadow-md">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={22} className="text-white/30" />
          </div>
        )}

        {/* Discount corner burst */}
        <div
          className="absolute top-1.5 right-1.5 w-9 h-9 rounded-full flex flex-col items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(135deg,#f97316,#ec4899)' }}
        >
          <span className="font-sans text-[8px] font-black text-white leading-none">{pct}%</span>
          <span className="font-sans text-[6px] font-bold text-white/80 leading-none">OFF</span>
        </div>

        {/* Decorative sparkle */}
        <Sparkles
          size={11}
          className="absolute bottom-1.5 left-1.5 text-yellow-200/60 pointer-events-none"
          strokeWidth={1.5}
        />
      </div>

      {/* Label pill */}
      <div className="bg-white/15 border border-white/20 rounded-full px-2 py-1 w-full text-center">
        <p className="font-sans text-[10px] font-semibold text-white line-clamp-1 leading-snug">
          {product.name}
        </p>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span className="font-sans text-[10px] font-bold text-yellow-300">
            ₹{product.discountPrice.toLocaleString()}
          </span>
          <span className="font-sans text-[9px] text-white/40 line-through">
            ₹{product.price.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Decorations
───────────────────────────────────────────────────────────────────────────── */
function FloatDeco({ className, size = 16, Icon = Sparkles, stroke = 1.5 }) {
  return (
    <Icon
      size={size}
      strokeWidth={stroke}
      className={`absolute pointer-events-none select-none opacity-25 ${className}`}
      aria-hidden="true"
    />
  )
}

function CoinBadge({ className, value }) {
  return (
    <div
      className={`absolute pointer-events-none select-none flex items-center justify-center rounded-full border-2 border-white/30 shadow-inner ${className}`}
      style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', width: 34, height: 34 }}
      aria-hidden="true"
    >
      <span className="font-sans text-[8px] font-black text-white leading-none">{value}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function OfferSection() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const fetchOfferProducts = async () => {
      try {
        // Fetch a broad set, sort client-side by discount desc, take top 3.
        // We fetch up to 50 products that have a discountPrice set, then sort.
        const res  = await fetch(`${BASE}product?limit=50`, { cache: 'no-store' })
        const data = await res.json()
        if (data.success) {
          const sorted = (data.data || [])
            .filter((p) => p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price)
            .sort((a, b) => discountPct(b) - discountPct(a))
            .slice(0, 3)
          setProducts(sorted)
        }
      } catch (err) {
        console.error('OfferSection fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOfferProducts()
  }, [])

  // Compute the dynamic headline percentage from the top product
  const maxPct = products.length > 0 ? discountPct(products[0]) : 70

  return (
    <section className="w-full px-4 md:px-8 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl shadow-purple-200/40 min-h-[320px]">

          {/* ══════════════════════════════════════════════════════════
              LEFT PANEL — promo block
          ══════════════════════════════════════════════════════════ */}
          <div
            className="relative flex-shrink-0 lg:w-[42%] flex flex-col justify-center overflow-hidden px-8 py-10 md:px-12"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #C084FC 70%, #E879F9 100%)',
            }}
          >
            <FloatDeco Icon={Sparkles}     size={52}  className="text-white top-4   left-4   rotate-12"  stroke={1}   />
            <FloatDeco Icon={Sparkles}     size={28}  className="text-white bottom-8 right-6  -rotate-6"  stroke={1}   />
            <FloatDeco Icon={BadgePercent} size={76}  className="text-white/10 top-1/2 -translate-y-1/2 right-0 translate-x-6" stroke={1} />
            <FloatDeco Icon={Star}         size={18}  className="text-yellow-200 top-14 right-10"  stroke={1.5} />
            <FloatDeco Icon={Star}         size={13}  className="text-yellow-200 bottom-14 left-1/3" stroke={1.5} />
            <FloatDeco Icon={Percent}      size={26}  className="text-white/15 bottom-4 left-4"    stroke={1}   />

            <div className="relative z-10">
              {/* Eyebrow pill */}
              <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3.5 py-1 mb-4">
                <BadgePercent size={12} className="text-yellow-200" strokeWidth={2} />
                <span className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-white">
                  Exclusive Deal
                </span>
              </div>

              {/* Dynamic headline */}
              <div className="mb-2 leading-none">
                <p
                  className="font-serif text-white leading-none"
                  style={{
                    fontFamily: 'var(--font-playfair), serif',
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Up to
                </p>
                <p
                  className="font-serif leading-none"
                  style={{
                    fontFamily: 'var(--font-playfair), serif',
                    fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(90deg,#ffffff,#fde68a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {/* Uses real max discount; falls back to 70 until products load */}
                  {maxPct}% OFF
                </p>
              </div>

              <p
                className="font-serif text-white/90 italic mb-1"
                style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
              >
                on your first order
              </p>

              <p className="font-sans text-white/45 text-xs mb-6">
                * Terms &amp; conditions apply. Limited time offer.
              </p>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-[#7C3AED] font-sans font-bold text-sm px-7 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 hover:bg-purple-50"
              >
                Shop Now
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT PANEL — top-3 highest-discount products
              Hidden entirely only when not loading and no products at all
          ══════════════════════════════════════════════════════════ */}
          {(loading || products.length > 0) && (
            <div
              className="relative flex-1 overflow-hidden flex flex-col justify-center px-5 py-8 md:px-8"
              style={{ background: 'linear-gradient(135deg, #3B0764 0%, #581C87 50%, #6B21A8 100%)' }}
            >
              {/* Decorations */}
              <CoinBadge className="top-4  right-8"  value={`${maxPct}%`} />
              <CoinBadge className="bottom-6 right-24" value="OFF" />
              <FloatDeco Icon={Star}     size={16} className="text-yellow-200 top-6    left-6"   stroke={1.5} />
              <FloatDeco Icon={Star}     size={10} className="text-yellow-200 top-16   right-16" stroke={1.5} />
              <FloatDeco Icon={Sparkles} size={22} className="text-purple-300 bottom-5 left-14"  stroke={1}   />
              <FloatDeco Icon={Sparkles} size={13} className="text-purple-300 top-3    left-1/2" stroke={1}   />

              {/* Panel heading */}
              <div className="relative z-10 mb-4">
                <p className="font-sans text-white/60 text-[10px] font-semibold tracking-[0.25em] uppercase mb-1">
                  Handpicked Deals
                </p>
                <h3
                  className="font-serif text-white text-xl md:text-2xl font-bold leading-tight"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  Big Discounts,<br className="hidden md:block" /> Bigger Style
                </h3>
              </div>

              {/* Product tiles — exactly 3, no scroll needed */}
              {loading ? (
                <div className="relative z-10 flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 flex flex-col gap-2 animate-pulse">
                      <div className="aspect-[3/4] rounded-xl bg-white/10" />
                      <div className="h-7 rounded-full bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative z-10 flex gap-2 md:gap-3">
                  {products.map((p) => (
                    <OfferTile key={p._id} product={p} />
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="relative z-10 mt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-white/60 hover:text-white font-sans text-xs font-semibold transition-colors"
                >
                  View all deals
                  <ArrowRight size={11} strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
