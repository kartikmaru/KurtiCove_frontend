'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import ProductCard from './ProductCard'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ border: '1px solid #F0E8EC' }}>
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

function MobileSlider({ products }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef = useRef(null)
  const cardRefs = useRef([])

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
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((product, i) => (
          <div
            key={product._id}
            ref={(el) => { cardRefs.current[i] = el }}
            className="flex-shrink-0 snap-center"
            style={{ width: 'calc(50% - 6px)' }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = cardRefs.current[i]
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }}
            className="rounded-full transition-all duration-300"
            style={{
              width:      i === activeIdx ? 24 : 10,
              height:     10,
              background: i === activeIdx ? '#FBDBBB' : '#F8A5B5',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function BestSellers() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch(`${BASE}product?isBestSeller=true&limit=8`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setProducts(d.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      className="relative py-14 px-4 md:px-8 overflow-hidden"
      style={{
        backgroundImage: 'url(/bg%20image/best%20seller%20bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,255,255,0.90)' }} aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-xs font-bold tracking-[0.3em] uppercase font-sans block mb-2" style={{ color: '#E05C88' }}>
              CUSTOMER FAVOURITES
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif leading-tight" style={{ color: '#7B2447' }}>
              Best Sellers
            </h2>
          </div>
          <Link href="/shop?filter=isBestSeller"
            className="group font-semibold text-sm flex items-center gap-1 ml-4 pb-1"
            style={{ color: '#E05C88' }}>
            VIEW ALL <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="w-16 h-0.5 rounded-full mb-8"
             style={{ background: 'linear-gradient(to right,#FBDBBB,#E05C88)' }} />

        {loading ? (
          <>
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : products.length === 0 ? (
          <p className="text-center text-base font-sans py-12" style={{ color: '#6B4553' }}>No best sellers yet.</p>
        ) : (
          <>
            <div className="md:hidden">
              <MobileSlider products={products} />
            </div>
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
