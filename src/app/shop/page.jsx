'use client'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, X, Filter, Tag, ChevronDown,
  Star, SlidersHorizontal, ChevronLeft, ChevronRight,
  IndianRupee, Layers, Ruler, Check, ShoppingBag,
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { addToCartWithSync } from '../../utils/cartHelper'

/* ─── Palette tokens ─── */
const ROSE   = '#E05C88'
const BERRY  = '#7B2447'
const MAUVE  = '#6B4553'
const PINK   = '#F8A5B5'
const PEACH  = '#FBDBBB'
const CREAM  = '#FCFAE0'
const BORDER = '#F5C8D4'
const CARD   = '#FFFAF5'
const PEACH_LT = '#FEF0E3'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const BASE  = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

const SORT_OPTIONS = [
  { label: 'Newest First',       value: ''     },
  { label: 'Price: Low to High', value: 'asc'  },
  { label: 'Price: High to Low', value: 'desc' },
]

const COLLECTION_OPTIONS = [
  { label: 'All',          value: ''             },
  { label: 'New Arrivals', value: 'isNewArrival' },
  { label: 'Featured',     value: 'isFeatured'   },
  { label: 'Best Sellers', value: 'isBestSeller' },
]

/* ═══════════════════════════════════════════════════════════════════
   PROMO BANNER SLIDER  — pastel overlays, rose CTA button
═══════════════════════════════════════════════════════════════════ */
const BANNERS = [
  {
    src:      '/hero/image1.png',
    headline: 'New Season Collection',
    sub:      'Fresh kurtis, handpicked for you',
    cta:      'Explore Now',
    href:     '/shop?filter=isNewArrival',
    overlay:  'rgba(123,36,71,0.35)',
  },
  {
    src:      '/hero/image2.png',
    headline: 'Best Sellers',
    sub:      'Most loved by 10,000+ customers',
    cta:      'Shop Best Sellers',
    href:     '/shop?filter=isBestSeller',
    overlay:  'rgba(107,69,83,0.38)',
  },
  {
    src:      '/hero/image3.png',
    headline: 'Festival Styles',
    sub:      'Celebrate every occasion in elegance',
    cta:      'View Collection',
    href:     '/shop',
    overlay:  'rgba(123,36,71,0.32)',
  },
  {
    src:      '/hero/image4.jpg',
    headline: 'Up to 70% OFF',
    sub:      'Limited time — grab your favourites',
    cta:      'Shop Sale',
    href:     '/shop?sort=desc',
    overlay:  'rgba(107,69,83,0.40)',
  },
]

