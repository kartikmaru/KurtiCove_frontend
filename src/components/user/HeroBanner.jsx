'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/*
  All banner images are standardised to 1717×916 (ratio ≈1.874:1).
  Same desktop images used on mobile — they scale down proportionally
  with the container maintaining the same aspect-ratio, so nothing is
  ever cropped on any screen size.

  Hero offset: the section no longer uses a negative margin. Instead
  the Header's own spacer div (h-14 md:h-20) pushes the content below
  the fixed bar, and this section starts flush below that spacer. This
  guarantees the hero artwork is NEVER hidden behind the header in
  either the flat or pill state.
*/

const SLIDES = [
  {
    src:  '/hero/image1.png',
    alt:  'Kurti Cove Collection 1',
    href: '/shop',
    cta:  'Shop Now',
  },
  {
    src:  '/hero/image2.png',
    alt:  'Kurti Cove Collection 2',
    href: '/shop?filter=isNewArrival',
    cta:  'New Arrivals',
  },
  {
    src:  '/hero/image3.png',
    alt:  'Kurti Cove Collection 3',
    href: '/shop?filter=isBestSeller',
    cta:  'Best Sellers',
  },
  {
    src:  '/hero/image4.png',   /* fixed: was image4.jpg — file is .png */
    alt:  'Kurti Cove Collection 4',
    href: '/shop?sort=desc',
    cta:  'Shop Deals',
  },
]

const INTERVAL_MS = 3500

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef(null)
  const total = SLIDES.length

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

        /*
          Hero container:
          - Uses the 1717/916 aspect-ratio on all screen sizes so the image
            always scales proportionally — no cropping ever.
          - No negative margin: the header spacer div handles the offset.
        */
        .hero-slider-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          aspect-ratio: 1717 / 916;
        }

        /* Arrow buttons — glassy style */
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          background: rgba(255,255,255,0.75);
          border: 1.5px solid rgba(123,36,71,0.22);
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          color: #7B2447;
          /* Desktop size */
          width: 44px;
          height: 44px;
        }
        .hero-arrow:hover {
          background: rgba(255,255,255,0.92);
          box-shadow: 0 4px 18px rgba(224,92,136,0.30);
          transform: translateY(-50%) scale(1.08);
          color: #E05C88;
        }
        /* Mobile: slightly smaller */
        @media (max-width: 767px) {
          .hero-arrow {
            width: 34px;
            height: 34px;
          }
        }
      `}</style>

      {/*
        NO negative margin here. The Header component renders its own
        spacer div (h-14 md:h-20) which pushes all page content below
        the fixed bar. The hero starts naturally after that spacer.
      */}
      <section className="w-full relative" aria-label="Hero image slider">
        <div className="hero-slider-container">

          {/* ── SLIDES ── */}
          {SLIDES.map((slide, idx) => {
            const active = idx === current
            return (
              /* Entire slide is a link */
              <Link
                key={slide.src}
                href={slide.href}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out block"
                style={{ opacity: active ? 1 : 0, zIndex: active ? 1 : 0 }}
                aria-hidden={!active}
                tabIndex={active ? 0 : -1}
              >
                {/* Layer 1 — ambient blur fill (letterbox filler) */}
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

                {/* CTA pill button — deep rose, themed */}
                <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center px-5 py-2 sm:px-7 sm:py-2.5 rounded-full text-white font-sans font-semibold text-xs sm:text-sm shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                        style={{ background: '#E05C88' }}>
                    {slide.cta}
                  </span>
                </div>
              </Link>
            )
          })}

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none z-10"
               style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.12))' }} />

          {/* Left arrow */}
          <button onClick={(e) => { e.preventDefault(); goPrev() }} aria-label="Previous slide"
            className="hero-arrow" style={{ left: '12px' }}>
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          {/* Right arrow */}
          <button onClick={(e) => { e.preventDefault(); goNext() }} aria-label="Next slide"
            className="hero-arrow" style={{ right: '12px' }}>
            <ChevronRight size={20} strokeWidth={2} />
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
        {/* Mobile: slim 28px, Desktop: 44px */}
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
