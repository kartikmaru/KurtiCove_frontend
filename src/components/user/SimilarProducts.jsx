'use client'
import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

function SkeletonCard() {
  return (
    <div className="rounded-[14px] overflow-hidden animate-pulse border" style={{ borderColor: '#F5C8D4' }}>
      <div className="aspect-[3/4]" style={{ background: '#FBDBBB' }} />
      <div className="p-3 space-y-2" style={{ background: '#FEF0E3' }}>
        <div className="h-4 rounded-full w-4/5" style={{ background: '#F5C8D4' }} />
        <div className="h-3 rounded-full w-full" style={{ background: '#F5C8D4' }} />
        <div className="h-5 rounded-full w-2/5" style={{ background: '#F5C8D4' }} />
      </div>
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
      <div className="mb-8">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Mobile: horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto pb-2 md:hidden snap-x snap-mandatory"
               style={{ scrollbarWidth: 'none' }}>
            {products.map(p => (
              <div key={p._id} className="flex-shrink-0 w-[200px] snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </>
      )}
    </section>
  )
}
