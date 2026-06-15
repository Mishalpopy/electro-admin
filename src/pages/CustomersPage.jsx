import { useEffect, useState } from 'react'
import { getCustomers, deleteCustomer } from '../api/api'
import { ConfirmModal, Toast, Spinner } from '../components/UI'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setLoading(true)
    getCustomers()
      .then((res) => {
        setCustomers(res.data.data)
      })
      .catch((err) => {
        showToast(err.response?.data?.message || 'Failed to load customers', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    )
  })

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteCustomer(confirm.id)
      showToast('Customer deleted successfully!')
      load()
      setConfirm(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete customer', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Customers</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Manage your registered users ({customers.length} total)</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input 
            className="input h-11" 
            placeholder="Search by name, email or phone…" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-20 bg-surface/50 border-white/5 backdrop-blur-sm">
          <div className="w-20 h-20 bg-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No customers found</h3>
          <p className="text-gray-500 max-w-xs mx-auto text-sm">We couldn't find any customers matching your search criteria.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden bg-surface/50 border-white/5 backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-dark/50 border-b border-white/5">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-[2px]">Customer Details</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-[2px]">Contact Info</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-[2px]">Joined On</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-[2px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm border border-primary/10">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{customer.name}</div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">ID: #{customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(customer.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setConfirm({ id: customer.id, name: customer.name })} 
                        className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all inline-flex items-center justify-center"
                        title="Delete Customer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <ConfirmModal
          title="Delete Customer"
          confirmText="Remove Customer"
          message={`Are you sure you want to permanently remove "${confirm.name}"? This action will delete their account access and history.`}
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
