'use client'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Package, Truck, CreditCard, BadgeCheck, ShoppingBag } from 'lucide-react'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const PEACH    = '#FBDBBB'
const CREAM    = '#FCFAE0'
const MINT     = '#B5EDDB'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'

const UPI_METHODS = ['upi', 'phonepe', 'googlepay', 'online']

function ThankYouContent() {
  const { id }       = useParams()
  const searchParams = useSearchParams()
  const method       = searchParams.get('method') || 'upi'
  const isUpi        = UPI_METHODS.includes(method)

  const methodLabel = method === 'phonepe'   ? 'PhonePe'
                    : method === 'googlepay' ? 'Google Pay'
                    : method === 'upi'       ? 'UPI'
                    : method === 'cod'       ? 'Cash on Delivery'
                    : 'UPI'

  const infoCards = isUpi
    ? [
        { Icon: Package,    label: 'Order Placed', value: 'Just now'          },
        { Icon: Truck,      label: 'Shipping',      value: 'Express Delivery'  },
        { Icon: CreditCard, label: 'Payment',       value: `${methodLabel} ✓` },
      ]
    : [
        { Icon: Package,    label: 'Order Placed', value: 'Just now'        },
        { Icon: Truck,      label: 'Shipping',      value: 'COD Delivery'    },
        { Icon: CreditCard, label: 'Payment',       value: 'Pay on Delivery' },
      ]

  return (
    <main
      className="min-h-screen flex items-center justify-center py-16 px-4"
      style={{ background: `linear-gradient(160deg, ${CREAM} 0%, #fff7f0 100%)` }}
    >
      <div className="max-w-lg w-full text-center">

        {/* Icon circle */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${PINK}, ${ROSE})` }}
        >
          {isUpi
            ? <CreditCard size={38} className="text-white" strokeWidth={1.5} />
            : <Package    size={38} className="text-white" strokeWidth={1.5} />}
        </div>

        <h1
          className="font-cursive text-4xl md:text-5xl font-bold mb-3"
          style={{ color: BERRY }}
        >
          Order Placed!
        </h1>
        <p className="font-sans text-lg mb-6" style={{ color: MAUVE }}>
          Thank you for shopping with Kurti Cove
        </p>

        {/* Order ID card */}
        <div
          className="bg-white rounded-[16px] p-6 mb-8 shadow-card"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <p className="font-sans text-sm mb-1" style={{ color: PINK }}>Your Order ID</p>
          <p
            className="font-mono text-base font-bold px-4 py-2 rounded-xl inline-block mb-4"
            style={{ color: BERRY, background: PEACH_LT }}
          >
            #{id?.slice(-12)?.toUpperCase()}
          </p>
          <p className="font-sans text-sm leading-relaxed" style={{ color: MAUVE }}>
            {isUpi
              ? `Your order has been placed. We will verify your ${methodLabel} payment and confirm shortly.`
              : 'Your order has been placed. It will be delivered via Cash on Delivery.'}
          </p>
          {isUpi && (
            <div
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: MINT, color: BERRY, border: `1px solid #8ED8C3` }}
            >
              <BadgeCheck size={13} /> Order Confirmed
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {infoCards.map(({ Icon, label, value }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background: PEACH_LT }}>
              <div className="flex justify-center mb-1.5">
                <Icon size={22} strokeWidth={1.5} style={{ color: ROSE }} />
              </div>
              <p className="font-sans text-xs" style={{ color: PINK }}>{label}</p>
              <p className="font-sans text-xs font-semibold mt-0.5" style={{ color: BERRY }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/orders/${id}`}
            className="inline-flex items-center justify-center gap-2 text-white px-8 py-3 rounded-full font-sans font-semibold text-sm transition-all hover:shadow-lg"
            style={{ background: ROSE }}
          >
            View My Order
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 border-2 px-8 py-3 rounded-full font-sans font-semibold text-sm transition-all hover:text-white"
            style={{ borderColor: ROSE, color: ROSE }}
            onMouseEnter={(e) => { e.currentTarget.style.background = ROSE; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ROSE }}
          >
            <ShoppingBag size={15} /> Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: ROSE, borderTopColor: 'transparent' }} />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
