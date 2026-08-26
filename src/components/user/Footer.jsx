import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#3B0764] text-white mt-16 pb-20 md:pb-24">
      {/* Wave divider */}
      <div className="w-full overflow-hidden leading-[0] rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-10 fill-[#FAF5FF]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌸</span>
              <span className="font-cursive text-2xl font-bold text-white">Kurti Cove</span>
            </div>
            <p className="text-[#C084FC] text-sm leading-relaxed font-sans">
              Celebrating the beauty of Indian ethnic wear. Handpicked kurtis for every woman, every occasion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-[#E9D5FF]">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'Shop All', href: '/shop' },
                { label: 'New Arrivals', href: '/shop?filter=isNewArrival' },
                { label: 'Best Sellers', href: '/shop?filter=isBestSeller' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#C084FC] hover:text-white transition-colors font-sans">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-[#E9D5FF]">My Account</h4>
            <ul className="space-y-2">
              {[
                { label: 'Login', href: '/login' },
                { label: 'Register', href: '/register' },
                { label: 'My Orders', href: '/orders' },
                { label: 'My Profile', href: '/profile' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#C084FC] hover:text-white transition-colors font-sans">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-[#E9D5FF]">Contact Us</h4>
            <ul className="space-y-2 font-sans text-sm text-[#C084FC]">
              <li>📧 hello@kurticove.in</li>
              <li>📞 +91 98765 43210</li>
              <li>📍 Mumbai, Maharashtra</li>
            </ul>
            <div className="flex gap-3 mt-4">
              {['Instagram', 'Facebook', 'Pinterest'].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-full bg-[#6B21A8] hover:bg-[#A855F7] flex items-center justify-center text-xs transition-colors">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#6B21A8] mt-10 pt-6 text-center text-sm text-[#C084FC] font-sans">
          © 2025 Kurti Cove. All rights reserved. Made with 🌸 in India.
        </div>
      </div>
    </footer>
  )
}
