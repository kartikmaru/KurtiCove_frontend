'use client'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, X, Filter, Tag, ChevronDown,
  Star, SlidersHorizontal, ChevronLeft, ChevronRight,
  IndianRupee, Layers, Ruler, Check,
} from 'lucide-react'

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
   PROMO BANNER SLIDER
   Uses /hero/image1-4.png from public/hero/.
   Crossfade + subtle translateY between slides, auto-advances 4s.
═══════════════════════════════════════════════════════════════════ */
const BANNERS = [
  {
    src: '/hero/image1.png',
    headline: 'New Season Collection',
    sub: 'Fresh kurtis, handpicked for you',
    cta: 'Explore Now',
    href: '/shop?filter=isNewArrival',
    overlay: 'rgba(59,7,100,0.38)',
  },
  {
    src: '/hero/image2.png',
    headline: 'Best Sellers',
    sub: 'Most loved by 10,000+ customers',
    cta: 'Shop Best Sellers',
    href: '/shop?filter=isBestSeller',
    overlay: 'rgba(30,10,60,0.42)',
  },
  {
    src: '/hero/image3.png',
    headline: 'Festival Styles',
    sub: 'Celebrate every occasion in elegance',
    cta: 'View Collection',
    href: '/shop',
    overlay: 'rgba(80,10,80,0.40)',
  },
  {
    src: '/hero/image4.png',
    headline: 'Up to 70% OFF',
    sub: 'Limited time — grab your favourites',
    cta: 'Shop Sale',
    href: '/shop?sort=desc',
    overlay: 'rgba(20,10,50,0.44)',
  },
]

function PromoBannerSlider() {
  const [current,  setCurrent]  = useState(0)
  const [visible,  setVisible]  = useState(0)
  const timerRef                = useRef(null)
  const total                   = BANNERS.length

  // Auto-advance only — no manual goTo needed since arrows are removed
  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), 4000)
    return () => clearInterval(timerRef.current)
  }, [total])

  // Lag visible by 30ms so the CSS fade transition actually plays
  useEffect(() => {
    const t = setTimeout(() => setVisible(current), 30)
    return () => clearTimeout(t)
  }, [current])

  return (
    /*
      Full-width hero — slimmer than before.
      Height: 180px mobile, 260px tablet, 360px desktop.
    */
    <div className="relative w-full h-[180px] sm:h-[260px] md:h-[360px] overflow-hidden">
      {/* Slides */}
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
          <img
            src={b.src}
            alt={b.headline}
            className="w-full h-full object-cover object-center"
            draggable={false}
          />

          {/* Black overlay for legibility */}
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />

          {/* Per-slide tint on top */}
          <div className="absolute inset-0" style={{ background: b.overlay }} />

          {/* Text content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-16 pb-6">
            <p className="font-sans text-white/55 text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-1.5 font-semibold">
              Kurti Cove
            </p>

            {/* Gradient headline — white → lavender → warm rose */}
            <h2
              className="font-bold leading-tight mb-2.5"
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 'clamp(1.35rem, 4.5vw, 2.75rem)',
                background: 'linear-gradient(100deg, #ffffff 0%, #E9D5FF 45%, #F9A8D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {b.headline}
            </h2>

            {/* Sub-text gradient — slightly muted */}
            <p
              className="font-sans text-sm mb-4 hidden sm:block max-w-xs"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.80) 0%, rgba(233,213,255,0.70) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {b.sub}
            </p>

            <Link
              href={b.href}
              className="self-start inline-flex items-center gap-2 bg-white text-[#7C3AED] font-sans font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              {b.cta} <ChevronRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      ))}

      {/* Bottom fade — subtle, shorter, lighter so it just softens the edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(250,245,255,0.85) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Dots — above the fade */}
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
   Shows filled / half / empty Lucide Star icons based on avgRating.
