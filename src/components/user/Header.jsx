'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import {
  FiShoppingBag, FiMenu, FiX,
  FiLogOut, FiPackage, FiChevronRight, FiSearch,
} from 'react-icons/fi'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { ChevronDown, User, Settings } from 'lucide-react'
import { resetCart } from '../../redux/features/CartSlice'
import API from '../../utils/Helper'

/* ─────────────────────────────────────────────────────────────
   THEME TOKENS — change one value here to retheme the header
───────────────────────────────────────────────────────────────*/
const THEME = {
  // Header gradient — soft rose pink → peach
  grad: 'linear-gradient(125deg, #F8A5B5 0%, #FBCBB0 50%, #FBDBBB 100%)',
  // Pill shadow (warm rose glow)
  pillShadow: '0 8px 36px rgba(224,92,136,0.28)',
  pillBorder: 'rgba(123,36,71,0.18)',
  // Text / icons — deep berry on pastel bg
  textIvory:  '#7B2447',
  textMuted:  'rgba(123,36,71,0.60)',
  // Active accent
  accentGold:  '#E05C88',
  accentUnder: '#C94A74',
  // Badges — mint with berry numbers
  cartBadge:     '#B5EDDB',
  cartBadgeText: '#7B2447',
}

/*
  CSS variable block — injected once so future palette tweaks
  are genuinely one-liner changes at the top of this file.
*/
const CSS_VARS = `
  :root {
    --hdr-grad:        ${THEME.grad};
    --hdr-pill-shadow: ${THEME.pillShadow};
    --hdr-pill-border: ${THEME.pillBorder};
    --hdr-radius-flat: 0px;
    --hdr-radius-pill: 50px;
    --hdr-inset-mobile: 12px;
    --hdr-inset-desk:   20px;
    --hdr-mt-pill:      10px;
  }
  .kc-header-wrapper {
    transition:
      border-radius 0.35s cubic-bezier(0.4,0,0.2,1),
      left          0.35s cubic-bezier(0.4,0,0.2,1),
      right         0.35s cubic-bezier(0.4,0,0.2,1),
      top           0.35s cubic-bezier(0.4,0,0.2,1),
      box-shadow    0.35s cubic-bezier(0.4,0,0.2,1),
      border        0.35s cubic-bezier(0.4,0,0.2,1);
  }
`

const navLinks = [
  { label: 'Home',         href: '/' },
  { label: 'Shop',         href: '/shop' },
  { label: 'New Arrivals', href: '/shop?filter=isNewArrival' },
  { label: 'Best Sellers', href: '/shop?filter=isBestSeller' },
]

const WL_KEY = 'kc_wishlist'

/* ── Profile initial avatar ──────────────────────────────────*/
function AvatarInitial({ name }) {
  const initial = (name || 'U')[0].toUpperCase()
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ring-1"
      style={{
        background: 'linear-gradient(135deg,#E05C88,#F8A5B5)',
        color: '#fff',
        ringColor: 'rgba(123,36,71,0.25)',
      }}
    >
      {initial}
    </span>
  )
}

