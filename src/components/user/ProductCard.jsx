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
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <Link href={`/product/${product._id}`} className="group block">
      <div className="bg-white rounded-[14px] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-[#E9D5FF]">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-purple-50 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNewArrival && (
              <span className="bg-[#A855F7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
            )}
            {product.isBestSeller && (
              <span className="bg-[#3B0764] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BEST SELLER</span>
            )}
            {hasDiscount && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{discountPct}% OFF</span>
            )}
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-[#3B0764] text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Quick add button */}
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#A855F7] hover:bg-[#9333EA] text-white p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0"
              title="Add to Cart"
            >
              <FiShoppingBag size={16} />
            </button>
          )}
        </div>

        {/* Details */}
        <div className="p-3">
          <h3 className="font-sans text-sm font-semibold text-[#3B0764] line-clamp-1 mb-1">{product.name}</h3>

          {/* Short description — 2-line clamp */}
          {product.description && (
            <p className="text-[11px] text-gray-400 font-sans leading-snug mb-2"
               style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.description}
              {' '}
              <Link
                href={`/product/${product._id}#description`}
                onClick={(e) => e.stopPropagation()}
                className="text-purple-400 hover:text-purple-600 underline underline-offset-2 font-medium whitespace-nowrap transition-colors"
              >
                More
              </Link>
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-purple-700 text-base font-sans">₹{displayPrice.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through font-sans font-normal">₹{product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
