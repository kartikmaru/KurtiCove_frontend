'use client'
import { useState, useEffect, useCallback } from 'react'
import API from '../../../utils/Helper'
import ProductForm from '../../../components/admin/ProductForm'
import toast from 'react-hot-toast'
import { FiEdit2, FiTrash2, FiPlus, FiPackage } from 'react-icons/fi'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('table') // 'table' | 'form'
  const [editProduct, setEditProduct] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const LIMIT = 15

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await API.get(`/product?page=${page}&limit=${LIMIT}`)
      if (res.data.success) {
        setProducts(res.data.data)
        setPagination(res.data.pagination)
      }
    } catch {
      toast.error('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await API.delete(`/product/${id}`)
      toast.success('Product deleted.')
      fetchProducts()
    } catch {
      toast.error('Failed to delete product.')
    }
  }

  const openAdd = () => { setEditProduct(null); setView('form') }
  const openEdit = (p) => { setEditProduct(p); setView('form') }
  const handleFormSuccess = () => { setView('table'); setEditProduct(null); fetchProducts() }
  const handleFormCancel = () => { setView('table'); setEditProduct(null) }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cursive text-3xl font-bold text-[#3B0764]">
            {view === 'form' ? (editProduct ? 'Edit Product' : 'Add New Product') : 'Products'}
          </h1>
          {view === 'table' && (
            <p className="font-sans text-sm text-[#C084FC] mt-1">{pagination.total} products total</p>
          )}
        </div>
        {view === 'table' && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white px-5 py-2.5 rounded-xl font-sans font-semibold text-sm transition-all hover:shadow-lg"
          >
            <FiPlus size={16} /> Add New Product
          </button>
        )}
        {view === 'form' && (
          <button
            onClick={handleFormCancel}
            className="font-sans text-sm text-[#C084FC] hover:text-[#A855F7] transition-colors"
          >
            ← Back to Products
          </button>
        )}
      </div>

      {/* Form view */}
      {view === 'form' && (
        <div className="max-w-2xl bg-white rounded-[16px] border border-[#E9D5FF] p-6 shadow-card">
          <ProductForm product={editProduct} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-[16px] border border-[#E9D5FF] p-16 text-center shadow-card">
            <FiPackage size={52} className="mx-auto text-[#E9D5FF] mb-4" />
            <h2 className="font-serif text-xl font-bold text-[#3B0764] mb-2">No products yet</h2>
            <button onClick={openAdd} className="mt-4 bg-[#A855F7] text-white px-6 py-2 rounded-full text-sm font-sans font-medium">
              Add Your First Product
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-[16px] border border-[#E9D5FF] overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead className="bg-[#F3E8FF]">
                    <tr>
                      {['Image', 'Name', 'Category', 'Price ₹', 'Discount ₹', 'Stock', 'Flags', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[#3B0764] font-semibold text-xs uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, idx) => (
                      <tr
                        key={product._id}
                        className={`border-t border-[#F3E8FF] hover:bg-[#FAF5FF] transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF5FF]/40'}`}
                      >
                        <td className="px-4 py-3">
                          <div className="w-12 h-14 bg-[#F3E8FF] rounded-lg overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">👗</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#3B0764] line-clamp-1 max-w-[180px]">{product.name}</p>
                          <p className="text-[#C084FC] text-xs mt-0.5">
                            {product.sizes?.slice(0, 3).join(' · ')}
                            {product.sizes?.length > 3 && ` +${product.sizes.length - 3}`}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {product.category ? (
                            <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-semibold px-2.5 py-1 rounded-full max-w-[120px] truncate">
                              {product.category}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#3B0764]">₹{product.price?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#A855F7]">
                          {product.discountPrice ? `₹${product.discountPrice.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {product.isFeatured && <span className="bg-[#F3E8FF] text-[#6B21A8] text-[9px] font-bold px-1.5 py-0.5 rounded">F</span>}
                            {product.isNewArrival && <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded">N</span>}
                            {product.isBestSeller && <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded">B</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-2 text-[#A855F7] hover:bg-[#F3E8FF] rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id, product.name)}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
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

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-[#E9D5FF] text-sm text-[#3B0764] hover:bg-[#F3E8FF] disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>
                <span className="px-4 py-2 text-sm text-[#6B21A8] font-medium">
                  {page} / {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-xl border border-[#E9D5FF] text-sm text-[#3B0764] hover:bg-[#F3E8FF] disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )
      )}
    </div>
  )
}
