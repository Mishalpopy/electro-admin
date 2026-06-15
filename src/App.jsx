import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import BrandsPage from './pages/BrandsPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import CustomersPage from './pages/CustomersPage'
import PopularSearchesPage from './pages/PopularSearchesPage'
import BannersPage from './pages/BannersPage'
import VehicleModelsPage from './pages/VehicleModelsPage'
import VehicleBrandsPage from './pages/VehicleBrandsPage'
import VehicleTypesPage from './pages/VehicleTypesPage'
import VehicleCategoriesPage from './pages/VehicleCategoriesPage'
import Sidebar from './components/Sidebar'






function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onLogout={onLogout} closeSidebar={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-border bg-surface flex items-center px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">Electro</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-none flex flex-col">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/popular-searches" element={<PopularSearchesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/banners" element={<BannersPage />} />
            <Route path="/vehicle-brands" element={<VehicleBrandsPage />} />
            <Route path="/vehicle-types" element={<VehicleTypesPage />} />
            <Route path="/vehicle-categories" element={<VehicleCategoriesPage />} />
            <Route path="/vehicle-models" element={<VehicleModelsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))

  return (
    <BrowserRouter>
      {isLoggedIn ? (
        <AdminLayout onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <Routes>
          <Route path="*" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}
