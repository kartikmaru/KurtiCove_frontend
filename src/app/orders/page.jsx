'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { FiPackage, FiChevronRight } from 'react-icons/fi'

const STATUS_STYLES = {
  placed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/order/my-orders')
        if (res.data.success) setOrders(res.data.data)
      } catch {
        toast.error('Failed to load orders.')
      } finally {
        setLoading(false)
      }
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

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <main className="min-h-screen bg-[#FAF5FF] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="font-cursive text-4xl font-bold text-[#3B0764] mb-8">My Orders</h1>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-16 text-center shadow-card">
              <FiPackage size={52} className="mx-auto text-[#E9D5FF] mb-4" />
              <h2 className="font-serif text-2xl font-bold text-[#3B0764] mb-2">No orders yet</h2>
              <p className="font-sans text-[#C084FC] text-sm mb-8">Start shopping and your orders will appear here</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white px-8 py-3 rounded-full font-sans font-semibold text-sm transition-all"
              >
                Shop Now →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-[16px] border border-[#E9D5FF] p-5 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-mono text-xs text-[#C084FC]">Order #{order._id.slice(-10).toUpperCase()}</p>
                      <p className="font-sans text-xs text-[#6B21A8] mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.orderStatus.replace('_', ' ').toUpperCase()}
                      </span>
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

                  {/* Items preview */}
                  <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
                    {order.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex-shrink-0 w-14 h-16 bg-[#F3E8FF] rounded-lg overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">👗</div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex-shrink-0 w-14 h-16 bg-[#F3E8FF] rounded-lg flex items-center justify-center">
                        <span className="text-xs text-[#C084FC] font-medium">+{order.items.length - 4}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-sans text-xs text-[#C084FC]">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      <p className="font-serif font-bold text-[#3B0764]">₹{order.totalAmount.toLocaleString()}</p>
                      {/* Payment badges */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          order.paymentMethod === 'online' || order.paymentMethod === 'ONLINE'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {(order.paymentMethod || 'cod').toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          order.paymentStatus === 'paid' || order.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : order.paymentStatus === 'failed' || order.paymentStatus === 'FAILED'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}>
                          {(order.paymentStatus || 'pending').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/orders/${order._id}`}
                      className="flex items-center gap-1 text-sm text-[#A855F7] hover:text-[#9333EA] font-medium font-sans transition-colors"
                    >
                      View Details <FiChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
