'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

/*
  Desktop banners: standardised 1717×916 (ratio ≈1.874:1).
  Mobile banners: portrait images in /for mobile hero/ folder.

  FIX for mobile invisible slider:
  ─────────────────────────────────────────────────────────────
  Root cause: isMobile started as `false` (SSR default), so the
  container always received aspectRatio:'1717/916' on first paint.
  On a 375px screen that is only ~200px tall and the absolute-
  positioned slides filled that thin strip — images appeared
  invisible or clipped.

  Fix:
  • isMobile starts as `null` (unknown).
  • Container uses CSS media queries (not inline JS) for sizing:
    - Mobile: min-height:56vw so something is always visible before JS
    - Desktop md+: aspect-ratio:1717/916
  • After hydration, the JS isMobile state selects the correct slide
    set (mobile images vs desktop images) and removes the min-height.
─────────────────────────────────────────────────────────────*/

const DESKTOP_SLIDES = [
  { src: '/hero/image1.png', alt: 'Kurti Cove Collection 1' },
  { src: '/hero/image2.png', alt: 'Kurti Cove Collection 2' },
  { src: '/hero/image3.png', alt: 'Kurti Cove Collection 3' },
  { src: '/hero/image4.jpg', alt: 'Kurti Cove Collection 4' },
]

const MOBILE_SLIDES = [
  { src: '/for%20mobile%20hero/34c535f4-1e26-436c-af3b-2f5985c86a77.png',      alt: 'Kurti Cove Mobile 1' },
  { src: '/for%20mobile%20hero/image1ba5eea5e-70c3-4509-a37a-9578cd09125d.png', alt: 'Kurti Cove Mobile 2' },
  { src: '/for%20mobile%20hero/image2.png',                                       alt: 'Kurti Cove Mobile 3' },
  { src: '/for%20mobile%20hero/image3.png',                                       alt: 'Kurti Cove Mobile 4' },
]

const INTERVAL_MS = 3500

export default function HeroBanner() {
  const [current,  setCurrent]  = useState(0)
  /* null = not yet detected (avoids SSR mismatch) */
  const [isMobile, setIsMobile] = useState(null)
  const intervalRef = useRef(null)

  /* Detect after mount — never runs on server */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /*
    While isMobile is null (SSR / first paint), default to desktop slides
    so the component renders something on both server and client.
    The CSS media query ensures the container is tall enough on mobile
    even before JS detects the screen size.
  */
  const slides = isMobile === true ? MOBILE_SLIDES : DESKTOP_SLIDES
  const total  = slides.length

  /* Auto-slide */
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

  return (
    <>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        /* ── Hero container sizing ── */
        .hero-slider-container {
          /* Mobile-first: portrait-friendly minimum height */
          min-height: 56vw;
          aspect-ratio: auto;
        }
        @media (min-width: 768px) {
          .hero-slider-container {
            min-height: unset;
            aspect-ratio: 1717 / 916;
          }
        }
      `}</style>

      <section className="-mt-14 md:-mt-20 w-full relative" aria-label="Hero image slider">
        {/*
          .hero-slider-container:
          Mobile  → aspect-ratio:auto, min-height:56vw (ensures visible height
                    for portrait images before JS fires)
          Desktop → aspect-ratio:1717/916, min-height:unset
        */}
        <div className="hero-slider-container relative w-full overflow-hidden">

          {/* ── SLIDES ── */}
          {slides.map((slide, idx) => {
            const active = idx === current
            return (
              <div
                key={slide.src}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: active ? 1 : 0, zIndex: active ? 1 : 0 }}
                aria-hidden={!active}
              >
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
                />

                {/* Layer 2 — foreground, never cropped */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src} alt={slide.alt}
                  className="absolute inset-0 w-full h-full select-none"
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                  draggable={false}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
            )
          })}

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none z-10"
               style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.14))' }} />

          {/* Left arrow — desktop only */}
          <button onClick={goPrev} aria-label="Previous slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white items-center justify-center shadow-md transition-all duration-200 hover:scale-105"
            style={{ color: '#7B2447' }}>
            <FiChevronLeft size={20} />
          </button>

          {/* Right arrow — desktop only */}
          <button onClick={goNext} aria-label="Next slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white items-center justify-center shadow-md transition-all duration-200 hover:scale-105"
            style={{ color: '#7B2447' }}>
            <FiChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2"
               role="tablist" aria-label="Slide indicators">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
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
        </div>{/* end hero-slider-container */}
      </section>

      {/* Marquee strip */}
      <div className="w-full py-3 overflow-hidden relative"
           style={{ background: 'linear-gradient(90deg,#E05C88 0%,#F8A5B5 50%,#E05C88 100%)' }}>
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
                      className="inline-flex items-center gap-2 px-8 text-sm font-sans font-medium"
                      style={{ color: '#FDF3F4' }}>
                  <span style={{ color: 'rgba(253,243,244,0.50)', fontSize: '10px' }}>✦</span>
                  {text}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
