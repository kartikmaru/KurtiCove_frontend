'use client'
import { useEffect, useState } from 'react'

/*
  PRELOADER — simple, traditional, elegant
  ─────────────────────────────────────────────────────────────
  Design:
  • Soft cream/white background, no heavy effects
  • "Kurti Cove" in Playfair Display serif, deep berry, centred
  • Single thin circular ring spinner in deep rose below the name
  • Muted tagline in small caps Poppins

  Dismissal — TRUE full-load:
  1. Waits for window 'load' event (ALL images + assets downloaded)
  2. Waits for the app's initial data fetch to signal complete
     (uses a global window flag: window.__KC_DATA_READY = true,
      set by section components after their first fetch resolves)
  3. Respects a minimum display time (900ms) so it never flashes
  4. Falls back after a hard 7s safety timeout so the page is
     never permanently blocked by a failed/slow request

  Sessions: only shows on the first page load of a session
  (sessionStorage flag).  Navigating between pages doesn't re-trigger.
─────────────────────────────────────────────────────────────*/

/* Global flag — set by data-loading code to signal readiness */
if (typeof window !== 'undefined' && window.__KC_DATA_READY === undefined) {
  window.__KC_DATA_READY = false
}

export function markDataReady() {
  if (typeof window !== 'undefined') window.__KC_DATA_READY = true
}

export default function Preloader() {
  const [visible,   setVisible]   = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    /* Only first visit per session */
    if (sessionStorage.getItem('kc_preloader_shown')) return
    sessionStorage.setItem('kc_preloader_shown', '1')
    setVisible(true)

    const startTime  = Date.now()
    const MIN_MS     = 900
    const HARD_LIMIT = 7000   // never block longer than 7s
    let dismissed    = false

    const dismiss = () => {
      if (dismissed) return
      dismissed = true
      const remaining = Math.max(0, MIN_MS - (Date.now() - startTime))
      setTimeout(() => {
        setFadingOut(true)
        setTimeout(() => setVisible(false), 500)
      }, remaining)
    }

    /* Safety hard timeout */
    const hardTimer = setTimeout(dismiss, HARD_LIMIT)

    /* Check both conditions: window loaded + data ready */
    const check = () => {
      if (document.readyState === 'complete' && window.__KC_DATA_READY) {
        clearTimeout(hardTimer)
        dismiss()
      }
    }

    /* Poll for data-ready every 150ms (data resolves quickly) */
    const pollTimer = setInterval(check, 150)

    /* Also listen for window load event */
    window.addEventListener('load', check, { once: false })

    return () => {
      clearInterval(pollTimer)
      clearTimeout(hardTimer)
      window.removeEventListener('load', check)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        /* Soft pastel background — no heavy radial glow, just clean */
        background:     '#FDFAF5',
        transition:     'opacity 0.5s ease',
        opacity:        fadingOut ? 0 : 1,
        pointerEvents:  fadingOut ? 'none' : 'auto',
      }}
    >
      {/* Name */}
      <p style={{
        fontFamily:    '"Playfair Display", Georgia, serif',
        fontSize:      'clamp(1.6rem, 5vw, 2.4rem)',
        fontWeight:    700,
        color:         '#7B2447',
        letterSpacing: '0.06em',
        margin:        '0 0 32px',
        lineHeight:    1,
      }}>
        Kurti Cove
      </p>

      {/* Single thin ring spinner */}
      <div style={{
        width:        40,
        height:       40,
        borderRadius: '50%',
        border:       '2px solid rgba(248,165,181,0.30)',
        borderTopColor: '#E05C88',
        animation:    'kc-spin 0.9s linear infinite',
        marginBottom: 28,
      }} />

      {/* Tagline */}
      <p style={{
        fontFamily:    'Poppins, sans-serif',
        fontSize:      'clamp(0.58rem, 1.6vw, 0.68rem)',
        color:         '#6B4553',
        letterSpacing: '0.20em',
        textTransform: 'uppercase',
        opacity:       0.5,
        margin:        0,
      }}>
        Ethnic Wear for Every Woman
      </p>

      <style>{`@keyframes kc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
