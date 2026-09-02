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

/* ── Palette ── */
const ROSE     = '#E05C88'
const ROSE_DK  = '#C94A74'
const BERRY    = '#7B2447'
const MAUVE    = '#6B4553'
const PINK     = '#F8A5B5'
const PEACH    = '#FBDBBB'
const MINT     = '#B5EDDB'
const CREAM    = '#FCFAE0'
const BORDER   = '#F5C8D4'
const PEACH_LT = '#FEF0E3'
const CARD     = '#FFFAF5'

const emptyAddr = { fullName: '', mobile: '', pincode: '', addressLine: '', city: '', state: '' }

const STORE_UPI  = process.env.NEXT_PUBLIC_STORE_UPI_ID  || 'yourupi@upi'
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME    || 'Kurti Cove'

/* ── Delivery: ₹49 below ₹300, FREE at/above ₹300 ── */
const calcDelivery = (subtotal) => (subtotal < 300 ? 49 : 0)

/* ── UPI deep-link ── */
const upiIntent = (amount, ref) =>
  `upi://pay?pa=${encodeURIComponent(STORE_UPI)}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('KurtiCove-' + ref)}`

/* ── QR via Google Charts ── */
function UpiQR({ url }) {
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(url)}&choe=UTF-8`
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="UPI QR Code" width={180} height={180}
      className="rounded-xl mx-auto"
      style={{ border: `1px solid ${BORDER}` }} />
  )
}

/* ── Copy UPI ID ── */
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
      className="inline-flex items-center gap-1.5 text-xs font-semibold font-sans px-3 py-1.5 rounded-lg border transition-all"
      style={{ borderColor: BORDER, color: copied ? 'green' : BERRY, background: 'white' }}
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy UPI ID'}
    </button>
  )
}

/* ── Input field ── */
function Field({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1 font-sans" style={{ color: BERRY }}>{label}</label>
      <input
        name={name} value={value} onChange={onChange}
        placeholder={placeholder} type={type}
        className="w-full border rounded-xl px-4 py-2.5 text-sm font-sans outline-none transition-all"
        style={{ borderColor: BORDER, color: BERRY, background: CARD }}
        onFocus={(e)  => { e.target.style.borderColor = ROSE; e.target.style.boxShadow = `0 0 0 2px ${ROSE}22` }}
        onBlur={(e)   => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */
export default function CheckoutPage() {
  const router   = useRouter()
  const dispatch = useDispatch()
  const { items, totalPrice } = useSelector((s) => s.cart)

  const [savedAddresses, setSavedAddresses]   = useState([])
  const [selectedAddrIdx, setSelectedAddrIdx] = useState(null)
  const [showNewForm,    setShowNewForm]       = useState(false)
  const [newAddr,        setNewAddr]           = useState(emptyAddr)
  const [placing,        setPlacing]           = useState(false)
  const [payMethod,      setPayMethod]         = useState('upi')
  const [payError,       setPayError]          = useState('')
  const [showUpiPanel,   setShowUpiPanel]      = useState(false)
  const [orderRef]                             = useState(() => 'ORD' + Date.now())
  const [addrTouched,    setAddrTouched]       = useState(false)
  const [deletingIdx,    setDeletingIdx]       = useState(null)

  const deliveryCharge = calcDelivery(totalPrice)
  const finalTotal     = totalPrice + deliveryCharge

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
    if (payMethod === 'cod') setPayMethod('upi')
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
      } else if (selectedAddrIdx > idx) {
        setSelectedAddrIdx((p) => p - 1)
      }
    } catch { /* silent */ }
    finally { setDeletingIdx(null) }
  }

  const validateOrder = useCallback(() => {
    if (items.length === 0) { toast.error('Your cart is empty.'); return false }
    const addr = getAddress()
    if (!addr?.fullName || !addr?.mobile || !addr?.pincode || !addr?.addressLine || !addr?.city || !addr?.state) {
      toast.error('Please complete all address fields.')
      return false
    }
    return true
  }, [items, getAddress])

  const handleConfirmOrder = useCallback(async () => {
    if (!validateOrder()) return
    setPlacing(true); setPayError('')
    try {
      const res = await API.post('/order/place', {
        address: getAddress(), paymentMethod: payMethod, paymentStatus: 'pending',
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

  const handleProceed = () => {
    if (payMethod === 'cod') {
      setPayError('Cash on Delivery is not available. Please select a UPI option.')
      return
    }
    if (!validateOrder()) return
    setPayError('')
    setShowUpiPanel(true)
    setTimeout(() => {
      document.getElementById('upi-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const codDisabled = addrTouched

  const UPI_OPTIONS = [
    { value: 'phonepe',   label: 'PhonePe',    Icon: Smartphone },
    { value: 'googlepay', label: 'Google Pay',  Icon: Wallet     },
    { value: 'upi',       label: 'UPI',         Icon: Wallet     },
  ]

  const intentUrl = upiIntent(finalTotal, orderRef)

  /* ── Address card ── */
  const AddrCard = ({ addr, i, selected }) => (
    <div
      onClick={() => handleSelectSaved(i)}
      className="p-4 rounded-xl border-2 cursor-pointer transition-all relative"
      style={{
        borderColor: selected ? ROSE : BORDER,
        background:  selected ? PEACH_LT : 'white',
      }}
    >
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
          <button
            onClick={(e) => handleDeleteAddress(i, e)}
            disabled={deletingIdx === i}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
            aria-label="Delete address"
          >
            {deletingIdx === i ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  )

  /* ── Payment option card ── */
  const PayCard = ({ value, label, Icon, disabled: dis, note }) => {
    const active = payMethod === value && !dis
    return (
      <div
        onClick={() => !dis && (() => { setPayMethod(value); setPayError(''); setShowUpiPanel(false) })()}
        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${dis ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{ borderColor: active ? ROSE : BORDER, background: active ? PEACH_LT : 'white' }}
      >
        {/* Radio dot */}
        <div
          className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
          style={{ borderColor: active ? ROSE : PINK, background: active ? ROSE : 'white' }}
        >
          {active && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon size={16} style={{ color: dis ? '#9ca3af' : ROSE }} />
            <p className="font-sans font-semibold text-sm" style={{ color: dis ? '#9ca3af' : BERRY }}>{label}</p>
          </div>
          {note && <p className="font-sans text-xs mt-0.5" style={{ color: dis ? '#f59e0b' : MAUVE }}>{note}</p>}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-10" style={{ background: CREAM }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-cursive text-4xl font-bold mb-8" style={{ color: BERRY }}>Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Address card */}
            <div className="bg-white rounded-[16px] p-6 shadow-card" style={{ border: `1px solid ${BORDER}` }}>
              <h2 className="font-serif text-xl font-bold flex items-center gap-2 mb-5" style={{ color: BERRY }}>
                <MapPin size={18} style={{ color: ROSE }} /> Delivery Address
              </h2>

              {savedAddresses.length > 0 && (
                <div className="space-y-3 mb-5">
                  {savedAddresses.map((addr, i) => (
                    <AddrCard key={i} addr={addr} i={i}
                      selected={selectedAddrIdx === i && !showNewForm} />
                  ))}
                  <button
                    onClick={() => { setShowNewForm(!showNewForm); setSelectedAddrIdx(null) }}
                    className="flex items-center gap-2 text-sm font-medium font-sans transition-colors"
                    style={{ color: ROSE }}
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
                      <Field
                        label={f.label} name={f.name}
                        value={newAddr[f.name]} onChange={handleNewAddrChange}
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-[16px] p-6 shadow-card" style={{ border: `1px solid ${BORDER}` }}>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: BERRY }}>Payment Method</h2>

              <div className="space-y-3">
                {UPI_OPTIONS.map(({ value, label, Icon }) => (
                  <PayCard key={value} value={value} label={label} Icon={Icon}
                    note={`Pay via ${label} UPI app`} />
                ))}

                {/* COD — disabled */}
                <div
                  className="flex items-start gap-4 p-4 rounded-xl border-2 transition-all opacity-50 cursor-not-allowed"
                  style={{ borderColor: BORDER, background: 'white' }}
                >
                  <div className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                       style={{ borderColor: PINK, background: 'white' }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Ban size={15} className="text-gray-400" />
                      <p className="font-sans font-semibold text-sm text-gray-400">Cash on Delivery</p>
                    </div>
                    {codDisabled && (
                      <p className="font-sans text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                        <AlertTriangle size={11} /> Not available for this area
                      </p>
                    )}
                    {!codDisabled && (
                      <p className="font-sans text-xs text-gray-400 mt-0.5">Pay when your order arrives</p>
                    )}
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

            {/* UPI Panel */}
            {showUpiPanel && (
              <div id="upi-panel" className="bg-white rounded-[16px] p-6 shadow-card"
                   style={{ border: `2px solid ${ROSE}` }}>
                <div className="flex items-center gap-2 mb-4">
                  <Info size={18} style={{ color: ROSE }} />
                  <h2 className="font-serif text-xl font-bold" style={{ color: BERRY }}>Complete Payment</h2>
                </div>

                {/* Amount box */}
                <div className="rounded-2xl p-4 mb-5 text-center" style={{ background: PEACH_LT }}>
                  <p className="font-sans text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: PINK }}>
                    Amount to Pay
                  </p>
                  <p className="font-serif text-3xl font-bold" style={{ color: BERRY }}>
                    ₹{finalTotal.toLocaleString()}
                  </p>
                  <p className="font-sans text-xs mt-1" style={{ color: MAUVE }}>
                    via {UPI_OPTIONS.find((o) => o.value === payMethod)?.label || 'UPI'}
                  </p>
                </div>

                {/* Mobile: deep link */}
                <div className="block sm:hidden mb-4">
                  <a
                    href={intentUrl}
                    className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg"
                    style={{ background: ROSE }}
                  >
                    <ExternalLink size={16} /> Open UPI App &amp; Pay ₹{finalTotal.toLocaleString()}
                  </a>
                  <p className="font-sans text-xs text-center mt-2" style={{ color: MAUVE }}>
                    Opens PhonePe / GPay / any UPI app
                  </p>
                </div>

                {/* Desktop: QR + UPI ID */}
                <div className="hidden sm:block mb-5">
                  <p className="font-sans text-xs font-semibold mb-3 text-center uppercase tracking-wide"
                     style={{ color: BERRY }}>
                    Scan QR or copy UPI ID
                  </p>
                  <UpiQR url={intentUrl} />
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="font-mono text-sm font-bold px-3 py-1.5 rounded-lg"
                          style={{ color: BERRY, background: PEACH_LT, border: `1px solid ${BORDER}` }}>
                      {STORE_UPI}
                    </span>
                    <CopyButton text={STORE_UPI} />
                  </div>
                </div>

                {/* Instruction */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                  <Info size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-amber-700 leading-relaxed">
                    Pay ₹{finalTotal.toLocaleString()} from any UPI app using the QR or UPI ID above,
                    then tap <strong>Confirm Order</strong> below.
                  </p>
                </div>

                {/* Confirm button */}
                <button
                  onClick={handleConfirmOrder}
                  disabled={placing}
                  className="w-full text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: ROSE }}
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
            <div className="bg-white rounded-[16px] p-6 shadow-card sticky top-20"
                 style={{ border: `1px solid ${BORDER}` }}>
              <h2 className="font-serif text-xl font-bold mb-5" style={{ color: BERRY }}>Order Summary</h2>

              {/* Item list */}
              <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="w-12 h-14 rounded-lg overflow-hidden flex-shrink-0"
                         style={{ background: PEACH_LT }}>
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
                  <span className="font-serif text-lg">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {!showUpiPanel ? (
                <button
                  onClick={handleProceed}
                  disabled={placing || items.length === 0}
                  className="w-full text-white py-3.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: ROSE }}
                >
                  Proceed to Pay ₹{finalTotal.toLocaleString()}
                </button>
              ) : (
                <div className="text-center text-xs font-sans py-2" style={{ color: PINK }}>
                  Complete payment using the panel on the left
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
