'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

/*
  All desktop banner images are standardized to 1717×916 (ratio ≈1.874:1).
  The slider container uses this fixed ratio so height NEVER jumps between
  slides. Any future image with an odd ratio is handled gracefully by the
  ambient-blur-fill layer behind the foreground — the foreground is always
  shown complete with object-fit:contain and zero cropping.

  Ideal future upload size: 1717×916 px (PNG or WebP).
*/

const DESKTOP_SLIDES = [
  { src: '/hero/image1.png', alt: 'Kurti Cove Collection 1' },
  { src: '/hero/image2.png', alt: 'Kurti Cove Collection 2' },
  { src: '/hero/image3.png', alt: 'Kurti Cove Collection 3' },
  { src: '/hero/image4.png', alt: 'Kurti Cove Collection 4' },
]

const MOBILE_SLIDES = [
  { src: '/for%20mobile%20hero/34c535f4-1e26-436c-af3b-2f5985c86a77.png',       alt: 'Kurti Cove Mobile 1' },
  { src: '/for%20mobile%20hero/image1ba5eea5e-70c3-4509-a37a-9578cd09125d.png',  alt: 'Kurti Cove Mobile 2' },
  { src: '/for%20mobile%20hero/image2.png',                                        alt: 'Kurti Cove Mobile 3' },
  { src: '/for%20mobile%20hero/image3.png',                                        alt: 'Kurti Cove Mobile 4' },
]

const INTERVAL_MS = 3500

export default function HeroBanner() {
  const [current,  setCurrent]  = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const intervalRef = useRef(null)

  /* ── Mobile detection ────────────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const slides = isMobile ? MOBILE_SLIDES : DESKTOP_SLIDES
  const total  = slides.length

  /* ── Auto-slide ──────────────────────────────────────────── */
  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), INTERVAL_MS)
  }, [total])

  useEffect(() => { startTimer(); return () => clearInterval(intervalRef.current) }, [startTimer])

  const goTo   = useCallback((idx) => { setCurrent(((idx % total) + total) % total); startTimer() }, [total, startTimer])
  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  /* ── Keyboard navigation ─────────────────────────────────── */
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
      `}</style>

      <section
        className="-mt-14 md:-mt-20 w-full relative"
        aria-label="Hero image slider"
      >
        {/*
          FIXED-RATIO CONTAINER
          ──────────────────────────────────────────────────────
          aspect-ratio: 1717/916 keeps height perfectly image-derived
          on desktop (all files are exactly 1717×916 after standardization).

          On mobile we fall back to auto height driven by the image itself
          since mobile images have varying portrait ratios — the foreground
          contain + blur-fill handles any mismatch seamlessly.

          overflow:hidden here is intentional — it clips ONLY the blurred
          background layer and the slide wrappers, not any overlay UI
          (arrows/dots sit inside so they are fine).
        */}
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: isMobile ? 'auto' : '1717 / 916' }}
        >
          {/* ── SLIDES ── */}
          {slides.map((slide, idx) => {
            const active = idx === current
            return (
              <div
                key={slide.src}
                /*
                  Active slide: opacity 1, z-index 1.
                  Inactive: opacity 0, z-index 0 (hidden behind, pre-loaded).
                  position:absolute inset-0 so all slides stack without
                  affecting layout — zero height contribution.
                */
                className="absolute inset-0 transition-opacity duration-600 ease-in-out"
                style={{ opacity: active ? 1 : 0, zIndex: active ? 1 : 0 }}
                aria-hidden={!active}
              >
                {/*
                  LAYER 1 — AMBIENT BLUR FILL (background)
                  Same image, object-fit:cover + heavy blur + dark wash.
                  Fills any letterbox bars that would appear if the image
                  ratio doesn't match the container exactly.
                  pointer-events:none so it never intercepts clicks.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full pointer-events-none select-none"
                  style={{
                    objectFit:  'cover',
                    objectPosition: 'center',
                    filter:     'blur(36px) brightness(0.55) saturate(1.2)',
                    transform:  'scale(1.08)', // eliminates blur edge halos
                    willChange: 'opacity',
                  }}
                  draggable={false}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/*
                  LAYER 2 — FOREGROUND (main content, never cropped)
                  object-fit:contain keeps every pixel of the artwork visible.
                  On desktop all images are 1717×916 = same ratio as the
                  container, so contain == fill (no letterbox bars at all).
                  On mobile or for any future odd-ratio upload, contain
                  shows the full image with the blur layer filling the bars.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="absolute inset-0 w-full h-full select-none"
                  style={{
                    objectFit:      'contain',
                    objectPosition: 'center',
                    willChange:     'opacity',
                  }}
                  draggable={false}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
            )
          })}

          {/* ── BOTTOM GRADIENT (decorative) ── */}
          <div
            className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.14))' }}
          />

          {/* ── LEFT ARROW ── */}
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white items-center justify-center shadow-md transition-all duration-200 hover:scale-105 text-purple-700"
          >
            <FiChevronLeft size={20} />
          </button>

          {/* ── RIGHT ARROW ── */}
          <button
            onClick={goNext}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white items-center justify-center shadow-md transition-all duration-200 hover:scale-105 text-purple-700"
          >
            <FiChevronRight size={20} />
          </button>

          {/* ── DOTS ── */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2"
            role="tablist"
            aria-label="Slide indicators"
          >
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
                    ? 'w-5 h-2 sm:w-7 sm:h-2.5 bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]'
                    : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/60 hover:bg-white',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div
        className="w-full py-3 overflow-hidden relative"
        style={{ background: 'linear-gradient(90deg,#E05C88 0%,#F8A5B5 50%,#E05C88 100%)' }}
      >
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
                <span
                  key={`${repeat}-${i}`}
                  className="inline-flex items-center gap-2 px-8 text-sm font-sans font-medium"
                  style={{ color: '#FDF3F4' }}
                >
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
