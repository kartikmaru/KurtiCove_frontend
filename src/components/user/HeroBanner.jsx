'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// ── Desktop images (4 images in public/hero/) ─────────────────
const DESKTOP_SLIDES = [
  { src: '/hero/image1.png',  alt: 'Kurti Cove Collection 1' },
  { src: '/hero/image2.png',  alt: 'Kurti Cove Collection 2' },
  { src: '/hero/image3.png',  alt: 'Kurti Cove Collection 3' },
  { src: '/hero/image4.png',  alt: 'Kurti Cove Collection 4' },
]

// ── Mobile images (4 images in public/for mobile hero/) ───────
const MOBILE_SLIDES = [
  { src: '/for%20mobile%20hero/34c535f4-1e26-436c-af3b-2f5985c86a77.png',      alt: 'Kurti Cove Mobile Collection 1' },
  { src: '/for%20mobile%20hero/image1ba5eea5e-70c3-4509-a37a-9578cd09125d.png', alt: 'Kurti Cove Mobile Collection 2' },
  { src: '/for%20mobile%20hero/image2.png',                                       alt: 'Kurti Cove Mobile Collection 3' },
  { src: '/for%20mobile%20hero/image3.png',                                       alt: 'Kurti Cove Mobile Collection 4' },
]

const INTERVAL_MS = 3000

export default function HeroBanner() {
  const [current,  setCurrent]  = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const intervalRef = useRef(null)

  /* ── Mobile detection + resize ───────────────────────────── */
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
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total)
    }, INTERVAL_MS)
  }, [total])

  useEffect(() => {
    startTimer()
    return () => clearInterval(intervalRef.current)
  }, [startTimer])

  const goTo = useCallback(
    (idx) => { setCurrent((idx + total) % total); startTimer() },
    [total, startTimer]
  )

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
      <section
        className="-mt-16 md:-mt-20 w-full relative overflow-hidden shadow-lg shadow-purple-200/30"
        aria-label="Hero image slider"
      >
        <div className="w-full h-[50vh] md:h-[85vh] overflow-hidden relative">
          {/* Sliding track */}
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{
              width: `${total * 100}%`,
              transform: `translateX(-${current * (100 / total)}%)`,
            }}
          >
            {slides.map((slide, idx) => (
              <div
                key={slide.src}
                className="relative h-full flex-shrink-0"
                style={{ width: `${100 / total}%` }}
                aria-hidden={idx !== current}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center select-none"
                  draggable={false}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/15 to-transparent pointer-events-none z-10" />

          {/* Left arrow — desktop only */}
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white items-center justify-center shadow-md transition-all duration-200 hover:scale-105 text-purple-700"
          >
            <FiChevronLeft size={20} />
          </button>

          {/* Right arrow — desktop only */}
          <button
            onClick={goNext}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white items-center justify-center shadow-md transition-all duration-200 hover:scale-105 text-purple-700"
          >
            <FiChevronRight size={20} />
          </button>

          {/* Dot indicators — all screen sizes */}
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

      {/* ── MARQUEE STRIP — directly below slider ── */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 30s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="w-full bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 py-3 overflow-hidden relative">
        <div className="marquee-track flex whitespace-nowrap">
          {/* Content repeated twice for seamless loop */}
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
                <span key={`${repeat}-${i}`} className="inline-flex items-center gap-2 px-8 text-white text-sm font-sans font-medium">
                  <span className="text-white/60 text-xs">✦</span>
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
