'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/*
  Hero slider — full-slide clickable images, no CTA button overlays.
  Slides 1–3: navigate to shop routes.
  Slide 4: scrolls to the #deals60 section on the homepage, accounting
           for the fixed header height so the heading is never hidden.
*/

const HEADER_H = 80   // matches md:h-20 (80px) — used for scroll offset

const SLIDES = [
  {
    src:  '/hero/image1.png',
    alt:  'Kurti Cove Collection 1',
    href: '/shop',
  },
  {
    src:  '/hero/image2.png',
    alt:  'Kurti Cove Collection 2',
    href: '/shop?filter=isNewArrival',
  },
  {
    src:  '/hero/image3.png',
    alt:  'Kurti Cove Collection 3',
    href: '/shop?filter=isBestSeller',
  },
  {
    src:    '/hero/image4.png',
    alt:    'Kurti Cove Collection 4',
    href:   '/#deals60',     // navigates/scrolls to the 60% OFF section
    isHash: true,            // handled with custom scroll logic
  },
]

const INTERVAL_MS = 3500

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef(null)
  const router   = useRouter()
  const pathname = usePathname()
  const total    = SLIDES.length

  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % total), INTERVAL_MS)
  }, [total])

  useEffect(() => { startTimer(); return () => clearInterval(intervalRef.current) }, [startTimer])

  const goTo   = useCallback((idx) => { setCurrent(((idx % total) + total) % total); startTimer() }, [total, startTimer])
  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  /*
    Handle slide 4 click: smooth-scroll to #deals60 with header offset.
    - If already on homepage: find the element and scroll to it minus header height.
    - If on another page: navigate to homepage, then scroll after mount.
      We store the target in sessionStorage so the homepage can pick it up.
  */
  const handleHashSlide = useCallback((e) => {
    e.preventDefault()
    const scrollToDeal = () => {
      const el = document.getElementById('deals60')
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_H - 16
      window.scrollTo({ top, behavior: 'smooth' })
    }

    if (pathname === '/') {
      scrollToDeal()
    } else {
      sessionStorage.setItem('kc_scroll_to', 'deals60')
      router.push('/')
    }
  }, [pathname, router])

  /*
    On homepage mount: check if we were sent here to scroll to deals60.
    Uses a short delay to let the page render first.
  */
  useEffect(() => {
    if (pathname !== '/') return
    const target = sessionStorage.getItem('kc_scroll_to')
    if (!target) return
    sessionStorage.removeItem('kc_scroll_to')
    const timer = setTimeout(() => {
      const el = document.getElementById(target)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_H - 16
      window.scrollTo({ top, behavior: 'smooth' })
    }, 350)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        .hero-slider-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          aspect-ratio: 1717 / 916;
        }

        /*
          Minimal edge-pinned arrow buttons — no filled disc, no border.
          Just a clean chevron with a very subtle hover highlight.
          Pinned flush to the left/right edge of the slider.
        */
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          /* Large hit-area, visually invisible background */
          width: 48px;
          height: 64px;
          border-radius: 4px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.80);
          transition: color 0.18s ease, background 0.18s ease;
          padding: 0;
        }
        .hero-arrow:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.08);
        }
        .hero-arrow svg {
          /* Slightly thicker stroke for legibility over images */
          filter: drop-shadow(0 1px 3px rgba(0,0,0,0.55));
        }

        @media (max-width: 767px) {
          .hero-arrow {
            width: 36px;
            height: 52px;
          }
        }
      `}</style>

      <section className="w-full relative" aria-label="Hero image slider">
        <div className="hero-slider-container">

          {/* ── SLIDES — each is a clickable link, no CTA button overlays ── */}
          {SLIDES.map((slide, idx) => {
            const active = idx === current

            const slideContent = (
              <>
                {/* Layer 1 — ambient blur fill */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src} alt="" aria-hidden="true"
                  className="absolute inset-0 w-full h-full pointer-events-none select-none"
                  style={{
                    objectFit: 'cover', objectPosition: 'center',
                    filter: 'blur(36px) brightness(0.55) saturate(1.2)',
                    transform: 'scale(1.08)',
                  }}
                  draggable={false}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                />
                {/* Layer 2 — foreground, never cropped */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src} alt={slide.alt}
                  className="absolute inset-0 w-full h-full select-none"
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                  draggable={false}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                />
              </>
            )

            if (slide.isHash) {
              /* Slide 4 — custom click handler for anchor scroll */
              return (
                <a
                  key={slide.src}
                  href={slide.href}
                  onClick={handleHashSlide}
                  className="absolute inset-0 transition-opacity duration-700 ease-in-out block cursor-pointer"
                  style={{ opacity: active ? 1 : 0, zIndex: active ? 1 : 0 }}
                  aria-hidden={!active}
                  tabIndex={active ? 0 : -1}
                  aria-label={slide.alt}
                >
                  {slideContent}
                </a>
              )
            }

            return (
              <Link
                key={slide.src}
                href={slide.href}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out block cursor-pointer"
                style={{ opacity: active ? 1 : 0, zIndex: active ? 1 : 0 }}
                aria-hidden={!active}
                tabIndex={active ? 0 : -1}
                aria-label={slide.alt}
              >
                {slideContent}
              </Link>
            )
          })}

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none z-10"
               style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.12))' }} />

          {/* Left arrow — minimal transparent */}
          <button
            onClick={(e) => { e.preventDefault(); goPrev() }}
            aria-label="Previous slide"
            className="hero-arrow"
            style={{ left: 0 }}
          >
            <ChevronLeft size={28} strokeWidth={1.6} />
          </button>

          {/* Right arrow — minimal transparent */}
          <button
            onClick={(e) => { e.preventDefault(); goNext() }}
            aria-label="Next slide"
            className="hero-arrow"
            style={{ right: 0 }}
          >
            <ChevronRight size={28} strokeWidth={1.6} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2"
               role="tablist" aria-label="Slide indicators">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); goTo(idx) }}
                role="tab"
                aria-selected={idx === current}
                aria-label={`Go to slide ${idx + 1}`}
                className={[
                  'rounded-full transition-all duration-300 focus:outline-none',
                  idx === current
                    ? 'w-5 h-2 sm:w-7 sm:h-2.5 bg-[#E05C88] shadow-[0_0_6px_rgba(224,92,136,0.6)]'
                    : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/60 hover:bg-white',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <div className="w-full overflow-hidden relative"
           style={{ background: 'linear-gradient(90deg,#E05C88 0%,#F8A5B5 50%,#E05C88 100%)' }}>
        <div className="py-1.5 sm:py-3">
          <div className="marquee-track flex whitespace-nowrap">
            {[0, 1].map((repeat) => (
              <span key={repeat} className="flex items-center flex-shrink-0">
                {[
                  'Free Shipping on Orders Above ₹999',
                  'Cash on Delivery Available',
                  '15-Day Easy Returns',
                  '500+ Kurti Styles',
                  'Authentic Indian Ethnic Wear',
                  'Handcrafted with Love',
                  'New Arrivals Every Week',
                  'Secure & Encrypted Checkout',
                ].map((text, i) => (
                  <span key={`${repeat}-${i}`}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 text-[11px] sm:text-sm font-sans font-medium"
                        style={{ color: '#FDF3F4' }}>
                    <span style={{ color: 'rgba(253,243,244,0.50)', fontSize: '8px' }}>✦</span>
                    {text}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
