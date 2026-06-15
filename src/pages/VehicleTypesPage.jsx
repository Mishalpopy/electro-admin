import { useEffect, useState } from 'react'
import { adminGetVehicleTypes, createVehicleType, updateVehicleType, deleteVehicleType } from '../api/api'
import { Modal, ConfirmModal, Toast, Spinner } from '../components/UI'

const empty = { id: '', name: '', status: 'active' }

export default function VehicleTypesPage() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)       // 'add' | 'edit'
  const [confirm, setConfirm] = useState(null)   // { id, name }
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setLoading(true)
    adminGetVehicleTypes()
      .then((res) => {
        setTypes(res.data.data)
      })
      .catch(() => showToast('Failed to load vehicle types', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setError(''); setModal('add') }
  const openEdit = (type) => { setForm({ id: type.id, name: type.name, status: type.status }); setError(''); setModal('edit') }
  const closeModal = () => { setModal(null); setForm(empty) }

  const handleSave = async () => {
    setError('')
    if (!form.id || !form.name) { setError('Both ID and name are required'); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        await createVehicleType(form)
        showToast('Vehicle type added successfully!')
      } else {
        await updateVehicleType(form.id, form)
        showToast('Vehicle type updated!')
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
      await deleteVehicleType(confirm.id)
      showToast('Vehicle type deleted!')
      load(); setConfirm(null)
    } catch {
      showToast('Failed to delete type', 'error')
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
          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">Vehicle Types</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{types.length} vehicle categories total</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-3 text-sm sm:text-base">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Category
        </button>
      </div>

      {/* List Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ID (Internal)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {types.map((type) => (
                <tr key={type._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">{type.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{type.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${type.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {type.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(type)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setConfirm({ id: type.id, name: type.name })} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors">
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
          {types.length === 0 && (
            <div className="text-center py-12">
               <p className="text-gray-500">No vehicle types found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Vehicle Category' : 'Edit Category'} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="label">Type ID (e.g. sedan, truck)</label>
              <input 
                className="input" 
                placeholder="sedan" 
                value={form.id} 
                onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase() })} 
                disabled={modal === 'edit'}
              />
              <p className="text-[10px] text-gray-500 mt-1">This ID is used for internal mapping and filtering.</p>
            </div>
            <div>
              <label className="label">Display Name</label>
              <input className="input" placeholder="Sedan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Saving…' : modal === 'add' ? 'Add Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <ConfirmModal
          title="Delete Category"
          confirmText="Delete Category"
          message={`Are you sure you want to delete "${confirm.name}"? This may affect vehicles using this category.`}
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
