'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import API from '../../utils/Helper'

const AdminUserContext = createContext(null)

export const useAdminUser = () => useContext(AdminUserContext)

/**
 * AdminGuard — wraps all admin pages.
 * On mount, fetches /api/user/get and checks role.
 * Redirects to /login?error=unauthorized if not admin/superAdmin.
 */
export default function AdminGuard({ children }) {
  const [adminUser, setAdminUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await API.get('/user/get')
        if (res.data.success) {
          const user = res.data.data
          if (user.role === 'admin' || user.role === 'superAdmin') {
            setAdminUser(user)
          } else {
            router.replace('/login?error=unauthorized')
          }
        } else {
          router.replace('/login?error=unauthorized')
        }
      } catch {
        router.replace('/login?error=unauthorized')
      } finally {
        setChecking(false)
      }
    }
    verify()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-sans text-[#C084FC]">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!adminUser) return null

  return (
    <AdminUserContext.Provider value={adminUser}>
      {children}
    </AdminUserContext.Provider>
  )
}
