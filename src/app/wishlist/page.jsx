'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { addToCartWithSync } from '../../utils/cartHelper'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const PEACH    = '#FBDBBB'
const CREAM    = '#FCFAE0'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'

const BASE   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
const WL_KEY = 'kc_wishlist'

const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') }
  catch { return [] }
}

/* ── Single wishlist card ── */
function WishlistCard({ product, onRemove }) {
  const dispatch     = useDispatch()
  const [removing,   setRemoving]   = useState(false)
  const [addingCart, setAddingCart] = useState(false)

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

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAddingCart(true)
    await addToCartWithSync(product, 1, dispatch)
    setAddingCart(false)
  }, [dispatch, product])

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
        removing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{ border: `1px solid ${BORDER}`, boxShadow: `0 2px 10px rgba(224,92,136,0.08)` }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(224,92,136,0.18)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(224,92,136,0.08)' }}
    >
      <Link href={`/product/${product._id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: PEACH_LT }}>
          {product.images && product.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl">👗</div>
          )}

          {/* Remove button */}
          <button
            onClick={handleRemove}
            aria-label="Remove from wishlist"
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110"
          >
            <Heart size={16} fill="#ef4444" className="text-red-500" />
          </button>

          {hasDiscount && (
            <span
              className="absolute top-3 left-3 z-10 text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: ROSE }}
            >
              {discountPct}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 md:p-4">
          <p className="font-semibold text-sm md:text-base font-sans truncate mb-1.5" style={{ color: BERRY }}>
            {product.name}
          </p>

          {/* Price */}
          <div className="flex items-center flex-wrap gap-1.5 mb-2">
            <span className="font-bold text-base md:text-lg font-sans" style={{ color: ROSE }}>
              ₹{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm line-through font-sans" style={{ color: MAUVE }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {previewColors.length > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {previewColors.map((color, i) => (
                <span
                  key={i}
                  className="inline-block w-3.5 h-3.5 rounded-full border border-white flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: color.toLowerCase(), outline: `1px solid ${BORDER}` }}
                  title={color}
                />
              ))}
              {extraColors > 0 && (
                <span className="text-xs font-sans ml-0.5" style={{ color: MAUVE }}>+{extraColors}</span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-3 md:px-4 pb-3 md:pb-4 mt-auto">
        <button
          onClick={handleAddToCart}
          disabled={addingCart}
          className="w-full flex items-center justify-center gap-2 text-white rounded-xl py-2.5 text-sm font-medium font-sans transition-all disabled:opacity-60"
          style={{ background: ROSE }}
        >
          <ShoppingBag size={15} />
          {addingCart ? 'Adding…' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ border: `1px solid ${BORDER}` }}>
      <div className="aspect-[3/4]" style={{ background: PEACH_LT }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded w-3/4" style={{ background: BORDER }} />
        <div className="h-4 rounded w-1/2" style={{ background: BORDER }} />
        <div className="h-10 rounded-xl w-full mt-2" style={{ background: BORDER }} />
      </div>
    </div>
  )
}

/* ── Main page ── */
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
    <div className="min-h-screen py-10 px-4 md:px-8" style={{ background: CREAM }}>
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <nav className="text-sm font-sans mb-6 flex items-center gap-1.5" style={{ color: PINK }}>
          <Link href="/" className="hover:underline transition-colors" style={{ color: PINK }}>Home</Link>
          <span>/</span>
          <span className="font-medium" style={{ color: BERRY }}>Wishlist</span>
        </nav>

        {/* Heading */}
        <div className="flex items-center gap-3 mb-2">
          <Heart size={28} fill={ROSE} style={{ color: ROSE }} />
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-playfair), serif', color: BERRY }}
          >
            My Wishlist
          </h1>
        </div>
        {!loading && (
          <p className="text-sm font-sans mb-8" style={{ color: MAUVE }}>
            {products.length === 0
              ? 'No items saved yet'
              : `${products.length} item${products.length !== 1 ? 's' : ''} saved`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart size={72} style={{ color: BORDER }} className="mb-5" />
            <h2 className="text-xl font-semibold font-sans mb-2" style={{ color: MAUVE }}>
              Your wishlist is empty
            </h2>
            <p className="text-sm font-sans mb-8 max-w-xs" style={{ color: MAUVE }}>
              Save items you love and come back to them anytime.
            </p>
            <Link
              href="/shop?filter=isNewArrival"
              className="text-white rounded-full px-6 py-3 font-sans font-medium text-sm transition-all hover:shadow-lg"
              style={{ background: ROSE }}
            >
              Shop New Arrivals →
            </Link>
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
