'use client'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Package, Truck, CreditCard, BadgeCheck, ShoppingBag } from 'lucide-react'

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
        { Icon: Package,    label: 'Order Placed',  value: 'Just now'            },
        { Icon: Truck,      label: 'Shipping',       value: 'Express Delivery'    },
        { Icon: CreditCard, label: 'Payment',        value: `${methodLabel} ✓`   },
      ]
    : [
        { Icon: Package,    label: 'Order Placed',  value: 'Just now'        },
        { Icon: Truck,      label: 'Shipping',       value: 'COD Delivery'    },
        { Icon: CreditCard, label: 'Payment',        value: 'Pay on Delivery' },
      ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FAF5FF] to-white flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center">

        <div className="w-24 h-24 bg-gradient-to-br from-[#A855F7] to-[#6B21A8] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          {isUpi
            ? <CreditCard size={38} className="text-white" strokeWidth={1.5} />
            : <Package    size={38} className="text-white" strokeWidth={1.5} />}
        </div>

        <h1 className="font-cursive text-4xl md:text-5xl font-bold text-[#3B0764] mb-3">
          Order Placed!
        </h1>
        <p className="font-sans text-lg text-[#6B21A8] mb-6">
          Thank you for shopping with Kurti Cove
        </p>

        <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-6 shadow-card mb-8">
          <p className="font-sans text-sm text-[#C084FC] mb-1">Your Order ID</p>
          <p className="font-mono text-base font-bold text-[#3B0764] bg-[#F3E8FF] px-4 py-2 rounded-xl inline-block">
            #{id?.slice(-12)?.toUpperCase()}
          </p>
          <p className="font-sans text-sm text-[#6B21A8] mt-4 leading-relaxed">
            {isUpi
              ? `Your order has been placed. We will verify your ${methodLabel} payment and confirm the order shortly.`
              : 'Your order has been placed. It will be delivered via Cash on Delivery.'}
          </p>
          {isUpi && (
            <div className="inline-flex items-center gap-1.5 mt-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <BadgeCheck size={13} /> Order Confirmed
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {infoCards.map(({ Icon, label, value }) => (
            <div key={label} className="bg-[#F3E8FF] rounded-xl p-3 text-center">
              <div className="flex justify-center mb-1.5">
                <Icon size={22} className="text-[#A855F7]" strokeWidth={1.5} />
              </div>
              <p className="font-sans text-xs text-[#C084FC]">{label}</p>
              <p className="font-sans text-xs font-semibold text-[#3B0764] mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/orders/${id}`}
            className="inline-flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white px-8 py-3 rounded-full font-sans font-semibold text-sm transition-all hover:shadow-lg"
          >
            View My Order
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#A855F7] text-[#A855F7] hover:bg-[#A855F7] hover:text-white px-8 py-3 rounded-full font-sans font-semibold text-sm transition-all"
          >
            <ShoppingBag size={15} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF5FF] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  )
}
