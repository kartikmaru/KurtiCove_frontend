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

/* ── Palette ── */
const ROSE    = '#E05C88'
const BERRY   = '#7B2447'
const MAUVE   = '#6B4553'
const PINK    = '#F8A5B5'
const PEACH   = '#FBDBBB'
const CREAM   = '#FCFAE0'
const BORDER  = '#F5C8D4'
const PEACH_LT = '#FEF0E3'

const BASE   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
const WL_KEY = 'kc_wishlist'

const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') }
  catch { return [] }
}

/* ── Zoom image (scale on hover, stays in rounded container) ── */
function ZoomImage({ src, alt }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl cursor-zoom-in"
      style={{ background: PEACH_LT }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src} alt={alt}
        className="w-full h-full object-contain rounded-2xl select-none"
        draggable={false}
        style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s ease' }}
      />
    </div>
  )
}

/* ── Pincode checker ── */
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
        type="text" value={pin}
        onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setChecked(false) }}
        placeholder="Enter pincode"
        className="border rounded-xl px-4 py-3 text-sm flex-1 outline-none font-sans transition-all"
        style={{ borderColor: BORDER, color: BERRY, background: CREAM }}
        maxLength={6}
      />
      <button
        onClick={check}
        className="border px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-colors"
        style={{ borderColor: ROSE, color: checked ? '#fff' : ROSE, background: checked ? ROSE : 'transparent' }}
      >
        {checked ? '✓ OK' : 'Check'}
      </button>
    </div>
  )
}

