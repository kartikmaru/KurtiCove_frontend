'use client'
import { useState, useRef, useEffect } from 'react'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { FiX, FiUpload, FiChevronDown } from 'react-icons/fi'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

/* ── Category combobox ───────────────────────────────────────── */
function CategoryCombobox({ value, onChange }) {
  const [suggestions, setSuggestions]   = useState([])   // all existing categories
  const [open, setOpen]                 = useState(false)
  const [inputVal, setInputVal]         = useState(value || '')
  const containerRef                    = useRef(null)

  // Fetch distinct categories from API once
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${BASE}product/categories`)
        const data = await res.json()
        if (data.success) setSuggestions(data.data.map((c) => c.name))
      } catch { /* silent */ }
    }
    load()
  }, [])

  // Keep parent value in sync if edited externally
  useEffect(() => { setInputVal(value || '') }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = (e) => {
    setInputVal(e.target.value)
    onChange(e.target.value)
    setOpen(true)
  }

  const handleSelect = (name) => {
    setInputVal(name)
    onChange(name)
    setOpen(false)
  }

  const filtered = inputVal.trim()
    ? suggestions.filter((s) => s.toLowerCase().includes(inputVal.toLowerCase()))
    : suggestions

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputVal}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder="e.g. Anarkali, Straight Cut, Palazzo Set…"
          className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 pr-10 text-sm text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7]"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          className="absolute right-3 text-purple-400 hover:text-purple-600"
        >
          <FiChevronDown size={15} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#E9D5FF] rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            inputVal.trim() ? (
              <button
                type="button"
                onClick={() => handleSelect(inputVal.trim())}
                className="w-full text-left px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 font-medium"
              >
                + Create &ldquo;{inputVal.trim()}&rdquo;
              </button>
            ) : (
              <p className="px-4 py-3 text-xs text-gray-400">No categories yet. Type to create one.</p>
            )
          ) : (
            <>
              {filtered.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelect(name)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors ${
                    name === value ? 'text-purple-700 font-semibold bg-purple-50' : 'text-[#3B0764]'
                  }`}
                >
                  {name}
                </button>
              ))}
              {/* Allow creating new entry even when suggestions exist */}
              {inputVal.trim() && !filtered.some((s) => s.toLowerCase() === inputVal.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => handleSelect(inputVal.trim())}
                  className="w-full text-left px-4 py-2.5 text-sm text-purple-500 hover:bg-purple-50 border-t border-purple-50 font-medium"
                >
                  + Create &ldquo;{inputVal.trim()}&rdquo;
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main form ───────────────────────────────────────────────── */
export default function ProductForm({ product, onSuccess, onCancel }) {
  const isEdit = !!product

  const [form, setForm] = useState({
    name:          product?.name          || '',
    description:   product?.description   || '',
    category:      product?.category      || '',
    price:         product?.price         || '',
    discountPrice: product?.discountPrice || '',
    stock:         product?.stock         || '',
    isFeatured:    product?.isFeatured    || false,
    isNewArrival:  product?.isNewArrival  || false,
    isBestSeller:  product?.isBestSeller  || false,
    colors:        product?.colors        || [],
    sizes:         product?.sizes         || [],
  })

  const [colorInput,    setColorInput]    = useState('#A855F7')
  const [imageFiles,    setImageFiles]    = useState([])
  const [imagePreviews, setImagePreviews] = useState(product?.images || [])
  const [loading,       setLoading]       = useState(false)
  const fileInputRef = useRef()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const addColor = () => {
    const c   = colorInput.trim()
    if (!c) return
    const hex = c.startsWith('#') ? c.toLowerCase() : `#${c}`.toLowerCase()
    if (hex.length >= 4 && !form.colors.includes(hex)) {
      setForm((prev) => ({ ...prev, colors: [...prev.colors, hex] }))
    }
  }

  const removeColor = (c) =>
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((x) => x !== c) }))

  const toggleSize = (s) =>
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(s) ? prev.sizes.filter((x) => x !== s) : [...prev.sizes, s],
    }))

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)
    const previews = files.map((f) => URL.createObjectURL(f))
    setImagePreviews([...(product?.images || []), ...previews])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.description || !form.price) {
      toast.error('Name, description and price are required.')
      return
    }
    setLoading(true)

    try {
      let productId = product?._id

      const payload = {
        name:          form.name,
        description:   form.description,
        category:      form.category.trim(),
        price:         Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stock:         Number(form.stock) || 0,
        colors:        JSON.stringify(form.colors),
        sizes:         JSON.stringify(form.sizes),
        isFeatured:    form.isFeatured,
        isNewArrival:  form.isNewArrival,
        isBestSeller:  form.isBestSeller,
      }

      if (isEdit) {
        await API.put(`/product/${productId}`, payload)
        toast.success('Product updated.')
      } else {
        const res = await API.post('/product', payload)
        productId = res.data.data._id
        toast.success('Product created.')
      }

      if (imageFiles.length > 0) {
        const formData = new FormData()
        imageFiles.forEach((f) => formData.append('images', f))
        await API.post(`/product/${productId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Images uploaded.')
      }

      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-[#3B0764] mb-1">Product Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Floral Anarkali Kurti"
          required
          className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7]"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-[#3B0764] mb-1">Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Describe the kurti…"
          required
          className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] resize-none"
        />
      </div>

      {/* Category combobox */}
      <div>
        <label className="block text-sm font-semibold text-[#3B0764] mb-1">
          Category
          <span className="font-normal text-gray-400 ml-1">(pick existing or type to create new)</span>
        </label>
        <CategoryCombobox
          value={form.category}
          onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
        />
      </div>

      {/* Price + Discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#3B0764] mb-1">Price ₹ *</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="999"
            min="0"
            required
            className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#3B0764] mb-1">Discount Price ₹</label>
          <input
            name="discountPrice"
            type="number"
            value={form.discountPrice}
            onChange={handleChange}
            placeholder="799"
            min="0"
            className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7]"
          />
        </div>
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-semibold text-[#3B0764] mb-1">Stock *</label>
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          placeholder="50"
          min="0"
          required
          className="w-full border border-[#E9D5FF] rounded-xl px-4 py-2.5 text-sm text-[#3B0764] bg-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7]"
        />
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-semibold text-[#3B0764] mb-1">Colors</label>
        {form.colors.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {form.colors.map((hex) => (
              <span
                key={hex}
                className="inline-flex items-center gap-1.5 bg-white border border-[#E9D5FF] text-[#3B0764] px-2.5 py-1 rounded-full text-xs shadow-sm"
              >
                <span className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: hex }} />
                <span className="font-mono">{hex}</span>
                <button type="button" onClick={() => removeColor(hex)} className="text-[#C084FC] hover:text-red-500 ml-0.5">
                  <FiX size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            className="w-10 h-10 rounded-lg border border-purple-200 cursor-pointer p-0.5 flex-shrink-0"
            title="Pick a color"
          />
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor() } }}
            placeholder="#A855F7"
            maxLength={7}
            className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-sm font-mono text-purple-800 focus:ring-2 focus:ring-purple-300 outline-none bg-white"
          />
          <button
            type="button"
            onClick={addColor}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Pick a color or type a hex code like #FF5733</p>
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-sm font-semibold text-[#3B0764] mb-2">Sizes</label>
        <div className="flex gap-2 flex-wrap">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
                form.sizes.includes(s)
                  ? 'bg-[#A855F7] border-[#A855F7] text-white'
                  : 'border-[#E9D5FF] text-[#3B0764] hover:border-[#A855F7] hover:text-[#A855F7]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div>
        <label className="block text-sm font-semibold text-[#3B0764] mb-2">Product Flags</label>
        <div className="flex gap-4 flex-wrap">
          {[
            { name: 'isFeatured',   label: 'Featured'    },
            { name: 'isNewArrival', label: 'New Arrival' },
            { name: 'isBestSeller', label: 'Best Seller' },
          ].map((flag) => (
            <label key={flag.name} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name={flag.name}
                checked={form[flag.name]}
                onChange={handleChange}
                className="w-4 h-4 accent-[#A855F7] rounded"
              />
              <span className="text-sm text-[#3B0764]">{flag.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-[#3B0764] mb-2">Product Images</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#C084FC] rounded-xl p-6 text-center cursor-pointer hover:bg-[#FAF5FF] transition-colors"
        >
          <FiUpload size={24} className="mx-auto text-[#C084FC] mb-2" />
          <p className="text-sm text-[#C084FC] font-sans">Click to upload images (max 10)</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 10MB each</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        {imagePreviews.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-[#E9D5FF] bg-[#F3E8FF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-all"
        >
          {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Save Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border-2 border-[#E9D5FF] text-[#3B0764] hover:border-[#A855F7] hover:text-[#A855F7] py-3 rounded-xl font-semibold text-sm transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
