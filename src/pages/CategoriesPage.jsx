import { useEffect, useState } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory, uploadImage } from '../api/api'
import { Modal, ConfirmModal, Toast, Spinner } from '../components/UI'

const empty = { name: '', icon: '', type: '' }

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)       // 'add' | 'edit'
  const [confirm, setConfirm] = useState(null)   // { id, name }
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
      setForm({ ...form, icon: res.data.data.url })
      showToast('Icon uploaded successfully!')
    } catch (err) {
      showToast('Failed to upload icon', 'error')
    } finally {
      setUploading(false)
    }
  }

  const load = () => {
    setLoading(true)
    getCategories()
      .then((res) => setCategories(res.data.data))
      .catch(() => showToast('Failed to load categories', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setError(''); setModal('add') }
  const openEdit = (cat) => { setForm({ name: cat.name, icon: cat.icon, type: cat.type, id: cat.id }); setError(''); setModal('edit') }
  const closeModal = () => { setModal(null); setForm(empty) }

  const handleSave = async () => {
    setError('')
    if (!form.name || !form.icon || !form.type) { setError('All fields are required'); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        await createCategory({ name: form.name, icon: form.icon, type: form.type })
        showToast('Category created!')
      } else {
        await updateCategory(form.id, { name: form.name, icon: form.icon, type: form.type })
        showToast('Category updated!')
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
      await deleteCategory(confirm.id)
      showToast('Category deleted!')
      load(); setConfirm(null)
    } catch {
      showToast('Failed to delete category', 'error')
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
          <h1 className="text-xl sm:text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{categories.length} categories total</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-3 text-sm sm:text-base">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Cards Grid */}
      {categories.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📁</div>
          <p className="text-gray-400">No categories yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card hover:border-primary/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                  {cat.type === 'car' ? '🚗' : cat.type === 'bike' ? '🏍️' : cat.type === 'truck' ? '🚚' : '🔋'}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-dark text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirm({ id: cat.id, name: cat.name })}
                    className="p-1.5 rounded-lg hover:bg-dark text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <h3 className="text-white font-semibold text-base">{cat.name}</h3>
              <p className="text-gray-500 text-xs mt-1">{cat.icon}</p>
              <span className="mt-3 inline-block badge bg-primary/15 text-primary capitalize">{cat.type}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Category' : 'Edit Category'} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" placeholder="e.g. Car" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Category Icon</label>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="https://example.com/icon.png" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
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
            {form.icon && (
               <div className="flex items-center gap-3 p-3 bg-dark/30 rounded-xl border border-white/5">
                 <img src={form.icon} className="w-10 h-10 object-contain" alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                 <span className="text-xs text-gray-500 truncate">{form.icon}</span>
               </div>
            )}
            <div>
              <label className="label">Type (unique key)</label>
              <input className="input" placeholder="e.g. car" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={modal === 'edit'} />
              {modal === 'edit' && <p className="text-xs text-gray-500 mt-1">Type cannot be changed after creation.</p>}
            </div>
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
