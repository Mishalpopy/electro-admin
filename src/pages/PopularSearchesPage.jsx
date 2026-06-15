import { useEffect, useState } from 'react'
import api from '../api/api'
import { Modal, ConfirmModal, Toast, Spinner } from '../components/UI'

export default function PopularSearchesPage() {
  const [searches, setSearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState({ term: '', order: 0 })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setLoading(true)
    api.get('/admin/popular-searches')
      .then(res => setSearches(res.data.data))
      .catch(() => showToast('Failed to load search terms', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.term) return
    setSaving(true)
    try {
      await api.post('/admin/popular-searches', form)
      showToast('Search term added!')
      setModal(false)
      setForm({ term: '', order: 0 })
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/popular-searches/${confirm.id}`)
      showToast('Search term removed!')
      setConfirm(null)
      load()
    } catch {
      showToast('Failed to delete', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Popular Searches</h1>
          <p className="text-gray-400 text-sm mt-1">Manage trending tags shown on the search screen</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Term
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {searches.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <p className="text-gray-500 italic">No custom search terms added. The app is currently showing terms derived from product brands.</p>
          </div>
        ) : (
          searches.map((s) => (
            <div key={s._id} className="card p-4 flex items-center justify-between group hover:border-primary/30 transition-colors">
              <div>
                <div className="text-white font-medium">{s.term}</div>
                <div className="text-xs text-gray-500 mt-1">Order: {s.order}</div>
              </div>
              <button 
                onClick={() => setConfirm({ id: s._id, name: s.term })}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {modal && (
        <Modal title="Add Popular Search" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Search Term</label>
              <input 
                className="input" 
                placeholder="e.g. Lithium Ion" 
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Display Order (Optional)</label>
              <input 
                className="input" 
                type="number"
                placeholder="0" 
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Adding...' : 'Add Term'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmModal
          title="Delete Search Term"
          message={`Are you sure you want to remove "${confirm.name}"?`}
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
