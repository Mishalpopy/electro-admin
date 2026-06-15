import { useEffect, useState } from 'react'
import {
  adminGetVehicleCategories,
  createVehicleCategory,
  updateVehicleCategory,
  deleteVehicleCategory,
  adminGetVehicleTypes,
} from '../api/api'
import { Modal, ConfirmModal, Toast, Spinner } from '../components/UI'

const empty = { id: '', name: '', vehicle_type: '', status: 'active' }

export default function VehicleCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [categoriesRes, typesRes] = await Promise.all([
        adminGetVehicleCategories(),
        adminGetVehicleTypes(),
      ])
      setCategories(categoriesRes.data.data || [])
      setTypes(typesRes.data.data || [])
    } catch {
      showToast('Failed to load vehicle categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setError(''); setModal('add') }
  const openEdit = (category) => {
    setForm({
      id: category.id,
      name: category.name,
      vehicle_type: category.vehicle_type,
      status: category.status || 'active',
    })
    setError('')
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setForm(empty) }

  const handleSave = async () => {
    setError('')
    if (!form.name || !form.vehicle_type) {
      setError('Name and vehicle type are required')
      return
    }
    const payload = {
      ...form,
      id: (form.id || form.name).toLowerCase().trim().replace(/\s+/g, '-'),
    }
    setSaving(true)
    try {
      if (modal === 'add') {
        await createVehicleCategory(payload)
        showToast('Vehicle category added successfully!')
      } else {
        await updateVehicleCategory(form.id, payload)
        showToast('Vehicle category updated!')
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
      await deleteVehicleCategory(confirm.id)
      showToast('Vehicle category deleted!')
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">Vehicle Categories</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{categories.length} categories total</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-3 text-sm sm:text-base">
          Add New Category
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vehicle Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{category.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{category.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-gray-300 uppercase">{category.vehicle_type}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${category.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(category)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">Edit</button>
                      <button onClick={() => setConfirm({ id: category.id, name: category.name })} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div className="text-center py-12 text-gray-500">No vehicle categories found.</div>}
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Vehicle Category' : 'Edit Vehicle Category'} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="label">Category ID (auto)</label>
              <input
                className="input"
                placeholder="e.g. sedan"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().trim().replace(/\s+/g, '-') })}
                disabled={modal === 'edit'}
              />
            </div>
            <div>
              <label className="label">Category Name</label>
              <input className="input" placeholder="Sedan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Vehicle Type</label>
              <select className="input" value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
                <option value="">Choose Type</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
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

      {confirm && (
        <ConfirmModal
          title="Delete Category"
          confirmText="Delete Category"
          message={`Are you sure you want to delete "${confirm.name}"?`}
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
