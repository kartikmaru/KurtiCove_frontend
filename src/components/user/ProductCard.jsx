'use client'
import Link from 'next/link'
import { Heart } from 'lucide-react'
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
  UNIFIED PRODUCT CARD — used on home sections, shop grid, similar products.
  Reference design:
    • White card, rounded-2xl, soft rose border, lift on hover
    • Large image filling top (3:4 ratio, object-contain on white/light bg)
    • Name — bold berry, sans, 1-line clamp
    • Category — small muted mauve, 1-line clamp
    • Price row — selling price bold rose, struck-through original muted
    • Full-width "View Details" button → navigates to PDP (NO direct add-to-cart)
    • Wishlist heart — top-right corner of image
    • NO badges/labels of any kind
*/
export default function ProductCard({ product }) {
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

  return (
    <Link href={`/product/${product._id}`} className="group block h-full">
      <div
        className="bg-white rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1"
        style={{
          border:    `1px solid ${BORDER}`,
          boxShadow: '0 1px 6px rgba(224,92,136,0.07)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(224,92,136,0.16)' }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(224,92,136,0.07)' }}
      >
        {/* ── IMAGE ── */}
        <div className="relative aspect-[3/4] bg-[#fafafa] overflow-hidden">
          {product.images?.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
          )}

          {/* Out of stock overlay — no badges */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-white text-xs font-semibold px-3 py-1 rounded-full shadow"
                    style={{ color: BERRY }}>Out of Stock</span>
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
          <h3
            className="font-sans font-bold text-[12px] md:text-sm leading-snug line-clamp-1"
            style={{ color: BERRY }}
          >
            {product.name}
          </h3>

          {/* Category / type line — muted mauve */}
          {product.category && (
            <p className="font-sans text-[10px] md:text-[11px] line-clamp-1 leading-none"
               style={{ color: MAUVE }}>
              {product.category}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1 min-h-[4px]" />

          {/* Price row */}
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

          {/* Full-width CTA — navigates to PDP, does NOT add to cart directly */}
          <Link
            href={`/product/${product._id}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 w-full flex items-center justify-center text-white font-sans font-medium text-[11px] md:text-xs py-2 md:py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: ROSE }}
          >
            View Details
          </Link>
        </div>
      </div>
    </Link>
  )
}
