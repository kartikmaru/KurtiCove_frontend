'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import API from '../../../utils/Helper'
import toast from 'react-hot-toast'
import { ArrowLeft, MapPin, Package } from 'lucide-react'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const CREAM    = '#FCFAE0'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered']

const STATUS_STYLES = {
  placed:           { bg: '#FEF9C3', text: '#92400e' },
  confirmed:        { bg: '#DBEAFE', text: '#1e40af' },
  shipped:          { bg: '#E0E7FF', text: '#3730a3' },
  out_for_delivery: { bg: '#FFEDD5', text: '#9a3412' },
  delivered:        { bg: '#DCFCE7', text: '#166534' },
  cancelled:        { bg: '#FEE2E2', text: '#991b1b' },
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

export default function OrderDetailPage() {
  const { id }    = useParams()
  const router    = useRouter()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/order/${id}`)
        if (res.data.success) setOrder(res.data.data)
      } catch {
        toast.error('Failed to load order.')
        router.push('/orders')
      } finally { setLoading(false) }
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

  const currentStep = STATUS_STEPS.indexOf(order?.orderStatus)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: ROSE, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!order) return null

  const st = STATUS_STYLES[order.orderStatus] || { bg: '#F3F4F6', text: '#6B7280' }

  return (
    <main className="min-h-screen py-10" style={{ background: CREAM }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2 text-sm font-sans mb-6 transition-colors"
          style={{ color: PINK }}
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>

        {/* Title + status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-cursive text-3xl font-bold" style={{ color: BERRY }}>Order Details</h1>
            <p className="font-mono text-sm mt-1" style={{ color: PINK }}>
              #{order._id.slice(-12).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: st.bg, color: st.text }}
            >
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
          {/* Left — Timeline + Items */}
          <div className="lg:col-span-2 space-y-5">

            {/* Timeline */}
            {order.orderStatus !== 'cancelled' && (
              <div className="bg-white rounded-[16px] p-6 shadow-card" style={{ border: `1px solid ${BORDER}` }}>
                <h2 className="font-serif text-lg font-bold mb-5" style={{ color: BERRY }}>Order Timeline</h2>
                <div className="flex items-center gap-0">
                  {STATUS_STEPS.map((step, i) => {
                    const done   = i <= currentStep
                    const active = i === currentStep
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center">
                        <div className="flex items-center w-full">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0"
                            style={{
                              background:  done ? ROSE : 'white',
                              borderColor: done ? ROSE : BORDER,
                              color:       done ? '#fff' : PINK,
                              outline:     active ? `2px solid ${ROSE}` : 'none',
                              outlineOffset: '2px',
                            }}
                          >
                            {done ? '✓' : i + 1}
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className="flex-1 h-0.5"
                                 style={{ background: i < currentStep ? ROSE : BORDER }} />
                          )}
                        </div>
                        <p
                          className="text-[9px] font-sans mt-1.5 text-center capitalize"
                          style={{ color: done ? ROSE : PINK, fontWeight: done ? 600 : 400 }}
                        >
                          {step.replace('_', ' ')}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-[16px] p-6 shadow-card" style={{ border: `1px solid ${BORDER}` }}>
              <h2 className="font-serif text-lg font-bold mb-4 flex items-center gap-2" style={{ color: BERRY }}>
                <Package size={18} style={{ color: ROSE }} />
                Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i}
                    className="flex gap-4 items-start pb-4 last:pb-0 last:border-0 border-b"
                    style={{ borderColor: BORDER }}>
                    <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0"
                         style={{ background: PEACH_LT }}>
                      {item.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-sm" style={{ color: BERRY }}>{item.name}</p>
                      <p className="font-sans text-xs mt-0.5" style={{ color: PINK }}>Qty: {item.qty}</p>
                      <p className="font-sans text-xs" style={{ color: PINK }}>₹{item.price.toLocaleString()} each</p>
                    </div>
                    <p className="font-serif font-bold text-sm flex-shrink-0" style={{ color: BERRY }}>
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
            <div className="bg-white rounded-[16px] p-5 shadow-card" style={{ border: `1px solid ${BORDER}` }}>
              <h2 className="font-serif text-lg font-bold mb-3 flex items-center gap-2" style={{ color: BERRY }}>
                <MapPin size={16} style={{ color: ROSE }} /> Delivery Address
              </h2>
              <div className="font-sans text-sm space-y-0.5" style={{ color: MAUVE }}>
                <p className="font-semibold" style={{ color: BERRY }}>{order.address.fullName}</p>
                <p>{order.address.mobile}</p>
                <p>{order.address.addressLine}</p>
                <p>{order.address.city}, {order.address.state}</p>
                <p>Pincode: {order.address.pincode}</p>
              </div>
            </div>

            {/* Payment + Total */}
            <div className="bg-white rounded-[16px] p-5 shadow-card" style={{ border: `1px solid ${BORDER}` }}>
              <h2 className="font-serif text-lg font-bold mb-3" style={{ color: BERRY }}>Payment Info</h2>
              <div className="font-sans text-sm space-y-2">
                <div className="flex justify-between" style={{ color: MAUVE }}>
                  <span>Method</span>
                  <span className="font-medium uppercase" style={{ color: BERRY }}>
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: MAUVE }}>
                  <span>Status</span>
                  <span
                    className="font-medium capitalize"
                    style={{ color: order.paymentStatus === 'paid' ? '#16a34a' : PINK }}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                <hr style={{ borderColor: BORDER }} />
                <div className="flex justify-between font-bold" style={{ color: BERRY }}>
                  <span>Total</span>
                  <span className="font-serif text-lg">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-[16px] p-5 shadow-card" style={{ border: `1px solid ${BORDER}` }}>
              <div className="font-sans text-xs space-y-1.5" style={{ color: PINK }}>
                <p>Placed on:{' '}
                  <span className="font-medium" style={{ color: BERRY }}>{formatDate(order.createdAt)}</span>
                </p>
                {order.cancelledAt && (
                  <p>Cancelled on:{' '}
                    <span className="font-medium text-red-500">{formatDate(order.cancelledAt)}</span>
                  </p>
                )}
                {order.deliveredAt && (
                  <p>Delivered on:{' '}
                    <span className="font-medium text-green-600">{formatDate(order.deliveredAt)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
