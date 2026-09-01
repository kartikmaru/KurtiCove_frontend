'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import {
  FiShoppingBag, FiMenu, FiX,
  FiLogOut, FiPackage, FiChevronRight, FiSearch,
} from 'react-icons/fi'
import { HiUserCircle } from 'react-icons/hi'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { resetCart } from '../../redux/features/CartSlice'
import API from '../../utils/Helper'

const navLinks = [
  { label: 'Home',         href: '/' },
  { label: 'Shop',         href: '/shop' },
  { label: 'New Arrivals', href: '/shop?filter=isNewArrival' },
  { label: 'Best Sellers', href: '/shop?filter=isBestSeller' },
]

const WL_KEY = 'kc_wishlist'

function HeaderInner() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [userMenu,    setUserMenu]    = useState(false)
  const [user,        setUser]        = useState(null)
  const [wishlist,    setWishlist]    = useState([])
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const cartQty   = useSelector((s) => s.cart.totalQty)
  const dispatch  = useDispatch()
  const pathname  = usePathname()
  const router    = useRouter()
  const searchParams = useSearchParams()

  const userMenuRef = useRef(null)
  const searchRef   = useRef(null)
  const searchInput = useRef(null)

  /* ── Load user — and re-read whenever auth changes ───────── */
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

    // Initial read on mount
    readUser()

    // Re-read whenever login/logout fires the custom event
    window.addEventListener('kc-auth-changed', readUser)
    // Also catch cross-tab storage changes
    window.addEventListener('storage', readUser)
    return () => {
      window.removeEventListener('kc-auth-changed', readUser)
      window.removeEventListener('storage', readUser)
    }
  }, [])

  /* ── Load wishlist ───────────────────────────────────────── */
  useEffect(() => {
    try {
      const s = localStorage.getItem(WL_KEY)
      if (s) setWishlist(JSON.parse(s))
    } catch {}
  }, [])

  /* ── Scroll — pill triggers at 15px, reverts at 0 ─────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Outside click — user dropdown ──────────────────────── */
  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenu(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* ── Outside click — search ──────────────────────────────── */
  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* ── Auto-focus search ───────────────────────────────────── */
  useEffect(() => {
    if (searchOpen && searchInput.current) searchInput.current.focus()
  }, [searchOpen])

  /* ── Body scroll lock — mobile drawer ───────────────────── */
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

  /*
    NOT scrolled : full-width, no border-radius, no side margins
                   bg-white/70 backdrop-blur-md
    Scrolled     : floating pill — mx-4 md:mx-8, mt-3, rounded-full
                   bg-white shadow-xl shadow-purple-200/60 border border-purple-100
    Both states  : fixed top-0 left-0 right-0 z-50
    Transition   : transition-all duration-500 ease-in-out on the wrapper
  */
  // z-[60] keeps header ABOVE the shop page sticky sidebar (z-30) and
  // category strip (z-20), but below the mobile drawer (z-[70]).
  const wrapperClass = [
    'fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ease-in-out',
    scrolled ? 'mx-3 md:mx-6 mt-3' : 'mx-0 mt-0',
  ].join(' ')

  const headerClass = [
    'transition-all duration-300 ease-in-out',
    scrolled
      ? 'rounded-2xl shadow-xl shadow-purple-200/60 border border-purple-100'
      : 'border-b border-purple-100/60',
  ].join(' ')

  // Gradient background — applied via inline style on the header element
  const headerStyle = {
    background: 'linear-gradient(135deg, #E6E6FA,#FFD1DC )',
  }

  // Icons are always purple — no conditional colour
  const iconBtn = 'relative flex items-center justify-center rounded-full p-1.5 md:p-2 text-purple-700 hover:text-purple-500 hover:bg-purple-50 transition-colors duration-200'

  return (
    <>
      {/* ═══════════════ HEADER ══════════════════════════════ */}
      <div className={wrapperClass}>
        <header className={headerClass} style={headerStyle}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-20">

              {/* ── LOGO ──────────────────────────────────────── */}
              {/* Single img tag — h-12 mobile, h-16 desktop, w-auto */}
              <Link href="/" className="flex items-center pt-2 md:pt-4 flex-shrink-0 min-w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Kurti Cove"
                  className="h-14 md:h-19 lg:h-27 w-auto object-contain"
                  draggable={false}
                  loading="eager"
                />
              </Link>

            {/* ── DESKTOP NAV ───────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                // Fix: links with query params must match BOTH path AND search param
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
                  // group on the outer span enables group-hover on the underline span
                  <span key={link.href} className="group relative">
                    <Link
                      href={link.href}
                      className={[
                        'relative px-3 py-1 text-sm font-medium transition-colors duration-200',
                        isActive
                          ? 'text-purple-500'
                          : 'text-purple-800 hover:text-purple-500',
                      ].join(' ')}
                    >
                      {link.label}
                      {/* Animated underline */}
                      <span
                        className={[
                          'absolute bottom-0 left-0 h-0.5 bg-purple-500 rounded-full transition-all duration-300',
                          isActive ? 'w-full' : 'w-0 group-hover:w-full',
                        ].join(' ')}
                      />
                    </Link>
                  </span>
                )
              })}
            </nav>

            {/* ── RIGHT ICONS ───────────────────────────────── */}
            {/*
              ml-auto on mobile pushes everything to the right edge.
              gap-1 mobile, gap-3 desktop.
              Icons: 18px mobile, 22px desktop.
            */}
            <div
              className="flex items-center justify-end gap-1 md:gap-3 ml-auto md:ml-0"
              ref={searchRef}
            >

              {/* 1 — Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  title="Search"
                  aria-label="Toggle search"
                  className={iconBtn}
                >
                  <FiSearch className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
                </button>

                {/* Desktop floating search */}
                {searchOpen && (
                  <form
                    onSubmit={handleSearch}
                    className="absolute top-full right-0 mt-2 z-50 hidden md:flex"
                  >
                    <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-white border border-purple-200 shadow-lg w-72 lg:w-80">
                      <FiSearch size={14} className="text-purple-400 flex-shrink-0" />
                      <input
                        ref={searchInput}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search kurtis..."
                        className="flex-1 text-sm text-purple-900 placeholder-purple-300 bg-transparent outline-none font-sans"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-purple-300 hover:text-purple-600 transition-colors"
                        >
                          <FiX size={12} />
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* 2 — Wishlist (hidden xs) */}
              <Link
                href="/wishlist"
                title="Wishlist"
                aria-label="Wishlist"
                className={`${iconBtn} hidden sm:flex`}
              >
                {wishlist.length > 0
                  ? <AiFillHeart className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-red-500" />
                  : <AiOutlineHeart className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
                }
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none">
                    {wishlist.length > 9 ? '9+' : wishlist.length}
                  </span>
                )}
              </Link>

              {/* 3 — Cart */}
              <Link href="/cart" title="Cart" aria-label="Cart" className={iconBtn}>
                <FiShoppingBag className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
                {cartQty > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-[8px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none">
                    {cartQty > 99 ? '99+' : cartQty}
                  </span>
                )}
              </Link>

              {/* 4 — Profile / Login */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenu((v) => !v)}
                    title="Profile"
                    aria-label="Profile menu"
                    className={`${iconBtn} gap-1 pr-1.5 md:pr-2`}
                  >
                    <HiUserCircle className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" />
                    <span className="hidden sm:block text-sm font-medium max-w-[60px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {userMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgba(168,85,247,0.18)] border border-purple-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-purple-50 bg-[#FAF5FF]">
                        <p className="text-xs text-purple-400 font-sans">Signed in as</p>
                        <p className="text-sm font-semibold text-[#3B0764] truncate">{user.email}</p>
                      </div>
                      {[
                        { href: '/profile', Icon: HiUserCircle, label: 'My Profile', sz: 17 },
                        { href: '/orders',  Icon: FiPackage,    label: 'My Orders',  sz: 15 },
                      ].map(({ href, Icon, label, sz }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenu(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-[#3B0764] hover:bg-[#FAF5FF] transition-colors group"
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={sz} className="text-purple-400" />
                            {label}
                          </span>
                          <FiChevronRight size={13} className="text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                      {(user.role === 'admin' || user.role === 'superAdmin') && (
                        <Link
                          href="/admin/products"
                          onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-600 hover:bg-[#FAF5FF] transition-colors font-medium"
                        >
                          ⚙️ Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-purple-50"
                      >
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  title="Login"
                  className="flex items-center gap-1 px-2.5 md:px-4 py-1.5 rounded-full text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-200"
                >
                  <HiUserCircle className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className={`md:hidden ${iconBtn}`}
              >
                <FiMenu className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search strip */}
        {searchOpen && (
          <div className="md:hidden px-4 py-2 border-t border-purple-100">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow border border-purple-100"
            >
              <FiSearch size={14} className="text-purple-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kurtis..."
                className="flex-1 text-sm text-purple-900 placeholder-purple-300 bg-transparent outline-none font-sans"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-purple-300"
                >
                  <FiX size={12} />
                </button>
              )}
            </form>
          </div>
        )}
      </header>
      </div>{/* end wrapperClass div */}

      {/*
        SPACER — same height as the fixed header (h-16 mobile, h-20 desktop).
        This pushes all page content below the header on every page.
        HeroBanner cancels this with -mt-16 md:-mt-20 so the slider
        intentionally sits behind the transparent header.
      */}
      <div className="h-14 md:h-20 w-full" aria-hidden="true" />

      {/* ═══════════════ MOBILE DRAWER ═══════════════════════════ */}
      <div
        onClick={() => setMenuOpen(false)}
        className={[
          'fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      <aside
        className={[
          'fixed top-0 left-0 h-full w-72 max-w-[82vw] bg-white z-[70] shadow-2xl',
          'transform transition-transform duration-300 ease-in-out md:hidden flex flex-col',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Kurti Cove"
            className="h-10 w-auto object-contain"
            draggable={false}
          />
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-full text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

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
                className={[
                  'flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-purple-800 hover:bg-purple-50 hover:text-purple-600',
                ].join(' ')}
              >
                {link.label}
                {isActive && <FiChevronRight size={14} className="text-purple-500" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-purple-100 space-y-1.5">
          {user ? (
            <>
              <div className="px-4 py-2.5 bg-purple-50 rounded-xl mb-2">
                <p className="text-xs text-purple-400 font-sans">Signed in as</p>
                <p className="text-sm font-semibold text-[#3B0764] truncate">{user.email}</p>
              </div>
              <Link href="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-purple-800 hover:bg-purple-50 transition-colors">
                <HiUserCircle size={17} className="text-purple-400" /> My Profile
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-purple-800 hover:bg-purple-50 transition-colors">
                <FiPackage size={15} className="text-purple-400" /> My Orders
              </Link>
              <Link href="/wishlist" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-purple-800 hover:bg-purple-50 transition-colors">
                <AiOutlineHeart size={16} className="text-red-400" /> Wishlist
                {wishlist.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                <FiLogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-sans font-semibold text-sm transition-colors">
              <HiUserCircle size={18} /> Login / Register
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
