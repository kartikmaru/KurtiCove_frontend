'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import {
  FiArrowLeft, FiShoppingBag, FiCheck,
  FiTruck, FiRefreshCw, FiShield, FiChevronDown, FiChevronUp,
} from 'react-icons/fi'
import { addToCartWithSync } from '../../../utils/cartHelper'
import toast from 'react-hot-toast'
import ProductReviews from '../../../components/user/ProductReviews'
import SimilarProducts from '../../../components/user/SimilarProducts'

const BASE   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
const WL_KEY = 'kc_wishlist'

const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') }
  catch { return [] }
}

// ── Subtle zoom image (scale 1.05 on hover, smooth 0.4s) ─────
function ZoomImage({ src, alt }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl bg-purple-50/50 cursor-zoom-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain rounded-2xl select-none"
        draggable={false}
        style={{
          transform:  hovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.4s ease',
        }}
      />
    </div>
  )
}

// ── Pincode checker ───────────────────────────────────────────
function PincodeChecker() {
  const [pin,     setPin]     = useState('')
  const [checked, setChecked] = useState(false)

  const check = () => {
    if (pin.length !== 6) { toast.error('Enter a valid 6-digit pincode'); return }
    setChecked(true)
  }

  return (
    <div className="flex gap-2 items-center mt-1">
      <input
        type="text"
        value={pin}
        onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setChecked(false) }}
        placeholder="Enter pincode"
        className="border border-gray-200 rounded-xl px-4 py-3 text-sm flex-1 focus:ring-2 focus:ring-purple-300 outline-none font-sans"
        maxLength={6}
      />
      <button
        onClick={check}
        className="border border-purple-500 text-purple-600 font-medium px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors text-sm whitespace-nowrap"
      >
        {checked ? '✓ OK' : 'Check'}
      </button>
    </div>
  )
}

