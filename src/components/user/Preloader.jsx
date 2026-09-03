'use client'
import { useEffect, useState } from 'react'

/*
  PRELOADER — elegant editorial redesign
  ─────────────────────────────────────────────────────────────
  • Full-viewport fixed overlay, z-9999
  • First session visit only (sessionStorage flag)
  • Minimum 800ms + waits for window 'load', then fades 450ms
  • Never causes layout shift
  ─────────────────────────────────────────────────────────────
  Design:
  • "Kurti Cove" in Cormorant Garamond (high-fashion editorial serif)
    with wide letter-spacing — the wordmark IS the identity
  • Fine-line double-ring spinner: outer ring thin rose (#F8A5B5),
    inner ring thin deep rose (#E05C88) rotating opposite directions
    at different speeds — refined, not generic
  • Tagline in Poppins, muted and small below the spinner
  • Rose radial glow on white background
─────────────────────────────────────────────────────────────*/
export default function Preloader() {
  const [visible,   setVisible]   = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    const shown = sessionStorage.getItem('kc_preloader_shown')
    if (shown) return
    sessionStorage.setItem('kc_preloader_shown', '1')
    setVisible(true)

    const startTime = Date.now()
    const MIN_MS    = 800

    const dismiss = () => {
      const remaining = Math.max(0, MIN_MS - (Date.now() - startTime))
      setTimeout(() => {
        setFadingOut(true)
        setTimeout(() => setVisible(false), 480)
      }, remaining)
    }

    if (document.readyState === 'complete') {
      dismiss()
    } else {
      window.addEventListener('load', dismiss, { once: true })
      const fallback = setTimeout(dismiss, 5000)
      return () => { window.removeEventListener('load', dismiss); clearTimeout(fallback) }
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        background:      '#FFFFFF',
        backgroundImage: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(248,165,181,0.14) 0%, transparent 70%)',
        transition:      'opacity 0.45s ease',
        opacity:         fadingOut ? 0 : 1,
        pointerEvents:   fadingOut ? 'none' : 'auto',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

        {/* ── Wordmark — Cormorant Garamond, high-fashion editorial ── */}
        <p style={{
          fontFamily:    '"Cormorant Garamond", "Playfair Display", Georgia, serif',
          fontSize:      'clamp(1.9rem, 6vw, 3rem)',
          fontWeight:    600,
          fontStyle:     'italic',
          color:         '#7B2447',
          letterSpacing: '0.14em',
          lineHeight:    1,
          margin:        0,
          marginBottom:  '28px',
        }}>
          Kurti Cove
        </p>

        {/* ── Double-ring spinner ── */}
        <div style={{ position: 'relative', width: 52, height: 52, marginBottom: 24 }}>
          {/* Outer ring — thin rose, slow CW */}
          <div style={{
            position:     'absolute',
            inset:        0,
            borderRadius: '50%',
            border:       '1.5px solid rgba(248,165,181,0.25)',
            borderTopColor: '#F8A5B5',
            animation:    'kc-spin-cw 2.2s linear infinite',
          }} />
          {/* Middle ring — slightly smaller, deep rose, medium CCW */}
          <div style={{
            position:     'absolute',
            inset:        7,
            borderRadius: '50%',
            border:       '1.5px solid rgba(224,92,136,0.18)',
            borderBottomColor: '#E05C88',
            animation:    'kc-spin-ccw 1.6s linear infinite',
          }} />
          {/* Inner dot */}
          <div style={{
            position:     'absolute',
            inset:        '50%',
            transform:    'translate(-50%,-50%)',
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   '#E05C88',
            opacity:      0.6,
          }} />
        </div>

        {/* ── Tagline ── */}
        <p style={{
          fontFamily:    'Poppins, sans-serif',
          fontSize:      'clamp(0.6rem, 1.8vw, 0.7rem)',
          color:         '#6B4553',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          margin:        0,
          opacity:       0.55,
        }}>
          Ethnic Wear for Every Woman
        </p>
      </div>

      <style>{`
        @keyframes kc-spin-cw  { to { transform: rotate(360deg);  } }
        @keyframes kc-spin-ccw { to { transform: rotate(-360deg); } }
      `}</style>
    </div>
  )
}
