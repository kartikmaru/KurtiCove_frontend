'use client'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { FiShoppingBag } from 'react-icons/fi'
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
      <div className="bg-white rounded-[14px] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-[#F5C8D4]">

        {/* Image */}
        <div className="relative aspect-[3/4] bg-[#FEF0E3] overflow-hidden">
          {product.images?.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
          )}

          {/* Badges — NEW mint, BEST SELLER peach, DISCOUNT deep rose */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNewArrival && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
                    style={{ background: '#B5EDDB', color: '#7B2447' }}>
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
                    style={{ background: '#FBDBBB', color: '#7B2447' }}>
                BEST SELLER
              </span>
            )}
            {hasDiscount && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
                    style={{ background: '#E05C88', color: '#fff' }}>
                {discountPct}% OFF
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="bg-white text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ color: '#7B2447' }}>
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick add */}
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-white p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0"
              style={{ background: '#E05C88' }}
              title="Add to Cart"
            >
              <FiShoppingBag size={16} />
            </button>
          )}
        </div>

        {/* Details */}
        <div className="p-3">
          <h3 className="font-sans text-sm font-semibold line-clamp-1 mb-1"
              style={{ color: '#7B2447' }}>
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[11px] font-sans leading-snug mb-2"
               style={{
                 color: '#6B4553',
                 display: '-webkit-box',
                 WebkitLineClamp: 2,
                 WebkitBoxOrient: 'vertical',
                 overflow: 'hidden',
               }}>
              {product.description}{' '}
              <Link
                href={`/product/${product._id}#description`}
                onClick={(e) => e.stopPropagation()}
                className="underline underline-offset-2 font-medium whitespace-nowrap transition-colors"
                style={{ color: '#E05C88' }}
              >
                More
              </Link>
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="font-semibold text-base font-sans" style={{ color: '#E05C88' }}>
              ₹{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs line-through font-sans font-normal" style={{ color: '#6B4553' }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
