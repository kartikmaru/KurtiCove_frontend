'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Minus } from 'lucide-react'

/*
  FOOTER
  ─────────────────────────────────────────────────────────────
  Desktop (md+): always fully expanded, unchanged layout.
  Mobile (<md):  collapsed by default.
    • A + button at top-right toggles open/closed.
    • Animation: CSS max-height + opacity transition via classes.
    • Icon rotates plus ↔ minus.
  Social I/F/P placeholders removed entirely.
  No excess bottom padding.
─────────────────────────────────────────────────────────────*/
export default function Footer() {
  const [open, setOpen] = useState(false)

  return (
    <footer style={{ background: '#7B2447', color: '#fff' }}>
      {/* Keyframe + mobile collapsible CSS */}
      <style>{`
        .footer-body {
          overflow: hidden;
          transition: max-height 0.38s ease, opacity 0.3s ease;
        }
        @media (max-width: 767px) {
          .footer-body.collapsed { max-height: 0;     opacity: 0;   pointer-events: none; }
          .footer-body.expanded  { max-height: 560px; opacity: 1;   pointer-events: auto; }
        }
        @media (min-width: 768px) {
          .footer-body { max-height: none !important; opacity: 1 !important; pointer-events: auto !important; }
        }
      `}</style>

      {/* Wave divider */}
      <div className="w-full overflow-hidden leading-[0] rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"
             className="w-full h-10" style={{ fill: '#FCFAE0' }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-0">

        {/* ── Mobile toggle header (hidden on desktop) ── */}
        <div className="flex items-center justify-between md:hidden mb-1">
          <span className="font-cursive text-xl font-bold text-white">Kurti Cove</span>
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Collapse footer' : 'Expand footer'}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }}
          >
            {open
              ? <Minus size={15} className="text-white" />
              : <Plus  size={15} className="text-white" />}
          </button>
        </div>

        {/* ── Collapsible body ── */}
        <div className={`footer-body ${open ? 'expanded' : 'collapsed'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-6">

            {/* Brand — wordmark hidden on mobile (shown in toggle header) */}
            <div className="md:col-span-1">
              <div className="hidden md:flex items-center gap-2 mb-4">
                <span className="font-cursive text-2xl font-bold text-white">Kurti Cove</span>
              </div>
              <p className="text-sm leading-relaxed font-sans md:mt-0" style={{ color: '#FBDBBB' }}>
                Celebrating the beauty of Indian ethnic wear. Handpicked kurtis for every woman, every occasion.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-serif font-semibold text-lg mb-4" style={{ color: '#F8A5B5' }}>Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Home',         href: '/' },
                  { label: 'Shop All',     href: '/shop' },
                  { label: 'New Arrivals', href: '/shop?filter=isNewArrival' },
                  { label: 'Best Sellers', href: '/shop?filter=isBestSeller' },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm font-sans transition-colors hover:text-white"
                      style={{ color: '#FBDBBB' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-serif font-semibold text-lg mb-4" style={{ color: '#F8A5B5' }}>My Account</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Login',     href: '/login' },
                  { label: 'Register',  href: '/register' },
                  { label: 'My Orders', href: '/orders' },
                  { label: 'Profile',   href: '/profile' },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm font-sans transition-colors hover:text-white"
                      style={{ color: '#FBDBBB' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact — social symbols removed */}
            <div>
              <h4 className="font-serif font-semibold text-lg mb-4" style={{ color: '#F8A5B5' }}>Contact Us</h4>
              <ul className="space-y-2 font-sans text-sm" style={{ color: '#FBDBBB' }}>
                <li>hello@kurticove.in</li>
                <li>+91 98765 43210</li>
                <li>Mumbai, Maharashtra</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright — always visible */}
        <div className="border-t pt-5 pb-6 text-center text-sm font-sans"
             style={{ borderColor: 'rgba(248,165,181,0.30)', color: '#FBDBBB' }}>
          © 2025 Kurti Cove. All rights reserved. Made with love in India.
        </div>
      </div>
    </footer>
  )
}
