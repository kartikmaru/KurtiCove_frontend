'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { qtyChange, lstoCart } from '../../redux/features/CartSlice'
import { removeFromCartSync } from '../../utils/cartHelper'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi'

export default function CartPage() {
  const dispatch = useDispatch()
  const { items, totalQty, totalPrice } = useSelector((state) => state.cart)

  useEffect(() => {
    dispatch(lstoCart())
  }, [dispatch])

  const handleQty = (id, flag) => {
    dispatch(qtyChange({ id, flag }))
  }

  const handleRemove = (id) => {
    // Optimistic UI + DB delete via cartHelper
    removeFromCartSync(id, dispatch)
  }

  return (
    <main className="min-h-screen bg-[#FAF5FF] py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="font-cursive text-4xl font-bold text-[#3B0764] mb-8">
            Your Cart 🛍️
            {totalQty > 0 && (
              <span className="ml-3 font-sans text-base font-normal text-[#C084FC]">({totalQty} items)</span>
            )}
          </h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-16 text-center shadow-card">
              <FiShoppingBag size={56} className="mx-auto text-[#E9D5FF] mb-4" />
              <h2 className="font-serif text-2xl font-bold text-[#3B0764] mb-2">Your cart is empty</h2>
              <p className="font-sans text-[#C084FC] text-sm mb-8">Explore our beautiful kurtis and add something you love!</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white px-8 py-3 rounded-full font-sans font-semibold text-sm transition-all hover:shadow-lg"
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
                    className="bg-white rounded-[14px] border border-[#E9D5FF] p-4 flex gap-4 shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    {/* Image */}
                    <Link href={`/product/${item._id}`} className="flex-shrink-0">
                      <div className="w-20 h-24 bg-[#F3E8FF] rounded-xl overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item._id}`}>
                        <h3 className="font-sans font-semibold text-sm text-[#3B0764] line-clamp-2 hover:text-[#A855F7] transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-serif font-bold text-[#3B0764]">
                          ₹{(item.discountPrice || item.price).toLocaleString()}
                        </span>
                        {item.discountPrice && item.discountPrice < item.price && (
                          <span className="text-xs text-gray-400 line-through">₹{item.price.toLocaleString()}</span>
                        )}
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#E9D5FF] rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => handleQty(item._id, 'dec')}
                            className="px-2.5 py-1.5 text-[#3B0764] hover:bg-[#F3E8FF] transition-colors"
                          >
                            <FiMinus size={13} />
                          </button>
                          <span className="px-3 py-1.5 font-sans font-semibold text-sm text-[#3B0764] min-w-[28px] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleQty(item._id, 'inc')}
                            className="px-2.5 py-1.5 text-[#3B0764] hover:bg-[#F3E8FF] transition-colors"
                          >
                            <FiPlus size={13} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-serif font-bold text-[#3B0764] text-sm">
                        ₹{((item.discountPrice || item.price) * item.qty).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-6 shadow-card sticky top-20">
                  <h2 className="font-serif text-xl font-bold text-[#3B0764] mb-5">Order Summary</h2>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between font-sans text-sm text-[#3B0764]">
                      <span>Subtotal ({totalQty} items)</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-sans text-sm text-[#3B0764]">
                      <span>Shipping</span>
                      <span className={totalPrice >= 999 ? 'text-green-600 font-medium' : ''}>
                        {totalPrice >= 999 ? 'FREE' : '₹99'}
                      </span>
                    </div>
                    {totalPrice < 999 && (
                      <p className="text-xs text-[#C084FC] font-sans">
                        Add ₹{(999 - totalPrice).toLocaleString()} more for free shipping
                      </p>
                    )}
                    <hr className="border-[#E9D5FF]" />
                    <div className="flex justify-between font-sans font-bold text-[#3B0764]">
                      <span>Total</span>
                      <span className="font-serif text-lg">₹{(totalPrice + (totalPrice >= 999 ? 0 : 99)).toLocaleString()}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full bg-[#A855F7] hover:bg-[#9333EA] text-white py-3.5 rounded-xl font-sans font-semibold text-sm text-center transition-all hover:shadow-lg"
                  >
                    Proceed to Checkout →
                  </Link>

                  <Link
                    href="/shop"
                    className="block w-full text-center text-sm text-[#C084FC] hover:text-[#A855F7] mt-3 font-sans transition-colors"
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
