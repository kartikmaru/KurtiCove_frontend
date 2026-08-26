'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import API from '../../../utils/Helper'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiSearch } from 'react-icons/fi'

// ── Format datetime-local value ───────────────────────────────
const toLocalInput = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Product search dropdown ───────────────────────────────────
function ProductSearch({ onSelect }) {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const timerRef               = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await API.get(`/product?search=${encodeURIComponent(query)}&limit=8`)
        if (res.data.success) setResults(res.data.data)
      } catch {}
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timerRef.current)
  }, [query])

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border border-purple-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-purple-300 bg-white">
        <FiSearch size={15} className="text-purple-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products to add..."
          className="flex-1 text-sm text-purple-900 placeholder-purple-300 outline-none font-sans bg-transparent"
        />
        {loading && <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />}
      </div>
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-purple-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => { onSelect(p); setQuery(''); setResults([]) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left"
            >
              <div className="w-10 h-12 bg-purple-50 rounded-lg overflow-hidden flex-shrink-0">
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-900 truncate">{p.name}</p>
                <p className="text-xs text-purple-400">₹{p.price?.toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminSalePage() {
  const [view,       setView]       = useState('list') // 'list' | 'form'
  const [sales,      setSales]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [editSale,   setEditSale]   = useState(null)
  const [saving,     setSaving]     = useState(false)

  // Form state
  const [form, setForm] = useState({
    title:     '',
    subtitle:  '',
    startTime: '',
    endTime:   '',
    isActive:  false,
  })
  const [selectedProducts, setSelectedProducts] = useState([]) // [{ product, salePrice }]

  /* ── Fetch all sales ── */
  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const res = await API.get('/sale/all')
      if (res.data.success) setSales(res.data.data)
    } catch { toast.error('Failed to load sales.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSales() }, [fetchSales])

  /* ── Open create form ── */
  const openCreate = () => {
    setEditSale(null)
    setForm({ title: '', subtitle: '', startTime: '', endTime: '', isActive: false })
    setSelectedProducts([])
    setView('form')
  }

  /* ── Open edit form ── */
  const openEdit = (sale) => {
    setEditSale(sale)
    setForm({
      title:     sale.title,
      subtitle:  sale.subtitle || '',
      startTime: toLocalInput(sale.startTime),
      endTime:   toLocalInput(sale.endTime),
      isActive:  sale.isActive,
    })
    // Reconstruct selected products from populated data
    setSelectedProducts(
      (sale.products || [])
        .filter((item) => item.productId)
        .map((item) => ({
          product:   item.productId,
          salePrice: item.salePrice,
        }))
    )
    setView('form')
  }

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!confirm('Delete this sale?')) return
    try {
      await API.delete(`/sale/delete/${id}`)
      toast.success('Sale deleted.')
      fetchSales()
    } catch { toast.error('Failed to delete.') }
  }

  /* ── Toggle ── */
  const handleToggle = async (id) => {
    try {
      await API.patch(`/sale/toggle/${id}`)
      toast.success('Status updated.')
      fetchSales()
    } catch { toast.error('Failed to toggle status.') }
  }

  /* ── Add product to selection ── */
  const handleAddProduct = (product) => {
    if (selectedProducts.find((sp) => sp.product._id === product._id)) return
    setSelectedProducts((prev) => [...prev, { product, salePrice: '' }])
  }

  /* ── Update sale price ── */
  const updateSalePrice = (productId, value) => {
    setSelectedProducts((prev) =>
      prev.map((sp) => sp.product._id === productId ? { ...sp, salePrice: value } : sp)
    )
  }

  /* ── Remove product ── */
  const removeProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((sp) => sp.product._id !== productId))
  }

  /* ── Submit form ── */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title || !form.startTime || !form.endTime) {
      toast.error('Title, start time, and end time are required.')
      return
    }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      toast.error('End time must be after start time.')
      return
    }
    if (selectedProducts.length === 0) {
      toast.error('Add at least one product.')
      return
    }

    // Validate sale prices
    for (const sp of selectedProducts) {
      const sp_price = Number(sp.salePrice)
      if (!sp_price || sp_price <= 0) {
        toast.error(`Set a valid sale price for "${sp.product.name}".`)
        return
      }
      if (sp_price >= sp.product.price) {
        toast.error(`Sale price for "${sp.product.name}" must be less than original price ₹${sp.product.price}.`)
        return
      }
    }

    const payload = {
      title:     form.title,
      subtitle:  form.subtitle,
      startTime: form.startTime,
      endTime:   form.endTime,
      isActive:  form.isActive,
      products:  selectedProducts.map((sp) => ({
        productId: sp.product._id,
        salePrice: Number(sp.salePrice),
      })),
    }

    setSaving(true)
    try {
      if (editSale) {
        await API.put(`/sale/update/${editSale._id}`, payload)
        toast.success('Sale updated.')
      } else {
        await API.post('/sale/create', payload)
        toast.success('Sale created.')
      }
      setView('list')
      fetchSales()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save sale.')
    } finally {
      setSaving(false)
    }
  }

  const formatDt = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  /* ════════════════════════════════ LIST VIEW ════════════════════════════════ */
  if (view === 'list') {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-cursive text-3xl font-bold text-[#3B0764]">Festival Sale</h1>
            <p className="text-sm text-purple-400 font-sans mt-1">Manage limited-time sale events</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-sans font-semibold text-sm transition-colors"
          >
            <FiPlus size={16} /> Create New Sale
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sales.length === 0 ? (
          <div className="bg-white rounded-2xl border border-purple-100 p-16 text-center shadow-sm">
            <p className="text-purple-300 font-sans text-lg mb-4">No sales yet</p>
            <button onClick={openCreate} className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
              Create First Sale
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead className="bg-purple-50">
                  <tr>
                    {['Title', 'Start', 'End', 'Products', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-purple-700 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, idx) => (
                    <tr key={sale._id} className={`border-t border-purple-50 hover:bg-purple-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-purple-50/20'}`}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-purple-900">{sale.title}</p>
                        {sale.subtitle && <p className="text-xs text-purple-400 mt-0.5">{sale.subtitle}</p>}
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">{formatDt(sale.startTime)}</td>
                      <td className="px-5 py-4 text-gray-600 text-xs">{formatDt(sale.endTime)}</td>
                      <td className="px-5 py-4 text-center font-semibold text-purple-700">
                        {sale.products?.length || 0}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${sale.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {sale.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(sale)} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" title="Edit">
                            <FiEdit2 size={15} />
                          </button>
                          <button onClick={() => handleToggle(sale._id)} className="p-2 transition-colors rounded-lg" title="Toggle status">
                            {sale.isActive
                              ? <FiToggleRight size={18} className="text-green-500" />
                              : <FiToggleLeft  size={18} className="text-gray-400 hover:text-purple-500" />
                            }
                          </button>
                          <button onClick={() => handleDelete(sale._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <FiTrash2 size={15} />
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

  /* ════════════════════════════════ FORM VIEW ════════════════════════════════ */
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-cursive text-3xl font-bold text-[#3B0764]">
          {editSale ? 'Edit Sale' : 'Create New Sale'}
        </h1>
        <button onClick={() => setView('list')} className="text-sm text-purple-500 hover:text-purple-700 font-sans font-medium">
          ← Back to Sales
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6 max-w-3xl">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1.5">Sale Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Diwali Mega Sale"
            required
            className="w-full border border-purple-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-300 outline-none font-sans"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1.5">Subtitle (optional)</label>
          <input
            value={form.subtitle}
            onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
            placeholder="e.g. Up to 60% off on selected kurtis"
            className="w-full border border-purple-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-300 outline-none font-sans"
          />
        </div>

        {/* Times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-800 mb-1.5">Start Date & Time *</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              required
              className="w-full border border-purple-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-300 outline-none font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-800 mb-1.5">End Date & Time *</label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              required
              className="w-full border border-purple-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-300 outline-none font-sans"
            />
          </div>
        </div>

        {/* Active */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            className="w-4 h-4 accent-purple-600"
          />
          <span className="text-sm font-medium text-purple-800 font-sans">
            Activate this sale immediately (deactivates any other active sale)
          </span>
        </label>

        {/* Products search */}
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1.5">Add Products *</label>
          <ProductSearch onSelect={handleAddProduct} />
        </div>

        {/* Selected products */}
        {selectedProducts.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-widest font-sans">
              Selected Products ({selectedProducts.length})
            </p>
            {selectedProducts.map(({ product, salePrice }) => (
              <div key={product._id} className="flex items-center gap-4 bg-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="w-12 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-purple-100">
                  {product.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-purple-900 truncate">{product.name}</p>
                  <p className="text-xs text-purple-400">Original: ₹{product.price?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-purple-600 font-sans">₹</span>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => updateSalePrice(product._id, e.target.value)}
                    placeholder="Sale price"
                    min="1"
                    max={product.price - 1}
                    className="w-28 border border-purple-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-300 outline-none font-sans"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product._id)}
                  className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors font-sans"
          >
            {saving ? 'Saving...' : editSale ? 'Update Sale' : 'Create Sale'}
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className="flex-1 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 py-3 rounded-xl font-semibold text-sm transition-colors font-sans"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
