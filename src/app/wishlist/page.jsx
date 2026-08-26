'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { FiShoppingBag } from 'react-icons/fi'
import { useDispatch } from 'react-redux'
import { addtocart } from '../../redux/features/CartSlice'

const BASE   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
const WL_KEY = 'kc_wishlist'

const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') }
  catch { return [] }
}

// ── Single wishlist card ──────────────────────────────────────
function WishlistCard({ product, onRemove }) {
  const dispatch    = useDispatch()
  const [removing, setRemoving] = useState(false)

  const displayPrice = product.discountPrice || product.price
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price
  const discountPct  = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0
  const previewColors = product.colors?.slice(0, 4) || []
  const extraColors   = (product.colors?.length || 0) - 4

  const handleRemove = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setRemoving(true)
    setTimeout(() => {
      const wl = getWishlist().filter((id) => id !== product._id)
      localStorage.setItem(WL_KEY, JSON.stringify(wl))
      onRemove(product._id)
    }, 300)
  }, [product._id, onRemove])

  const handleAddToCart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(addtocart({
      _id:           product._id,
      name:          product.name,
      price:         product.price,
      discountPrice: product.discountPrice || null,
      images:        product.images || [],
      qty:           1,
    }))
  }, [dispatch, product])

  return (
    <div
      className={[
        'group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-purple-100',
        'transition-all duration-300',
        removing ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
      ].join(' ')}
    >
      <Link href={`/product/${product._id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-purple-50">
          {product.images && product.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">👗</div>
          )}

          {/* Remove from wishlist */}
          <button
            onClick={handleRemove}
            aria-label="Remove from wishlist"
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110"
          >
            <AiFillHeart size={17} className="text-red-500" />
          </button>

          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full font-sans z-10">
              {discountPct}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-semibold text-purple-900 text-sm md:text-base font-sans truncate mb-1.5">
            {product.name}
          </p>

          {/* Price */}
          <div className="flex items-center flex-wrap gap-1.5 mb-2">
            <span className="font-bold text-purple-700 text-lg font-sans">
              ₹{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-gray-400 text-sm line-through font-sans">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {previewColors.length > 0 && (
            <div className="flex items-center gap-1 mb-3">
              {previewColors.map((color, i) => (
                <span
                  key={i}
                  className="inline-block w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {extraColors > 0 && (
                <span className="text-xs text-purple-400 font-sans ml-0.5">+{extraColors}</span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-2.5 text-sm font-medium font-sans transition-colors duration-200"
        >
          <FiShoppingBag size={15} /> Add to Cart
        </button>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-purple-100 animate-pulse">
      <div className="aspect-[3/4] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-200 rounded-xl w-full mt-2" />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function WishlistPage() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const loadWishlist = async () => {
      const ids = getWishlist()
      if (ids.length === 0) { setLoading(false); return }

      try {
        const results = await Promise.all(
          ids.map((id) =>
            fetch(`${BASE}product/${id}`, { cache: 'no-store' })
              .then((r) => r.json())
              .then((d) => (d.success ? d.data : null))
              .catch(() => null)
          )
        )
        setProducts(results.filter(Boolean))
      } catch (err) {
        console.error('Wishlist load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadWishlist()
  }, [])

  const handleRemove = useCallback((removedId) => {
    setProducts((prev) => prev.filter((p) => p._id !== removedId))
  }, [])

  return (
    <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-purple-400 font-sans mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-purple-600 font-medium">Wishlist</span>
        </nav>

        {/* Page heading */}
        <div className="flex items-center gap-3 mb-2">
          <AiFillHeart size={30} className="text-red-400" />
          <h1
            className="text-3xl md:text-4xl font-bold text-purple-900"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            My Wishlist
          </h1>
        </div>
        {!loading && (
          <p className="text-sm text-purple-400 font-sans mb-8">
            {products.length === 0
              ? 'No items saved yet'
              : `${products.length} item${products.length !== 1 ? 's' : ''} saved`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AiOutlineHeart size={80} className="text-purple-200 mb-5" />
            <h2 className="text-xl font-semibold text-gray-500 font-sans mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-gray-400 font-sans mb-8">
              Save items you love and come back to them anytime.
            </p>
            <Link
              href="/shop?filter=isNewArrival"
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-6 py-3 font-sans font-medium text-sm transition-colors"
            >
              Shop New Arrivals →
            </Link>
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