/* ── Accordion ── */
function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: BORDER }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-bold uppercase tracking-widest font-sans" style={{ color: BERRY }}>{title}</span>
        {open
          ? <FiChevronUp size={16} style={{ color: PINK }} />
          : <FiChevronDown size={16} style={{ color: PINK }} />}
      </button>
      {open && (
        <div className="pb-4 text-sm leading-relaxed font-sans" style={{ color: MAUVE }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Main page ── */
export default function ProductDetailPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const dispatch = useDispatch()

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

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: ROSE, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: CREAM }}>
        <span className="text-6xl">👗</span>
        <h2 className="font-serif text-2xl" style={{ color: BERRY }}>Product not found</h2>
        <button onClick={() => router.push('/shop')}
          className="text-white px-6 py-2 rounded-full text-sm"
          style={{ background: ROSE }}>
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
    <main className="min-h-screen" style={{ background: CREAM }}>
      {/*
        Outer wrapper — provides top/bottom padding and houses the two-col layout.
        Image gets ~50% width on desktop (scaled down from 55%).
      */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Breadcrumb */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-sans mb-6 transition-colors"
          style={{ color: PINK }}
        >
          <FiArrowLeft size={15} /> Back to Shop
        </button>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ── LEFT — sticky image gallery, reduced width ~48% ── */}
          <div className="lg:w-[48%] flex flex-col gap-4">
            <div className="lg:sticky lg:top-[100px] lg:[align-self:flex-start] w-full">
              {/* Added py-6 for breathing room around the image block */}
              <div className="py-4 md:py-6">

                {/* Desktop: thumbnail strip + main image */}
                <div className="hidden lg:flex gap-4">
                  {images.length > 1 && (
                    <div className="flex flex-col gap-3 w-18 flex-shrink-0">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setMainImage(i)}
                          className="w-16 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200"
                          style={{
                            background:   PEACH_LT,
                            borderColor:  mainImage === i ? ROSE : 'transparent',
                            boxShadow:    mainImage === i ? `0 0 0 1px ${ROSE}` : 'none',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main zoom image */}
                  <div className="relative flex-1" style={{ aspectRatio: '3/4' }}>
                    {product.isNewArrival && (
                      <span className="absolute top-4 left-4 z-10 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md"
                            style={{ background: ROSE }}>NEW</span>
                    )}
                    <button
                      onClick={toggleWishlist}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-200"
                    >
                      {inWishlist
                        ? <AiFillHeart size={18} className="text-red-500" />
                        : <AiOutlineHeart size={18} style={{ color: MAUVE }} />}
                    </button>
                    {images.length > 0
                      ? <ZoomImage src={images[mainImage]} alt={product.name} />
                      : <div className="w-full h-full rounded-2xl flex items-center justify-center text-7xl" style={{ background: PEACH_LT }}>👗</div>}
                  </div>
                </div>

                {/* Mobile: main image + horizontal thumbnail strip */}
                <div className="lg:hidden">
                  <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4', background: PEACH_LT }}>
                    {product.isNewArrival && (
                      <span className="absolute top-3 left-3 z-10 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: ROSE }}>NEW</span>
                    )}
                    <button
                      onClick={toggleWishlist}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center"
                    >
                      {inWishlist
                        ? <AiFillHeart size={16} className="text-red-500" />
                        : <AiOutlineHeart size={16} style={{ color: MAUVE }} />}
                    </button>
                    {images.length > 0
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={images[mainImage]} alt={product.name} className="w-full h-full object-contain" />
                      : <div className="w-full h-full flex items-center justify-center text-6xl">👗</div>}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setMainImage(i)}
                          className="flex-shrink-0 w-14 h-18 rounded-xl overflow-hidden border-2 cursor-pointer"
                          style={{ background: PEACH_LT, borderColor: mainImage === i ? ROSE : 'transparent' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>{/* end py wrapper */}
            </div>
          </div>

          {/* ── RIGHT — details, scrolls normally ── */}
          <div className="lg:w-[52%] flex flex-col gap-5">

            {/* Name */}
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold leading-tight mb-2"
                style={{ fontFamily: 'var(--font-playfair), serif', color: BERRY }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-1.5">
                {product.stock > 0
                  ? <><span className="w-2 h-2 bg-green-500 rounded-full" /><span className="text-green-600 text-sm font-medium font-sans">In Stock</span></>
                  : <><span className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-red-600 text-sm font-medium font-sans">Out of Stock</span></>
                }
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl p-4" style={{ background: PEACH_LT, border: `1px solid ${BORDER}` }}>
              <p className="text-xs uppercase tracking-wider font-sans mb-1" style={{ color: MAUVE }}>Price</p>
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-bold text-xl font-sans" style={{ color: ROSE }}>
                  ₹{displayPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm line-through font-sans font-normal" style={{ color: MAUVE }}>
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="font-bold text-sm px-3 py-1 rounded-full font-sans text-white"
                          style={{ background: ROSE }}>
                      {discountPct}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs mt-1 font-sans" style={{ color: MAUVE }}>Inclusive of all taxes</p>
            </div>

            {/* Delivery info */}
            <div className="flex flex-wrap gap-4 text-xs font-sans" style={{ color: MAUVE }}>
              {['Ships within 24 hours', 'Cash on Delivery', 'Easy Returns'].map((label) => (
                <div key={label} className="flex items-center gap-1.5">
                  <FiCheck size={13} className="text-green-500 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            <hr style={{ borderColor: BORDER }} />

            {/* Description */}
            {product.description && (
              <p id="description" className="text-sm leading-relaxed font-sans" style={{ color: MAUVE }}>
                {product.description}
              </p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest font-sans mb-3" style={{ color: MAUVE }}>
                  Colour
                  {selectedColor && (
                    <span className="font-mono ml-2 normal-case tracking-normal font-medium" style={{ color: ROSE }}>
                      {selectedColor}
                    </span>
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
                      className={`w-10 h-10 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0 ${
                        selectedColor === hex
                          ? 'border-4 border-white ring-2 ring-offset-2 scale-110 shadow-lg'
                          : 'border-4 border-white shadow-md hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: hex,
                        ringColor: selectedColor === hex ? ROSE : 'transparent',
                        outline: selectedColor === hex ? `2px solid ${ROSE}` : 'none',
                        outlineOffset: '3px',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest font-sans" style={{ color: MAUVE }}>Size</p>
                  <button className="text-xs underline font-sans transition-colors" style={{ color: ROSE }}>Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className="min-w-[44px] h-10 px-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 font-sans"
                      style={
                        selectedSize === s
                          ? { borderColor: ROSE, background: ROSE, color: '#fff' }
                          : { borderColor: BORDER, color: BERRY, background: 'white' }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-xs font-sans mt-2" style={{ color: ROSE }}>Please select a size</p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest font-sans" style={{ color: MAUVE }}>Qty</p>
              <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: BORDER }}>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 font-bold text-lg transition-colors"
                  style={{ color: ROSE }}
                >−</button>
                <span className="px-4 py-2 font-semibold text-sm min-w-[36px] text-center font-sans" style={{ color: BERRY }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))}
                  className="px-3 py-2 font-bold text-lg transition-colors"
                  style={{ color: ROSE }}
                >+</button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl text-base tracking-wide transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${ROSE}, #C94A74)` }}
              >
                <FiShoppingBag size={18} />
                {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={toggleWishlist}
                className="border-2 p-4 rounded-2xl transition-all duration-200"
                style={{ borderColor: BORDER, color: inWishlist ? '#ef4444' : ROSE }}
                aria-label="Wishlist"
              >
                {inWishlist
                  ? <AiFillHeart size={20} className="text-red-500" />
                  : <AiOutlineHeart size={20} />}
              </button>
            </div>

            {/* Feature badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FiTruck,     label: 'FREE SHIPPING' },
                { icon: FiRefreshCw, label: '15-DAY RETURNS' },
                { icon: FiShield,    label: 'AUTHENTIC' },
              ].map(({ icon: Icon, label }) => (
                <div key={label}
                  className="rounded-xl p-3 text-center flex flex-col items-center gap-1.5"
                  style={{ background: PEACH_LT }}>
                  <Icon size={16} style={{ color: ROSE }} />
                  <span className="text-xs font-medium font-sans" style={{ color: BERRY }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Pincode checker */}
            <div className="rounded-2xl p-4" style={{ background: PEACH_LT, border: `1px solid ${BORDER}` }}>
              <p className="text-xs font-bold uppercase tracking-widest font-sans mb-2" style={{ color: MAUVE }}>
                Check Delivery
              </p>
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

        {/* Similar products + Reviews live outside the 2-col parent */}
        <SimilarProducts productId={id} />
        <ProductReviews productId={id} />
      </div>
    </main>
  )
}
