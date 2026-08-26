'use client'
import { useState, useEffect, useCallback } from 'react'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  placed: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
}

const STATUS_OPTIONS = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

export default function OrderTable() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const LIMIT = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (search) params.append('search', search)
      const res = await API.get(`/order/admin/all?${params}`)
      if (res.data.success) {
        setOrders(res.data.data)
        setPagination(res.data.pagination)
      }
    } catch (err) {
      toast.error('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.patch(`/order/admin/status/${orderId}`, { orderStatus: newStatus })
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      )
      toast.success('Order status updated.')
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="font-sans">
      {/* Search + header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] w-full sm:max-w-xs"
        />
        <button
          onClick={fetchOrders}
          className="px-5 py-2.5 bg-[#A855F7] hover:bg-[#9333EA] text-white text-sm rounded-xl transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-[#C084FC]">No orders found.</div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E9D5FF] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F3E8FF]">
                <tr>
                  {['Order ID', 'Customer', 'Date', 'Items', 'Total ₹', 'Method', 'Payment', 'Subtotal', 'Status', 'Update'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#3B0764] font-semibold text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order._id}
                    className={`border-t border-[#F3E8FF] hover:bg-[#FAF5FF] transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF5FF]/50'}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#6B21A8]">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#3B0764] text-xs">{order.user?.name || 'N/A'}</p>
                      <p className="text-[#C084FC] text-xs">{order.user?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6B21A8] text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-[#3B0764] text-xs">{order.items?.length || 0} items</td>
                    <td className="px-4 py-3 font-semibold text-[#3B0764] text-xs">
                      <div>₹{order.totalAmount?.toLocaleString()}</div>
                      {order.deliveryCharge > 0 && (
                        <div className="text-[9px] text-[#C084FC] font-normal mt-0.5">
                          incl. ₹{order.deliveryCharge} delivery
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        order.paymentMethod === 'phonepe'  ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : order.paymentMethod === 'googlepay' ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : order.paymentMethod === 'upi'       ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      }`}>
                        {(order.paymentMethod || 'cod').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {(order.paymentStatus || 'pending').toUpperCase()}
                      </span>
                    </td>
                    {/* Payment ref column — now just shows order subtotal breakdown */}
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-gray-400 font-sans">
                        {order.subtotal ? `₹${order.subtotal.toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="border border-[#E9D5FF] rounded-lg px-2 py-1 text-xs text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-[#E9D5FF] text-sm text-[#3B0764] hover:bg-[#F3E8FF] disabled:opacity-50 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-[#6B21A8] font-medium">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 rounded-xl border border-[#E9D5FF] text-sm text-[#3B0764] hover:bg-[#F3E8FF] disabled:opacity-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
