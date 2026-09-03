'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import {
  FiArrowLeft, FiShoppingBag, FiCheck,
  FiTruck, FiRefreshCw, FiShield,
  FiThumbsUp, FiCheckCircle, FiStar, FiEdit3,
} from 'react-icons/fi'
import { addToCartWithSync } from '../../../utils/cartHelper'
import toast from 'react-hot-toast'
import SimilarProducts from '../../../components/user/SimilarProducts'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'

const BASE   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
const WL_KEY = 'kc_wishlist'

/* ── Default kurti size chart (used when product has no measurements) ── */
const DEFAULT_SIZE_CHART = [
  { size: 'XS', chest: '32',  waist: '26', length: '44' },
  { size: 'S',  chest: '34',  waist: '28', length: '45' },
  { size: 'M',  chest: '36',  waist: '30', length: '46' },
  { size: 'L',  chest: '38',  waist: '32', length: '47' },
  { size: 'XL', chest: '40',  waist: '34', length: '48' },
  { size: 'XXL',chest: '42',  waist: '36', length: '49' },
]

const getWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') } catch { return [] }
}

/* ─────────────────────────────────────────────────────────────
   HTML DESCRIPTION RENDERER — DOMPurify, browser-only
───────────────────────────────────────────────────────────────*/
function HtmlDescription({ html }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    import('dompurify').then(({ default: DOMPurify }) => {
      const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p','br','b','strong','i','em','u','h2','h3','ul','ol','li','span','a'],
        ALLOWED_ATTR: ['href','target','rel'],
      })
      if (ref.current) ref.current.innerHTML = clean
    })
  }, [html])
  return (
    <>
      <style>{`
        .product-desc h2{font-family:var(--font-playfair),serif;font-size:1.05rem;font-weight:700;color:#7B2447;margin:.7rem 0 .3rem}
        .product-desc h3{font-family:var(--font-playfair),serif;font-size:.95rem;font-weight:600;color:#7B2447;margin:.55rem 0 .25rem}
        .product-desc p{color:#6B4553;font-size:.875rem;line-height:1.65;margin-bottom:.45rem}
        .product-desc ul,.product-desc ol{padding-left:1.2rem;margin-bottom:.45rem}
        .product-desc li{color:#6B4553;font-size:.875rem;line-height:1.6;margin-bottom:.1rem}
        .product-desc ul li::marker{color:#E05C88}
        .product-desc ol li::marker{color:#E05C88;font-weight:600}
        .product-desc strong,.product-desc b{color:#7B2447;font-weight:700}
        .product-desc em,.product-desc i{font-style:italic}
        .product-desc a{color:#E05C88;text-decoration:underline;text-underline-offset:2px}
      `}</style>
      <div ref={ref} className="product-desc" />
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   ZOOM IMAGE
───────────────────────────────────────────────────────────────*/
function ZoomImage({ src, alt }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl cursor-zoom-in bg-[#fafafa]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} draggable={false}
        className="w-full h-full object-contain rounded-2xl select-none"
        style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s ease' }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PINCODE CHECKER
───────────────────────────────────────────────────────────────*/
function PincodeChecker() {
  const [pin, setPin]       = useState('')
  const [checked, setChecked] = useState(false)
  const check = () => {
    if (pin.length !== 6) { toast.error('Enter a valid 6-digit pincode'); return }
    setChecked(true)
  }
  return (
    <div className="flex gap-2 items-center mt-1">
      <input type="text" value={pin} maxLength={6} placeholder="Enter pincode"
        onChange={(e) => { setPin(e.target.value.replace(/\D/g,'').slice(0,6)); setChecked(false) }}
        className="border rounded-xl px-4 py-3 text-sm flex-1 outline-none font-sans"
        style={{ borderColor: BORDER, color: BERRY, background: '#fff' }} />
      <button onClick={check} className="border px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-colors"
        style={{ borderColor: ROSE, color: checked ? '#fff' : ROSE, background: checked ? ROSE : 'transparent' }}>
        {checked ? '✓ OK' : 'Check'}
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   REVIEWS CONTENT (inline — same logic as ProductReviews)
───────────────────────────────────────────────────────────────*/
function StarRow({ rating, size = 15 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <FiStar key={n} size={size} strokeWidth={1.5}
          fill={n <= rating ? ROSE : 'none'} style={{ color: n <= rating ? ROSE : BORDER }} />
      ))}
    </div>
  )
}
function Avatar({ name }) {
  const initials = name.split(' ').slice(0,2).map((w) => w[0]?.toUpperCase() ?? '').join('')
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm font-sans"
         style={{ background: ROSE }}>{initials}</div>
  )
}
function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return '1 day ago'
  if (diff < 30) return `${diff} days ago`
  if (diff < 365) return `${Math.floor(diff/30)} months ago`
  return `${Math.floor(diff/365)} years ago`
}
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 w-8 flex-shrink-0 justify-end">
        <span className="text-xs font-sans" style={{ color: MAUVE }}>{star}</span>
        <FiStar size={10} fill={ROSE} style={{ color: ROSE }} />
      </div>
      <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: BORDER }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: ROSE }} />
      </div>
      <span className="w-7 text-right text-xs font-sans flex-shrink-0" style={{ color: MAUVE }}>{pct}%</span>
    </div>
  )
}
function ReviewCard({ review }) {
  const [count, setCount]   = useState(review.helpfulCount)
  const [marked, setMarked] = useState(false)
  const handleHelpful = async () => {
    if (marked) return
    try {
      const res  = await fetch(`${BASE}review/${review._id}/helpful`, { method: 'POST' })
      const data = await res.json()
      if (data.success) { setCount(data.data.helpfulCount); setMarked(true) }
    } catch { /* silent */ }
  }
  return (
    <div className="py-4 border-b last:border-0" style={{ borderColor: BORDER }}>
      <div className="flex items-start gap-3 mb-2">
        <Avatar name={review.customerName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm font-sans" style={{ color: BERRY }}>{review.customerName}</span>
            {review.verifiedBuyer && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-sans text-green-600">
                <FiCheckCircle size={11} strokeWidth={2.5} /> VERIFIED
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRow rating={review.rating} size={12} />
            <span className="text-xs font-sans" style={{ color: MAUVE }}>{timeAgo(review.createdAt)}</span>
          </div>
        </div>
      </div>
      {review.title && <p className="font-serif font-semibold text-sm mb-1" style={{ color: BERRY }}>{review.title}</p>}
      <p className="text-sm leading-relaxed font-sans" style={{ color: MAUVE }}>{review.comment}</p>
      {review.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={review.imageUrl} alt="Review" className="w-16 h-16 rounded-xl object-cover mt-2 cursor-pointer border"
          style={{ borderColor: BORDER }} onClick={() => window.open(review.imageUrl, '_blank')} />
      )}
      <button onClick={handleHelpful} disabled={marked}
        className="mt-2 inline-flex items-center gap-1 text-xs font-sans transition-colors"
        style={{ color: marked ? ROSE : MAUVE }}>
        <FiThumbsUp size={12} strokeWidth={2} /> Helpful ({count})
      </button>
    </div>
  )
}

function ReviewsContent({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!productId) return
    fetch(`${BASE}review?productId=${productId}`, { cache: 'no-store' })
      .then((r) => r.json()).then((d) => { if (d.success) setReviews(d.data) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [productId])

  if (loading) return (
    <div className="py-10 flex justify-center">
      <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: BORDER, borderTopColor: ROSE }} />
    </div>
  )

  const total      = reviews.length
  const avg        = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const verified   = reviews.filter((r) => r.verifiedBuyer).length
  const starCounts = [5,4,3,2,1].map((s) => ({ star: s, count: reviews.filter((r) => r.rating === s).length }))

  if (total === 0) return (
    <div className="py-8 text-center">
      <p className="text-sm font-sans mb-4" style={{ color: MAUVE }}>No reviews yet. Be the first!</p>
      <button className="inline-flex items-center gap-2 text-xs font-bold py-2.5 px-5 rounded-xl border-2 font-sans uppercase tracking-widest transition-all"
        style={{ borderColor: ROSE, color: ROSE }}
        onMouseEnter={(e) => { e.currentTarget.style.background = ROSE; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ROSE }}>
        <FiEdit3 size={13} /> Write a Review
      </button>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start pt-2">
      {/* Summary card — full width on mobile, fixed width on desktop */}
      <div className="w-full lg:w-56 flex-shrink-0">
        <div className="rounded-2xl p-4 md:p-5 flex flex-col gap-4 border" style={{ background: PEACH_LT, borderColor: BORDER }}>
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-bold leading-none" style={{ fontFamily: 'var(--font-playfair),serif', color: BERRY, fontSize: '3.5rem' }}>
              {avg.toFixed(1)}
            </span>
            <StarRow rating={Math.round(avg)} size={18} />
            <p className="text-xs font-sans" style={{ color: MAUVE }}>{verified} verified review{verified !== 1 ? 's' : ''}</p>
          </div>
          <hr style={{ borderColor: BORDER }} />
          <div className="flex flex-col gap-2">
            {starCounts.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={total} />
            ))}
          </div>
          <hr style={{ borderColor: BORDER }} />
          <button className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl border-2 font-sans uppercase tracking-widest transition-all"
            style={{ borderColor: ROSE, color: ROSE }}
            onMouseEnter={(e) => { e.currentTarget.style.background = ROSE; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ROSE }}>
            <FiEdit3 size={13} /> Write a Review
          </button>
        </div>
      </div>
      {/* List */}
      <div className="flex-1 min-w-0">
        {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT TABS (Description · Additional Info · Size & Shape · Reviews)
───────────────────────────────────────────────────────────────*/
function ProductTabs({ product, productId, reviewCount }) {
  const [active, setActive] = useState('description')

  const tabs = [
    { key: 'description',   label: 'Description'           },
    { key: 'additional',    label: 'Additional Information' },
    { key: 'size',          label: 'Size & Shape'           },
    { key: 'reviews',       label: `Reviews (${reviewCount})` },
  ]

  const hasHtml = product.description && /<[a-z][\s\S]*>/i.test(product.description)

  return (
    <section className="mt-12 w-full">
      {/* Tab bar — horizontally scrollable on mobile, no visible scrollbar */}
      <div className="border-b" style={{ borderColor: BORDER }}>
        <style>{`.pdp-tab-bar::-webkit-scrollbar{display:none}`}</style>
        <div
          className="pdp-tab-bar flex gap-0 overflow-x-auto"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActive(tab.key)}
              className="relative flex-shrink-0 px-4 md:px-6 py-3 text-sm font-sans font-medium transition-colors whitespace-nowrap"
              style={{ color: active === tab.key ? BERRY : MAUVE }}>
              {tab.label}
              {active === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: ROSE }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — py-6 on mobile, py-8 on desktop */}
      <div className="py-6 md:py-8">

        {/* DESCRIPTION */}
        {active === 'description' && (
          <div>
            {product.description ? (
              hasHtml
                ? <HtmlDescription html={product.description} />
                : <p className="text-sm leading-relaxed font-sans" style={{ color: MAUVE }}>{product.description}</p>
            ) : (
              <p className="text-sm font-sans" style={{ color: MAUVE }}>No description available.</p>
            )}
          </div>
        )}

        {/* ADDITIONAL INFORMATION */}
        {active === 'additional' && (
          <div className="max-w-lg">
            <table className="w-full text-sm font-sans border-collapse">
              <tbody>
                {[
                  product.category && { key: 'Category',  val: product.category },
                  product.sizes?.length && { key: 'Available Sizes', val: product.sizes.join(', ') },
                  product.colors?.length && {
                    key: 'Available Colours',
                    val: (
                      <span className="inline-flex items-center gap-1.5 flex-wrap">
                        {product.colors.map((hex) => (
                          <span key={hex} className="inline-flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full border border-gray-200 inline-block flex-shrink-0"
                                  style={{ backgroundColor: hex }} />
                            <span className="font-mono text-xs" style={{ color: MAUVE }}>{hex}</span>
                          </span>
                        ))}
                      </span>
                    ),
                  },
                  { key: 'SKU / ID', val: product._id?.slice(-10).toUpperCase() },
                  product.stock !== undefined && { key: 'Stock',  val: product.stock > 0 ? `${product.stock} available` : 'Out of Stock' },
                ].filter(Boolean).map(({ key, val }) => (
                  <tr key={key} className="border-b" style={{ borderColor: BORDER }}>
                    <td className="py-2.5 pr-6 font-semibold w-44 align-top" style={{ color: BERRY }}>{key}</td>
                    <td className="py-2.5 align-top" style={{ color: MAUVE }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SIZE & SHAPE */}
        {active === 'size' && (
          <div>
            <p className="text-xs font-sans mb-4" style={{ color: MAUVE }}>
              All measurements are approximate and given in <strong style={{ color: BERRY }}>inches</strong>. Size availability depends on stock.
            </p>
            <div className="overflow-x-auto -mx-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="text-sm font-sans border-collapse" style={{ minWidth: 300, width: '100%' }}>
                <thead>
                  <tr style={{ background: PEACH_LT }}>
                    {['Size','Chest','Waist','Length'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                          style={{ color: BERRY, borderBottom: `2px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEFAULT_SIZE_CHART.map((row, i) => {
                    const isProductSize = product.sizes?.includes(row.size)
                    return (
                      <tr key={row.size} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td className="px-3 py-2 font-semibold" style={{ color: isProductSize ? ROSE : BERRY, borderBottom: `1px solid ${BORDER}` }}>
                          {row.size}{isProductSize && <span className="ml-1 text-[10px]" style={{ color: ROSE }}>✓</span>}
                        </td>
                        <td className="px-3 py-2" style={{ color: MAUVE, borderBottom: `1px solid ${BORDER}` }}>{row.chest}"</td>
                        <td className="px-3 py-2" style={{ color: MAUVE, borderBottom: `1px solid ${BORDER}` }}>{row.waist}"</td>
                        <td className="px-3 py-2" style={{ color: MAUVE, borderBottom: `1px solid ${BORDER}` }}>{row.length}"</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {product.sizes?.length > 0 && (
              <p className="text-xs font-sans mt-3" style={{ color: PINK }}>
                ✓ = Available in this product
              </p>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {active === 'reviews' && (
          <ReviewsContent productId={productId} />
        )}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────*/
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
  const [reviewCount,   setReviewCount]   = useState(0)

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

  /* Fetch review count for tab label */
  useEffect(() => {
    if (!id) return
    fetch(`${BASE}review?productId=${id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setReviewCount(d.data.length) })
      .catch(() => {})
  }, [id])

  const handleAddToCart = async () => {
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size.'); return }
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

  /* ── Loading / not found ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: ROSE, borderTopColor: 'transparent' }} />
      </div>
    )
  }
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <span className="text-6xl">👗</span>
        <h2 className="font-serif text-2xl" style={{ color: BERRY }}>Product not found</h2>
        <button onClick={() => router.push('/shop')} className="text-white px-6 py-2 rounded-full text-sm" style={{ background: ROSE }}>
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
    /* WHITE background — matches home & shop pages */
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">

        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-sans mb-5 transition-colors"
          style={{ color: PINK }}>
          <FiArrowLeft size={15} /> Back to Shop
        </button>

        {/* ══ TWO-COLUMN LAYOUT ══ */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* LEFT — sticky image gallery (48% width) */}
          <div className="lg:w-[48%] flex flex-col gap-4">
            <div className="lg:sticky lg:top-[100px] lg:[align-self:flex-start] w-full">
              {/*
                py-7 md:py-9 — comfortable padding above/below the image block
                so the image sits optically centred in the viewport on first load.
                max-h on desktop limits the container so it never gets cut.
              */}
              <div className="py-6 md:py-8">

                {/* Desktop: thumbnail strip + main image */}
                <div className="hidden lg:flex gap-3">
                  {images.length > 1 && (
                    <div className="flex flex-col gap-2.5 flex-shrink-0" style={{ width: 64 }}>
                      {images.map((img, i) => (
                        <div key={i} onClick={() => setMainImage(i)}
                          className="w-16 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all"
                          style={{ background: '#f5f5f5', borderColor: mainImage === i ? ROSE : 'transparent', boxShadow: mainImage === i ? `0 0 0 1px ${ROSE}` : 'none' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main image — constrained height so it fits without fold crop */}
                  <div className="relative flex-1" style={{ aspectRatio: '3/4', maxHeight: '70vh' }}>
                    <button onClick={toggleWishlist}
                      className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform">
                      {inWishlist ? <AiFillHeart size={18} className="text-red-500" /> : <AiOutlineHeart size={18} style={{ color: MAUVE }} />}
                    </button>
                    {images.length > 0
                      ? <ZoomImage src={images[mainImage]} alt={product.name} />
                      : <div className="w-full h-full rounded-2xl flex items-center justify-center text-7xl bg-gray-50">👗</div>}
                  </div>
                </div>

                {/* Mobile: main image + thumbnails */}
                <div className="lg:hidden">
                  <div className="relative rounded-2xl overflow-hidden bg-[#fafafa]" style={{ aspectRatio: '3/4' }}>
                    <button onClick={toggleWishlist}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
                      {inWishlist ? <AiFillHeart size={16} className="text-red-500" /> : <AiOutlineHeart size={16} style={{ color: MAUVE }} />}
                    </button>
                    {images.length > 0
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={images[mainImage]} alt={product.name} className="w-full h-full object-contain" />
                      : <div className="w-full h-full flex items-center justify-center text-6xl">👗</div>}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <div key={i} onClick={() => setMainImage(i)}
                          className="flex-shrink-0 w-14 rounded-xl overflow-hidden border-2 cursor-pointer"
                          style={{ height: 68, background: '#f5f5f5', borderColor: mainImage === i ? ROSE : 'transparent' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — product details */}
          <div className="lg:w-[52%] flex flex-col gap-5">

            {/* Name + stock */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2"
                style={{ fontFamily: 'var(--font-playfair), serif', color: BERRY }}>
                {product.name}
              </h1>
              {product.category && (
                <p className="text-xs font-sans mb-2" style={{ color: MAUVE }}>{product.category}</p>
              )}
              <div className="flex items-center gap-1.5">
                {product.stock > 0
                  ? <><span className="w-2 h-2 bg-green-500 rounded-full" /><span className="text-green-600 text-sm font-medium font-sans">In Stock</span></>
                  : <><span className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-red-600 text-sm font-medium font-sans">Out of Stock</span></>}
              </div>
            </div>

            {/* Price box */}
            <div className="rounded-2xl p-4" style={{ background: PEACH_LT, border: `1px solid ${BORDER}` }}>
              <p className="text-xs uppercase tracking-wider font-sans mb-1" style={{ color: MAUVE }}>Price</p>
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-bold text-xl font-sans" style={{ color: ROSE }}>₹{displayPrice.toLocaleString()}</span>
                {hasDiscount && (
                  <>
                    <span className="text-sm line-through font-sans font-normal" style={{ color: MAUVE }}>₹{product.price.toLocaleString()}</span>
                    <span className="font-bold text-sm px-3 py-1 rounded-full font-sans text-white" style={{ background: ROSE }}>{discountPct}% OFF</span>
                  </>
                )}
              </div>
              <p className="text-xs mt-1 font-sans" style={{ color: MAUVE }}>Inclusive of all taxes</p>
            </div>

            {/* Delivery chips */}
            <div className="flex flex-wrap gap-3 text-xs font-sans" style={{ color: MAUVE }}>
              {['Ships within 24 hours', 'Cash on Delivery', 'Easy Returns'].map((l) => (
                <div key={l} className="flex items-center gap-1.5">
                  <FiCheck size={13} className="text-green-500 flex-shrink-0" />{l}
                </div>
              ))}
            </div>

            <hr style={{ borderColor: BORDER }} />

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest font-sans mb-3" style={{ color: MAUVE }}>
                  Colour
                  {selectedColor && <span className="font-mono ml-2 normal-case tracking-normal font-medium" style={{ color: ROSE }}>{selectedColor}</span>}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((hex) => (
                    <button key={hex} onClick={() => setSelectedColor(hex)} title={hex}
                      className="w-10 h-10 rounded-full border-4 border-white shadow-md hover:scale-110 transition-all flex-shrink-0"
                      style={{ backgroundColor: hex, outline: selectedColor === hex ? `2px solid ${ROSE}` : 'none', outlineOffset: '3px', transform: selectedColor === hex ? 'scale(1.1)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest font-sans" style={{ color: MAUVE }}>Size</p>
                  <button className="text-xs underline font-sans" style={{ color: ROSE }}
                    onClick={() => document.querySelector('[data-tab="size"]')?.click()}>
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className="min-w-[44px] h-10 px-3 rounded-xl border-2 text-sm font-medium transition-all font-sans"
                      style={selectedSize === s ? { borderColor: ROSE, background: ROSE, color: '#fff' } : { borderColor: BORDER, color: BERRY, background: 'white' }}>
                      {s}
                    </button>
                  ))}
                </div>
                {!selectedSize && <p className="text-xs font-sans mt-2" style={{ color: ROSE }}>Please select a size</p>}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest font-sans" style={{ color: MAUVE }}>Qty</p>
              <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: BORDER }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 font-bold text-lg transition-colors" style={{ color: ROSE }}>−</button>
                <span className="px-4 py-2 font-semibold text-sm min-w-[36px] text-center font-sans" style={{ color: BERRY }}>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))} className="px-3 py-2 font-bold text-lg transition-colors" style={{ color: ROSE }}>+</button>
              </div>
            </div>

            {/* Add to cart + wishlist */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={product.stock === 0 || adding}
                className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl text-base tracking-wide transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${ROSE}, #C94A74)` }}>
                <FiShoppingBag size={18} />
                {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button onClick={toggleWishlist} aria-label="Wishlist"
                className="border-2 p-4 rounded-2xl transition-all"
                style={{ borderColor: BORDER, color: inWishlist ? '#ef4444' : ROSE }}>
                {inWishlist ? <AiFillHeart size={20} className="text-red-500" /> : <AiOutlineHeart size={20} />}
              </button>
            </div>

            {/* Feature chips */}
            <div className="grid grid-cols-3 gap-3">
              {[{ icon: FiTruck, label: 'FREE SHIPPING' }, { icon: FiRefreshCw, label: '15-DAY RETURNS' }, { icon: FiShield, label: 'AUTHENTIC' }].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-xl p-3 text-center flex flex-col items-center gap-1.5" style={{ background: PEACH_LT }}>
                  <Icon size={16} style={{ color: ROSE }} />
                  <span className="text-xs font-medium font-sans" style={{ color: BERRY }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Pincode */}
            <div className="rounded-2xl p-4" style={{ background: PEACH_LT, border: `1px solid ${BORDER}` }}>
              <p className="text-xs font-bold uppercase tracking-widest font-sans mb-2" style={{ color: MAUVE }}>Check Delivery</p>
              <PincodeChecker />
            </div>
          </div>
        </div>

        {/* ══ TABS (below two-col, full width) ══ */}
        <ProductTabs product={product} productId={id} reviewCount={reviewCount} />

        {/* ══ SIMILAR PRODUCTS (stays outside tabs, below) ══ */}
        <SimilarProducts productId={id} />

      </div>
    </main>
  )
}
