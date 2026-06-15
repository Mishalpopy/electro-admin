import { useEffect, useState } from 'react'
import { getHomeData } from '../api/api'
import { StatCard, Spinner } from '../components/UI'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHomeData()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const totalProducts = data?.sections?.reduce((acc, s) => acc + s.items.length, 0) ?? 0

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <StatCard
          label="Total Revenue"
          value={`AED ${(data?.total_revenue || 0).toLocaleString()}`}
          color="bg-emerald-500"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={data?.total_orders || 0}
          color="bg-primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatCard
          label="Pending Orders"
          value={data?.pending_orders || 0}
          color="bg-amber-500"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Customers"
          value={data?.total_customers || 0}
          color="bg-blue-500"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="Products"
          value={totalProducts}
          color="bg-purple-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      {/* Category Overview */}
      <div className="card">
        <h2 className="text-base font-semibold text-white mb-4">Category Overview</h2>
        <div className="space-y-3">
          {data?.sections?.map((section) => (
            <div key={section.type} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300 font-medium">{section.title}</span>
                  <span className="text-sm text-gray-400">{section.items.length} items</span>
                </div>
                <div className="h-2 bg-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(section.items.length / Math.max(totalProducts, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {!data?.sections?.length && (
            <p className="text-gray-500 text-sm">No data yet. Add some categories and products.</p>
          )}
        </div>
      </div>

      {/* Recent Products */}
      {data?.sections?.flatMap((s) => s.items).length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">Recent Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Product</th>
                  <th className="table-th">Brand</th>
                  <th className="table-th">Type</th>
                  <th className="table-th text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {data.sections.flatMap((s) => s.items).slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-dark/40 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          onError={(e) => (e.target.src = 'https://placehold.co/40x40/2A2A3C/6C5CE7?text=B')}
                          className="w-9 h-9 rounded-lg object-cover bg-dark"
                          alt={item.name}
                        />
                        <span className="font-medium text-white truncate max-w-[180px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-gray-400">{item.brand}</td>
                    <td className="table-td">
                      <span className="badge bg-primary/20 text-primary capitalize">{item.type}</span>
                    </td>
                    <td className="table-td text-right font-semibold text-white">AED {item.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
