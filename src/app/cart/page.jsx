'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { qtyChange, lstoCart } from '../../redux/features/CartSlice'
import { removeFromCartSync } from '../../utils/cartHelper'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const CREAM    = '#FCFAE0'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'
const CARD     = '#FFFAF5'

export default function CartPage() {
  const dispatch = useDispatch()
  const { items, totalQty, totalPrice } = useSelector((state) => state.cart)

  useEffect(() => { dispatch(lstoCart()) }, [dispatch])

  const handleQty    = (id, flag) => dispatch(qtyChange({ id, flag }))
  const handleRemove = (id)       => removeFromCartSync(id, dispatch)

  const deliveryCharge = totalPrice >= 999 ? 0 : 99
  const grandTotal     = totalPrice + deliveryCharge

  return (
    <main className="min-h-screen py-10" style={{ background: CREAM }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <h1 className="font-cursive text-4xl font-bold mb-8" style={{ color: BERRY }}>
          Your Cart
          {totalQty > 0 && (
            <span className="ml-3 font-sans text-base font-normal" style={{ color: PINK }}>
              ({totalQty} items)
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-[16px] p-16 text-center shadow-card"
               style={{ border: `1px solid ${BORDER}` }}>
            <ShoppingBag size={52} style={{ color: BORDER }} className="mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: BERRY }}>Your cart is empty</h2>
            <p className="font-sans text-sm mb-8" style={{ color: MAUVE }}>
              Explore our beautiful kurtis and add something you love!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-white px-8 py-3 rounded-full font-sans font-semibold text-sm transition-all hover:shadow-lg"
              style={{ background: ROSE }}
            >
              Continue Shopping →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-[14px] p-4 flex gap-4 shadow-card hover:shadow-card-hover transition-shadow"
                  style={{ border: `1px solid ${BORDER}` }}
                >
                  {/* Image */}
                  <Link href={`/product/${item._id}`} className="flex-shrink-0">
                    <div className="w-20 h-24 rounded-xl overflow-hidden" style={{ background: PEACH_LT }}>
                      {item.images && item.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item._id}`}>
                      <h3 className="font-sans font-semibold text-sm line-clamp-2 transition-colors hover:underline"
                          style={{ color: BERRY }}>
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-serif font-bold" style={{ color: ROSE }}>
                        ₹{(item.discountPrice || item.price).toLocaleString()}
                      </span>
                      {item.discountPrice && item.discountPrice < item.price && (
                        <span className="text-xs line-through font-sans" style={{ color: MAUVE }}>
                          ₹{item.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: BORDER }}>
                        <button
                          onClick={() => handleQty(item._id, 'dec')}
                          className="px-2.5 py-1.5 transition-colors"
                          style={{ color: BERRY }}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 py-1.5 font-sans font-semibold text-sm min-w-[28px] text-center"
                              style={{ color: BERRY }}>
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleQty(item._id, 'inc')}
                          className="px-2.5 py-1.5 transition-colors"
                          style={{ color: BERRY }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-serif font-bold text-sm" style={{ color: BERRY }}>
                      ₹{((item.discountPrice || item.price) * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-[16px] p-6 shadow-card sticky top-20"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <h2 className="font-serif text-xl font-bold mb-5" style={{ color: BERRY }}>Order Summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between font-sans text-sm" style={{ color: BERRY }}>
                    <span>Subtotal ({totalQty} items)</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-sans text-sm" style={{ color: BERRY }}>
                    <span>Shipping</span>
                    <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {totalPrice < 999 && (
                    <p className="text-xs font-sans" style={{ color: PINK }}>
                      Add ₹{(999 - totalPrice).toLocaleString()} more for free shipping
                    </p>
                  )}
                  <hr style={{ borderColor: BORDER }} />
                  <div className="flex justify-between font-sans font-bold" style={{ color: BERRY }}>
                    <span>Total</span>
                    <span className="font-serif text-lg">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-white py-3.5 rounded-xl font-sans font-semibold text-sm text-center transition-all hover:shadow-lg"
                  style={{ background: ROSE }}
                >
                  Proceed to Checkout →
                </Link>

                <Link
                  href="/shop"
                  className="block w-full text-center text-sm mt-3 font-sans transition-colors"
                  style={{ color: PINK }}
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
