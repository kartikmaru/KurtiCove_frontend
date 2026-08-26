'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { emptycart } from '../../redux/features/CartSlice'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import {
  MapPin, Plus, Check, Truck, AlertTriangle,
  Loader2, Smartphone, Wallet, Ban, Trash2,
  Copy, ExternalLink, Info,
} from 'lucide-react'

const emptyAddr = { fullName: '', mobile: '', pincode: '', addressLine: '', city: '', state: '' }

const STORE_UPI  = process.env.NEXT_PUBLIC_STORE_UPI_ID  || 'yourupi@upi'
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME    || 'Kurti Cove'

/* ── Delivery charge rule: ₹49 below ₹300, FREE at/above ₹300 ── */
const calcDelivery = (subtotal) => (subtotal < 300 ? 49 : 0)

/* ── UPI deep-link intent URL ── */
const upiIntent = (amount, ref) =>
  `upi://pay?pa=${encodeURIComponent(STORE_UPI)}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('KurtiCove-' + ref)}`

/* ── Inline QR using Google Charts (no npm package needed) ── */
function UpiQR({ url }) {
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(url)}&choe=UTF-8`
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="UPI QR Code" width={180} height={180}
      className="rounded-xl border border-[#E9D5FF] mx-auto" />
  )
}

/* ── Copy-to-clipboard with "Copied" feedback ── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1.5 text-xs font-semibold font-sans px-3 py-1.5 rounded-lg border border-[#E9D5FF] bg-white hover:border-[#A855F7] hover:text-[#A855F7] transition-all"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy UPI ID'}
    </button>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
  const router   = useRouter()
  const dispatch = useDispatch()
  const { items, totalPrice } = useSelector((s) => s.cart)

  const [savedAddresses, setSavedAddresses]   = useState([])
  const [selectedAddrIdx, setSelectedAddrIdx] = useState(null)
  const [showNewForm,    setShowNewForm]       = useState(false)
  const [newAddr,        setNewAddr]           = useState(emptyAddr)
  const [placing,        setPlacing]           = useState(false)
  const [payMethod,      setPayMethod]         = useState('upi')   // 'upi'|'phonepe'|'googlepay'|'cod'
  const [payError,       setPayError]          = useState('')
  const [showUpiPanel,   setShowUpiPanel]      = useState(false)
  const [orderRef]                             = useState(() => 'ORD' + Date.now())
  const [addrTouched,    setAddrTouched]       = useState(false)   // disables COD on any address selection
  const [deletingIdx,    setDeletingIdx]       = useState(null)    // index being deleted

  // Delivery charge and totals
  const deliveryCharge = calcDelivery(totalPrice)
  const finalTotal     = totalPrice + deliveryCharge

  // ── Fetch saved addresses ─────────────────────────────────
  const fetchUser = useCallback(async () => {
    try {
      const res = await API.get('/user/get')
      if (res.data.success) {
        const addrs = res.data.data.addresses || []
        setSavedAddresses(addrs)
        if (addrs.length === 0) setShowNewForm(true)
      }
    } catch { setShowNewForm(true) }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  // ── Active address ────────────────────────────────────────
  const getAddress = useCallback(() => {
    if (showNewForm || savedAddresses.length === 0) return newAddr
    if (selectedAddrIdx !== null) return savedAddresses[selectedAddrIdx]
    return null
  }, [showNewForm, savedAddresses, selectedAddrIdx, newAddr])

  // ── Address change handlers ───────────────────────────────
  const handleNewAddrChange = (e) => {
    const { name, value } = e.target
    setNewAddr((p) => ({ ...p, [name]: value }))
    setAddrTouched(true)
  }

  const handleSelectSaved = (i) => {
    setSelectedAddrIdx(i)
    setShowNewForm(false)
    setAddrTouched(true)
    if (payMethod === 'cod') setPayMethod('upi')
  }

  // ── Delete saved address ──────────────────────────────────
  const handleDeleteAddress = async (idx, e) => {
    e.stopPropagation()
    if (!confirm('Remove this address?')) return
    setDeletingIdx(idx)
    try {
      await API.put('/user/deleteaddress', { index: idx })
      setSavedAddresses((prev) => prev.filter((_, i) => i !== idx))
      // If the deleted address was selected, reset selection
      if (selectedAddrIdx === idx) {
        setSelectedAddrIdx(null)
        if (savedAddresses.length - 1 === 0) setShowNewForm(true)
      } else if (selectedAddrIdx > idx) {
        setSelectedAddrIdx((p) => p - 1)
      }
    } catch { /* silent — address stays */ }
    finally { setDeletingIdx(null) }
  }

  // ── Validation ────────────────────────────────────────────
  const validateOrder = useCallback(() => {
    if (items.length === 0) { toast.error('Your cart is empty.'); return false }
    const addr = getAddress()
    if (!addr?.fullName || !addr?.mobile || !addr?.pincode || !addr?.addressLine || !addr?.city || !addr?.state) {
      toast.error('Please complete all address fields.')
      return false
    }
    return true
  }, [items, getAddress])

  // ── Place order (called after user taps "I Have Paid" or COD) ─
  const handleConfirmOrder = useCallback(async () => {
    if (!validateOrder()) return
    setPlacing(true)
    setPayError('')
    try {
      const res = await API.post('/order/place', {
        address:       getAddress(),
        paymentMethod: payMethod,
        paymentStatus: 'pending',
      })
      if (res.data.success) {
        dispatch(emptycart())
        try { await API.delete('/cart/clear') } catch { /* silent */ }
        router.push(`/thank-you/${res.data.data._id}?method=${payMethod}`)
      } else {
        setPayError('Order could not be placed. Please try again.')
      }
    } catch (err) {
      setPayError(err.response?.data?.msg || 'Something went wrong. Please try again.')
    } finally { setPlacing(false) }
  }, [validateOrder, getAddress, payMethod, dispatch, router])

  // ── "Proceed to Pay" — validates then shows UPI panel ─────
  const handleProceed = () => {
    if (payMethod === 'cod') {
      setPayError('Cash on Delivery is not available. Please select a UPI option.')
      return
    }
    if (!validateOrder()) return
    setPayError('')
    setShowUpiPanel(true)
    // Scroll to the UPI panel smoothly
    setTimeout(() => {
      document.getElementById('upi-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const codDisabled = addrTouched // disable COD the moment any address is touched

  /* ─────────────────────────────────────────────────────────
     UPI PAYMENT OPTIONS
  ───────────────────────────────────────────────────────── */
  const UPI_OPTIONS = [
    { value: 'phonepe',  label: 'PhonePe',   Icon: Smartphone },
    { value: 'googlepay', label: 'Google Pay', Icon: Wallet    },
    { value: 'upi',      label: 'UPI',        Icon: Wallet    },
  ]

  const intentUrl = upiIntent(finalTotal, orderRef)

  return (
    <main className="min-h-screen bg-[#FAF5FF] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-cursive text-4xl font-bold text-[#3B0764] mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── ADDRESS CARD ── */}
            <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-6 shadow-card">
              <h2 className="font-serif text-xl font-bold text-[#3B0764] flex items-center gap-2 mb-5">
                <MapPin size={18} className="text-[#A855F7]" /> Delivery Address
              </h2>

              {savedAddresses.length > 0 && (
                <div className="space-y-3 mb-5">
                  {savedAddresses.map((addr, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectSaved(i)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                        selectedAddrIdx === i && !showNewForm
                          ? 'border-[#A855F7] bg-[#FAF5FF]'
                          : 'border-[#E9D5FF] hover:border-[#C084FC]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-semibold text-sm text-[#3B0764]">{addr.fullName}</p>
                          <p className="font-sans text-xs text-[#6B21A8] mt-0.5">{addr.mobile}</p>
                          <p className="font-sans text-xs text-[#6B21A8] mt-0.5">
                            {addr.addressLine}, {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {selectedAddrIdx === i && !showNewForm && (
                            <div className="w-5 h-5 rounded-full bg-[#A855F7] flex items-center justify-center">
                              <Check size={11} className="text-white" />
                            </div>
                          )}
                          {/* Delete address button */}
                          <button
                            onClick={(e) => handleDeleteAddress(i, e)}
                            disabled={deletingIdx === i}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                            aria-label="Delete address"
                          >
                            {deletingIdx === i
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => { setShowNewForm(!showNewForm); setSelectedAddrIdx(null) }}
                    className="flex items-center gap-2 text-sm text-[#A855F7] hover:text-[#9333EA] font-medium font-sans transition-colors"
                  >
                    <Plus size={15} /> {showNewForm ? 'Cancel' : 'Add new address'}
                  </button>
                </div>
              )}

              {(showNewForm || savedAddresses.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'fullName',    label: 'Full Name',    placeholder: 'Priya Sharma' },
                    { name: 'mobile',      label: 'Mobile',       placeholder: '9876543210' },
                    { name: 'pincode',     label: 'Pincode',      placeholder: '400001' },
                    { name: 'addressLine', label: 'Address Line', placeholder: 'House / Street / Area', full: true },
                    { name: 'city',        label: 'City',         placeholder: 'Mumbai' },
                    { name: 'state',       label: 'State',        placeholder: 'Maharashtra' },
                  ].map((f) => (
                    <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-semibold text-[#3B0764] mb-1 font-sans">{f.label}</label>
                      <input
                        name={f.name}
                        value={newAddr[f.name]}
                        onChange={handleNewAddrChange}
                        placeholder={f.placeholder}
                        className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-[#FAF5FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] font-sans"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── PAYMENT METHOD ── */}
            <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-6 shadow-card">
              <h2 className="font-serif text-xl font-bold text-[#3B0764] mb-4">Payment Method</h2>

              <div className="space-y-3">
                {/* UPI options */}
                {UPI_OPTIONS.map(({ value, label, Icon }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      payMethod === value
                        ? 'border-[#A855F7] bg-[#FAF5FF]'
                        : 'border-[#E9D5FF] hover:border-[#C084FC]'
                    }`}
                  >
                    <input
                      type="radio" name="payMethod" value={value}
                      checked={payMethod === value}
                      onChange={() => { setPayMethod(value); setPayError(''); setShowUpiPanel(false) }}
                      className="sr-only"
                    />
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      payMethod === value ? 'border-[#A855F7] bg-[#A855F7]' : 'border-[#C084FC] bg-white'
                    }`}>
                      {payMethod === value && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-[#A855F7]" />
                        <p className="font-sans font-semibold text-sm text-[#3B0764]">{label}</p>
                      </div>
                      <p className="font-sans text-xs text-[#C084FC] mt-0.5">Pay via {label} UPI app</p>
                    </div>
                  </label>
                ))}

                {/* COD — disabled once address touched */}
                <div
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                    codDisabled
                      ? 'border-[#E9D5FF] opacity-50 cursor-not-allowed'
                      : 'border-[#E9D5FF] cursor-pointer hover:border-[#C084FC]'
                  }`}
                  onClick={() => !codDisabled && setPayMethod('cod')}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    payMethod === 'cod' && !codDisabled ? 'border-[#A855F7] bg-[#A855F7]' : 'border-[#C084FC] bg-white'
                  }`}>
                    {payMethod === 'cod' && !codDisabled && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {codDisabled ? <Ban size={15} className="text-gray-400" /> : <Truck size={15} className="text-gray-400" />}
                      <p className="font-sans font-semibold text-sm text-gray-400">Cash on Delivery</p>
                    </div>
                    {codDisabled && (
                      <p className="font-sans text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                        <AlertTriangle size={11} /> Not available for this area
                      </p>
                    )}
                    {!codDisabled && <p className="font-sans text-xs text-gray-400 mt-0.5">Pay when your order arrives</p>}
                  </div>
                </div>
              </div>

              {payError && (
                <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-sm text-red-600">{payError}</p>
                </div>
              )}
            </div>

            {/* ── UPI PAYMENT INSTRUCTIONS PANEL ── */}
            {showUpiPanel && (
              <div id="upi-panel" className="bg-white rounded-[16px] border-2 border-[#A855F7] p-6 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={18} className="text-[#A855F7]" />
                  <h2 className="font-serif text-xl font-bold text-[#3B0764]">Complete Payment</h2>
                </div>

                <div className="bg-[#F3E8FF] rounded-2xl p-4 mb-5 text-center">
                  <p className="font-sans text-xs text-[#C084FC] mb-1 uppercase tracking-wide font-semibold">Amount to Pay</p>
                  <p className="font-serif text-3xl font-bold text-[#3B0764]">₹{finalTotal.toLocaleString()}</p>
                  <p className="font-sans text-xs text-[#C084FC] mt-1">via {UPI_OPTIONS.find(o => o.value === payMethod)?.label || 'UPI'}</p>
                </div>

                {/* Mobile: UPI deep link button */}
                <div className="block sm:hidden mb-4">
                  <a
                    href={intentUrl}
                    className="w-full flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg"
                  >
                    <ExternalLink size={16} /> Open UPI App &amp; Pay ₹{finalTotal.toLocaleString()}
                  </a>
                  <p className="font-sans text-xs text-[#C084FC] text-center mt-2">Opens PhonePe / GPay / any UPI app</p>
                </div>

                {/* Desktop: UPI ID + QR */}
                <div className="hidden sm:block mb-5">
                  <p className="font-sans text-xs font-semibold text-[#6B21A8] mb-3 text-center uppercase tracking-wide">
                    Scan QR or copy UPI ID
                  </p>
                  <UpiQR url={intentUrl} />
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="font-mono text-sm font-bold text-[#3B0764] bg-[#F3E8FF] px-3 py-1.5 rounded-lg border border-[#E9D5FF]">
                      {STORE_UPI}
                    </span>
                    <CopyButton text={STORE_UPI} />
                  </div>
                </div>

                {/* Instruction note */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                  <Info size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-amber-700 leading-relaxed">
                    Pay ₹{finalTotal.toLocaleString()} from any UPI app using the QR or UPI ID above, then tap <strong>Confirm Order</strong> below.
                  </p>
                </div>

                {/* Confirm / I Have Paid */}
                <button
                  onClick={handleConfirmOrder}
                  disabled={placing}
                  className="w-full bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {placing
                    ? <><Loader2 size={16} className="animate-spin" /> Placing Order…</>
                    : <><Check size={16} /> I Have Paid — Confirm Order</>}
                </button>
              </div>
            )}
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-6 shadow-card sticky top-20">
              <h2 className="font-serif text-xl font-bold text-[#3B0764] mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="w-12 h-14 bg-[#F3E8FF] rounded-lg overflow-hidden flex-shrink-0">
                      {item.images?.[0]
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-[#F3E8FF]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs font-medium text-[#3B0764] line-clamp-1">{item.name}</p>
                      <p className="font-sans text-xs text-[#C084FC]">Qty: {item.qty}</p>
                    </div>
                    <p className="font-sans text-xs font-semibold text-[#3B0764] flex-shrink-0">
                      ₹{((item.discountPrice || item.price) * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="border-[#E9D5FF] mb-4" />

              <div className="space-y-2 mb-5 font-sans text-sm">
                <div className="flex justify-between text-[#3B0764]">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                {/* Delivery charge — ₹49 below ₹300, FREE otherwise */}
                <div className="flex justify-between text-[#3B0764]">
                  <span>Delivery Charges</span>
                  {deliveryCharge === 0
                    ? <span className="text-green-600 font-medium">FREE</span>
                    : <span>₹{deliveryCharge}</span>}
                </div>
                {totalPrice > 0 && totalPrice < 300 && (
                  <p className="text-[10px] text-[#C084FC] font-sans">
                    Add ₹{(300 - totalPrice).toLocaleString()} more for free delivery
                  </p>
                )}
                <hr className="border-[#E9D5FF]" />
                <div className="flex justify-between font-bold text-[#3B0764]">
                  <span>Total</span>
                  <span className="font-serif text-lg">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Primary CTA */}
              {!showUpiPanel ? (
                <button
                  onClick={handleProceed}
                  disabled={placing || items.length === 0}
                  className="w-full bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Proceed to Pay ₹{finalTotal.toLocaleString()}
                </button>
              ) : (
                <div className="text-center text-xs text-[#C084FC] font-sans py-2">
                  Complete payment using the panel above
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
