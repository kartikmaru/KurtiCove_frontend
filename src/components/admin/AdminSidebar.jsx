'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FiPackage, FiShoppingBag, FiLogOut, FiHome, FiTag, FiStar } from 'react-icons/fi'
import { useDispatch } from 'react-redux'
import { resetCart } from '../../redux/features/CartSlice'
import API from '../../utils/Helper'
import { useAdminUser } from './AdminGuard'

const navLinks = [
  { label: 'Products',      href: '/admin/products', icon: FiPackage },
  { label: 'Orders',        href: '/admin/orders',   icon: FiShoppingBag },
  { label: 'Festival Sale', href: '/admin/sale',     icon: FiTag },
  { label: 'Reviews',       href: '/admin/reviews',  icon: FiStar },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const adminUser = useAdminUser()

  const handleLogout = async () => {
    try {
      await API.post('/user/logout')
    } catch {}
    localStorage.removeItem('kc_token')
    localStorage.removeItem('kc_user')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    dispatch(resetCart())
    window.location.href = '/'
  }

  return (
    <aside className="w-64 min-h-screen bg-[#3B0764] text-white flex flex-col fixed left-0 top-0 z-30 shadow-xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#6B21A8]">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🌸</span>
          <span className="font-cursive text-xl font-bold text-white group-hover:text-[#C084FC] transition-colors">
            Kurti Cove
          </span>
        </Link>
        <p className="font-sans text-xs text-[#C084FC] mt-1 ml-8">Admin Panel</p>
      </div>

      {/* Admin User */}
      {adminUser && (
        <div className="px-6 py-4 border-b border-[#6B21A8]">
          <div className="w-10 h-10 rounded-full bg-[#A855F7] flex items-center justify-center text-white font-serif font-bold text-lg mb-2">
            {adminUser.name?.[0]?.toUpperCase()}
          </div>
          <p className="font-sans text-sm font-semibold text-white truncate">{adminUser.name}</p>
          <p className="font-sans text-xs text-[#C084FC] capitalize">{adminUser.role}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navLinks.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-[#A855F7] text-white shadow-lg'
                  : 'text-[#C084FC] hover:bg-[#6B21A8] hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-4 py-4 border-t border-[#6B21A8] space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm text-[#C084FC] hover:bg-[#6B21A8] hover:text-white transition-all"
        >
          <FiHome size={18} />
          View Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-sans text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
