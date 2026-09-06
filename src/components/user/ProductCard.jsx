'use client'
import Link from 'next/link'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { useState, useEffect, useCallback } from 'react'

/* ─── Palette ─── */
const ROSE   = '#E05C88'
const BERRY  = '#7B2447'
const MAUVE  = '#6B4553'
const BORDER = '#F0E8EC'

const WL_KEY = 'kc_wishlist'
const getWishlist = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') } catch { return [] } }

/*
  Cloudinary URL transformer — adds auto quality, auto format, and
  width transformation so the browser receives an appropriately-sized
  WebP/AVIF rather than the raw upload.

  If the URL is not a Cloudinary URL (e.g. placeholder), returns it unchanged.
  w=400 matches the typical 2-column card width on mobile/desktop grids.
*/
function cdnImg(url, w = 400) {
  if (!url) return url
  if (!url.includes('res.cloudinary.com')) return url
  // Insert transformation after /upload/ or /image/upload/
  return url.replace(/\/upload\//, `/upload/w_${w},q_auto:good,f_auto,dpr_auto/`)
}

export default function ProductCard({ product, priority = false }) {
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

  const displayPrice = product.discountPrice || product.price
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price
  const imgSrc       = cdnImg(product.images?.[0])

  return (
    <Link href={`/product/${product._id}`} className="group block h-full">
      <div
        className="bg-white rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1"
        style={{ border: `1px solid ${BORDER}`, boxShadow: '0 1px 6px rgba(224,92,136,0.07)' }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(224,92,136,0.16)' }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(224,92,136,0.07)' }}
      >
        {/* ── IMAGE ── */}
        <div className="relative aspect-[3/4] bg-[#fafafa] overflow-hidden">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={product.name}
              /*
                Below-fold cards use lazy loading + async decoding.
                The first card in a hero/above-fold position can pass
                priority=true to get eager + fetchpriority=high.
              */
              loading={priority ? 'eager' : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              fetchPriority={priority ? 'high' : 'low'}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
              width={400}
              height={533}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
          )}

          {/* Out of stock — no marketing badges */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-white text-xs font-semibold px-3 py-1 rounded-full shadow" style={{ color: BERRY }}>
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist heart */}
          <button
            onClick={toggleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 shadow flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            {inWishlist
              ? <AiFillHeart size={15} className="text-red-500" />
              : <AiOutlineHeart size={15} style={{ color: MAUVE }} />}
          </button>
        </div>

        {/* ── DETAILS ── */}
        <div className="p-2.5 md:p-3.5 flex flex-col gap-1 flex-1">

          {/* Product name */}
          <h3 className="font-sans font-bold text-[12px] md:text-sm leading-snug line-clamp-1" style={{ color: BERRY }}>
            {product.name}
          </h3>

          {/* Category */}
          {product.category && (
            <p className="font-sans text-[10px] md:text-[11px] line-clamp-1 leading-none" style={{ color: MAUVE }}>
              {product.category}
            </p>
          )}

          <div className="flex-1 min-h-[4px]" />

          {/* Price */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-sans font-bold text-sm md:text-[15px] leading-none" style={{ color: ROSE }}>
              ₹{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="font-sans text-[10px] md:text-xs line-through leading-none" style={{ color: '#9CA3AF' }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* CTA — navigates to PDP, does NOT add to cart directly */}
          <Link
            href={`/product/${product._id}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 w-full flex items-center justify-center text-white font-sans font-medium text-[11px] md:text-xs py-2 md:py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: ROSE }}
          >
            Buy Now
          </Link>
        </div>
      </div>
    </Link>
  )
}
