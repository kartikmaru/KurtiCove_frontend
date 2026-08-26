'use client'
import AdminGuard from '../../components/admin/AdminGuard'
import AdminSidebar from '../../components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#FAF5FF] flex">
        <AdminSidebar />
        {/* Main content — offset by sidebar width */}
        <main className="flex-1 ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
