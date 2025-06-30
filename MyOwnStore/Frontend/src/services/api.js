import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Request interceptor - Token:', token ? 'Present' : 'Missing')

    if (token) {
      // Remove quotes if token is stored with quotes
      const cleanToken = token.replace(/^"(.*)"$/, '$1')
      config.headers.Authorization = `Bearer ${cleanToken}`
      console.log('Added Authorization header:', config.headers.Authorization)
    } else {
      console.warn('No token found in localStorage')
    }

    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    })

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)


// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      const errorCode = response.data?.code;

      // Handle different types of auth errors
      switch (errorCode) {
        case 'TOKEN_EXPIRED':
          console.error('Token expired, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;

        case 'INVALID_TOKEN':
        case 'USER_NOT_FOUND':
          console.error('Invalid authentication, clearing session');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;

        case 'NO_TOKEN':
          console.error('No token provided');
          break;

        default:
          console.error('Authentication error:', response.data?.message);
      }
    }

    return Promise.reject(error);
  }
);

// Add getProfile method
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};



// Products API
export const productsAPI = {
  // Get all products with optional filters
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    // Add supported parameters
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.category) queryParams.append('category', params.category)
    if (params.brand) queryParams.append('brand', params.brand)
    if (params.minPrice) queryParams.append('minPrice', params.minPrice)
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice)
    if (params.search) queryParams.append('search', params.search)
    if (params.inStock) queryParams.append('inStock', params.inStock)
    if (params.featured) {
      // For featured products, we can sort by rating or use specific logic
      queryParams.append('sort', '-rating')
      queryParams.append('inStock', 'true')
    }
    
    const queryString = queryParams.toString()
    const url = queryString ? `/products?${queryString}` : '/products'
    
    return api.get(url)
  },
  
  // Get single product by ID
  getById: (id) => api.get(`/products/${id}`),
  
  // Get products by category
  getByCategory: (categoryId, params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.sort) queryParams.append('sort', params.sort)
    
    const queryString = queryParams.toString()
    const url = queryString ? `/products/category/${categoryId}?${queryString}` : `/products/category/${categoryId}`
    
    return api.get(url)
  },
  
  // ✅ Add dedicated search method
  search: (params = {}) => {
    const queryParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value)
      }
    })
    
    return api.get(`/products/search?${queryParams.toString()}`)
  },
  
  // Get search suggestions
  getSearchSuggestions: (query) => api.get(`/products/search/suggestions?q=${encodeURIComponent(query)}`),
  
  // Get product recommendations
  getRecommendations: (productId, limit = 5) => {
    return api.get(`/products/${productId}/recommendations?limit=${limit}`)
      .catch(error => {
        // Return empty recommendations if endpoint fails
        console.warn('Recommendations endpoint failed:', error.message)
        return { 
          data: { 
            success: true,
            data: { 
              products: [],
              similar: [],
              alternatives: [],
              betterDeals: []
            } 
          } 
        }
      })
  },
  
  // Admin functions
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock })
}

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    
    const queryString = queryParams.toString()
    const url = queryString ? `/categories?${queryString}` : '/categories'
    
    return api.get(url)
  },
  
  // Get single category by ID
  getById: (id) => api.get(`/categories/${id}`),
  
  // Get category by slug
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  
  // Admin functions
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`)
}

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (productId, quantity, size) => {
    const data = { productId, quantity }
    if (size) data.size = size
    return api.post('/cart/add', data)
  },
  updateItem: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  removeItem: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
  applyCoupon: (couponCode) => api.post('/cart/coupon', { couponCode }),
  removeCoupon: () => api.delete('/cart/coupon'),
}

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  getStatistics: () => api.get('/orders/statistics'),
  track: (trackingNumber) => api.get(`/orders/track/${trackingNumber}`),
}

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (reviewData) => api.post('/reviews', reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  toggleHelpful: (id) => api.post(`/reviews/${id}/helpful`),
}

// Coupons API
export const couponsAPI = {
  validate: (code, total) => api.post('/coupons/validate', { code, total }),
}


// Guest API
export const guestAPI = {
  createOrder: (orderData) => api.post('/guest/order', orderData),
  trackOrder: (trackingNumber, email) => api.get(`/guest/order/track`, {
    params: { trackingNumber, email }
  }),
}

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist/add', { productId }),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
  clear: () => api.delete('/wishlist/clear'),
}

export default api
