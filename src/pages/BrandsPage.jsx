import { useEffect, useState } from 'react'
import { getBrands, createBrand, updateBrand, deleteBrand, uploadImage, getBrandCapacities } from '../api/api'
import { Modal, ConfirmModal, Toast, Spinner } from '../components/UI'

const empty = { name: '', image: '' }

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)       // 'add' | 'edit'
  const [confirm, setConfirm] = useState(null)   // { id, name }
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')
  const [capacities, setCapacities] = useState({}) // { brandName: [cap1, cap2] }

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
      // The backend returns { status: true, data: { url: '...' } }
      const imageUrl = res.data.data.url
      setForm({ ...form, image: imageUrl })
      showToast('Brand logo uploaded successfully!')
    } catch (err) {
      showToast('Failed to upload logo', 'error')
    } finally {
      setUploading(false)
    }
  }

  const load = () => {
    setLoading(true)
    getBrands()
      .then((res) => {
        setBrands(res.data.data)
        // Optionally load capacities for each brand
        res.data.data.forEach(brand => {
           getBrandCapacities(brand.name).then(capRes => {
              setCapacities(prev => ({ ...prev, [brand.name]: capRes.data.data }))
           })
        })
      })
      .catch(() => showToast('Failed to load brands', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setError(''); setModal('add') }
  const openEdit = (brand) => { setForm({ name: brand.name, image: brand.image, id: brand.id }); setError(''); setModal('edit') }
  const closeModal = () => { setModal(null); setForm(empty) }

  const handleSave = async () => {
    setError('')
    if (!form.name || !form.image) { setError('Both name and logo are required'); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        await createBrand({ name: form.name, image: form.image })
        showToast('Brand added successfully!')
      } else {
        await updateBrand(form.id, { name: form.name, image: form.image })
        showToast('Brand updated!')
      }
      load(); closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteBrand(confirm.id)
      showToast('Brand deleted!')
      load(); setConfirm(null)
    } catch {
      showToast('Failed to delete brand', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">Battery Brands</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{brands.length} battery brands total</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-3 text-sm sm:text-base">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Brand
        </button>
      </div>

      {/* Cards Grid */}
      {brands.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔋</div>
          <p className="text-gray-400">No battery brands yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="card hover:border-primary/40 transition-all group overflow-hidden">
               <div className="flex items-start justify-between">
                <div className="w-20 h-10 flex items-center justify-center p-2 bg-white rounded-lg">
                  <img src={brand.image} alt={brand.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex gap-1 opacity-10 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(brand)}
                    className="p-1.5 rounded-lg hover:bg-dark text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirm({ id: brand.id, name: brand.name })}
                    className="p-1.5 rounded-lg hover:bg-dark text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-white font-semibold text-lg">{brand.name}</h3>
                <p className="text-gray-500 text-xs mt-1">Available Capacities:</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                   {capacities[brand.name]?.length > 0 ? (
                      capacities[brand.name].slice(0, 4).map(cap => (
                        <span key={cap} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-400 border border-white/10 uppercase">
                          {cap}
                        </span>
                      ))
                   ) : (
                      <span className="text-[10px] text-gray-600">No products linked</span>
                   )}
                   {capacities[brand.name]?.length > 4 && (
                      <span className="text-[10px] text-gray-600">+{capacities[brand.name].length - 4} more</span>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Battery Brand' : 'Edit Brand'} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="label">Brand Name</label>
              <input className="input" placeholder="e.g. Bosch" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Brand Logo URL</label>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="https://example.com/logo.png" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
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
            {form.image && (
               <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-white/10">
                 <img src={form.image} className="w-16 h-8 object-contain" alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                 <span className="text-xs text-gray-500 truncate">{form.image}</span>
               </div>
            )}
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Saving…' : modal === 'add' ? 'Add Brand' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <ConfirmModal
          title="Delete Brand"
          confirmText="Delete Brand"
          message={`Are you sure you want to delete "${confirm.name}"? This will not delete the products associated with it, but they will become brand-less.`}
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