function PromoBannerSlider() {
  const [current,  setCurrent]  = useState(0)
  const [visible,  setVisible]  = useState(0)
  const timerRef                = useRef(null)
  const total                   = BANNERS.length

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), 4000)
    return () => clearInterval(timerRef.current)
  }, [total])

  useEffect(() => {
    const t = setTimeout(() => setVisible(current), 30)
    return () => clearTimeout(t)
  }, [current])

  return (
    <div className="relative w-full h-[180px] sm:h-[260px] md:h-[360px] overflow-hidden">
      {BANNERS.map((b, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{
            opacity:       i === visible ? 1 : 0,
            transform:     i === visible ? 'translateY(0)' : 'translateY(12px)',
            zIndex:        i === current ? 1 : 0,
            pointerEvents: i === visible ? 'auto' : 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.src} alt={b.headline} className="w-full h-full object-cover object-center" draggable={false} />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.38)' }} />
          <div className="absolute inset-0" style={{ background: b.overlay }} />

          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-16 pb-6">
            <p className="font-sans text-white/60 text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-1.5 font-semibold">
              Kurti Cove
            </p>
            <h2
              className="font-bold leading-tight mb-2.5"
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 'clamp(1.35rem, 4.5vw, 2.75rem)',
                background: `linear-gradient(100deg, #ffffff 0%, ${PINK} 55%, ${PEACH} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {b.headline}
            </h2>
            <p
              className="font-sans text-sm mb-4 hidden sm:block max-w-xs"
              style={{
                background: `linear-gradient(90deg, rgba(255,255,255,0.80) 0%, rgba(251,219,187,0.70) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {b.sub}
            </p>
            <Link
              href={b.href}
              className="self-start inline-flex items-center gap-2 font-sans font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: ROSE, color: '#fff' }}
            >
              {b.cta} <ChevronRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      ))}

      {/* Bottom fade into cream */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-10"
        style={{ background: `linear-gradient(to bottom, transparent 0%, ${CREAM}cc 100%)` }}
        aria-hidden="true"
      />

      {/* Dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i)
              clearInterval(timerRef.current)
              timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), 4000)
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   STAR RATING DISPLAY
═══════════════════════════════════════════════════════════════════ */
function StarDisplay({ rating, count }) {
  if (rating == null) return null
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((s) => (
          <Star
            key={s}
            size={10}
            strokeWidth={1.5}
            fill={rating >= s ? '#f59e0b' : 'none'}
            className={rating >= s ? 'text-amber-400' : 'text-gray-300'}
          />
        ))}
      </div>
      <span className="font-sans text-[10px] leading-none" style={{ color: MAUVE }}>
        {rating.toFixed(1)}
        {count != null && <span className="ml-0.5">({count})</span>}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SHOP PRODUCT CARD  — pastel theme, no cart button (navigate to PDP)
   Mobile: slightly smaller paddings & fonts via responsive classes
═══════════════════════════════════════════════════════════════════ */
function ShopProductCard({ product }) {
  const displayPrice = product.discountPrice || product.price
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price
  const discountPct  = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <Link href={`/product/${product._id}`} className="group block">
      <div
        className="bg-white rounded-[14px] overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
        style={{ border: `1px solid ${BORDER}`, boxShadow: `0 2px 10px rgba(224,92,136,0.08)` }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(224,92,136,0.20)' }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(224,92,136,0.08)' }}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-[13px]" style={{ background: PEACH_LT }}>
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag size={24} style={{ color: PINK, opacity: 0.4 }} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isNewArrival && (
              <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-none"
                    style={{ background: '#B5EDDB', color: BERRY }}>NEW</span>
            )}
            {product.isBestSeller && (
              <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-none"
                    style={{ background: PEACH, color: BERRY }}>BEST SELLER</span>
            )}
            {hasDiscount && (
              <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-none"
                    style={{ background: ROSE, color: '#fff' }}>{discountPct}% OFF</span>
            )}
          </div>

          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <span className="bg-white text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ color: BERRY }}>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-2.5 md:p-3 flex flex-col gap-1 flex-1">
          <h3
            className="text-[12px] md:text-sm font-semibold line-clamp-1 leading-snug font-sans"
            style={{ color: BERRY, fontFamily: 'var(--font-playfair), serif' }}
          >
            {product.name}
          </h3>

          {product.description && (
            <p
              className="text-[10px] md:text-[11px] font-sans leading-snug"
              style={{
                color: MAUVE,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.description}
            </p>
          )}

          {product.avgRating != null && (
            <div className="mt-0.5">
              <StarDisplay rating={product.avgRating} count={product.reviewCount} />
            </div>
          )}

          <div className="flex-1" />

          {/* Price */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="font-semibold text-[13px] md:text-sm font-sans" style={{ color: ROSE }}>
              ₹{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[10px] md:text-xs line-through font-sans font-normal" style={{ color: MAUVE }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SORT DROPDOWN  — pastel themed
═══════════════════════════════════════════════════════════════════ */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)
  const current         = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0]

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 border rounded-xl px-2.5 py-1.5 md:px-3.5 md:py-2 text-[11px] md:text-xs font-semibold font-sans transition-all duration-200 bg-white"
        style={{
          borderColor: open ? ROSE : BORDER,
          color:       open ? ROSE : BERRY,
          boxShadow:   open ? `0 0 0 2px ${ROSE}22` : 'none',
        }}
      >
        <SlidersHorizontal size={11} strokeWidth={2} className="md:w-[13px] md:h-[13px]" />
        <span>{current.label}</span>
        <ChevronDown
          size={11} strokeWidth={2.5}
          className={`md:w-[13px] md:h-[13px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-30 bg-white rounded-xl shadow-xl min-w-[180px] overflow-hidden"
          style={{ border: `1px solid ${BORDER}` }}
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-xs font-sans transition-colors"
              style={{
                background: opt.value === value ? PEACH_LT : 'white',
                color:      opt.value === value ? ROSE : BERRY,
                fontWeight: opt.value === value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   CATEGORY PILLS  — pastel active state
═══════════════════════════════════════════════════════════════════ */
function CategoryPills({ activeCategory, onSelect }) {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${BASE}product/categories`)
        const data = await res.json()
        if (data.success) setCategories(data.data)
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-hidden pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full animate-pulse flex-shrink-0"
               style={{ background: PEACH_LT }} />
        ))}
      </div>
    )
  }
  if (categories.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => onSelect('')}
        className="flex-shrink-0 snap-start inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
        style={
          !activeCategory
            ? { background: ROSE, borderColor: ROSE, color: '#fff', boxShadow: `0 2px 8px ${ROSE}44` }
            : { background: 'white', borderColor: BORDER, color: BERRY }
        }
      >
        All
      </button>
      {categories.map(({ name, count }) => (
        <button
          key={name}
          onClick={() => onSelect(name === activeCategory ? '' : name)}
          className="flex-shrink-0 snap-start inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap"
          style={
            activeCategory === name
              ? { background: ROSE, borderColor: ROSE, color: '#fff', boxShadow: `0 2px 8px ${ROSE}44` }
              : { background: 'white', borderColor: BORDER, color: BERRY }
          }
        >
          <Tag size={11} />
          {name}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-normal"
            style={
              activeCategory === name
                ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                : { background: PEACH_LT, color: MAUVE }
            }
          >
            {count}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR FILTER PANEL  — pastel themed
═══════════════════════════════════════════════════════════════════ */
function FilterSidebar({ filters, updateFilter, clearFilters, hasActiveFilters, onClose, isDrawer }) {
  const [searchInput,   setSearchInput]   = useState(filters.search)
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice)
  const searchDebounce = useRef(null)

  useEffect(() => {
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => {
      if (searchInput !== filters.search) updateFilter('search', searchInput)
    }, 300)
    return () => clearTimeout(searchDebounce.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  useEffect(() => { setSearchInput(filters.search) },     [filters.search])
  useEffect(() => { setMinPriceInput(filters.minPrice) }, [filters.minPrice])
  useEffect(() => { setMaxPriceInput(filters.maxPrice) }, [filters.maxPrice])

  const applyPrice = () => {
    updateFilter('minPrice', minPriceInput)
    updateFilter('maxPrice', maxPriceInput)
  }

  const SectionHead = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0"
           style={{ background: PEACH_LT }}>
        <Icon size={12} strokeWidth={2.5} style={{ color: ROSE }} />
      </div>
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] flex-1"
         style={{ color: BERRY }}>
        {text}
      </p>
    </div>
  )

  const Divider = () => <div className="border-t my-4" style={{ borderColor: BORDER }} />

  const inputCls = "flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all"
  const inputStyle = { borderColor: BORDER, background: CARD }

  return (
    <div className={isDrawer ? 'h-full flex flex-col' : ''}>

      {/* Drawer header */}
      {isDrawer && (
        <div className="flex items-center justify-between px-5 py-4 border-b"
             style={{ borderColor: BORDER, background: PEACH_LT }}>
          <span className="font-bold text-base" style={{ fontFamily: 'var(--font-playfair), serif', color: BERRY }}>
            Filters
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: PINK }}
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className={`p-4 ${isDrawer ? 'flex-1 overflow-y-auto' : ''}`}>

        {/* Search */}
        <SectionHead icon={Search} text="Search" />
        <div className={inputCls} style={inputStyle}>
          <Search size={12} className="flex-shrink-0" style={{ color: PINK }} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search kurtis…"
            className="flex-1 text-xs bg-transparent outline-none font-sans"
            style={{ color: BERRY }}
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} style={{ color: PINK }}>
              <X size={11} />
            </button>
          )}
        </div>

        <Divider />

        {/* Price Range */}
        <SectionHead icon={IndianRupee} text="Price Range" />
        <div className="flex items-stretch gap-2 mb-3">
          {[
            { label: 'Min ₹', val: minPriceInput, set: setMinPriceInput, ph: '0' },
            { label: 'Max ₹', val: maxPriceInput, set: setMaxPriceInput, ph: 'Any' },
          ].map((f, idx) => (
            <div key={idx} className="flex-1 border rounded-xl px-3 py-2 transition-all"
                 style={{ borderColor: BORDER, background: CARD }}>
              <p className="text-[9px] font-sans font-semibold uppercase tracking-wide mb-0.5"
                 style={{ color: PINK }}>{f.label}</p>
              <input
                type="number" min={0} value={f.val} placeholder={f.ph}
                onChange={(e) => f.set(e.target.value)}
                className="w-full text-xs bg-transparent outline-none font-sans"
                style={{ color: BERRY }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={applyPrice}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold font-sans transition-all active:scale-95 text-white"
          style={{ background: ROSE }}
        >
          <Check size={12} strokeWidth={2.5} /> Apply Price Filter
        </button>

        <Divider />

        {/* Collection */}
        <SectionHead icon={Layers} text="Collection" />
        <div className="space-y-0.5 mb-1">
          {COLLECTION_OPTIONS.map((opt) => {
            const active = filters.filter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => updateFilter('filter', opt.value)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all duration-150 flex items-center gap-2"
                style={{
                  background: active ? ROSE : 'transparent',
                  color:      active ? '#fff' : BERRY,
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0 border transition-all"
                      style={active ? { background: '#fff', borderColor: '#fff' } : { borderColor: PINK }} />
                {opt.label}
              </button>
            )
          })}
        </div>

        <Divider />

        {/* Size */}
        <SectionHead icon={Ruler} text="Size" />
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => updateFilter('size', filters.size === s ? '' : s)}
              className="px-3 py-1.5 rounded-full border text-xs font-semibold font-sans transition-all duration-150"
              style={
                filters.size === s
                  ? { background: ROSE, borderColor: ROSE, color: '#fff' }
                  : { background: 'white', borderColor: BORDER, color: BERRY }
              }
            >
              {s}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <>
            <Divider />
            <button
              onClick={clearFilters}
              className="w-full border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 py-2.5 rounded-xl text-xs font-semibold font-sans transition-colors"
            >
              Clear All Filters
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN SHOP CONTENT
═══════════════════════════════════════════════════════════════════ */
function ShopContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [pagination,  setPagination]  = useState({ total: 0, pages: 1, page: 1 })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userInteracted = useRef(false)

  const [filters, setFilters] = useState({
    sort: '', size: '', filter: '', category: '', search: '', minPrice: '', maxPrice: '', page: 1,
  })

  const didInitRef = useRef(false)
  useEffect(() => {
    if (userInteracted.current) return
    setFilters({
      sort:     searchParams.get('sort')     || '',
      size:     searchParams.get('size')     || '',
      filter:   searchParams.get('filter')   || '',
      category: searchParams.get('category') || '',
      search:   searchParams.get('search')   || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      page:     Number(searchParams.get('page')) || 1,
    })
    didInitRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!userInteracted.current) return
    const params = new URLSearchParams()
    if (filters.sort)     params.set('sort',     filters.sort)
    if (filters.size)     params.set('size',     filters.size)
    if (filters.filter)   params.set('filter',   filters.filter)
    if (filters.category) params.set('category', filters.category)
    if (filters.search)   params.set('search',   filters.search)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.page > 1) params.set('page',     String(filters.page))
    const qs = params.toString()
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.sort)     params.set('sort',     filters.sort)
      if (filters.size)     params.set('size',     filters.size)
      if (filters.search)   params.set('search',   filters.search)
      if (filters.filter)   params.set(filters.filter, 'true')
      if (filters.category) params.set('category', filters.category)
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      params.set('page',  String(filters.page))
      params.set('limit', '20')
      const res  = await fetch(`${BASE}product?${params}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.success) { setProducts(data.data); setPagination(data.pagination) }
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateFilter = useCallback((key, value) => {
    userInteracted.current = true
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    userInteracted.current = true
    setFilters({ sort: '', size: '', filter: '', category: '', search: '', minPrice: '', maxPrice: '', page: 1 })
  }, [])

  const hasActiveFilters = !!(
    filters.sort || filters.size || filters.filter ||
    filters.search || filters.category || filters.minPrice || filters.maxPrice
  )

  return (
    <main className="min-h-screen" style={{ background: CREAM }}>

      <PromoBannerSlider />

      <div className="h-5" style={{ background: CREAM }} />

      {/* Category strip — sticky */}
      <div
        className="border-b sticky top-[74px] md:top-[98px] z-20"
        style={{ borderColor: BORDER, background: 'rgba(255,250,245,0.92)', backdropFilter: 'blur(8px)' }}
      >
        <div className="w-full px-4 sm:px-6 py-3">
          <CategoryPills activeCategory={filters.category} onSelect={(cat) => updateFilter('category', cat)} />
        </div>
      </div>

      <div className="h-5" style={{ background: CREAM }} />

      {/* Main layout */}
      <div className="w-full px-4 sm:px-6 pb-12 flex gap-6 lg:gap-8 items-start">

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:block flex-shrink-0 w-56 xl:w-60 rounded-2xl overflow-hidden"
          style={{
            position:  'sticky',
            top:       '168px',
            maxHeight: 'calc(100vh - 184px)',
            overflowY: 'auto',
            zIndex:    10,
            background: 'white',
            border:    `1px solid ${BORDER}`,
            boxShadow: `0 4px 16px rgba(224,92,136,0.10)`,
          }}
        >
          <FilterSidebar
            filters={filters} updateFilter={updateFilter}
            clearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
            isDrawer={false}
          />
        </aside>

        {/* Product area */}
        <div className="flex-1 min-w-0">

          {/* Mobile: filter button + sort */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors"
              style={{ borderColor: BORDER, color: BERRY }}
            >
              <Filter size={14} /> Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full" style={{ background: ROSE }} />}
            </button>
            <div className="flex items-center gap-2">
              <p className="hidden md:block text-xs font-sans" style={{ color: PINK }}>
                {pagination.total} products
              </p>
              <SortDropdown value={filters.sort} onChange={(v) => updateFilter('sort', v)} />
            </div>
          </div>

          {/* Desktop: active filter tags + sort */}
          <div className="hidden lg:flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {filters.category && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: PEACH_LT, color: ROSE }}>
                  <Tag size={10} /> {filters.category}
                  <button onClick={() => updateFilter('category', '')} className="ml-0.5"><X size={10} /></button>
                </span>
              )}
              {filters.filter && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: PEACH_LT, color: ROSE }}>
                  <Layers size={10} /> {COLLECTION_OPTIONS.find((o) => o.value === filters.filter)?.label}
                  <button onClick={() => updateFilter('filter', '')} className="ml-0.5"><X size={10} /></button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: PEACH_LT, color: ROSE }}>
                  <Search size={10} /> &ldquo;{filters.search}&rdquo;
                  <button onClick={() => updateFilter('search', '')} className="ml-0.5"><X size={10} /></button>
                </span>
              )}
              <p className="text-xs font-sans" style={{ color: PINK }}>{pagination.total} products</p>
            </div>
            <SortDropdown value={filters.sort} onChange={(v) => updateFilter('sort', v)} />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[14px] overflow-hidden animate-pulse"
                     style={{ border: `1px solid ${BORDER}` }}>
                  <div className="aspect-[3/4]" style={{ background: PEACH_LT }} />
                  <div className="p-3 space-y-2">
                    <div className="h-3 rounded w-3/4" style={{ background: BORDER }} />
                    <div className="h-3 rounded w-full" style={{ background: BORDER }} />
                    <div className="h-3 rounded w-1/2" style={{ background: BORDER }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                   style={{ background: PEACH_LT }}>
                <Search size={28} strokeWidth={1.5} style={{ color: PINK }} />
              </div>
              <h3 className="text-xl font-bold mb-2"
                  style={{ fontFamily: 'var(--font-playfair), serif', color: BERRY }}>
                {filters.search
                  ? `No results for "${filters.search}"`
                  : filters.category
                    ? `No kurtis in "${filters.category}" yet`
                    : 'No kurtis found'}
              </h3>
              <p className="font-sans text-sm mb-6 max-w-xs" style={{ color: MAUVE }}>
                Try a different search term, or clear your filters to browse all styles.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-full text-sm font-medium font-sans transition-colors"
                style={{ background: ROSE }}
              >
                <X size={14} /> Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((p) => <ShopProductCard key={p._id} product={p} />)}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                    disabled={filters.page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border text-sm font-sans disabled:opacity-40 transition-colors"
                    style={{ borderColor: BORDER, color: BERRY, background: 'white' }}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="px-4 py-2 text-sm font-medium font-sans" style={{ color: BERRY }}>
                    {filters.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: Math.min(pagination.pages, f.page + 1) }))}
                    disabled={filters.page === pagination.pages}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border text-sm font-sans disabled:opacity-40 transition-colors"
                    style={{ borderColor: BORDER, color: BERRY, background: 'white' }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out lg:hidden max-h-[85vh] flex flex-col ${
          sidebarOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: BORDER }} />
        </div>
        <FilterSidebar
          filters={filters} updateFilter={updateFilter}
          clearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
          onClose={() => setSidebarOpen(false)} isDrawer={true}
        />
      </div>
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: ROSE, borderTopColor: 'transparent' }} />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