// ── Accordion ─────────────────────────────────────────────────
function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-purple-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-bold text-purple-900 tracking-widest uppercase font-sans">{title}</span>
        {open ? <FiChevronUp size={16} className="text-purple-400" /> : <FiChevronDown size={16} className="text-purple-400" />}
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed font-sans">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id }    = useParams()
  const router    = useRouter()
  const dispatch  = useDispatch()

  const [product,       setProduct]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [mainImage,     setMainImage]     = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize,  setSelectedSize]  = useState(null)
  const [qty,           setQty]           = useState(1)
  const [adding,        setAdding]        = useState(false)
  const [inWishlist,    setInWishlist]    = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res  = await fetch(`${BASE}product/${id}`, { cache: 'no-store' })
        const data = await res.json()
        if (data.success) {
          setProduct(data.data)
          if (data.data.colors?.length > 0) setSelectedColor(data.data.colors[0])
          setInWishlist(getWishlist().includes(data.data._id))
        }
      } catch { toast.error('Failed to load product.') }
      finally { setLoading(false) }
    }
    if (id) fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size.')
      return
    }
    setAdding(true)
    await addToCartWithSync(product, qty, dispatch)
    setAdding(false)
  }

  const toggleWishlist = () => {
    const wl   = getWishlist()
    const next = wl.includes(product._id) ? wl.filter((x) => x !== product._id) : [...wl, product._id]
    localStorage.setItem(WL_KEY, JSON.stringify(next))
    setInWishlist(!inWishlist)
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">👗</span>
        <h2 className="font-serif text-2xl text-purple-900">Product not found</h2>
        <button onClick={() => router.push('/shop')} className="bg-purple-500 text-white px-6 py-2 rounded-full text-sm">
          Back to Shop
        </button>
      </div>
    )
  }

  const displayPrice = product.discountPrice || product.price
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price
  const discountPct  = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0
  const images       = product.images?.length > 0 ? product.images : []

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Breadcrumb */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-600 font-sans mb-6 transition-colors"
        >
          <FiArrowLeft size={15} /> Back to Shop
        </button>

        {/*
          ════════════════════════════════════════════════════════════
          STICKY TWO-COLUMN LAYOUT
          ─────────────────────────────────────────────────────────────
          • The outer flex container is the "sticky parent" — its
            height is determined by the taller of the two columns
            (always the right/details column on a real product).
          • The left column has `position: sticky; top: 100px;
            align-self: flex-start` so it sticks while scrolling
            WITHIN this parent, then naturally scrolls away when
            the parent ends.
          • SimilarProducts and ProductReviews live OUTSIDE this
            parent as full-width siblings, so sticky auto-releases
            the moment the user reaches them.
          • On mobile (<lg) the layout stacks and sticky is removed.
          ════════════════════════════════════════════════════════════
        */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ── LEFT COLUMN — sticky image gallery (desktop only) ── */}
          <div
            className="lg:w-[55%] flex flex-col gap-4"
            style={{
              // Sticky only applies when rendered as a flex child on desktop.
              // The CSS media query equivalent is handled by the JS below via
              // an inline style that Next.js SSR can output directly.
            }}
          >
            {/*
              We wrap the actual gallery in a sticky shell.
              - `position: sticky` + `top: 100px` accounts for the
                fixed header (~80px) plus a comfortable 20px gap.
              - `align-self: flex-start` is the critical property:
                without it the item stretches to the parent height
                and sticky never activates.
              - The `lg:` prefix on the wrapper class makes this
                desktop-only; on mobile the div is non-sticky.
            */}
            <div className="lg:sticky lg:top-[100px] lg:[align-self:flex-start] w-full">

              {/* Desktop: thumbnail strip left + main image right */}
              <div className="hidden lg:flex gap-4">
                {/* Vertical thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex flex-col gap-3 w-20 flex-shrink-0">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setMainImage(i)}
                        className={[
                          'w-20 h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 bg-purple-50',
                          mainImage === i
                            ? 'border-purple-500 shadow-md'
                            : 'border-transparent hover:border-purple-300',
                        ].join(' ')}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Main zoom image */}
                <div className="relative flex-1" style={{ aspectRatio: '3/4' }}>
                  {/* Badges */}
                  {product.isNewArrival && (
                    <span className="absolute top-4 left-4 z-10 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      NEW
                    </span>
                  )}
                  {/* Wishlist */}
                  <button
                    onClick={toggleWishlist}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-200"
                  >
                    {inWishlist
                      ? <AiFillHeart size={18} className="text-red-500" />
                      : <AiOutlineHeart size={18} className="text-gray-400" />
                    }
                  </button>

                  {images.length > 0
                    ? <ZoomImage src={images[mainImage]} alt={product.name} />
                    : (
                      <div className="w-full h-full bg-purple-50 rounded-2xl flex items-center justify-center text-7xl">
                        👗
                      </div>
                    )
                  }
                </div>
              </div>

              {/* Mobile: main image + horizontal thumbnail strip */}
              <div className="lg:hidden">
                <div className="relative rounded-2xl overflow-hidden bg-purple-50" style={{ aspectRatio: '3/4' }}>
                  {product.isNewArrival && (
                    <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">NEW</span>
                  )}
                  <button
                    onClick={toggleWishlist}
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center"
                  >
                    {inWishlist
                      ? <AiFillHeart size={16} className="text-red-500" />
                      : <AiOutlineHeart size={16} className="text-gray-400" />
                    }
                  </button>
                  {images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[mainImage]} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">👗</div>
                  )}
                </div>
                {/* Horizontal thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setMainImage(i)}
                        className={[
                          'flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 cursor-pointer bg-purple-50',
                          mainImage === i ? 'border-purple-500' : 'border-transparent hover:border-purple-300',
                        ].join(' ')}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>{/* end sticky shell */}
          </div>

          {/* ── RIGHT COLUMN (details) — scrolls normally ── */}
          <div className="lg:w-[45%] flex flex-col gap-5">

            {/* Name */}
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold text-purple-900 leading-tight mb-2"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {product.name}
              </h1>

              {/* Stock */}
              <div className="flex items-center gap-1.5">
                {product.stock > 0 ? (
                  <><span className="w-2 h-2 bg-green-500 rounded-full" /><span className="text-green-600 text-sm font-medium font-sans">In Stock</span></>
                ) : (
                  <><span className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-red-600 text-sm font-medium font-sans">Out of Stock</span></>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-purple-50/50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-sans mb-1">Price</p>
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-medium text-purple-700 text-base font-sans">
                  ₹{displayPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xs text-gray-400 line-through font-sans font-normal">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="bg-green-100 text-green-700 font-bold text-sm px-3 py-1 rounded-full font-sans">
                      {discountPct}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-sans">Inclusive of all taxes</p>
            </div>

            {/* Delivery info */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-sans">
              {[
                { label: 'Ships within 24 hours' },
                { label: 'Cash on Delivery' },
                { label: 'Easy Returns' },
              ].map(({ label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <FiCheck size={13} className="text-green-500 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            <hr className="border-purple-100" />

            {/* Description */}
            {product.description && (
              <p id="description" className="text-gray-600 text-sm leading-relaxed font-sans">{product.description}</p>
            )}

            {/* COLOR */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 tracking-widest uppercase font-sans mb-3">
                  Colour
                  {selectedColor && (
                    <span className="font-mono text-purple-500 ml-2 normal-case tracking-normal font-medium">{selectedColor}</span>
                  )}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setSelectedColor(hex)}
                      title={hex}
                      aria-label={hex}
                      aria-pressed={selectedColor === hex}
                      className={[
                        'w-10 h-10 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0',
                        selectedColor === hex
                          ? 'border-4 border-purple-600 ring-2 ring-purple-400 ring-offset-2 scale-110 shadow-lg'
                          : 'border-4 border-white shadow-md hover:scale-110',
                      ].join(' ')}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SIZE */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-500 tracking-widest uppercase font-sans">Size</p>
                  <button className="text-xs text-purple-500 underline font-sans hover:text-purple-700 transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={[
                        'min-w-[44px] h-10 px-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 font-sans',
                        selectedSize === s
                          ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                          : 'border-gray-200 text-gray-700 hover:border-purple-400 hover:text-purple-600',
                      ].join(' ')}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-red-400 font-sans mt-2">Please select a size</p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase font-sans">Qty</p>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-purple-700 hover:bg-purple-50 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold text-sm text-purple-900 min-w-[36px] text-center font-sans">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))}
                  className="px-3 py-2 text-purple-700 hover:bg-purple-50 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl text-base tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-purple-300/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingBag size={18} />
                {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={toggleWishlist}
                className="border-2 border-purple-200 hover:border-purple-500 text-purple-500 p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50"
                aria-label="Wishlist"
              >
                {inWishlist
                  ? <AiFillHeart size={20} className="text-red-500" />
                  : <AiOutlineHeart size={20} />
                }
              </button>
            </div>

            {/* Feature badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FiTruck,     label: 'FREE SHIPPING' },
                { icon: FiRefreshCw, label: '15-DAY RETURNS' },
                { icon: FiShield,    label: 'AUTHENTIC' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-purple-50 rounded-xl p-3 text-center flex flex-col items-center gap-1.5">
                  <Icon size={16} className="text-purple-500" />
                  <span className="text-xs font-medium text-purple-700 font-sans">{label}</span>
                </div>
              ))}
            </div>

            {/* Pincode checker */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest font-sans mb-2">Check Delivery</p>
              <PincodeChecker />
            </div>

            {/* Accordion */}
            <div className="mt-2">
              <Accordion title="Details & Fabric">
                <p>{product.description || 'Beautiful hand-crafted kurti made with premium quality fabric.'}</p>
                <ul className="mt-2 space-y-1">
                  <li>• Fabric: Premium Cotton Blend</li>
                  <li>• Style: Ethnic / Fusion</li>
                  <li>• Wash Care: Machine Wash Cold</li>
                </ul>
              </Accordion>
              <Accordion title="Shipping & Returns">
                <p>Free shipping on orders above ₹999. Standard delivery in 3–7 business days. Easy 15-day returns — no questions asked.</p>
              </Accordion>
            </div>
          </div>
        </div>
        {/*
          ════════════════════════════════════════════════════════════
          BELOW-THE-FOLD SECTIONS — live OUTSIDE the two-column flex
          parent, so the sticky image column naturally releases here.
          ════════════════════════════════════════════════════════════
        */}

        {/* ── SIMILAR PRODUCTS ── */}
        <SimilarProducts productId={id} />

        {/* ── REVIEWS SECTION ── */}
        <ProductReviews productId={id} />

      </div>
    </main>
  )
}
