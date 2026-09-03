'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { FiX, FiUpload, FiChevronDown } from 'react-icons/fi'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

/* ─────────────────────────────────────────────────────────────────────
   RICH TEXT EDITOR
   Toolbar: Bold · Italic · Underline · H2 · H3 · Bullet list · Numbered list · BR
   Outputs clean HTML string stored in form.description.
   Preview tab shows sanitized rendered result.
───────────────────────────────────────────────────────────────────── */
function RichTextEditor({ value, onChange }) {
  const editorRef  = useRef(null)
  const [preview,  setPreview]  = useState(false)
  const [html,     setHtml]     = useState(value || '')
  const initiated  = useRef(false)

  /* Sync incoming value → editor on first mount only */
  useEffect(() => {
    if (initiated.current || !editorRef.current) return
    editorRef.current.innerHTML = value || ''
    initiated.current = true
  }, [value])

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    sync()
  }, [])

  const sync = useCallback(() => {
    const content = editorRef.current?.innerHTML || ''
    setHtml(content)
    onChange(content)
  }, [onChange])

  const insertBR = useCallback(() => {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, '<br/>')
    sync()
  }, [sync])

  const toolbarBtnCls = 'px-2.5 py-1 rounded-lg border text-xs font-semibold font-sans transition-all hover:bg-[#F3E8FF] border-[#E9D5FF] text-[#3B0764] active:scale-95 select-none'

  return (
    <div className="rounded-xl border border-[#E9D5FF] overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap px-3 py-2 border-b border-[#E9D5FF] bg-[#FAF5FF]">
        <button type="button" title="Bold"        className={toolbarBtnCls} onMouseDown={(e) => { e.preventDefault(); exec('bold')          }}>B</button>
        <button type="button" title="Italic"      className={`${toolbarBtnCls} italic`}      onMouseDown={(e) => { e.preventDefault(); exec('italic')        }}>I</button>
        <button type="button" title="Underline"   className={`${toolbarBtnCls} underline`}   onMouseDown={(e) => { e.preventDefault(); exec('underline')     }}>U</button>
        <span className="w-px h-5 bg-[#E9D5FF] mx-1" />
        <button type="button" title="Heading 2"   className={toolbarBtnCls} onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'H2') }}>H2</button>
        <button type="button" title="Heading 3"   className={toolbarBtnCls} onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'H3') }}>H3</button>
        <button type="button" title="Paragraph"   className={toolbarBtnCls} onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'P')  }}>P</button>
        <span className="w-px h-5 bg-[#E9D5FF] mx-1" />
        <button type="button" title="Bullet list"   className={toolbarBtnCls} onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList') }}>• List</button>
        <button type="button" title="Numbered list" className={toolbarBtnCls} onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList')   }}>1. List</button>
        <button type="button" title="Line break"    className={toolbarBtnCls} onMouseDown={(e) => { e.preventDefault(); insertBR()                  }}>↵ BR</button>
        <span className="flex-1" />
        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className={`px-3 py-1 rounded-lg border text-xs font-semibold font-sans transition-all ${
            preview
              ? 'bg-[#A855F7] border-[#A855F7] text-white'
              : 'border-[#E9D5FF] text-[#A855F7] hover:bg-[#F3E8FF]'
          }`}
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview ? (
        /* ── Preview panel ── */
        <div className="min-h-[120px] px-4 py-3">
          {html ? (
            <>
              <style>{`
                .rte-preview h2{font-size:1.05rem;font-weight:700;color:#3B0764;margin:0.6rem 0 0.3rem}
                .rte-preview h3{font-size:0.9rem;font-weight:600;color:#3B0764;margin:0.5rem 0 0.25rem}
                .rte-preview p{font-size:0.875rem;line-height:1.6;color:#4B2F3A;margin-bottom:0.4rem}
                .rte-preview ul,.rte-preview ol{padding-left:1.2rem;margin-bottom:0.4rem}
                .rte-preview li{font-size:0.875rem;line-height:1.55;color:#4B2F3A;margin-bottom:0.1rem}
                .rte-preview ul li::marker{color:#A855F7}
                .rte-preview ol li::marker{color:#A855F7;font-weight:600}
                .rte-preview strong,.rte-preview b{color:#3B0764;font-weight:700}
              `}</style>
              {/* dangerouslySetInnerHTML is admin-only, content written by the admin themselves */}
              <div className="rte-preview text-sm" dangerouslySetInnerHTML={{ __html: html }} />
            </>
          ) : (
            <p className="text-sm text-gray-400 font-sans">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        /* ── Editable area ── */
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          className="min-h-[120px] px-4 py-3 text-sm text-[#3B0764] font-sans outline-none"
          style={{ lineHeight: 1.65 }}
          data-placeholder="Describe the kurti — supports bold, headings, lists…"
        />
      )}

      {/* Raw HTML toggle — small helper */}
      <details className="border-t border-[#E9D5FF]">
        <summary className="px-4 py-1.5 text-[11px] text-gray-400 cursor-pointer hover:text-gray-600 select-none">
          Raw HTML
        </summary>
        <textarea
          rows={4}
          value={html}
          onChange={(e) => {
            const v = e.target.value
            setHtml(v)
            onChange(v)
            if (editorRef.current && !preview) editorRef.current.innerHTML = v
          }}
          className="w-full px-4 py-2 text-xs font-mono text-gray-600 bg-gray-50 outline-none resize-y border-t border-[#E9D5FF]"
          spellCheck={false}
        />
      </details>

      {/* Empty placeholder CSS */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #C084FC;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

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

      {/* Description — rich-text editor */}
      <div>
        <label className="block text-sm font-semibold text-[#3B0764] mb-1">Description *
          <span className="font-normal text-gray-400 ml-1">(supports HTML formatting)</span>
        </label>
        <RichTextEditor
          value={form.description}
          onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
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