function HeaderInner() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [userMenu,    setUserMenu]    = useState(false)
  const [user,        setUser]        = useState(null)
  const [wishlist,    setWishlist]    = useState([])
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const cartQty      = useSelector((s) => s.cart.totalQty)
  const dispatch     = useDispatch()
  const pathname     = usePathname()
  const router       = useRouter()
  const searchParams = useSearchParams()

  const userMenuRef  = useRef(null)
  const searchRef    = useRef(null)
  const searchInput  = useRef(null)

  /* ── Auth state ──────────────────────────────────────────── */
  useEffect(() => {
    const readUser = () => {
      const token    = localStorage.getItem('kc_token')
      const userData = localStorage.getItem('kc_user')
      if (token && userData) {
        try { setUser(JSON.parse(userData)) } catch {}
      } else {
        setUser(null)
      }
    }
    readUser()
    window.addEventListener('kc-auth-changed', readUser)
    window.addEventListener('storage', readUser)
    return () => {
      window.removeEventListener('kc-auth-changed', readUser)
      window.removeEventListener('storage', readUser)
    }
  }, [])

  /* ── Wishlist ────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const s = localStorage.getItem(WL_KEY)
      if (s) setWishlist(JSON.parse(s))
    } catch {}
  }, [])

  /* ── Scroll ──────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Outside clicks ──────────────────────────────────────── */
  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (searchOpen && searchInput.current) searchInput.current.focus()
  }, [searchOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  /* ── Logout ──────────────────────────────────────────────── */
  const handleLogout = async () => {
    try { await API.post('/user/logout') } catch {}
    localStorage.removeItem('kc_token')
    localStorage.removeItem('kc_user')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    dispatch(resetCart())
    window.dispatchEvent(new Event('kc-auth-changed'))
    window.location.href = '/'
  }

  /* ── Search ──────────────────────────────────────────────── */
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault()
      const q = searchQuery.trim()
      if (!q) return
      setSearchOpen(false)
      setSearchQuery('')
      router.push(`/shop?search=${encodeURIComponent(q)}`)
    },
    [searchQuery, router]
  )

  /* ── Derived styles ──────────────────────────────────────── */
  const wrapperStyle = scrolled
    ? {
        // PILL STATE
        position:     'fixed',
        top:          '10px',
        left:         '16px',
        right:        '16px',
        zIndex:       60,
        borderRadius: '50px',
        background:   THEME.grad,
        boxShadow:    THEME.pillShadow,
        border:       `1px solid ${THEME.pillBorder}`,
        overflow:     'visible',
      }
    : {
        // FLAT STATE
        position:     'fixed',
        top:          '0',
        left:         '0',
        right:        '0',
        zIndex:       60,
        borderRadius: '0px',
        background:   THEME.grad,
        boxShadow:    'none',
        border:       'none',
        borderBottom: '1px solid rgba(123,36,71,0.14)',
        overflow:     'visible',
      }

  // Icon button base
  const iconBtn = 'relative flex items-center justify-center rounded-full p-1.5 md:p-2 transition-all duration-200'
  const iconBtnStyle = { color: THEME.textIvory }

  return (
    <>
      {/* Inject CSS variables and transition rule once */}
      <style>{CSS_VARS}</style>

      {/* ═══ HEADER — single fixed element, pill animates here ══════ */}
      <div className="kc-header-wrapper" style={wrapperStyle}>
        {/* Inner layout container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-20">

            {/* ── LOGO ──────────────────────────────────────── */}
            <Link href="/" className="flex items-center self-center flex-shrink-0 min-w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Kurti Cove"
                className="h-7 md:h-12 w-auto object-contain brightness-[1.25] drop-shadow"
                draggable={false}
                loading="eager"
              />
            </Link>

            {/* ── DESKTOP NAV ───────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                let isActive
                if (!link.href.includes('?')) {
                  isActive = pathname === link.href
                } else {
                  const [basePath, query] = link.href.split('?')
                  const param = new URLSearchParams(query)
                  const filterVal = param.get('filter')
                  isActive =
                    pathname === basePath &&
                    (filterVal ? searchParams.get('filter') === filterVal : true)
                }

                return (
                  <span key={link.href} className="group relative">
                    <Link
                      href={link.href}
                      className="relative px-3 py-1 text-sm font-medium transition-colors duration-200"
                      style={{ color: isActive ? THEME.accentGold : THEME.textIvory }}
                    >
                      {link.label}
                      <span
                        className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300"
                        style={{
                          background: THEME.accentUnder,
                          width: isActive ? '100%' : '0%',
                        }}
                      />
                    </Link>
                  </span>
                )
              })}
            </nav>

            {/* ── RIGHT ICONS ───────────────────────────────── */}
            <div
              className="flex items-center justify-end gap-1 md:gap-2.5 ml-auto md:ml-0"
              ref={searchRef}
            >

              {/* 1 — Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  title="Search"
                  aria-label="Toggle search"
                  className={`${iconBtn} hover:bg-white/10`}
                  style={iconBtnStyle}
                >
                  <FiSearch className="w-[18px] h-[18px] md:w-[21px] md:h-[21px]" />
                </button>

                {searchOpen && (
                  <form
                    onSubmit={handleSearch}
                    className="absolute top-full right-0 mt-2 z-[70] hidden md:flex"
                  >
                    <div className="flex items-center gap-2 rounded-full px-4 py-2.5 w-72 lg:w-80"
                         style={{
                           background: '#fff',
                           boxShadow: '0 8px 24px rgba(224,92,136,0.18)',
                           border: '1px solid #F5C8D4',
                         }}>
                      <FiSearch size={14} className="flex-shrink-0" style={{ color: '#E05C88' }} />
                      <input
                        ref={searchInput}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search kurtis..."
                        className="flex-1 text-sm bg-transparent outline-none font-sans"
                        style={{ color: '#7B2447' }}
                      />
                      {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery('')}
                          style={{ color: '#F8A5B5' }}>
                          <FiX size={12} />
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* 2 — Wishlist */}
              <Link
                href="/wishlist"
                title="Wishlist"
                aria-label="Wishlist"
                className={`${iconBtn} hidden sm:flex hover:bg-white/10`}
                style={iconBtnStyle}
              >
                {wishlist.length > 0
                  ? <AiFillHeart className="w-[18px] h-[18px] md:w-[21px] md:h-[21px] text-[#FFC9E2]" />
                  : <AiOutlineHeart className="w-[18px] h-[18px] md:w-[21px] md:h-[21px]" />
                }
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none"
                        style={{ background: THEME.cartBadge, color: THEME.cartBadgeText }}>
                    {wishlist.length > 9 ? '9+' : wishlist.length}
                  </span>
                )}
              </Link>

              {/* 3 — Cart */}
              <Link href="/cart" title="Cart" aria-label="Cart"
                className={`${iconBtn} hover:bg-white/10`}
                style={iconBtnStyle}>
                <FiShoppingBag className="w-[18px] h-[18px] md:w-[21px] md:h-[21px]" />
                {cartQty > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none"
                        style={{ background: THEME.cartBadge, color: THEME.cartBadgeText }}>
                    {cartQty > 99 ? '99+' : cartQty}
                  </span>
                )}
              </Link>

              {/* 4 — Profile chip / Login */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenu((v) => !v)}
                    title="Profile"
                    aria-label="Profile menu"
                    className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full transition-all duration-200 hover:brightness-125"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      border:     '1px solid rgba(255,255,255,0.20)',
                    }}
                  >
                    <AvatarInitial name={user.name} />
                    <span className="hidden sm:block text-sm font-medium max-w-[60px] truncate"
                          style={{ color: THEME.textIvory }}>
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      size={13}
                      strokeWidth={2.5}
                      style={{ color: THEME.textMuted }}
                      className={`transition-transform duration-200 ${userMenu ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown — clean white card, z-[70] clears wrapper stacking context */}
                  {userMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl overflow-hidden z-[70]"
                         style={{ boxShadow: '0 8px 30px rgba(224,92,136,0.18)', border: '1px solid #F5C8D4' }}>
                      <div className="px-4 py-3 border-b border-pink-50"
                           style={{ background: '#FEF0E3' }}>
                        <p className="text-xs font-sans" style={{ color: '#6B4553' }}>Signed in as</p>
                        <p className="text-sm font-semibold truncate" style={{ color: '#7B2447' }}>{user.email}</p>
                      </div>
                      {[
                        { href: '/profile', Icon: User,      label: 'My Profile', sz: 15 },
                        { href: '/orders',  Icon: FiPackage, label: 'My Orders',  sz: 15 },
                      ].map(({ href, Icon, label, sz }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenu(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors group"
                          style={{ color: '#7B2447' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FEF0E3'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={sz} style={{ color: '#E05C88' }} />
                            {label}
                          </span>
                          <FiChevronRight size={13} style={{ color: '#F8A5B5' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                      {(user.role === 'admin' || user.role === 'superAdmin') && (
                        <Link
                          href="/admin/products"
                          onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
                          style={{ color: '#E05C88' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FEF0E3'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Settings size={15} style={{ color: '#E05C88' }} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t"
                        style={{ borderColor: '#F5C8D4' }}
                      >
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged-out: ivory-outlined Login pill */
                <Link
                  href="/login"
                  title="Login"
                  className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-125"
                  style={{
                    color:      THEME.textIvory,
                    border:     `1.5px solid rgba(255,243,246,0.55)`,
                    background: 'rgba(255,255,255,0.10)',
                  }}
                >
                  <User size={15} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className={`md:hidden ${iconBtn} hover:bg-white/10`}
                style={iconBtnStyle}
              >
                <FiMenu className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search strip */}
        {searchOpen && (
          <div className="md:hidden px-4 py-2 border-t" style={{ borderColor: 'rgba(123,36,71,0.14)' }}>
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(123,36,71,0.18)' }}
            >
              <FiSearch size={14} style={{ color: '#7B2447' }} className="flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kurtis..."
                className="flex-1 text-sm bg-transparent outline-none font-sans"
                style={{ color: '#7B2447' }}
                autoFocus
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} style={{ color: '#6B4553' }}>
                  <FiX size={12} />
                </button>
              )}
            </form>
          </div>
        )}
      </div>{/* end kc-header-wrapper */}

      {/* SPACER — fixed height so page content never jumps */}
      <div className="h-14 md:h-20 w-full" aria-hidden="true" />

      {/* ═══════════════ MOBILE DRAWER ═══════════════════════════ */}
      <div
        onClick={() => setMenuOpen(false)}
        className={[
          'fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      <aside
        className={[
          'fixed top-0 left-0 h-full w-72 max-w-[82vw] z-[70] shadow-2xl',
          'transform transition-transform duration-300 ease-in-out md:hidden flex flex-col',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ background: THEME.grad }}      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Kurti Cove" className="h-10 w-auto object-contain brightness-125" draggable={false} />
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            style={{ color: THEME.textIvory }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            let isActive
            if (!link.href.includes('?')) {
              isActive = pathname === link.href
            } else {
              const [basePath, query] = link.href.split('?')
              const param = new URLSearchParams(query)
              const filterVal = param.get('filter')
              isActive =
                pathname === basePath &&
                (filterVal ? searchParams.get('filter') === filterVal : true)
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color:      isActive ? THEME.accentGold : THEME.textIvory,
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                }}
              >
                {link.label}
                {isActive && <FiChevronRight size={14} style={{ color: THEME.accentGold }} />}
              </Link>
            )
          })}
        </nav>

        {/* Drawer auth section */}
        <div className="px-4 py-4 border-t border-white/10 space-y-1.5">
          {user ? (
            <>
              <div className="px-4 py-2.5 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.10)' }}>
                <p className="text-xs font-sans" style={{ color: THEME.textMuted }}>Signed in as</p>
                <p className="text-sm font-semibold truncate" style={{ color: THEME.textIvory }}>{user.email}</p>
              </div>
              {[
                { href: '/profile',  label: 'My Profile' },
                { href: '/orders',   label: 'My Orders'  },
                { href: '/wishlist', label: 'Wishlist'   },
              ].map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/10"
                  style={{ color: THEME.textIvory }}>
                  {label}
                </Link>
              ))}
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm transition-colors hover:bg-red-900/30"
                style={{ color: '#FFB4C0' }}>
                <FiLogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-125"
              style={{
                color:      THEME.textIvory,
                background: 'rgba(255,255,255,0.12)',
                border:     '1px solid rgba(255,255,255,0.22)',
              }}>
              Login / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}

export default function Header() {
  return (
    <Suspense fallback={<div className="h-14 md:h-20 w-full" aria-hidden="true" />}>
      <HeaderInner />
    </Suspense>
  )
}