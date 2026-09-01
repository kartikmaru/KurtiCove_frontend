'use client'
import AdminGuard from '../../components/admin/AdminGuard'
import AdminSidebar from '../../components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      {/*
        Hide the global Header and Footer on all admin pages.
        The global root layout renders them for every route, but admin
        has its own sidebar navigation so the user-facing header/footer
        are not needed here.
      */}
      <style>{`
        .kc-header-wrapper { display: none !important; }
        body > div > main + footer { display: none !important; }
        /* Also hide the header spacer div so no blank gap appears */
        .kc-header-spacer { display: none !important; }
      `}</style>

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
