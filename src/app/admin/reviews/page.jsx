'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import API from '../../../utils/Helper'
import toast from 'react-hot-toast'
import { FiStar, FiEdit2, FiTrash2, FiX, FiUpload, FiPlus } from 'react-icons/fi'

/* ── Star rating picker ── */
function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="focus:outline-none"
          aria-label={`${n} star`}
        >
          <FiStar
            size={22}
            className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
            fill={n <= value ? '#fbbf24' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}

/* ── Empty form state ── */
const emptyForm = {
  productId:    '',
  customerName: '',
  location:     '',
  rating:       5,
  title:        '',
  comment:      '',
  verifiedBuyer: false,
}

export default function AdminReviewsPage() {
  const [view,      setView]      = useState('list')   // 'list' | 'form'
  const [reviews,   setReviews]   = useState([])
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [editReview,setEditReview]= useState(null)

  const [form,       setForm]       = useState(emptyForm)
  const [imageFile,  setImageFile]  = useState(null)
  const [imagePreview,setImagePreview] = useState(null)
  const fileRef = useRef()

  /* ── Fetch reviews + products ── */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [rv, pr] = await Promise.all([
        API.get('/review/all'),
        API.get('/product?limit=200'),
      ])
      if (rv.data.success)  setReviews(rv.data.data)
      if (pr.data.success)  setProducts(pr.data.data)
    } catch { toast.error('Failed to load data.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── Open create ── */
  const openCreate = () => {
    setEditReview(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setView('form')
  }

  /* ── Open edit ── */
  const openEdit = (r) => {
    setEditReview(r)
    setForm({
      productId:     r.productId?._id || r.productId || '',
      customerName:  r.customerName,
      location:      r.location || '',
      rating:        r.rating,
      title:         r.title || '',
      comment:       r.comment,
      verifiedBuyer: r.verifiedBuyer,
    })
    setImageFile(null)
    setImagePreview(r.imageUrl || null)
    setView('form')
  }

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      await API.delete(`/review/${id}`)
      toast.success('Review deleted.')
      fetchData()
    } catch { toast.error('Failed to delete.') }
  }

  /* ── Image pick ── */
  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.productId || !form.customerName || !form.comment) {
      toast.error('Product, customer name and comment are required.')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)

      if (editReview) {
        await API.patch(`/review/${editReview._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Review updated.')
      } else {
        await API.post('/review', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Review created.')
      }
      setView('list')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save review.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7]'

  /* ════ LIST ════ */
  if (view === 'list') {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-cursive text-3xl font-bold text-[#3B0764]">Reviews</h1>
            <p className="text-sm text-purple-400 mt-1 font-sans">{reviews.length} total reviews</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white px-5 py-2.5 rounded-xl font-sans font-semibold text-sm transition-colors"
          >
            <FiPlus size={16} /> Add Review
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E9D5FF] p-16 text-center shadow-sm">
            <FiStar size={40} className="mx-auto text-purple-200 mb-4" />
            <p className="text-purple-300 font-sans text-lg mb-4">No reviews yet</p>
            <button onClick={openCreate} className="bg-[#A855F7] text-white px-6 py-2 rounded-full text-sm font-medium">
              Add First Review
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E9D5FF] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead className="bg-[#F3E8FF]">
                  <tr>
                    {['Product', 'Customer', 'Rating', 'Title', 'Verified', 'Helpful', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-bold text-[#3B0764] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r, idx) => (
                    <tr key={r._id} className={`border-t border-[#F3E8FF] hover:bg-purple-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-purple-50/10'}`}>
                      <td className="px-4 py-3 max-w-[140px]">
                        <p className="text-[#3B0764] font-medium truncate text-xs">
                          {r.productId?.name || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#3B0764] text-xs">{r.customerName}</p>
                        {r.location && <p className="text-purple-400 text-xs">{r.location}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((n) => (
                            <FiStar key={n} size={12} fill={n <= r.rating ? '#fbbf24' : 'none'} className={n <= r.rating ? 'text-amber-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[120px]">
                        <p className="text-[#3B0764] text-xs truncate">{r.title || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.verifiedBuyer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {r.verifiedBuyer ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-purple-600 font-semibold text-xs">{r.helpfulCount}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(r)} className="p-1.5 text-[#A855F7] hover:bg-purple-50 rounded-lg transition-colors" title="Edit">
                            <FiEdit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ════ FORM ════ */
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-cursive text-3xl font-bold text-[#3B0764]">
          {editReview ? 'Edit Review' : 'Add Review'}
        </h1>
        <button onClick={() => setView('list')} className="text-sm text-purple-500 hover:text-purple-700 font-medium font-sans">
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5 max-w-2xl">
        {/* Product selector */}
        <div>
          <label className="block text-sm font-semibold text-[#3B0764] mb-1">Product *</label>
          <select
            value={form.productId}
            onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
            required
            className={inputCls}
          >
            <option value="">— Select a product —</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Customer name + location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#3B0764] mb-1">Customer Name *</label>
            <input
              value={form.customerName}
              onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
              placeholder="Priya Sharma"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#3B0764] mb-1">City / Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="Mumbai"
              className={inputCls}
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-[#3B0764] mb-2">Star Rating *</label>
          <StarPicker value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-[#3B0764] mb-1">Review Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Absolutely loved this kurti!"
            className={inputCls}
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold text-[#3B0764] mb-1">Review Comment *</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
            rows={4}
            required
            placeholder="The fabric quality is amazing..."
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Verified buyer */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.verifiedBuyer}
            onChange={(e) => setForm((p) => ({ ...p, verifiedBuyer: e.target.checked }))}
            className="w-4 h-4 accent-[#A855F7]"
          />
          <span className="text-sm font-medium text-[#3B0764] font-sans">Verified Buyer</span>
        </label>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-semibold text-[#3B0764] mb-2">Review Photo (optional)</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-[#C084FC] rounded-xl p-5 text-center cursor-pointer hover:bg-purple-50/50 transition-colors"
          >
            <FiUpload size={22} className="mx-auto text-[#C084FC] mb-1" />
            <p className="text-sm text-[#C084FC] font-sans">Click to upload review photo</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 10MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {imagePreview && (
            <div className="relative inline-block mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" className="w-24 h-24 rounded-xl object-cover border border-[#E9D5FF]" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="absolute -top-2 -right-2 bg-white border border-[#E9D5FF] rounded-full w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 shadow-sm"
              >
                <FiX size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-all font-sans"
          >
            {saving ? 'Saving...' : editReview ? 'Update Review' : 'Save Review'}
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className="flex-1 border-2 border-[#E9D5FF] text-[#3B0764] hover:border-[#A855F7] hover:text-[#A855F7] py-3 rounded-xl font-semibold text-sm transition-all font-sans"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
