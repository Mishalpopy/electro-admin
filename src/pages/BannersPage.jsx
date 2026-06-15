import { useEffect, useState } from 'react'
import { getBanners, createBanner, updateBanner, deleteBanner, uploadImage } from '../api/api'
import { Modal, ConfirmModal, Toast, Spinner } from '../components/UI'

const empty = { title: '', subtitle: '', image: '', link: '', isActive: true }

export default function BannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)       // 'add' | 'edit'
  const [confirm, setConfirm] = useState(null)   // { id, title }
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')

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
      showToast('Banner image uploaded successfully!')
    } catch (err) {
      showToast('Failed to upload image', 'error')
    } finally {
      setUploading(false)
    }
  }

  const load = () => {
    setLoading(true)
    getBanners()
      .then((res) => {
        setBanners(res.data.data)
      })
      .catch(() => showToast('Failed to load banners', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setError(''); setModal('add') }
  const openEdit = (banner) => { 
    setForm({ 
      id: banner.id, 
      title: banner.title, 
      subtitle: banner.subtitle, 
      image: banner.image, 
      link: banner.link || '', 
      isActive: banner.isActive 
    }); 
    setError(''); 
    setModal('edit') 
  }
  const closeModal = () => { setModal(null); setForm(empty) }

  const handleSave = async () => {
    setError('')
    if (!form.title || !form.subtitle || !form.image) { 
      setError('Title, subtitle and image are required'); 
      return 
    }
    setSaving(true)
    try {
      if (modal === 'add') {
        await createBanner(form)
        showToast('Banner added successfully!')
      } else {
        await updateBanner(form.id, form)
        showToast('Banner updated!')
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
      await deleteBanner(confirm.id)
      showToast('Banner deleted!')
      load(); setConfirm(null)
    } catch {
      showToast('Failed to delete banner', 'error')
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
          <h1 className="text-xl sm:text-2xl font-bold text-white">Home Banners</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{banners.length} banners total</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-3 text-sm sm:text-base">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Banner
        </button>
      </div>

      {/* Grid */}
      {banners.length === 0 ? (
        <div className="card text-center py-16 text-white">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-gray-400 font-medium">No banners yet. Boost your shop's appearance!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="card group overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300">
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-dark">
                <img 
                  src={banner.image} 
                  alt={banner.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent"></div>
                
                {/* Banner Content Preview */}
                <div className="absolute bottom-4 left-4 right-4">
                   <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{banner.subtitle}</p>
                   <h3 className="text-white text-lg font-bold leading-tight">{banner.title}</h3>
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-primary transition-colors border border-white/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirm({ id: banner.id, title: banner.title })}
                    className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-colors border border-white/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${banner.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                   <p className="text-xs text-gray-500">Redirect Link:</p>
                   <p className="text-xs text-primary truncate max-w-[200px]">{banner.link || 'None'}</p>
                </div>
                <div className="text-[10px] text-gray-600">ID: #{banner.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Create Banner' : 'Edit Banner'} onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Main Title</label>
                <input 
                  className="input" 
                  placeholder="e.g. Premium Battery Solutions" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                />
              </div>
              <div>
                <label className="label">Subtitle / Badge</label>
                <input 
                  className="input" 
                  placeholder="e.g. ULTIMATE POWER" 
                  value={form.subtitle} 
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="label">Redirect Link (Optional)</label>
              <input 
                className="input" 
                placeholder="e.g. /product/123 or https://..." 
                value={form.link} 
                onChange={(e) => setForm({ ...form, link: e.target.value })} 
              />
            </div>

            <div>
              <label className="label">Background Image URL</label>
              <div className="flex gap-2">
                <input 
                  className="input flex-1" 
                  placeholder="https://example.com/banner.jpg" 
                  value={form.image} 
                  onChange={(e) => setForm({ ...form, image: e.target.value })} 
                />
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
               <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-dark group border border-white/10">
                 <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white">Preview</div>
               </div>
            )}

            <div className="flex items-center gap-2 py-2">
               <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={form.isActive} 
                  onChange={(e) => setForm({...form, isActive: e.target.checked})}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                />
               <label htmlFor="isActive" className="text-sm text-gray-300">Set as Active</label>
            </div>
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={saving || uploading} 
                className="btn-primary flex-1 justify-center"
              >
                {saving ? 'Saving…' : modal === 'add' ? 'Create Banner' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <ConfirmModal
          title="Delete Banner"
          confirmText="Delete"
          message={`Are you sure you want to delete "${confirm.title}"?`}
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
