import { useEffect, useState } from 'react'
import { getAdminOrders, updateOrderStatus } from '../api/api'
import { Modal, Toast, Spinner } from '../components/UI'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setLoading(true)
    getAdminOrders()
      .then((res) => setOrders(res.data.data))
      .catch(() => showToast('Failed to load orders', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = orders.filter((o) => {
    const matchSearch = String(o.id).includes(search) || 
                       o.user?.name.toLowerCase().includes(search.toLowerCase()) ||
                       o.user?.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      showToast('Status updated successfully!')
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
    } catch {
      showToast('Failed to update status', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/10 text-amber-500'
      case 'Processing': return 'bg-blue-500/10 text-blue-500'
      case 'Shipped': return 'bg-purple-500/10 text-purple-500'
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-500'
      case 'Cancelled': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{orders.length} orders total</p>
        </div>
        <button onClick={load} className="btn-ghost py-2 px-3 text-sm">
          <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input pl-9" placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-full sm:w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark">
                <tr>
                  <th className="table-th">Order ID</th>
                  <th className="table-th text-center">Status</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Items</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th text-right px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-colors">
                    <td className="table-td font-mono text-primary font-bold">#{order.id}</td>
                    <td className="table-td text-center">
                      <select 
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ring-1 ring-inset border-none focus:ring-1 outline-none transition-all cursor-pointer ${getStatusColor(order.status)}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updating === order._id}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="table-td">
                      <div className="max-w-[120px] sm:max-w-none">
                        <div className="text-white font-medium truncate">{order.user?.name || 'Unknown'}</div>
                        <div className="text-gray-500 text-[10px] truncate">{order.user?.email}</div>
                      </div>
                    </td>
                    <td className="table-td text-gray-400 text-xs">
                      {order.totalItems}
                    </td>
                    <td className="table-td font-bold text-white text-xs">AED {order.totalPrice.toLocaleString()}</td>
                    <td className="table-td text-right px-6">
                      <button 
                        onClick={() => setModal(order)}
                        className="p-1.5 rounded-lg hover:bg-surface text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

      {/* Detail Modal */}
      {modal && (
        <Modal title={`Order Details - #${modal.id}`} onClose={() => setModal(null)} maxWidth="max-w-3xl">
          <div className="space-y-6">
            {/* Customer & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Customer Info</h3>
                <div className="bg-dark/50 p-4 rounded-xl space-y-2 border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-white font-medium">{modal.user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-white font-medium truncate ml-4">{modal.user?.email}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Shipping Address</h3>
                <div className="bg-dark/50 p-4 rounded-xl border border-white/5">
                  {modal.address ? (
                    <div className="text-xs text-white space-y-1">
                      <p className="font-bold text-primary">{modal.address.full_name}</p>
                      <p className="text-gray-300">{modal.address.address_line_1}</p>
                      <p className="text-gray-400">{modal.address.city}, {modal.address.pincode}</p>
                      <p className="pt-2 text-[10px] text-gray-500">Phone: {modal.address.phone_number}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-xs text-center">Not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Order Items</h3>
              <div className="space-y-2">
                {modal.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-dark/30 p-3 rounded-xl border border-white/5">
                    <img 
                      src={item.product?.image} 
                      className="w-12 h-12 rounded-lg object-contain bg-white/5 p-1"
                      alt=""
                      onError={(e) => (e.target.src = 'https://placehold.co/48x48/2A2A3C/6C5CE7?text=B')}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.product?.name || 'deleted product'}</p>
                      <p className="text-xs text-gray-500">{item.product?.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">AED {item.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Order Summary</h3>
              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">AED {modal.itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery Fee</span>
                  <span className="text-white">AED {modal.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/5 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-bold">Total Amount</span>
                  <span className="text-xl font-black text-primary">AED {modal.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setModal(null)}
                className="btn-primary"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
