'use client'
import { useState, useEffect, useRef } from 'react'
import ProductCard from './ProductCard'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

function SkeletonCard({ width }) {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse border flex-shrink-0"
         style={{ borderColor: '#F0E8EC', width }}>
      <div className="aspect-[3/4] bg-gray-100" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 rounded-full w-4/5 bg-gray-100" />
        <div className="h-3 rounded-full w-1/2 bg-gray-100" />
        <div className="h-4 rounded-full w-2/5 bg-gray-100" />
        <div className="h-8 rounded-xl w-full bg-gray-100 mt-1" />
      </div>
    </div>
  )
}

/*
  RESPONSIVE SLIDER
  ─────────────────────────────────────────────────────────────
  Mobile (<768px)  → 2 cards per view  (calc(50% - 6px))
  Desktop (≥768px) → 5 cards per view  (calc(20% - 10px))

  Both use scroll-snap + IntersectionObserver for synced dots.
  Card width is set via a CSS custom property --card-w injected
  once on mount and updated on resize.
─────────────────────────────────────────────────────────────*/
function ResponsiveSlider({ products }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [cardWidth, setCardWidth] = useState('calc(50% - 6px)')
  const [perView,   setPerView]   = useState(2)
  const trackRef  = useRef(null)
  const cardRefs  = useRef([])
  const wrapRef   = useRef(null)

  /* Recalculate card width on mount and on resize */
  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 768
      setPerView(mobile ? 2 : 5)
      setCardWidth(mobile ? 'calc(50% - 6px)' : 'calc(20% - 10px)')
    }
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  /* IntersectionObserver — update active dot */
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
    return () => observers.forEach(o => o.disconnect())
  }, [products.length, perView])

  const scrollTo = i => {
    cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  /*
    Dot count: number of distinct "page positions".
    For 2-per-view on 8 items → 8 dots (scrolls 1 card at a time).
    For 5-per-view on 8 items → show every item's dot (user can snap to any).
  */
  const dotCount = products.length

  return (
    <div ref={wrapRef}>
      {/* Track */}
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory pb-1"
        style={{ gap: '12px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <style>{`.sim-track::-webkit-scrollbar{display:none}`}</style>
        {products.map((p, i) => (
          <div
            key={p._id}
            ref={el => { cardRefs.current[i] = el }}
            className="flex-shrink-0 snap-start sim-track"
            style={{ width: cardWidth, transition: 'width 0.2s' }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Dots */}
      {dotCount > perView && (
        <div className="flex justify-center gap-2 mt-4" aria-label="Similar products navigation">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to product ${i + 1}`}
              onClick={() => scrollTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === activeIdx ? 22 : 8,
                height:     8,
                background: i === activeIdx ? '#E05C88' : '#F8A5B5',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SimilarProducts({ productId }) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!productId) return
    fetch(`${BASE}product/similar?productId=${productId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  if (!loading && products.length === 0) return null

  return (
    <section className="mt-14 pt-10 border-t" style={{ borderColor: '#F5C8D4' }}>
      <div className="mb-6">
        <span className="text-xs font-bold tracking-[0.3em] uppercase font-sans block mb-2" style={{ color: '#E05C88' }}>
          YOU MAY ALSO LIKE
        </span>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight" style={{ fontFamily: 'var(--font-playfair), serif', color: '#7B2447' }}>
          Similar Products
        </h2>
      </div>

      {loading ? (
        /* Skeleton — matches the responsive card width pattern */
        <div className="flex gap-3 overflow-x-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} width="calc(20% - 10px)" />
          ))}
        </div>
      ) : (
        <ResponsiveSlider products={products} />
      )}
    </section>
  )
}
