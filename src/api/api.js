import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Switched to localhost for development
  headers: { 'Content-Type': 'application/json' },
})

// Token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Auth ──────────────────────────────────────────────────────────────
export const adminLoginUser = (data) => api.post('/auth/admin-login', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const registerUser = (data) => api.post('/auth/register', data)
export const getProfile = () => api.get('/auth/profile')

// ─── Home ──────────────────────────────────────────────────────────────
export const getHomeData = () => api.get('/home')

// ─── Categories (Legacy/Optional) ─────────────────────────────────────
export const getCategories = () => api.get('/categories')
export const createCategory = (data) => api.post('/categories', data)
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// ─── Brands ────────────────────────────────────────────────────────────
export const getBrands = () => api.get('/brands')
export const createBrand = (data) => api.post('/brands', data)
export const updateBrand = (id, data) => api.put(`/brands/${id}`, data)
export const deleteBrand = (id) => api.delete(`/brands/${id}`)
export const getBrandCapacities = (name) => api.get(`/brands/${name}/capacities`)

// ─── Banners ────────────────────────────────────────────────────────────
export const getBanners = () => api.get('/banners')
export const createBanner = (data) => api.post('/banners', data)
export const updateBanner = (id, data) => api.put(`/banners/${id}`, data)
export const deleteBanner = (id) => api.delete(`/banners/${id}`)

// ─── Products ──────────────────────────────────────────────────────────
export const getProducts = (params) => api.get('/products', { params })
export const createProduct = (data) => api.post('/products', data)
export const bulkUploadProducts = (formData) => api.post('/products/bulk', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// ─── Orders ───────────────────────────────────────────────────────────
export const getAdminOrders = () => api.get('/orders/admin/all')
export const updateOrderStatus = (id, status) => api.put(`/orders/admin/status/${id}`, { status })

// ─── Admin (Customers) ────────────────────────────────────────────────
export const getCustomers = () => api.get('/admin/customers')
export const deleteCustomer = (id) => api.delete(`/admin/customers/${id}`)

// ─── Vehicle Brands ──────────────────────────────────────────────────
export const getVehicleBrands = () => api.get('/vehicles/brands')
export const createVehicleBrand = (data) => api.post('/vehicles/brands', data)
export const updateVehicleBrand = (id, data) => api.put(`/vehicles/brands/${id}`, data)
export const deleteVehicleBrand = (id) => api.delete(`/vehicles/brands/${id}`)

// ─── Vehicle Models ──────────────────────────────────────────────────
export const getVehicleModels = (params) => api.get('/vehicles/models', { params })
export const getVehicleModelTypes = () => api.get('/vehicles/model-types')
export const createVehicleModel = (data) => api.post('/vehicles/models', data)
export const updateVehicleModel = (id, data) => api.put(`/vehicles/models/${id}`, data)
export const deleteVehicleModel = (id) => api.delete(`/vehicles/models/${id}`)

// ─── Vehicle Types ───────────────────────────────────────────────────
export const adminGetVehicleTypes = () => api.get('/vehicles/admin/types')
export const createVehicleType = (data) => api.post('/vehicles/types', data)
export const updateVehicleType = (id, data) => api.put(`/vehicles/types/${id}`, data)
export const deleteVehicleType = (id) => api.delete(`/vehicles/types/${id}`)

// ─── Vehicle Categories ───────────────────────────────────────────────
export const getVehicleCategories = (params) => api.get('/vehicles/categories', { params })
export const adminGetVehicleCategories = () => api.get('/vehicles/admin/categories')
export const createVehicleCategory = (data) => api.post('/vehicles/categories', data)
export const updateVehicleCategory = (id, data) => api.put(`/vehicles/categories/${id}`, data)
export const deleteVehicleCategory = (id) => api.delete(`/vehicles/categories/${id}`)

// ─── Upload ───────────────────────────────────────────────────────────
export const uploadImage = (formData) => api.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

export default api;
