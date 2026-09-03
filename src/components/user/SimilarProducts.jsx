'use client'
import { useState, useEffect, useRef } from 'react'
import ProductCard from './ProductCard'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse border flex-shrink-0"
         style={{ borderColor: '#F0E8EC', width: 'calc(50% - 6px)' }}>
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
  2-PER-VIEW SNAP SLIDER
  ─────────────────────────────────────────────────────────────
  • Each card is (50% - gap/2) wide so exactly 2 fit edge-to-edge
  • scroll-snap-type: x mandatory, each card is a snap point
  • IntersectionObserver tracks which card is visually leftmost
    to sync the dot indicator (threshold 0.6)
  • No library — native scroll + CSS snap only
  • Pagination dots below, rose for active
  ─────────────────────────────────────────────────────────────
*/
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

  /* Scroll a specific card into view */
  const scrollTo = (i) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  /* Dot count = number of "pages" where each page advances by 1 card */
  const dotCount = products.length

  return (
    <div>
      {/* Scroll track */}
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory pb-1"
        style={{
          gap: '12px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          /* hide webkit scrollbar */
        }}
      >
        <style>{`.similar-track::-webkit-scrollbar{display:none}`}</style>
        {products.map((p, i) => (
          <div
            key={p._id}
            ref={(el) => { cardRefs.current[i] = el }}
            className="flex-shrink-0 snap-start"
            /* Each card is 50% of container minus half the gap (6px) */
            style={{ width: 'calc(50% - 6px)' }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      {dotCount > 1 && (
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
        <span className="text-xs font-bold tracking-[0.3em] uppercase font-sans block mb-2"
              style={{ color: '#E05C88' }}>
          YOU MAY ALSO LIKE
        </span>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-playfair), serif', color: '#7B2447' }}>
          Similar Products
        </h2>
      </div>

      {loading ? (
        /* Skeleton — 2 per row matching the slider */
        <div className="flex gap-3 overflow-x-hidden">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        /*
          Single layout for both mobile and desktop:
          2-per-view snap slider.
          On wider screens the cards are simply wider (50% of a
          wider container = large comfortable cards).
        */
        <TwoPerViewSlider products={products} />
      )}
    </section>
  )
}
