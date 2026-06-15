import { useEffect, useState } from 'react'
import { getVehicleModels, createVehicleModel, updateVehicleModel, deleteVehicleModel, getVehicleBrands, getVehicleModelTypes, getVehicleCategories, uploadImage } from '../api/api'
import { Modal, ConfirmModal, Toast, Spinner } from '../components/UI'

const empty = { name: '', brand_id: '', type: '', category: '', image: '', status: 'active' }

export default function VehicleModelsPage() {
  const [models, setModels] = useState([])
  const [brands, setBrands] = useState([])
  const [types, setTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)       // 'add' | 'edit'
  const [confirm, setConfirm] = useState(null)   // { id, name }
  const [form, setForm] = useState(empty)
  const [isCustomType, setIsCustomType] = useState(false)
  const [isCustomCategory, setIsCustomCategory] = useState(false)
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
      const imageUrl = res.data.data.url
      setForm({ ...form, image: imageUrl })
      showToast('Model image uploaded successfully!')
    } catch (err) {
      showToast('Failed to upload image', 'error')
    } finally {
      setUploading(false)
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const [modelsRes, brandsRes, typesRes] = await Promise.all([
        getVehicleModels(),
        getVehicleBrands(),
        getVehicleModelTypes()
      ])
      setModels(modelsRes.data.data)
      setBrands(brandsRes.data.data)
      setTypes(typesRes.data.data)
    } catch (err) {
      showToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!form.type) {
      setCategories([])
      return
    }

    if (isCustomType) {
      setCategories([])
      return
    }

    getVehicleCategories({ vehicle_type: form.type })
      .then((res) => {
        const fetched = res.data.data || []
        setCategories(fetched)
        if (form.category && !fetched.some((c) => c.id === form.category)) {
          setIsCustomCategory(true)
        }
      })
      .catch(() => setCategories([]))
  }, [form.type, isCustomType])

  const openAdd = () => {
    setForm(empty)
    setIsCustomType(false)
    setIsCustomCategory(false)
    setError('')
    setModal('add')
  }
  const openEdit = (model) => { 
    const availableTypeIds = types.map(t => t.id)
    const currentCategory = model.category || ''
    const currentType = model.type || ''
    setForm({ 
        id: model.id, 
        name: model.name, 
        brand_id: model.brand_id, 
        type: currentType, 
        category: currentCategory,
        image: model.image, 
        status: model.status || 'active' 
    }); 
    setIsCustomType(!!currentType && !availableTypeIds.includes(currentType))
    setIsCustomCategory(false)
    setError(''); 
    setModal('edit') 
  }
  const closeModal = () => {
    setModal(null)
    setIsCustomType(false)
    setIsCustomCategory(false)
    setForm(empty)
  }

  const handleSave = async () => {
    setError('')
    if (!form.name || !form.brand_id || !form.type || !form.category) { 
        setError('All fields are required'); 
        return 
    }
    setSaving(true)
    try {
      if (modal === 'add') {
        await createVehicleModel(form)
        showToast('Vehicle model added successfully!')
      } else {
        await updateVehicleModel(form.id, form)
        showToast('Vehicle model updated!')
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
      await deleteVehicleModel(confirm.id)
      showToast('Model deleted!')
      load(); setConfirm(null)
    } catch {
      showToast('Failed to delete model', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const getBrandName = (id) => {
    const brand = brands.find(b => b.id === id)
    return brand ? brand.name : 'Unknown'
  }

  if (loading) return <Spinner />

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">Vehicle Models</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{models.length} vehicle models total</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-3 text-sm sm:text-base">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Model
        </button>
      </div>

      {/* Grid */}
      {models.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🚗</div>
          <p className="text-gray-400">No vehicle models yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {models.map((model) => (
            <div key={model.id} className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300 group relative min-h-[220px]">
              {/* Card Hover Actions Overlay (Full Card) */}
              <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                <button
                  onClick={() => openEdit(model)}
                  className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                  title="Edit Model"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setConfirm({ id: model.id, name: model.name })}
                  className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                  title="Delete Model"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Image Section */}
              <div className="aspect-video w-full bg-white/5 flex items-center justify-center p-6 relative">
                <img 
                  src={model.image} 
                  alt={model.name} 
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="text-6xl opacity-10">🚗</div>';
                  }}
                />
                
                <div className="absolute top-3 right-3 z-0 group-hover:opacity-0 transition-opacity">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${model.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {model.status}
                  </span>
                </div>
              </div>

              {/* Label Info */}
              <div className="p-5 flex flex-col flex-1 bg-surface-dark/50 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-primary uppercase font-black tracking-widest">{getBrandName(model.brand_id)}</span>
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] text-gray-400 border border-white/5 uppercase font-bold">{model.type}</span>
                    {model.category && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[9px] text-primary border border-primary/20 uppercase font-bold">{model.category}</span>
                    )}
                  </div>
                </div>
                <h3 className="text-white font-bold text-base truncate">{model.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Vehicle Model' : 'Edit Model'} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="label">1. Select Vehicle Type</label>
              <div className="flex flex-wrap gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                {types.map(t => (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="radio" 
                        name="type" 
                        value={t.id} 
                        checked={form.type === t.id} 
                        onChange={(e) => {
                            setIsCustomType(false)
                            setForm({ ...form, type: e.target.value, brand_id: '' }) // Reset brand when type changes
                        }}
                        className="w-4 h-4 accent-primary"
                    />
                    <span className={`text-sm ${form.type === t.id ? 'text-primary font-bold' : 'text-gray-400'} group-hover:text-primary transition-colors`}>{t.name}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    value="__custom__"
                    checked={isCustomType}
                    onChange={() => {
                      setIsCustomType(true)
                      setForm({ ...form, type: '', brand_id: '' })
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className={`text-sm ${isCustomType ? 'text-primary font-bold' : 'text-gray-400'} group-hover:text-primary transition-colors`}>Custom...</span>
                </label>
              </div>
            </div>
            {isCustomType && (
              <div>
                <label className="label">Custom Vehicle Type</label>
                <input
                  className="input"
                  placeholder="e.g. monster truck"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="label">
                2. Select Brand {form.type && `(${types.find(t => t.id === form.type)?.name || form.type})`}
              </label>
              <select 
                className={`input cursor-pointer ${!form.type ? 'opacity-50 pointer-events-none' : ''}`} 
                value={form.brand_id} 
                onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                disabled={!form.type}
              >
                <option value="">{form.type ? 'Choose Brand' : 'Select Type First'}</option>
                {brands
                  .filter(b => {
                    if (!form.type) return false
                    if (isCustomType) return true
                    return b.types && b.types.includes(form.type)
                  })
                  .map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))
                }
              </select>
              {form.type && !isCustomType && brands.filter(b => b.types && b.types.includes(form.type)).length === 0 && (
                <p className="text-[10px] text-red-400 mt-1">No brands found for this vehicle type. Add brands for this type first.</p>
              )}
            </div>

            <div>
              <label className="label">3. Model Name</label>
              <input className="input" placeholder="e.g. BMW M5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">4. Vehicle Category</label>
              <select
                className="input cursor-pointer"
                value={isCustomCategory ? '__custom__' : form.category}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomCategory(true)
                    setForm({ ...form, category: '' })
                    return
                  }
                  setIsCustomCategory(false)
                  setForm({ ...form, category: e.target.value })
                }}
              >
                <option value="">Choose Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
                <option value="__custom__">Custom...</option>
              </select>
            </div>
            {isCustomCategory && (
              <div>
                <label className="label">Custom Category Name</label>
                <input
                  className="input"
                  placeholder="e.g. crossover"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="label">Model Image URL (Optional)</label>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="https://example.com/ix.png" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
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
              <div className="p-3 bg-dark rounded-xl border border-white/10 flex flex-col items-center gap-2">
                <img 
                  src={form.image} 
                  className="w-full h-32 object-contain rounded-lg" 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="h-32 flex items-center justify-center text-gray-500 text-sm italic">Invalid Image URL</div>';
                  }} 
                />
                <button 
                  type="button" 
                  onClick={() => setForm({ ...form, image: '' })}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider transition-colors"
                >
                  Remove Image
                </button>
              </div>
            )}
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Saving…' : modal === 'add' ? 'Add Model' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <ConfirmModal
          title="Delete Model"
          confirmText="Delete Model"
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
