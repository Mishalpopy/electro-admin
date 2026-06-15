import { useEffect, useState } from 'react'
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, uploadImage, bulkUploadProducts, getBrands } from '../api/api'
import { Modal, ConfirmModal, Toast, Spinner } from '../components/UI'

const empty = { brand: '', name: '', description: '', price: '', stock_status: 'In Stock', image: '', images: '', warranty: '', capacity: '', voltage: '', battery_type: '', ah: '', cca: '', dimensions: '', part_number: '', type: 'battery', is_favorite: false }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Pagination states
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await uploadImage(formData)
      setForm({ ...form, image: res.data.data.url })
      showToast('Image uploaded successfully!')
    } catch (err) {
      showToast('Failed to upload image', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsBulkUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await bulkUploadProducts(formData)
      showToast(res.data.message || 'Bulk upload successful!')
      load(1)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload file', 'error')
    } finally {
      setIsBulkUploading(false)
      e.target.value = null
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const newUrls = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)
        const res = await uploadImage(formData)
        newUrls.push(res.data.data.url)
      }

      const currentGallery = form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : []
      setForm({ ...form, images: [...currentGallery, ...newUrls].join(', ') })
      showToast(`${files.length} images added to gallery`)
    } catch (err) {
      showToast('Failed to upload gallery images', 'error')
    } finally {
      setUploading(false)
    }
  }

  const removeGalleryImage = (urlToRemove) => {
    const currentGallery = form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : []
    const updated = currentGallery.filter(url => url !== urlToRemove)
    setForm({ ...form, images: updated.join(', ') })
  }

  const load = (pPage = page) => {
    setLoading(true)
    getProducts({ page: pPage, limit })
      .then((res) => {
        setProducts(res.data.data)
        setTotal(res.data.pagination.total)
        setTotalPages(res.data.pagination.pages)
        setPage(res.data.pagination.page)
      })
      .catch(() => showToast('Failed to load products', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { 
    load(1) 
    getBrands().then(res => setBrands(res.data.data)).catch(err => console.error('Failed to load brands', err))
  }, [])

  // Refetch when page or limit changes
  useEffect(() => {
    load(page)
  }, [page, limit])

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || p.type === filterType
    return matchSearch && matchType
  })

  const openAdd = () => { setForm(empty); setError(''); setModal('add') }
  const openEdit = (p) => { 
    setForm({ 
      ...p, 
      images: p.images ? p.images.join(', ') : '',
      warranty: p.warranty || '',
      capacity: p.capacity || '',
      voltage: p.voltage || ''
    }); 
    setError(''); 
    setModal('edit'); 
  }
  const closeModal = () => { setModal(null); setForm(empty) }

  const handleSave = async () => {
    setError('')
    if (!form.brand || !form.name || !form.description || !form.price || !form.image) {
      setError('All basic fields are required'); return
    }
    setSaving(true)
    try {
      const payload = { 
        ...form, 
        price: Number(form.price),
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : []
      }
      if (modal === 'add') {
        await createProduct(payload)
        showToast('Product created!')
      } else {
        await updateProduct(form.id, payload)
        showToast('Product updated!')
      }
      load(page); closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProduct(confirm.id)
      showToast('Product deleted!')
      load(page); setConfirm(null)
    } catch {
      showToast('Failed to delete product', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading && page === 1) return <Spinner />

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{total} products total</p>
        </div>
        <div className="flex gap-2">
          <label className={`btn-secondary py-2 px-3 text-sm sm:text-base cursor-pointer flex items-center gap-2 border border-white/10 hover:border-primary/50 transition-colors rounded-lg bg-surface hover:bg-surface/80 text-white ${isBulkUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isBulkUploading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
            Bulk Upload
            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleBulkUpload} disabled={isBulkUploading} />
          </label>
          <button onClick={openAdd} className="btn-primary py-2 px-3 text-sm sm:text-base flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-9" placeholder="Search by name or brand…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select w-40" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-400">No products found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card p-0 overflow-hidden relative">
            {loading && (
              <div className="absolute inset-0 bg-dark/20 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                <Spinner />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark">
                  <tr>
                    <th className="table-th">Product</th>
                    <th className="table-th">Brand</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Price</th>
                    <th className="table-th">Stock Status</th>
                    <th className="table-th">In Cart</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-dark/30 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            onError={(e) => (e.target.src = 'https://placehold.co/40x40/2A2A3C/6C5CE7?text=B')}
                            className="w-10 h-10 rounded-lg object-cover bg-dark shrink-0"
                            alt={product.name}
                          />
                          <div>
                            <div className="text-white font-medium text-sm">{product.name}</div>
                            <div className="text-gray-500 text-xs truncate max-w-[160px]">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-gray-400">{product.brand}</td>
                      <td className="table-td">
                        <span className="badge bg-primary/15 text-primary capitalize">{product.type}</span>
                      </td>
                      <td className="table-td font-semibold text-white">AED {Number(product.price).toLocaleString()}</td>
                      <td className="table-td">
                        <span className={`badge ${product.stock_status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {product.stock_status || 'In Stock'}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className="badge bg-amber-500/10 text-amber-400">
                          {product.in_cart_count || 0} units
                        </span>
                      </td>
                      <td className="table-td text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-surface text-gray-400 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setConfirm({ id: product.id, name: product.name })} className="p-1.5 rounded-lg hover:bg-surface text-gray-400 hover:text-red-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-gray-400">
              Showing <span className="text-white">{(page - 1) * limit + 1}</span> to <span className="text-white">{Math.min(page * limit, total)}</span> of <span className="text-white">{total}</span> results
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1}
                className="btn-secondary py-1 px-3 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  // Show current, first, last, and pages around current
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <button 
                        key={p} 
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm transition-colors ${page === p ? 'bg-primary text-white' : 'bg-surface text-gray-400 hover:text-white border border-white/5'}`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === 2 || p === totalPages - 1) return <span key={p} className="text-gray-600 px-1 pt-2">…</span>;
                  return null;
                })}
              </div>
              <button 
                onClick={() => setPage(page + 1)} 
                disabled={page === totalPages}
                className="btn-secondary py-1 px-3 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Product' : 'Edit Product'} onClose={closeModal}>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-none">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="label">Brand</label>
                <select 
                  className="select" 
                  value={form.brand} 
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                >
                  <option value="">Select Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Product Name</label>
              <input className="input" placeholder="e.g. Exide Matrix Red" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Price (AED )</label>
                <input className="input" type="number" placeholder="4500" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="label">Stock Status</label>
                <select className="select" value={form.stock_status} onChange={(e) => setForm({ ...form, stock_status: e.target.value })}>
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="label">Warranty</label>
                <input className="input" placeholder="e.g. 48 Months" value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} />
              </div>
              <div>
                <label className="label">Capacity</label>
                <input className="input" placeholder="e.g. 60 Ah" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </div>
              <div>
                <label className="label">Voltage</label>
                <input className="input" placeholder="e.g. 12 V" value={form.voltage} onChange={(e) => setForm({ ...form, voltage: e.target.value })} />
              </div>
              <div>
                <label className="label">Battery Type</label>
                <input className="input" placeholder="e.g. 50B19R/L" value={form.battery_type} onChange={(e) => setForm({ ...form, battery_type: e.target.value })} />
              </div>
              <div>
                <label className="label">AH (C20)</label>
                <input className="input" placeholder="e.g. 40" value={form.ah} onChange={(e) => setForm({ ...form, ah: e.target.value })} />
              </div>
              <div>
                <label className="label">CCA (-18° C)</label>
                <input className="input" placeholder="e.g. 370" value={form.cca} onChange={(e) => setForm({ ...form, cca: e.target.value })} />
              </div>
              <div>
                <label className="label">Dimensions</label>
                <input className="input" placeholder="e.g. 187x127x227" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} />
              </div>
              <div>
                <label className="label">Part Number</label>
                <input className="input" placeholder="e.g. 50B19R/L" value={form.part_number} onChange={(e) => setForm({ ...form, part_number: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={form.is_favorite}
                  onChange={(e) => setForm({ ...form, is_favorite: e.target.checked })}
                />
                <span className="text-sm text-gray-300">Mark as Favorite</span>
              </label>
            </div>
            <div>
              <label className="label">Main Image</label>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="https://example.com/image.jpg" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                <label className={`btn-ghost cursor-pointer h-10 px-4 flex items-center justify-center shrink-0 border border-white/10 hover:border-primary/50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                </label>
              </div>
            </div>
            <div>
              <label className="label">Gallery Images</label>
              <div className="flex gap-2">
                <textarea 
                  className="input flex-1 resize-none h-10" 
                  placeholder="url1.jpg, url2.jpg" 
                  value={form.images} 
                  onChange={(e) => setForm({ ...form, images: e.target.value })} 
                />
                <label className={`btn-ghost cursor-pointer h-10 px-4 flex items-center justify-center shrink-0 border border-white/10 hover:border-primary/50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                </label>
              </div>
            </div>

            {/* Gallery Previews */}
            {form.images && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {form.images.split(',').map(s => s.trim()).filter(Boolean).map((url, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <img src={url} className="w-16 h-16 object-cover rounded-lg border border-white/10 bg-dark" alt="gallery" onError={(e) => e.target.style.display = 'none'} />
                    <button 
                      onClick={() => removeGalleryImage(url)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {form.image && (
              <div className="relative group">
                <img src={form.image} onError={(e) => (e.target.style.display = 'none')} className="w-full h-32 object-contain rounded-lg bg-dark mt-2 border border-white/5" alt="preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg mt-2">
                   <p className="text-white text-xs font-medium">Main Image Preview</p>
                </div>
              </div>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Saving…' : modal === 'add' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <ConfirmModal
          title="Confirm Delete"
          confirmText="Delete"
          message={`Are you sure you want to delete "${confirm.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={deleting}
          variant="danger"
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
