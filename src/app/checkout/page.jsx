'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { emptycart } from '../../redux/features/CartSlice'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import {
  MapPin, Plus, Check, Truck, AlertTriangle,
  Loader2, Smartphone, Wallet, Ban, Trash2, QrCode,
} from 'lucide-react'

/* ── Palette ── */
const ROSE     = '#E05C88'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'
const CARD     = '#FFFAF5'

const emptyAddr = { fullName: '', mobile: '', pincode: '', addressLine: '', city: '', state: '' }

const STORE_UPI  = process.env.NEXT_PUBLIC_STORE_UPI_ID || 'yourupi@upi'
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME   || 'Kurti Cove'

/* ── ₹49 below ₹300, FREE at/above ₹300 ── */
const calcDelivery = (subtotal) => (subtotal < 300 ? 49 : 0)

/* ── Build UPI intent URL ── */
const buildUpiUrl = (amount, ref) =>
  `upi://pay?pa=${encodeURIComponent(STORE_UPI)}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('KurtiCove-' + ref)}`

/* ── QR via Google Charts ── */
function UpiQR({ url, amount }) {
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(url)}&choe=UTF-8`
  return (
    <div className="text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="UPI QR Code" width={200} height={200}
        className="rounded-2xl mx-auto mb-3"
        style={{ border: `1px solid ${BORDER}` }} />
      <p className="font-sans text-xs" style={{ color: MAUVE }}>
        Scan with any UPI app to pay <strong style={{ color: BERRY }}>₹{amount.toLocaleString()}</strong>
      </p>
      <p className="font-mono text-xs mt-1 font-bold" style={{ color: BERRY }}>{STORE_UPI}</p>
    </div>
  )
}

/* ── Input field ── */
function Field({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1 font-sans" style={{ color: BERRY }}>{label}</label>
      <input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type}
        className="w-full border rounded-xl px-4 py-2.5 text-sm font-sans outline-none transition-all"
        style={{ borderColor: BORDER, color: BERRY, background: CARD }}
        onFocus={(e) => { e.target.style.borderColor = ROSE; e.target.style.boxShadow = `0 0 0 2px ${ROSE}22` }}
        onBlur={(e)  => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none' }} />
    </div>
  )
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════════ */
export default function CheckoutPage() {
  const router   = useRouter()
  const dispatch = useDispatch()
  const { items, totalPrice } = useSelector((s) => s.cart)

  const [savedAddresses,  setSavedAddresses]  = useState([])
  const [selectedAddrIdx, setSelectedAddrIdx] = useState(null)
  const [showNewForm,     setShowNewForm]      = useState(false)
  const [newAddr,         setNewAddr]          = useState(emptyAddr)
  const [payMethod,       setPayMethod]        = useState('upi')
  const [payError,        setPayError]         = useState('')
  const [addrTouched,     setAddrTouched]      = useState(false)
  const [deletingIdx,     setDeletingIdx]      = useState(null)
  /* Desktop: after Proceed clicked, show QR fallback */
  const [showQr,          setShowQr]           = useState(false)
  /* Placing state — shows spinner on the button */
  const [placing,         setPlacing]          = useState(false)
  /* Ref to store the created orderId so we can redirect after returning from UPI app */
  const pendingOrderRef = useRef(null)

  const deliveryCharge = calcDelivery(totalPrice)
  const finalTotal     = totalPrice + deliveryCharge

  /* ── Fetch saved addresses ── */
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await API.get('/user/get')
        if (res.data.success) {
          const addrs = res.data.data.addresses || []
          setSavedAddresses(addrs)
          if (addrs.length === 0) setShowNewForm(true)
        }
      } catch { setShowNewForm(true) }
    }
    fetch_()
  }, [])

  /*
    When the user returns from the UPI app (page becomes visible again),
    if we have a pending order ID stored in sessionStorage, clear the cart
    and redirect to the thank-you page.
  */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const pendingId = sessionStorage.getItem('kc_pending_order_id')
        const pendingMethod = sessionStorage.getItem('kc_pending_order_method') || 'upi'
        if (pendingId) {
          sessionStorage.removeItem('kc_pending_order_id')
          sessionStorage.removeItem('kc_pending_order_method')
          dispatch(emptycart())
          try { API.delete('/cart/clear') } catch { /* silent */ }
          router.push(`/thank-you/${pendingId}?method=${pendingMethod}&amount=${finalTotal}`)
        }
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [dispatch, router])

  const getAddress = useCallback(() => {
    if (showNewForm || savedAddresses.length === 0) return newAddr
    if (selectedAddrIdx !== null) return savedAddresses[selectedAddrIdx]
    return null
  }, [showNewForm, savedAddresses, selectedAddrIdx, newAddr])

  const handleNewAddrChange = (e) => {
    const { name, value } = e.target
    setNewAddr((p) => ({ ...p, [name]: value }))
    setAddrTouched(true)
  }

  const handleSelectSaved = (i) => {
    setSelectedAddrIdx(i)
    setShowNewForm(false)
    setAddrTouched(true)
  }

  const handleDeleteAddress = async (idx, e) => {
    e.stopPropagation()
    if (!confirm('Remove this address?')) return
    setDeletingIdx(idx)
    try {
      await API.put('/user/deleteaddress', { index: idx })
      setSavedAddresses((prev) => prev.filter((_, i) => i !== idx))
      if (selectedAddrIdx === idx) {
        setSelectedAddrIdx(null)
        if (savedAddresses.length - 1 === 0) setShowNewForm(true)
      } else if (selectedAddrIdx > idx) setSelectedAddrIdx((p) => p - 1)
    } catch { /* silent */ }
    finally { setDeletingIdx(null) }
  }

  /* ── Validate address fields synchronously ── */
  const validateSync = useCallback(() => {
    if (items.length === 0) { setPayError('Your cart is empty.'); return false }
    const addr = getAddress()
    if (!addr?.fullName || !addr?.mobile || !addr?.pincode || !addr?.addressLine || !addr?.city || !addr?.state) {
      setPayError('Please complete all address fields.')
      return false
    }
    return true
  }, [items, getAddress])

  /*
    HANDLE PROCEED — UPI DIRECT REDIRECT
    ─────────────────────────────────────────────────────────────
    Browser rule: intent URL must be set in the SAME synchronous
    call stack as the user gesture (click). We cannot await anything
    before window.location.href = upiUrl.

    Flow:
    1. Validate address (sync, no API)
    2. Detect desktop vs mobile
    3a. MOBILE: set window.location.href synchronously (opens UPI app)
         Then create the order asynchronously in the background.
         When user returns, visibilitychange handler redirects.
    3b. DESKTOP: show QR panel + create order, then redirect to thank-you.
  */
  const handleProceed = async () => {
    setPayError('')
    if (!validateSync()) return

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    const upiUrl   = buildUpiUrl(finalTotal, 'REF' + Date.now())
    const address  = getAddress()

    if (isMobile) {
      /*
        Step 1: open UPI app IMMEDIATELY (must be synchronous).
        The page goes to background; the order creation happens after.
      */
      window.location.href = upiUrl

      /*
        Step 2: create order in the background while UPI app is open.
        Store the order ID in sessionStorage so visibilitychange can
        redirect when the user comes back.
      */
      try {
        const res = await API.post('/order/place', {
          address,
          paymentMethod: payMethod,
          paymentStatus: 'pending_verification',
        })
        if (res.data.success) {
          sessionStorage.setItem('kc_pending_order_id',     res.data.data._id)
          sessionStorage.setItem('kc_pending_order_method', payMethod)
        }
      } catch { /* silent — visibilitychange will fall through gracefully */ }

    } else {
      /*
        DESKTOP fallback: show QR code panel + create order synchronously.
      */
      setPlacing(true)
      try {
        const res = await API.post('/order/place', {
          address,
          paymentMethod: payMethod,
          paymentStatus: 'pending_verification',
        })
        if (res.data.success) {
          pendingOrderRef.current = { id: res.data.data._id, method: payMethod }
          setShowQr(true)
          dispatch(emptycart())
          try { await API.delete('/cart/clear') } catch { /* silent */ }
        } else {
          setPayError('Order could not be placed. Please try again.')
        }
      } catch (err) {
        setPayError(err.response?.data?.msg || 'Something went wrong. Please try again.')
      } finally {
        setPlacing(false)
      }
    }
  }

  /* After showing QR on desktop, user clicks "I've Paid — Confirm" */
  const handleDesktopConfirm = () => {
    if (!pendingOrderRef.current) return
    router.push(`/thank-you/${pendingOrderRef.current.id}?method=${pendingOrderRef.current.method}&amount=${finalTotal}`)
  }

  const codDisabled = addrTouched

  const UPI_OPTIONS = [
    { value: 'phonepe',   label: 'PhonePe',   Icon: Smartphone },
    { value: 'googlepay', label: 'Google Pay', Icon: Wallet     },
    { value: 'upi',       label: 'UPI',        Icon: Wallet     },
  ]

  /* ── Address card ── */
  const AddrCard = ({ addr, i, selected }) => (
    <div onClick={() => handleSelectSaved(i)}
      className="p-4 rounded-xl border-2 cursor-pointer transition-all"
      style={{ borderColor: selected ? ROSE : BORDER, background: selected ? PEACH_LT : 'white' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-sm" style={{ color: BERRY }}>{addr.fullName}</p>
          <p className="font-sans text-xs mt-0.5" style={{ color: MAUVE }}>{addr.mobile}</p>
          <p className="font-sans text-xs mt-0.5" style={{ color: MAUVE }}>
            {addr.addressLine}, {addr.city}, {addr.state} — {addr.pincode}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selected && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: ROSE }}>
              <Check size={11} className="text-white" />
            </div>
          )}
          <button onClick={(e) => handleDeleteAddress(i, e)} disabled={deletingIdx === i}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
            aria-label="Delete address">
            {deletingIdx === i ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  )

  /* ── Payment option card ── */
  const PayCard = ({ value, label, Icon }) => {
    const active = payMethod === value
    return (
      <div onClick={() => { setPayMethod(value); setPayError(''); setShowQr(false) }}
        className="flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
        style={{ borderColor: active ? ROSE : BORDER, background: active ? PEACH_LT : 'white' }}>
        <div className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
             style={{ borderColor: active ? ROSE : PINK, background: active ? ROSE : 'white' }}>
          {active && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon size={16} style={{ color: ROSE }} />
            <p className="font-sans font-semibold text-sm" style={{ color: BERRY }}>{label}</p>
          </div>
          <p className="font-sans text-xs mt-0.5" style={{ color: MAUVE }}>Pay via {label} UPI app</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-sans text-3xl font-bold mb-8" style={{ color: BERRY }}>Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Address */}
            <div className="bg-white rounded-[16px] p-6 shadow-card" style={{ border: `1px solid ${BORDER}` }}>
              <h2 className="font-sans text-xl font-bold flex items-center gap-2 mb-5" style={{ color: BERRY }}>
                <MapPin size={18} style={{ color: ROSE }} /> Delivery Address
              </h2>
              {savedAddresses.length > 0 && (
                <div className="space-y-3 mb-5">
                  {savedAddresses.map((addr, i) => (
                    <AddrCard key={i} addr={addr} i={i} selected={selectedAddrIdx === i && !showNewForm} />
                  ))}
                  <button onClick={() => { setShowNewForm(!showNewForm); setSelectedAddrIdx(null) }}
                    className="flex items-center gap-2 text-sm font-medium font-sans" style={{ color: ROSE }}>
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
                      <Field label={f.label} name={f.name} value={newAddr[f.name]}
                        onChange={handleNewAddrChange} placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-[16px] p-6 shadow-card" style={{ border: `1px solid ${BORDER}` }}>
              <h2 className="font-sans text-xl font-bold mb-4" style={{ color: BERRY }}>Payment Method</h2>
              <div className="space-y-3">
                {UPI_OPTIONS.map(({ value, label, Icon }) => (
                  <PayCard key={value} value={value} label={label} Icon={Icon} />
                ))}
                {/* COD — disabled */}
                <div className="flex items-start gap-4 p-4 rounded-xl border-2 opacity-50 cursor-not-allowed"
                     style={{ borderColor: BORDER, background: 'white' }}>
                  <div className="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: PINK }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Ban size={15} className="text-gray-400" />
                      <p className="font-sans font-semibold text-sm text-gray-400">Cash on Delivery</p>
                    </div>
                    {codDisabled
                      ? <p className="font-sans text-xs text-amber-600 mt-0.5 flex items-center gap-1"><AlertTriangle size={11} /> Not available for this area</p>
                      : <p className="font-sans text-xs text-gray-400 mt-0.5">Pay when your order arrives</p>}
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

            {/* Desktop QR panel — shown after Proceed on desktop */}
            {showQr && pendingOrderRef.current && (
              <div className="bg-white rounded-[16px] p-6 shadow-card" style={{ border: `2px solid ${ROSE}` }}>
                <div className="flex items-center gap-2 mb-5">
                  <QrCode size={20} style={{ color: ROSE }} />
                  <h2 className="font-sans text-xl font-bold" style={{ color: BERRY }}>Scan to Pay</h2>
                </div>
                <UpiQR url={buildUpiUrl(finalTotal, 'REF' + Date.now())} amount={finalTotal} />
                <p className="font-sans text-xs text-center mt-3 mb-5" style={{ color: MAUVE }}>
                  Open PhonePe, GPay, or any UPI app — scan this QR to complete payment.
                </p>
                <button onClick={handleDesktopConfirm}
                  className="w-full text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  style={{ background: ROSE }}>
                  <Check size={16} /> I've Paid — View My Order
                </button>
              </div>
            )}
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[16px] p-6 shadow-card sticky top-20" style={{ border: `1px solid ${BORDER}` }}>
              <h2 className="font-sans text-xl font-bold mb-5" style={{ color: BERRY }}>Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="w-12 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: PEACH_LT }}>
                      {item.images?.[0]
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full" style={{ background: PEACH_LT }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs font-medium line-clamp-1" style={{ color: BERRY }}>{item.name}</p>
                      <p className="font-sans text-xs" style={{ color: PINK }}>Qty: {item.qty}</p>
                    </div>
                    <p className="font-sans text-xs font-semibold flex-shrink-0" style={{ color: BERRY }}>
                      ₹{((item.discountPrice || item.price) * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <hr className="mb-4" style={{ borderColor: BORDER }} />
              <div className="space-y-2 mb-5 font-sans text-sm">
                <div className="flex justify-between" style={{ color: BERRY }}>
                  <span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between" style={{ color: BERRY }}>
                  <span>Delivery</span>
                  {deliveryCharge === 0
                    ? <span className="text-green-600 font-medium">FREE</span>
                    : <span>₹{deliveryCharge}</span>}
                </div>
                {totalPrice > 0 && totalPrice < 300 && (
                  <p className="text-[10px] font-sans" style={{ color: PINK }}>
                    Add ₹{(300 - totalPrice).toLocaleString()} more for free delivery
                  </p>
                )}
                <hr style={{ borderColor: BORDER }} />
                <div className="flex justify-between font-bold" style={{ color: BERRY }}>
                  <span>Total</span>
                  <span className="font-sans text-lg">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {!showQr ? (
                <button onClick={handleProceed} disabled={placing || items.length === 0}
                  className="w-full text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: ROSE }}>
                  {placing
                    ? <><Loader2 size={16} className="animate-spin" /> Preparing…</>
                    : `Proceed to Pay ₹${finalTotal.toLocaleString()}`}
                </button>
              ) : (
                <div className="text-center text-xs font-sans py-2" style={{ color: PINK }}>
                  Scan the QR on the left to complete payment
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
