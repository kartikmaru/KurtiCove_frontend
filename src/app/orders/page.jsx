'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { Package, ChevronRight } from 'lucide-react'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const CREAM    = '#FCFAE0'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'

/* ── Status badge styles — semantic colors, pastel-friendly ── */
const STATUS_STYLES = {
  placed:           { bg: '#FEF9C3', text: '#92400e', border: '#FDE68A' },
  confirmed:        { bg: '#DBEAFE', text: '#1e40af', border: '#BFDBFE' },
  shipped:          { bg: '#E0E7FF', text: '#3730a3', border: '#C7D2FE' },
  out_for_delivery: { bg: '#FFEDD5', text: '#9a3412', border: '#FED7AA' },
  delivered:        { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
  cancelled:        { bg: '#FEE2E2', text: '#991b1b', border: '#FECACA' },
}

const PAY_STATUS_STYLES = {
  paid:    { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
  failed:  { bg: '#FEE2E2', text: '#991b1b', border: '#FECACA' },
  pending: { bg: '#FEF9C3', text: '#92400e', border: '#FDE68A' },
}

function StatusBadge({ status, map }) {
  const s = map[status] || { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' }
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {status.replace('_', ' ').toUpperCase()}
    </span>
  )
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/order/my-orders')
        if (res.data.success) setOrders(res.data.data)
      } catch { toast.error('Failed to load orders.') }
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [])

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await API.patch(`/order/cancel/${orderId}`)
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o))
      )
      toast.success('Order cancelled.')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Cannot cancel this order.')
    }
  }

  return (
    <main className="min-h-screen py-10" style={{ background: CREAM }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="font-cursive text-4xl font-bold mb-8" style={{ color: BERRY }}>My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                 style={{ borderColor: ROSE, borderTopColor: 'transparent' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[16px] p-16 text-center shadow-card"
               style={{ border: `1px solid ${BORDER}` }}>
            <Package size={52} className="mx-auto mb-4" style={{ color: BORDER }} />
            <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: BERRY }}>No orders yet</h2>
            <p className="font-sans text-sm mb-8" style={{ color: MAUVE }}>
              Start shopping and your orders will appear here
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-white px-8 py-3 rounded-full font-sans font-semibold text-sm transition-all hover:shadow-lg"
              style={{ background: ROSE }}
            >
              Shop Now →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-[16px] p-5 shadow-card hover:shadow-card-hover transition-shadow"
                style={{ border: `1px solid ${BORDER}` }}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-mono text-xs" style={{ color: PINK }}>
                      Order #{order._id.slice(-10).toUpperCase()}
                    </p>
                    <p className="font-sans text-xs mt-0.5" style={{ color: MAUVE }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={order.orderStatus} map={STATUS_STYLES} />
                    {order.orderStatus === 'placed' && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1 rounded-full font-medium font-sans transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Item thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex-shrink-0 w-14 h-16 rounded-lg overflow-hidden"
                         style={{ background: PEACH_LT }}>
                      {item.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">👗</div>}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex-shrink-0 w-14 h-16 rounded-lg flex items-center justify-center"
                         style={{ background: PEACH_LT }}>
                      <span className="text-xs font-medium" style={{ color: PINK }}>
                        +{order.items.length - 4}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-sans text-xs" style={{ color: PINK }}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="font-serif font-bold" style={{ color: BERRY }}>
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                        style={{ background: PEACH_LT, color: BERRY, borderColor: BORDER }}
                      >
                        {(order.paymentMethod || 'cod').toUpperCase()}
                      </span>
                      <StatusBadge
                        status={order.paymentStatus || 'pending'}
                        map={PAY_STATUS_STYLES}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/orders/${order._id}`}
                    className="flex items-center gap-1 text-sm font-medium font-sans transition-colors"
                    style={{ color: ROSE }}
                  >
                    View Details <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
