'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import API from '../../../utils/Helper'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiMapPin, FiPackage } from 'react-icons/fi'

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered']
const STATUS_STYLES = {
  placed: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/order/${id}`)
        if (res.data.success) setOrder(res.data.data)
      } catch {
        toast.error('Failed to load order.')
        router.push('/orders')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOrder()
  }, [id, router])

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    try {
      await API.patch(`/order/cancel/${id}`)
      setOrder((prev) => ({ ...prev, orderStatus: 'cancelled', cancelledAt: new Date() }))
      toast.success('Order cancelled.')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Cannot cancel this order.')
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const currentStep = STATUS_STEPS.indexOf(order?.orderStatus)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) return null

  return (
    <>
      <main className="min-h-screen bg-[#FAF5FF] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-sm text-[#C084FC] hover:text-[#A855F7] font-sans mb-6 transition-colors"
          >
            <FiArrowLeft size={14} /> Back to Orders
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <div>
              <h1 className="font-cursive text-3xl font-bold text-[#3B0764]">Order Details</h1>
              <p className="font-mono text-sm text-[#C084FC] mt-1">#{order._id.slice(-12).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${STATUS_STYLES[order.orderStatus]}`}>
                {order.orderStatus.replace('_', ' ').toUpperCase()}
              </span>
              {order.orderStatus === 'placed' && (
                <button
                  onClick={handleCancel}
                  className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-1.5 rounded-full font-medium font-sans transition-all"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — Items + Timeline */}
            <div className="lg:col-span-2 space-y-5">
              {/* Status timeline */}
              {order.orderStatus !== 'cancelled' && (
                <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-6 shadow-card">
                  <h2 className="font-serif text-lg font-bold text-[#3B0764] mb-5">Order Timeline</h2>
                  <div className="flex items-center gap-0">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= currentStep
                      const active = i === currentStep
                      return (
                        <div key={step} className="flex-1 flex flex-col items-center">
                          <div className="flex items-center w-full">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${done ? 'bg-[#A855F7] border-[#A855F7] text-white' : 'bg-white border-[#E9D5FF] text-[#C084FC]'} ${active ? 'ring-2 ring-[#A855F7] ring-offset-1' : ''}`}>
                              {done ? '✓' : i + 1}
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-[#A855F7]' : 'bg-[#E9D5FF]'}`} />
                            )}
                          </div>
                          <p className={`text-[9px] font-sans mt-1.5 text-center ${done ? 'text-[#A855F7] font-semibold' : 'text-[#C084FC]'}`}>
                            {step.replace('_', ' ')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-6 shadow-card">
                <h2 className="font-serif text-lg font-bold text-[#3B0764] mb-4">
                  <FiPackage className="inline mr-2 text-[#A855F7]" />
                  Items ({order.items.length})
                </h2>
                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-4 items-start pb-4 border-b border-[#F3E8FF] last:border-0 last:pb-0">
                      <div className="w-16 h-20 bg-[#F3E8FF] rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-semibold text-sm text-[#3B0764]">{item.name}</p>
                        <p className="font-sans text-xs text-[#C084FC] mt-0.5">Qty: {item.qty}</p>
                        <p className="font-sans text-xs text-[#C084FC]">₹{item.price.toLocaleString()} each</p>
                      </div>
                      <p className="font-serif font-bold text-sm text-[#3B0764] flex-shrink-0">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Summary */}
            <div className="space-y-5">
              {/* Address */}
              <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-5 shadow-card">
                <h2 className="font-serif text-lg font-bold text-[#3B0764] mb-3 flex items-center gap-2">
                  <FiMapPin className="text-[#A855F7]" /> Delivery Address
                </h2>
                <div className="font-sans text-sm text-[#6B21A8] space-y-0.5">
                  <p className="font-semibold text-[#3B0764]">{order.address.fullName}</p>
                  <p>{order.address.mobile}</p>
                  <p>{order.address.addressLine}</p>
                  <p>{order.address.city}, {order.address.state}</p>
                  <p>Pincode: {order.address.pincode}</p>
                </div>
              </div>

              {/* Payment + Total */}
              <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-5 shadow-card">
                <h2 className="font-serif text-lg font-bold text-[#3B0764] mb-3">Payment Info</h2>
                <div className="font-sans text-sm space-y-2">
                  <div className="flex justify-between text-[#6B21A8]">
                    <span>Method</span>
                    <span className="font-medium text-[#3B0764] uppercase">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-[#6B21A8]">
                    <span>Status</span>
                    <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-[#C084FC]'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <hr className="border-[#E9D5FF]" />
                  <div className="flex justify-between font-bold text-[#3B0764]">
                    <span>Total</span>
                    <span className="font-serif text-lg">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-5 shadow-card">
                <div className="font-sans text-xs text-[#C084FC] space-y-1.5">
                  <p>Placed on: <span className="text-[#3B0764] font-medium">{formatDate(order.createdAt)}</span></p>
                  {order.cancelledAt && (
                    <p>Cancelled on: <span className="text-red-500 font-medium">{formatDate(order.cancelledAt)}</span></p>
                  )}
                  {order.deliveredAt && (
                    <p>Delivered on: <span className="text-green-600 font-medium">{formatDate(order.deliveredAt)}</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
