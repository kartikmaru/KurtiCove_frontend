'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { FiArrowRight } from 'react-icons/fi'

const BASE   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
const WL_KEY = 'kc_wishlist'

const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') }
  catch { return [] }
}

// ── Product card ──────────────────────────────────────────────
function ProductCard({ product }) {
  const [inWishlist, setInWishlist] = useState(false)

  useEffect(() => {
    setInWishlist(getWishlist().includes(product._id))
  }, [product._id])

  const toggleWishlist = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const wl   = getWishlist()
    const next = wl.includes(product._id)
      ? wl.filter((id) => id !== product._id)
      : [...wl, product._id]
    localStorage.setItem(WL_KEY, JSON.stringify(next))
    setInWishlist(!inWishlist)
  }, [product._id, inWishlist])

  const img1 = product.images?.[0] || null
  const img2 = product.images?.[1] || img1

  const displayPrice = product.discountPrice || product.price
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price
  const discountPct  = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-purple-200/60 border border-purple-100/40 shadow-md">

      {/* Image container */}
      <div className="relative overflow-hidden rounded-t-3xl" style={{ paddingBottom: '120%' }}>
        <div className="absolute inset-0">
          {img1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img1}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-contain bg-purple-50/50 transition-all duration-700 group-hover:opacity-0 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-50 text-5xl text-purple-300">
              —
            </div>
          )}
          {img2 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img2}
              alt={`${product.name} alt`}
              className="absolute inset-0 w-full h-full object-contain bg-purple-50/50 transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-105"
            />
          )}
        </div>

        <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-violet-600 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg font-sans tracking-wider">
          NEW
        </span>

        <button
          onClick={toggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-125 transition-all duration-300"
        >
          {inWishlist
            ? <AiFillHeart size={18} className="text-red-500" />
            : <AiOutlineHeart size={18} className="text-gray-400" />
          }
        </button>

        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-purple-900/80 via-purple-800/60 to-transparent py-4 px-4 flex items-end justify-center">
          <Link
            href={`/product/${product._id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-center bg-white/95 hover:bg-white text-purple-700 font-semibold text-sm py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 font-sans tracking-wide block"
          >
            Quick Shop
          </Link>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-b from-white to-purple-50/30">
        <p className="font-serif font-semibold text-purple-900 text-lg leading-snug mb-2 line-clamp-1">
          {product.name}
        </p>
        {product.description && (
          <p className="text-xs text-gray-400 font-sans leading-snug mb-2.5"
             style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}{' '}
            <Link
              href={`/product/${product._id}#description`}
              onClick={(e) => e.stopPropagation()}
              className="text-purple-400 hover:text-purple-600 underline underline-offset-2 font-medium whitespace-nowrap transition-colors"
            >
              More
            </Link>
          </p>
        )}
        <div className="flex items-center flex-wrap gap-1">
          <span className="font-medium text-xl text-purple-700 font-sans">
            ₹{displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-400 line-through ml-2 font-sans font-normal">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="bg-green-100 text-green-600 text-xs px-2.5 py-0.5 rounded-full font-medium shadow-sm ml-2 font-sans">
                {discountPct}% OFF
              </span>
            </>
          )}
        </div>
      </div>

      <Link href={`/product/${product._id}`} className="absolute inset-0 z-0" aria-label={product.name} />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse shadow-md border border-purple-100/40">
      <div className="bg-gray-200" style={{ paddingBottom: '120%' }} />
      <div className="p-5 bg-white space-y-3">
        <div className="h-5 bg-gray-200 rounded-full w-4/5" />
        <div className="h-4 bg-gray-200 rounded-full w-1/3" />
        <div className="h-6 bg-gray-200 rounded-full w-2/5" />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOBILE SWIPE SLIDER WITH DOTS
   • Native horizontal scroll + scroll-snap — no JS scrolling, no library
   • IntersectionObserver watches each card and highlights its dot
   • Desktop: hidden, grid renders instead
───────────────────────────────────────────────────────────────────────────── */
function MobileSlider({ products }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef                  = useRef(null)
  const cardRefs                  = useRef([])

  // Observe each card; when it's ≥60% visible it becomes "active"
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

  return (
    <div>
      {/* Scroll track — one card = 100% of the container width */}
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((product, i) => (
          <div
            key={product._id}
            ref={(el) => { cardRefs.current[i] = el }}
            /* Each slide is exactly as wide as the parent minus 2×padding (px-4 = 16px each side) */
            className="flex-shrink-0 snap-center"
            style={{ width: 'calc(100% - 2rem)' }}  /* leave ~1rem peek on each side */
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-4" aria-label="Slider navigation">
        {products.map((_, i) => (
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
                ? 'w-6 h-2.5 bg-purple-500'
                : 'w-2.5 h-2.5 bg-purple-200 hover:bg-purple-400',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function NewArrivals() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res  = await fetch(`${BASE}product?isNewArrival=true&limit=8`, { cache: 'no-store' })
        const data = await res.json()
        if (data.success) setProducts(data.data || [])
      } catch (err) {
        console.error('NewArrivals fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNewArrivals()
  }, [])

  return (
    <section
      className="relative py-16 px-4 md:px-8 overflow-hidden"
      style={{
        backgroundImage:    'url(/bg%20image/newarrival.jpg)',
        backgroundSize:     'cover',
        backgroundPosition: 'center top',
        backgroundRepeat:   'no-repeat',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(250,245,255,0.88)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 bg-clip-text text-transparent text-xs font-bold tracking-[0.3em] uppercase font-sans block mb-2">
              FRESH FROM THE LOOM
            </span>
            <h2 className="bg-gradient-to-r from-purple-800 via-purple-600 to-pink-600 bg-clip-text text-transparent text-4xl md:text-5xl font-bold font-serif leading-tight">
              New Arrivals
            </h2>
          </div>
          <span className="group flex items-center gap-1 ml-4 pb-1">
            <Link
              href="/shop?filter=isNewArrival"
              className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold text-sm flex items-center gap-1"
            >
              VIEW ALL
              <FiArrowRight size={14} className="text-pink-500 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </span>
        </div>

        <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mb-8" />

        {loading ? (
          <>
            {/* Mobile skeleton — single column */}
            <div className="md:hidden">
              <SkeletonCard />
            </div>
            {/* Desktop skeleton — grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : products.length === 0 ? (
          <p className="text-center text-purple-300 text-lg font-sans py-16">
            No new arrivals right now. Check back soon!
          </p>
        ) : (
          <>
            {/* ── MOBILE: one-card swipe slider with dots ── */}
            <div className="md:hidden">
              <MobileSlider products={products} />
            </div>

            {/* ── DESKTOP: unchanged grid ── */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
