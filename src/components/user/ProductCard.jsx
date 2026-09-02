'use client'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { ShoppingBag } from 'lucide-react'
import { addToCartWithSync } from '../../utils/cartHelper'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCartWithSync(product, 1, dispatch)
  }

  const displayPrice = product.discountPrice || product.price
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price
  const discountPct  = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <Link href={`/product/${product._id}`} className="group block">
      {/* Card shell — cream-white bg, rose-tinted 1px border, pastel glow on hover */}
      <div
        className="bg-white rounded-[14px] overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
        style={{
          border:    '1px solid #F5C8D4',
          boxShadow: '0 2px 10px rgba(224,92,136,0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(224,92,136,0.20)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(224,92,136,0.08)'
        }}
      >
        {/* ── IMAGE ── */}
        <div className="relative aspect-[3/4] bg-[#FEF0E3] overflow-hidden rounded-t-[13px]">
          {product.images?.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl">👗</div>
          )}

          {/* Badges — top-left stacked */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isNewArrival && (
              <span
                className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-none"
                style={{ background: '#B5EDDB', color: '#7B2447' }}
              >
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span
                className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-none"
                style={{ background: '#FBDBBB', color: '#7B2447' }}
              >
                BEST SELLER
              </span>
            )}
            {hasDiscount && (
              <span
                className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-none"
                style={{ background: '#E05C88', color: '#fff' }}
              >
                {discountPct}% OFF
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <span
                className="bg-white text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full"
                style={{ color: '#7B2447' }}
              >
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* ── DETAILS ── */}
        <div className="p-2.5 md:p-3 flex flex-col gap-1 flex-1">

          {/* Title — deep berry, serif, 1-line clamp */}
          <h3
            className="font-sans text-[12px] md:text-sm font-semibold line-clamp-1 leading-snug"
            style={{ color: '#7B2447' }}
          >
            {product.name}
          </h3>

          {/* Description — mauve, 2-line clamp, slightly smaller on mobile */}
          {product.description && (
            <p
              className="text-[10px] md:text-[11px] font-sans leading-snug"
              style={{
                color: '#6B4553',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.description}
            </p>
          )}

          {/* Spacer pushes price + button to bottom */}
          <div className="flex-1" />

          {/* Price row */}
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="font-semibold text-[13px] md:text-sm font-sans leading-none"
              style={{ color: '#E05C88' }}
            >
              ₹{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span
                className="text-[10px] md:text-xs line-through font-sans font-normal leading-none"
                style={{ color: '#6B4553' }}
              >
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quick-add button — full-width outlined pill, slides up on hover */}
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="
                mt-1.5 w-full flex items-center justify-center gap-1.5
                border rounded-full py-1.5 md:py-2
                text-[10px] md:text-[11px] font-semibold font-sans
                transition-all duration-200
                opacity-0 translate-y-1
                group-hover:opacity-100 group-hover:translate-y-0
              "
              style={{
                borderColor: '#E05C88',
                color: '#E05C88',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E05C88'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#E05C88'
              }}
              title="Add to Cart"
            >
              <ShoppingBag size={12} />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
