'use client'
import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

function SkeletonCard() {
  return (
    <div className="rounded-[14px] overflow-hidden animate-pulse border border-purple-100 shadow-sm">
      <div className="bg-gray-200 aspect-[3/4]" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded-full w-4/5" />
        <div className="h-3 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-200 rounded-full w-3/5" />
        <div className="h-5 bg-gray-200 rounded-full w-2/5" />
      </div>
    </div>
  )
}

export default function SimilarProducts({ productId }) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!productId) return
    const fetchSimilar = async () => {
      try {
        const res  = await fetch(`${BASE}product/similar?productId=${productId}`, { cache: 'no-store' })
        const data = await res.json()
        if (data.success) setProducts(data.data || [])
      } catch (err) {
        console.error('SimilarProducts fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSimilar()
  }, [productId])

  // Don't render section if no similar products and not loading
  if (!loading && products.length === 0) return null

  return (
    <section className="mt-14 border-t border-purple-100 pt-10">
      {/* Heading */}
      <div className="mb-8">
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-xs font-bold tracking-[0.3em] uppercase font-sans block mb-2">
          YOU MAY ALSO LIKE
        </span>
        <h2
          className="text-2xl md:text-3xl font-bold text-purple-900 leading-tight"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          Similar Products
        </h2>
      </div>

      {/* Grid — horizontal scroll on mobile, 4-col on desktop */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Mobile: horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto pb-2 md:hidden scrollbar-hide snap-x snap-mandatory">
            {products.map((p) => (
              <div key={p._id} className="flex-shrink-0 w-[200px] snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