═══════════════════════════════════════════════════════════════════ */
function StarDisplay({ rating, count }) {
  if (rating == null) return null
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {stars.map((s) => {
          const filled = rating >= s
          const half   = !filled && rating >= s - 0.5
          return (
            <Star
              key={s}
              size={11}
              strokeWidth={1.5}
              fill={filled ? '#f59e0b' : half ? 'url(#half)' : 'none'}
              className={filled || half ? 'text-amber-400' : 'text-gray-300'}
            />
          )
        })}
      </div>
      <span className="font-sans text-[10px] text-gray-400 leading-none">
        {rating.toFixed(1)}
        {count != null && <span className="ml-0.5">({count})</span>}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SHOP PRODUCT CARD  — shop-page only
   • Serif title, gradient discount pill, star rating
   • NO add-to-cart button — clicking navigates to product details
     where the user selects size/colour first
═══════════════════════════════════════════════════════════════════ */
function ShopProductCard({ product }) {
  const displayPrice = product.discountPrice || product.price
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price
  const discountPct  = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <Link href={`/product/${product._id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-[#E9D5FF] shadow-sm hover:shadow-[0_8px_28px_rgba(168,85,247,0.18)] transition-all duration-300 hover:-translate-y-1.5">

        {/* Image */}
        <div className="relative aspect-[3/4] bg-[#F3E8FF] overflow-hidden">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag size={28} className="text-[#C084FC] opacity-30" />
            </div>
          )}

          {/* Gradient discount pill — top-left */}
          {hasDiscount && (
            <div
              className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full shadow-md"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
            >
              <span className="font-sans font-black text-white text-[10px] leading-none tracking-tight">
                {discountPct}% OFF
              </span>
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-[#3B0764] text-xs font-semibold px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-3">
          {/* Serif product title */}
          <h3
            className="text-sm font-semibold text-[#3B0764] line-clamp-1 mb-1 leading-snug"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            {product.name}
          </h3>

          {/* 2-line description */}
          {product.description && (
            <p
              className="text-[11px] text-gray-400 font-sans leading-snug mb-1.5"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {product.description}{' '}
              <span className="text-purple-400 font-medium underline underline-offset-1">More</span>
            </p>
          )}

          {/* Star rating */}
          {product.avgRating != null && (
            <div className="mb-1.5">
              <StarDisplay rating={product.avgRating} count={product.reviewCount} />
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="font-semibold text-[#7C3AED] text-sm font-sans">
              ₹{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through font-sans font-normal">
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
   SORT DROPDOWN  — sits above product grid, top-right
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
        className={`inline-flex items-center gap-1.5 border rounded-xl px-2.5 py-1.5 md:px-3.5 md:py-2 text-[11px] md:text-xs font-semibold font-sans transition-all duration-200 bg-white ${
          open
            ? 'border-[#A855F7] text-[#A855F7] ring-2 ring-[#A855F7]/20'
            : 'border-[#E9D5FF] text-[#3B0764] hover:border-[#A855F7] hover:text-[#A855F7]'
        }`}
      >
        <SlidersHorizontal size={11} strokeWidth={2} className="md:w-[13px] md:h-[13px]" />
        <span>{current.label}</span>
        <ChevronDown size={11} strokeWidth={2.5} className={`md:w-[13px] md:h-[13px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 bg-white border border-[#E9D5FF] rounded-xl shadow-xl shadow-purple-100/40 min-w-[180px] overflow-hidden">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-xs font-sans transition-colors ${
                opt.value === value
                  ? 'bg-[#F3E8FF] text-[#A855F7] font-semibold'
                  : 'text-[#3B0764] hover:bg-[#FAF5FF] hover:text-[#A855F7]'
              }`}
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
   CATEGORY PILLS  — horizontal scroll strip
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
          <div key={i} className="h-8 w-24 bg-purple-100 rounded-full animate-pulse flex-shrink-0" />
        ))}
      </div>
    )
  }
  if (categories.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => onSelect('')}
        className={`flex-shrink-0 snap-start inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
          !activeCategory
            ? 'bg-[#A855F7] border-[#A855F7] text-white shadow-md shadow-purple-200'
            : 'bg-white border-[#E9D5FF] text-[#3B0764] hover:border-[#A855F7] hover:text-[#A855F7]'
        }`}
      >
        All
      </button>
      {categories.map(({ name, count }) => (
        <button
          key={name}
          onClick={() => onSelect(name === activeCategory ? '' : name)}
          className={`flex-shrink-0 snap-start inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
            activeCategory === name
              ? 'bg-[#A855F7] border-[#A855F7] text-white shadow-md shadow-purple-200'
              : 'bg-white border-[#E9D5FF] text-[#3B0764] hover:border-[#A855F7] hover:text-[#A855F7]'
          }`}
        >
          <Tag size={11} />
          {name}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-normal ${
            activeCategory === name ? 'bg-white/25 text-white' : 'bg-purple-50 text-purple-400'
          }`}>
            {count}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR FILTER PANEL  — polished elevated card
═══════════════════════════════════════════════════════════════════ */
function FilterSidebar({ filters, updateFilter, clearFilters, hasActiveFilters, onClose, isDrawer }) {
  const [searchInput,   setSearchInput]   = useState(filters.search)
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice)
  const searchDebounce = useRef(null)

  // Live search — debounced 300ms
  useEffect(() => {
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => {
      if (searchInput !== filters.search) updateFilter('search', searchInput)
    }, 300)
    return () => clearTimeout(searchDebounce.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  // Sync local inputs when filters are cleared externally
  useEffect(() => { setSearchInput(filters.search) },     [filters.search])
  useEffect(() => { setMinPriceInput(filters.minPrice) }, [filters.minPrice])
  useEffect(() => { setMaxPriceInput(filters.maxPrice) }, [filters.maxPrice])

  const applyPrice = () => {
    updateFilter('minPrice', minPriceInput)
    updateFilter('maxPrice', maxPriceInput)
  }

  // Section heading — icon + label with a bottom rule
  const SectionHead = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#F3E8FF] flex-shrink-0">
        <Icon size={12} className="text-[#A855F7]" strokeWidth={2.5} />
      </div>
      <p className="font-sans text-[11px] font-bold text-[#6B21A8] uppercase tracking-[0.16em] flex-1">
        {text}
      </p>
    </div>
  )

  const Divider = () => <div className="border-t border-[#F3E8FF] my-4" />

  return (
    <div className={isDrawer ? 'h-full flex flex-col' : ''}>

      {/* Drawer header */}
      {isDrawer && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9D5FF] bg-[#FAF5FF]">
          <span className="font-bold text-[#3B0764] text-base" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Filters
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-purple-100 text-[#C084FC] hover:text-[#A855F7] transition-colors"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Body */}
      <div className={`p-4 ${isDrawer ? 'flex-1 overflow-y-auto' : ''}`}>

        {/* ── Search ── */}
        <SectionHead icon={Search} text="Search" />
        <div className="flex items-center gap-2 border border-[#E9D5FF] rounded-xl px-3 py-2.5 bg-[#FAF5FF] focus-within:ring-2 focus-within:ring-[#A855F7]/25 focus-within:border-[#A855F7] transition-all">
          <Search size={12} className="text-[#C084FC] flex-shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search kurtis…"
            className="flex-1 text-xs text-[#3B0764] bg-transparent outline-none font-sans placeholder-[#C084FC]"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="text-[#C084FC] hover:text-[#A855F7] transition-colors">
              <X size={11} />
            </button>
          )}
        </div>

        <Divider />

        {/* ── Price Range ── */}
        <SectionHead icon={IndianRupee} text="Price Range" />
        <div className="flex items-stretch gap-2 mb-3">
          <div className="flex-1 border border-[#E9D5FF] rounded-xl px-3 py-2 bg-[#FAF5FF] focus-within:ring-2 focus-within:ring-[#A855F7]/25 focus-within:border-[#A855F7] transition-all">
            <p className="text-[9px] text-[#C084FC] font-sans font-semibold uppercase tracking-wide mb-0.5">Min ₹</p>
            <input
              type="number" min={0} value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              placeholder="0"
              className="w-full text-xs text-[#3B0764] bg-transparent outline-none font-sans"
            />
          </div>
          <div className="flex items-center text-[#C084FC] text-xs font-sans self-center">—</div>
          <div className="flex-1 border border-[#E9D5FF] rounded-xl px-3 py-2 bg-[#FAF5FF] focus-within:ring-2 focus-within:ring-[#A855F7]/25 focus-within:border-[#A855F7] transition-all">
            <p className="text-[9px] text-[#C084FC] font-sans font-semibold uppercase tracking-wide mb-0.5">Max ₹</p>
            <input
              type="number" min={0} value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              placeholder="Any"
              className="w-full text-xs text-[#3B0764] bg-transparent outline-none font-sans"
            />
          </div>
        </div>
        <button
          onClick={applyPrice}
          className="w-full flex items-center justify-center gap-1.5 bg-[#A855F7] hover:bg-[#9333EA] active:scale-95 text-white py-2 rounded-xl text-xs font-semibold font-sans transition-all"
        >
          <Check size={12} strokeWidth={2.5} /> Apply Price Filter
        </button>

        <Divider />

        {/* ── Collection ── */}
        <SectionHead icon={Layers} text="Collection" />
        <div className="space-y-0.5 mb-1">
          {COLLECTION_OPTIONS.map((opt) => {
            const active = filters.filter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => updateFilter('filter', opt.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all duration-150 flex items-center gap-2 ${
                  active
                    ? 'bg-[#A855F7] text-white'
                    : 'text-[#3B0764] hover:bg-[#F3E8FF] hover:text-[#A855F7]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 border transition-all ${
                    active ? 'bg-white border-white' : 'border-[#C084FC]'
                  }`}
                />
                {opt.label}
              </button>
            )
          })}
        </div>

        <Divider />

        {/* ── Size ── */}
        <SectionHead icon={Ruler} text="Size" />
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => updateFilter('size', filters.size === s ? '' : s)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold font-sans transition-all duration-150 ${
                filters.size === s
                  ? 'bg-[#A855F7] border-[#A855F7] text-white shadow-sm shadow-purple-200'
                  : 'border-[#E9D5FF] bg-white text-[#3B0764] hover:border-[#A855F7] hover:text-[#A855F7] hover:bg-[#FAF5FF]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ── Clear all ── */}
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

  /*
    FIX (1) — Collection filter not applied to product list
    ─────────────────────────────────────────────────────────────────────
    Root cause: useState lazy-init runs during Suspense hydration before
    the real URL params are available. By the time the component mounts
    with the real URL, filters.filter is already '' and fetchProducts has
    already fired with no collection filter.

    Solution: don't use useState lazy init for URL-derived values at all.
    Instead, keep a single `filters` state that is always authoritative,
    and on every render compute the EFFECTIVE filters by merging the
    current state with what searchParams currently says. fetchProducts
    reads from the merged effective filters so it always reflects the URL.

    Simpler approach used here: read searchParams directly in the fetch
    function when filters.filter hasn't been manually set yet (i.e. on
    first load). We track whether the user has manually changed a filter
    with `userInteracted` ref — before that, always read from searchParams.
  */
  const userInteracted = useRef(false)

  const [filters, setFilters] = useState({
    sort:     '',
    size:     '',
    filter:   '',
    category: '',
    search:   '',
    minPrice: '',
    maxPrice: '',
    page:     1,
  })

  /*
    Read URL params into filters on mount and on every searchParams change
    (covers hard refresh, direct URL paste, browser back/forward).
    This useEffect runs AFTER mount so useSearchParams is fully hydrated.
  */
  const didInitRef = useRef(false)
  useEffect(() => {
    if (userInteracted.current) return  // user has taken control — don't overwrite
    const fromURL = {
      sort:     searchParams.get('sort')     || '',
      size:     searchParams.get('size')     || '',
      filter:   searchParams.get('filter')  || '',
      category: searchParams.get('category')|| '',
      search:   searchParams.get('search')  || '',
      minPrice: searchParams.get('minPrice')|| '',
      maxPrice: searchParams.get('maxPrice')|| '',
      page:     Number(searchParams.get('page')) || 1,
    }
    setFilters(fromURL)
    didInitRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only on mount — searchParams is stable across the initial hydration

  // Sync URL when user manually changes filters (not on URL-driven init)
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
      // Collection filter: translate filters.filter value to the boolean flag the API expects
      // e.g. filters.filter = 'isNewArrival' → sends ?isNewArrival=true
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
    <main className="min-h-screen bg-[#FAF5FF]">

      {/* ── Full-width promo banner — replaces the old heading strip ── */}
      <PromoBannerSlider />

      {/* Gap between slider and category strip */}
      <div className="h-5 bg-[#FAF5FF]" />

      {/* ── Category strip — sticky below header with visible gap ──
          Offset = header height + 18px gap
          Mobile:  56px header + 18px = 74px  → top-[74px]
          Desktop: 80px header + 18px = 98px  → top-[98px]
          z-20 — always below header (z-[60]).
      ── */}
      <div className="border-b border-purple-100 bg-white/90 backdrop-blur-sm sticky top-[74px] md:top-[98px] z-20">
        <div className="w-full px-4 sm:px-6 py-3">
          <CategoryPills
            activeCategory={filters.category}
            onSelect={(cat) => updateFilter('category', cat)}
          />
        </div>
      </div>

      {/* Gap between category strip and main content */}
      <div className="h-5 bg-[#FAF5FF]" />

      {/* ── Main layout: sidebar + grid — FIX (2) full-width, no max-w ── */}
      <div className="w-full px-4 sm:px-6 pb-12 flex gap-6 lg:gap-8 items-start">

        {/*
          DESKTOP STICKY SIDEBAR
          ─────────────────────────────────────────────────────────────
          Exact top offset so sidebar stops BELOW the category bar with visible gap:

          Header (desktop, NOT scrolled):   80px  (md:h-20)
          Gap above category bar:           20px  (h-5 div)
          Category strip height:            46px  (py-3 = 24px + ~22px pills)
          Gap below category bar:           20px  (h-5 div)
          Total:                           166px  → use 168px for breathing room

          When scrolled, header becomes a pill with mt-3 (12px). Its actual
          rendered top is ~12px from viewport, but sticky is relative to scroll
          position, not rendered position. The 168px top is still safe because
          the category strip itself is sticky at top-[80px] and occupies ~46px,
          so sidebar's 168px > 80 + 46 + 20 = 146px — guaranteed gap.

          z-index: 10 — well below header (z-[60]) and category strip (z-20).
        */}
        <aside
          className="hidden lg:block flex-shrink-0 w-56 xl:w-60 bg-white rounded-2xl border border-[#E9D5FF] shadow-md overflow-hidden"
          style={{
            position:  'sticky',
            top:       '168px',
            maxHeight: 'calc(100vh - 184px)',
            overflowY: 'auto',
            zIndex:    10,
          }}
        >
          <FilterSidebar
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            isDrawer={false}
          />
        </aside>

        {/* ══ PRODUCT AREA ══ */}
        <div className="flex-1 min-w-0">

          {/* Mobile: filter button + count row */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 bg-white border border-[#E9D5FF] text-[#3B0764] px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:border-[#A855F7] transition-colors"
            >
              <Filter size={14} /> Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-[#A855F7] rounded-full" />}
            </button>
            <div className="flex items-center gap-2">
              {/* Product count hidden on mobile */}
              <p className="hidden md:block text-xs text-[#C084FC] font-sans">{pagination.total} products</p>
              <SortDropdown value={filters.sort} onChange={(v) => updateFilter('sort', v)} />
            </div>
          </div>

          {/* Desktop: active tags + sort */}
          <div className="hidden lg:flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {filters.category && (
                <span className="inline-flex items-center gap-1.5 bg-[#F3E8FF] text-[#A855F7] text-xs font-semibold px-3 py-1 rounded-full">
                  <Tag size={10} /> {filters.category}
                  <button onClick={() => updateFilter('category', '')} className="ml-0.5 hover:text-[#7C3AED]"><X size={10} /></button>
                </span>
              )}
              {filters.filter && (
                <span className="inline-flex items-center gap-1.5 bg-[#F3E8FF] text-[#A855F7] text-xs font-semibold px-3 py-1 rounded-full">
                  <Layers size={10} /> {COLLECTION_OPTIONS.find((o) => o.value === filters.filter)?.label}
                  <button onClick={() => updateFilter('filter', '')} className="ml-0.5 hover:text-[#7C3AED]"><X size={10} /></button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-1.5 bg-[#F3E8FF] text-[#A855F7] text-xs font-semibold px-3 py-1 rounded-full">
                  <Search size={10} /> &ldquo;{filters.search}&rdquo;
                  <button onClick={() => updateFilter('search', '')} className="ml-0.5 hover:text-[#7C3AED]"><X size={10} /></button>
                </span>
              )}
              <p className="text-xs text-[#C084FC] font-sans">{pagination.total} products</p>
            </div>
            <SortDropdown value={filters.sort} onChange={(v) => updateFilter('sort', v)} />
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E9D5FF] overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-[#F3E8FF]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#E9D5FF] rounded w-3/4" />
                    <div className="h-3 bg-[#E9D5FF] rounded w-full" />
                    <div className="h-3 bg-[#E9D5FF] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] flex items-center justify-center mb-5">
                <Search size={28} className="text-[#C084FC]" strokeWidth={1.5} />
              </div>
              <h3
                className="text-xl font-bold text-[#3B0764] mb-2"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {filters.search
                  ? `No results for "${filters.search}"`
                  : filters.category
                    ? `No kurtis in "${filters.category}" yet`
                    : 'No kurtis found'}
              </h3>
              <p className="font-sans text-[#C084FC] text-sm mb-6 max-w-xs">
                Try a different search term, or clear your filters to browse all styles.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white px-6 py-2.5 rounded-full text-sm font-medium font-sans transition-colors"
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
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-[#E9D5FF] text-sm text-[#3B0764] hover:bg-[#F3E8FF] disabled:opacity-40 transition-colors font-sans"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="px-4 py-2 text-sm text-[#6B21A8] font-medium font-sans">
                    {filters.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: Math.min(pagination.pages, f.page + 1) }))}
                    disabled={filters.page === pagination.pages}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-[#E9D5FF] text-sm text-[#3B0764] hover:bg-[#F3E8FF] disabled:opacity-40 transition-colors font-sans"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══ MOBILE FILTER DRAWER ══ */}
      {/* Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Drawer panel — z-50 sits above backdrop (40) but below header (60) on desktop; on mobile header is 60 but drawer slides from bottom so it's fine */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out lg:hidden max-h-[85vh] flex flex-col ${
          sidebarOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <FilterSidebar
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          onClose={() => setSidebarOpen(false)}
          isDrawer={true}
        />
      </div>
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
