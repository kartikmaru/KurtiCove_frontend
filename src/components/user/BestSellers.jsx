'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { FiArrowRight } from 'react-icons/fi'

const BASE   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
const WL_KEY = 'kc_wishlist'
const getWishlist = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') } catch { return [] } }

function BestSellerCard({ product }) {
  const [inWishlist, setInWishlist] = useState(false)
  useEffect(() => { setInWishlist(getWishlist().includes(product._id)) }, [product._id])
  const toggleWishlist = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    const wl = getWishlist()
    const next = wl.includes(product._id) ? wl.filter(id => id !== product._id) : [...wl, product._id]
    localStorage.setItem(WL_KEY, JSON.stringify(next))
    setInWishlist(!inWishlist)
  }, [product._id, inWishlist])

  const img1 = product.images?.[0] || null
  const img2 = product.images?.[1] || img1
  const displayPrice = product.discountPrice || product.price
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price
  const discountPct  = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 shadow-card hover:shadow-card-hover border"
         style={{ borderColor: '#F5C8D4' }}>
      <div className="relative overflow-hidden rounded-t-3xl" style={{ paddingBottom: '120%' }}>
        <div className="absolute inset-0" style={{ background: '#FEF0E3' }}>
          {img1 && <img src={img1} alt={product.name} className="absolute inset-0 w-full h-full object-contain transition-all duration-700 group-hover:opacity-0 group-hover:scale-105" />}
          {img2 && <img src={img2} alt={`${product.name} alt`} className="absolute inset-0 w-full h-full object-contain transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-105" />}
        </div>
        {/* BEST SELLER badge — peach */}
        <span className="absolute top-3 left-3 z-10 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm font-sans"
              style={{ background: '#FBDBBB', color: '#7B2447' }}>
          BEST SELLER
        </span>
        <button onClick={toggleWishlist} aria-label="Wishlist"
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 transition-all duration-200">
          {inWishlist ? <AiFillHeart size={18} style={{ color: '#E05C88' }} /> : <AiOutlineHeart size={18} style={{ color: '#6B4553' }} />}
        </button>
        <div className="absolute bottom-0 left-0 right-0 z-10 py-4 px-4 flex items-end justify-center"
             style={{ background: 'linear-gradient(to top, rgba(123,36,71,0.70), transparent)' }}>
          <Link href={`/product/${product._id}`} onClick={e => e.stopPropagation()}
            className="w-full text-center bg-white font-semibold text-sm py-2.5 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 font-sans block"
            style={{ color: '#7B2447' }}>
            Quick Shop
          </Link>
        </div>
      </div>
      <div className="p-5" style={{ background: 'linear-gradient(to bottom, #fff, #FEF0E3)' }}>
        <p className="font-serif font-semibold text-base leading-snug mb-2 line-clamp-1" style={{ color: '#7B2447' }}>{product.name}</p>
        {product.description && (
          <p className="text-xs font-sans leading-snug mb-2.5" style={{ color: '#6B4553', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {product.description}{' '}
            <Link href={`/product/${product._id}#description`} onClick={e => e.stopPropagation()} className="underline underline-offset-2 font-medium" style={{ color: '#E05C88' }}>More</Link>
          </p>
        )}
        <div className="flex items-center flex-wrap gap-1">
          <span className="font-semibold text-lg font-sans" style={{ color: '#E05C88' }}>₹{displayPrice.toLocaleString()}</span>
          {hasDiscount && <>
            <span className="text-sm line-through ml-2 font-sans" style={{ color: '#6B4553' }}>₹{product.price.toLocaleString()}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-1 font-sans" style={{ background: '#B5EDDB', color: '#7B2447' }}>{discountPct}% OFF</span>
          </>}
        </div>
      </div>
      <Link href={`/product/${product._id}`} className="absolute inset-0 z-0" aria-label={product.name} />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse shadow-sm border" style={{ borderColor: '#F5C8D4' }}>
      <div style={{ paddingBottom: '120%', background: '#FBDBBB' }} />
      <div className="p-5 space-y-3" style={{ background: '#FEF0E3' }}>
        <div className="h-5 rounded-full w-4/5" style={{ background: '#F5C8D4' }} />
        <div className="h-4 rounded-full w-1/3" style={{ background: '#F5C8D4' }} />
        <div className="h-5 rounded-full w-2/5" style={{ background: '#F5C8D4' }} />
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
      const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActiveIdx(i) }, { root: trackRef.current, threshold: 0.6 })
      obs.observe(el); observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [products.length])
  return (
    <div>
      <div ref={trackRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2" style={{ scrollbarWidth: 'none' }}>
        {products.map((product, i) => (
          <div key={product._id} ref={el => { cardRefs.current[i] = el }} className="flex-shrink-0 snap-center" style={{ width: 'calc(100% - 2rem)' }}>
            <BestSellerCard product={product} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {products.map((_, i) => (
          <button key={i} onClick={() => { const el = cardRefs.current[i]; if (el) el.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' }) }}
            className="rounded-full transition-all duration-300"
            style={{ width: i === activeIdx ? 24 : 10, height: 10, background: i === activeIdx ? '#FBDBBB' : '#F8A5B5' }} />
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
      .then(r => r.json()).then(d => { if (d.success) setProducts(d.data || []) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <section className="relative py-16 px-4 md:px-8 overflow-hidden"
      style={{ backgroundImage:'url(/bg%20image/best%20seller%20bg.jpg)', backgroundSize:'cover', backgroundPosition:'center' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,255,255,0.87)' }} aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-xs font-bold tracking-[0.3em] uppercase font-sans block mb-2" style={{ color: '#FBDBBB' }}>
              <span style={{ color: '#E05C88' }}>CUSTOMER FAVOURITES</span>
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-serif leading-tight" style={{ color: '#7B2447' }}>Best Sellers</h2>
          </div>
          <span className="group flex items-center gap-1 ml-4 pb-1">
            <Link href="/shop?filter=isBestSeller" className="font-semibold text-sm flex items-center gap-1" style={{ color: '#E05C88' }}>
              VIEW ALL <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </span>
        </div>
        <div className="w-16 h-0.5 rounded-full mb-8" style={{ background: 'linear-gradient(to right,#FBDBBB,#E05C88)' }} />
        {loading ? (
          <>
            <div className="md:hidden"><SkeletonCard /></div>
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">{Array.from({length:4}).map((_,i) => <SkeletonCard key={i} />)}</div>
          </>
        ) : products.length === 0 ? (
          <p className="text-center text-lg font-sans py-16" style={{ color: '#6B4553' }}>No best sellers yet.</p>
        ) : (
          <>
            <div className="md:hidden"><MobileSlider products={products} /></div>
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => <BestSellerCard key={p._id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
