'use client'
import { useEffect, useState } from 'react'

/*
  PRELOADER
  ─────────────────────────────────────────────────────────────
  • Fixed full-viewport overlay, sits above everything (z-[9999])
  • Shows on first page load of each session (sessionStorage flag)
  • Waits for window 'load' event AND a minimum 800ms display time
  • Fades out over 450ms, then removes itself from DOM entirely
  • Never causes layout shift — page content renders underneath
  • Responsive: centered on all screen sizes
─────────────────────────────────────────────────────────────*/
export default function Preloader() {
  const [visible,   setVisible]   = useState(false)   // mount in DOM
  const [fadingOut, setFadingOut] = useState(false)   // trigger fade-out CSS

  useEffect(() => {
    // Only show on first visit of the session
    const shown = sessionStorage.getItem('kc_preloader_shown')
    if (shown) return

    // Mark shown immediately so back-nav doesn't re-trigger
    sessionStorage.setItem('kc_preloader_shown', '1')
    setVisible(true)

    const startTime = Date.now()
    const MIN_DISPLAY = 800 // ms

    const dismiss = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, MIN_DISPLAY - elapsed)

      setTimeout(() => {
        setFadingOut(true)                    // start CSS opacity transition
        setTimeout(() => setVisible(false), 480) // remove from DOM after fade
      }, remaining)
    }

    if (document.readyState === 'complete') {
      dismiss()
    } else {
      window.addEventListener('load', dismiss, { once: true })
      // Safety fallback — dismiss after 5s even if 'load' never fires
      const fallback = setTimeout(dismiss, 5000)
      return () => {
        window.removeEventListener('load', dismiss)
        clearTimeout(fallback)
      }
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9999,
        display:    'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        /* Subtle rose radial glow from centre */
        backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(248,165,181,0.18) 0%, transparent 70%)',
        transition: 'opacity 0.45s ease',
        opacity: fadingOut ? 0 : 1,
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      {/* ── Logo / Wordmark ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

        {/* Logo image — falls back gracefully if missing */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Kurti Cove"
          draggable={false}
          style={{
            height: 'clamp(52px, 10vw, 80px)',
            width: 'auto',
            objectFit: 'contain',
            animation: 'kc-pulse 1.8s ease-in-out infinite',
          }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        {/* Wordmark shown if logo fails, or as subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-dancing), cursive',
            fontSize: 'clamp(1.4rem, 5vw, 2rem)',
            fontWeight: 700,
            color: '#7B2447',
            letterSpacing: '0.02em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          Kurti Cove
        </p>

        {/* ── Thin animated progress bar ── */}
        <div
          style={{
            width: 'clamp(120px, 30vw, 180px)',
            height: '3px',
            borderRadius: '999px',
            background: 'rgba(248,165,181,0.25)',
            overflow: 'hidden',
            marginTop: '4px',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #F8A5B5, #E05C88, #FBDBBB)',
              animation: 'kc-bar 1.4s ease-in-out infinite',
            }}
          />
        </div>

        {/* Tagline */}
        <p
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
            color: '#6B4553',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            margin: 0,
            opacity: 0.7,
          }}
        >
          Ethnic Wear for Every Woman
        </p>
      </div>

      {/* Keyframe animations injected inline */}
      <style>{`
        @keyframes kc-pulse {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%       { opacity: 0.8; transform: scale(0.97); }
        }
        @keyframes kc-bar {
          0%   { width: 0%;    margin-left: 0%;    opacity: 1;   }
          50%  { width: 70%;   margin-left: 10%;   opacity: 1;   }
          100% { width: 20%;   margin-left: 100%;  opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
