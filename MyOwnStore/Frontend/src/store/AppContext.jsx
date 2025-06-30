import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getStorageItem, setStorageItem, removeStorageItem } from '../lib/utils'
import { cartAPI, wishlistAPI } from '../services/api'

// Initial state
const initialState = {
  user: getStorageItem('user'),
  token: getStorageItem('token'),
  isAuthenticated: !!(getStorageItem('user') && getStorageItem('token')),
  cart: getStorageItem('cart', []),
  wishlist: getStorageItem('wishlist', []),
  isLoading: false,
  error: null,
  success: null,
  theme: getStorageItem('theme', 'light'),
}

// Action types
export const actionTypes = {
  SET_USER: 'SET_USER',
  UPDATE_USER: 'UPDATE_USER', // Add this for profile updates
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  SET_CART: 'SET_CART',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  SET_WISHLIST: 'SET_WISHLIST',
  TOGGLE_THEME: 'TOGGLE_THEME',
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USER:
      const { user, token } = action.payload
      return {
        ...state,
        user: user,
        token: token || state.token,
        isAuthenticated: !!(user && (token || state.token)),
        error: null,
      }

    case actionTypes.UPDATE_USER:
      // Update user data without affecting authentication
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        // Keep existing token and authentication status
      }

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        cart: [],
        wishlist: [],
        error: null,
        success: null,
      }

    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        success: null,
      }

    case actionTypes.SET_SUCCESS:
      return {
        ...state,
        success: action.payload,
        error: null,
      }

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case actionTypes.CLEAR_MESSAGES:
      return {
        ...state,
        error: null,
        success: null,
      }

    case actionTypes.ADD_TO_CART:
      console.log('ADD_TO_CART reducer called with:', action.payload)
      console.log('Current cart:', state.cart)
      
      const existingItemIndex = state.cart.findIndex(
        item => item.productId === action.payload.productId
      )
      
      console.log('Existing item index:', existingItemIndex)

      if (existingItemIndex >= 0) {
        console.log('Updating existing item quantity')
        const updatedCart = [...state.cart]
        updatedCart[existingItemIndex].quantity += action.payload.quantity
        console.log('Updated cart:', updatedCart)
        return {
          ...state,
          cart: updatedCart,
        }
      } else {
        console.log('Adding new item to cart')
        const newCart = [...state.cart, action.payload]
        console.log('New cart:', newCart)
        return {
          ...state,
          cart: newCart,
        }
      }

    case actionTypes.UPDATE_CART_ITEM:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      }

    case actionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.productId !== action.payload),
      }

    case actionTypes.CLEAR_CART:
      return {
        ...state,
        cart: [],
      }

    case actionTypes.SET_CART:
      return {
        ...state,
        cart: action.payload,
      }

    case actionTypes.ADD_TO_WISHLIST:
      const isAlreadyInWishlist = state.wishlist.some(
        item => item.productId === action.payload.productId
      )
      
      if (isAlreadyInWishlist) {
        return state // Don't add if already in wishlist
      }

      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      }

    case actionTypes.REMOVE_FROM_WISHLIST:
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.productId !== action.payload),
      }

    case actionTypes.CLEAR_WISHLIST:
      return {
        ...state,
        wishlist: [],
      }

    case actionTypes.SET_WISHLIST:
      return {
        ...state,
        wishlist: action.payload,
      }

    case actionTypes.TOGGLE_THEME:
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      return {
        ...state,
        theme: newTheme,
      }

    default:
      return state
  }
}

// Create context
const AppContext = createContext()

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Persist state changes to localStorage
  useEffect(() => {
    if (state.user && state.token) {
      setStorageItem('user', state.user)
      setStorageItem('token', state.token)
    } else if (!state.isAuthenticated) {
      removeStorageItem('user')
      removeStorageItem('token')
    }
  }, [state.user, state.token, state.isAuthenticated])

  useEffect(() => {
    setStorageItem('cart', state.cart)
  }, [state.cart])

  useEffect(() => {
    setStorageItem('wishlist', state.wishlist)
  }, [state.wishlist])

  useEffect(() => {
    setStorageItem('theme', state.theme)
    // Apply theme to document
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.theme])

  // Cart synchronization function
  const syncCartWithBackend = async (token) => {
    try {
      console.log('🔄 Syncing cart with backend...')
      console.log('   Token:', token ? 'Present' : 'Missing')
      
      // Set the token temporarily for the API call
      const originalToken = localStorage.getItem('token')
      localStorage.setItem('token', token)
      
      // Fetch user's cart from backend
      console.log('📡 Fetching cart from backend...')
      const response = await cartAPI.get()
      console.log('📦 Backend response:', response.data)
      
      const backendCart = response.data?.data?.cart?.items || []
      
      console.log('📦 Backend cart items:', backendCart.length)
      
      // Get current local cart
      const localCart = getStorageItem('cart', [])
      console.log('🏠 Local cart items:', localCart.length)
      
      // Convert backend cart to frontend format
      const formattedBackendCart = backendCart.map(item => ({
        productId: item.productId._id,
        name: item.productId.title,
        price: item.price,
        image: item.productId.images?.[0] || '',
        quantity: item.quantity,
        stock: item.productId.stock,
        selectedSize: item.size,
        selectedColor: item.color
      }))
      
      console.log('🔄 Formatted backend cart:', formattedBackendCart.length, 'items')
      
      // Merge carts: prioritize backend cart, but add any local items not in backend
      const mergedCart = [...formattedBackendCart]
      
      for (const localItem of localCart) {
        const existsInBackend = formattedBackendCart.find(
          backendItem => backendItem.productId === localItem.productId
        )
        
        if (!existsInBackend) {
          // Add local item to backend
          try {
            const quantityToSync = Math.min(localItem.quantity, 10)
            console.log(`📤 Adding local item to backend: ${localItem.name}`)
            await cartAPI.addItem(localItem.productId, quantityToSync)
            
            mergedCart.push({
              ...localItem,
              quantity: quantityToSync
            })
            
            console.log(`➕ Added local item to backend: ${localItem.name}`)
          } catch (error) {
            console.error('❌ Error syncing local cart item to backend:', error)
          }
        }
      }
      
      console.log('🔗 Final merged cart:', mergedCart.length, 'items')
      
      // Update the cart in state
      dispatch({
        type: actionTypes.SET_CART,
        payload: mergedCart
      })
      
      // Restore original token if it was different
      if (originalToken !== token) {
        localStorage.setItem('token', originalToken)
      }
      
      console.log('✅ Cart synchronized successfully:', mergedCart.length, 'items')
      
    } catch (error) {
      console.error('❌ Error syncing cart with backend:', error)
      console.error('   Error details:', error.response?.data)
      // If sync fails, keep local cart as fallback
    }
  }

  // Wishlist synchronization function  
  const syncWishlistWithBackend = async (token) => {
    try {
      console.log('🔄 Syncing wishlist with backend...')
      
      // Set the token temporarily for the API call
      const originalToken = localStorage.getItem('token')
      localStorage.setItem('token', token)
      
      // Fetch user's wishlist from backend
      const response = await wishlistAPI.get()
      const backendWishlist = response.data?.wishlist || []
      
      // Update the wishlist in state
      dispatch({
        type: actionTypes.SET_WISHLIST,
        payload: backendWishlist
      })
      
      // Restore original token if it was different
      if (originalToken !== token) {
        localStorage.setItem('token', originalToken)
      }
      
      console.log('✅ Wishlist synchronized successfully:', backendWishlist.length, 'items')
      
    } catch (error) {
      console.error('❌ Error syncing wishlist with backend:', error)
      // If sync fails, keep local wishlist as fallback
    }
  }

  // Sync with backend on app initialization for authenticated users
  useEffect(() => {
    const initializeUserData = async () => {
      if (state.isAuthenticated && state.token && state.user) {
        try {
          console.log('🚀 App load: Initializing user data sync...')
          console.log('   User:', state.user.name || state.user.email)
          console.log('   Token:', state.token ? 'Present' : 'Missing')
          
          await syncCartWithBackend(state.token)
          await syncWishlistWithBackend(state.token)
          
          console.log('✅ App load: User data sync completed')
        } catch (error) {
          console.error('❌ App load: Error syncing user data:', error)
        }
      } else {
        console.log('ℹ️  App load: User not authenticated, skipping sync')
      }
    }

    // Only run when authentication state becomes true (avoid infinite loops)
    if (state.isAuthenticated) {
      initializeUserData()
    }
  }, [state.isAuthenticated])

  // Action creators
  const actions = {
    // Login action - sets both user and token
    login: async (user, token) => {
      console.log('🔐 AppContext login called with:', { user, token })

      // Store in localStorage immediately
      if (token) {
        localStorage.setItem('token', token)
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      dispatch({
        type: actionTypes.SET_USER,
        payload: { user, token },
      })
      
      // Sync cart and wishlist with backend after login
      if (token) {
        try {
          console.log('🔄 Syncing user data after login...')
          await syncCartWithBackend(token)
          await syncWishlistWithBackend(token)
          console.log('✅ User data sync completed')
        } catch (error) {
          console.error('❌ Error syncing data after login:', error)
        }
      }
    },

    // Set user - can be used for login or user updates
    setUser: (user, token = null) => {
      dispatch({
        type: actionTypes.SET_USER,
        payload: { user, token },
      })
    },

    // Update user - for profile updates without affecting authentication
    updateUser: (userData) => {
      dispatch({
        type: actionTypes.UPDATE_USER,
        payload: userData,
      })
    },

    logout: () => {
      dispatch({ type: actionTypes.LOGOUT })
    },

    setLoading: (loading) => {
      dispatch({
        type: actionTypes.SET_LOADING,
        payload: loading,
      })
    },

    setError: (error) => {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: error,
      })
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        dispatch({ type: actionTypes.CLEAR_ERROR })
      }, 5000)
    },

    setSuccess: (message) => {
      dispatch({
        type: actionTypes.SET_SUCCESS,
        payload: message,
      })
      // Auto-clear success after 3 seconds
      setTimeout(() => {
        dispatch({ type: actionTypes.CLEAR_MESSAGES })
      }, 3000)
    },

    clearError: () => {
      dispatch({ type: actionTypes.CLEAR_ERROR })
    },

    clearMessages: () => {
      dispatch({ type: actionTypes.CLEAR_MESSAGES })
    },

    addToCart: async (product, quantity = 1) => {
      console.log('Adding to cart:', {
        productId: product._id,
        name: product.name || product.title,
        price: product.price,
        quantity,
        isAuthenticated: state.isAuthenticated
      })
      
      // Update local state first
      dispatch({
        type: actionTypes.ADD_TO_CART,
        payload: {
          productId: product._id,
          name: product.name || product.title, // Handle both name and title
          price: product.price,
          image: product.images?.[0] || '',
          quantity,
          stock: product.stock,
          selectedSize: product.selectedSize,
          selectedColor: product.selectedColor,
        },
      })
      
      // Sync with backend if user is logged in
      if (state.isAuthenticated && state.token) {
        try {
          const cartData = {
            productId: product._id,
            quantity,
            ...(product.selectedSize && { size: product.selectedSize })
          }
          
          console.log('Syncing cart item to backend:', cartData)
          await cartAPI.addItem(cartData.productId, cartData.quantity, cartData.size)
          console.log('✅ Cart item synced to backend successfully')
        } catch (error) {
          console.error('❌ Error syncing cart item to backend:', error)
          
          // Handle specific quantity validation errors
          if (error.response?.data?.message?.includes('Maximum quantity')) {
            dispatch({
              type: actionTypes.SET_ERROR,
              payload: error.response.data.message
            })
            
            // Optionally revert the local state change
            // For now, we'll keep the local change but show the error
          } else {
            dispatch({
              type: actionTypes.SET_ERROR,
              payload: 'Failed to sync cart with server. Item added locally.'
            })
          }
        }
      }
    },

    updateCartItem: async (productId, quantity) => {
      if (quantity <= 0) {
        dispatch({
          type: actionTypes.REMOVE_FROM_CART,
          payload: productId,
        })
        
        // Sync removal with backend
        if (state.isAuthenticated && state.token) {
          try {
            await cartAPI.removeItem(productId)
            console.log('✅ Cart item removed from backend')
          } catch (error) {
            console.error('❌ Error removing cart item from backend:', error)
          }
        }
      } else {
        dispatch({
          type: actionTypes.UPDATE_CART_ITEM,
          payload: { productId, quantity },
        })
        
        // Sync update with backend
        if (state.isAuthenticated && state.token) {
          try {
            await cartAPI.updateItem(productId, quantity)
            console.log('✅ Cart item quantity updated in backend')
          } catch (error) {
            console.error('❌ Error updating cart item in backend:', error)
            
            // Handle specific quantity validation errors
            if (error.response?.data?.message?.includes('Maximum quantity')) {
              dispatch({
                type: actionTypes.SET_ERROR,
                payload: error.response.data.message
              })
            }
          }
        }
      }
    },

    removeFromCart: async (productId) => {
      dispatch({
        type: actionTypes.REMOVE_FROM_CART,
        payload: productId,
      })
      
      // Sync removal with backend
      if (state.isAuthenticated && state.token) {
        try {
          await cartAPI.removeItem(productId)
          console.log('✅ Cart item removed from backend')
        } catch (error) {
          console.error('❌ Error removing cart item from backend:', error)
        }
      }
    },

    clearCart: async () => {
      // Clear local cart immediately
      dispatch({ type: actionTypes.CLEAR_CART })
      
      // Sync clear with backend
      if (state.isAuthenticated && state.token) {
        try {
          await cartAPI.clear()
          console.log('✅ Cart cleared in backend')
          
          // Extra verification: load cart from backend to confirm it's empty
          setTimeout(async () => {
            try {
              const response = await cartAPI.get()
              const backendCart = response.data?.data?.cart?.items || []
              if (backendCart.length > 0) {
                console.log('⚠️ Backend cart not empty after clear, force clearing...')
                dispatch({ type: actionTypes.CLEAR_CART })
              }
            } catch (error) {
              console.error('❌ Error verifying cart clear:', error)
            }
          }, 500)
          
        } catch (error) {
          console.error('❌ Error clearing cart in backend:', error)
        }
      }
    },

    loadCart: async () => {
      if (state.isAuthenticated && state.token) {
        try {
          console.log('📦 Loading cart from backend...')
          const response = await cartAPI.get()
          const backendCart = response.data?.data?.cart?.items || []
          
          // Convert backend cart to frontend format
          const formattedCart = backendCart.map(item => ({
            productId: item.productId._id,
            name: item.productId.title,
            price: item.price,
            image: item.productId.images?.[0] || '',
            quantity: item.quantity,
            stock: item.productId.stock,
            selectedSize: item.size,
            selectedColor: item.color
          }))
          
          dispatch({
            type: actionTypes.SET_CART,
            payload: formattedCart
          })
          
          console.log('✅ Cart loaded from backend:', formattedCart.length, 'items')
          return formattedCart
        } catch (error) {
          console.error('❌ Error loading cart from backend:', error)
          throw error
        }
      } else {
        console.log('ℹ️ User not authenticated, using local cart')
        return state.cart
      }
    },

    // Wishlist actions
    addToWishlist: (product) => {
      dispatch({
        type: actionTypes.ADD_TO_WISHLIST,
        payload: {
          productId: product._id,
          name: product.name || product.title,
          price: product.price,
          image: product.images?.[0] || '',
          dateAdded: new Date().toISOString(),
        },
      })
    },

    removeFromWishlist: (productId) => {
      dispatch({
        type: actionTypes.REMOVE_FROM_WISHLIST,
        payload: productId,
      })
    },

    toggleWishlist: (product) => {
      const isInWishlist = state.wishlist.some(item => item.productId === product._id)
      if (isInWishlist) {
        dispatch({
          type: actionTypes.REMOVE_FROM_WISHLIST,
          payload: product._id,
        })
        return false // Removed from wishlist
      } else {
        dispatch({
          type: actionTypes.ADD_TO_WISHLIST,
          payload: {
            productId: product._id,
            name: product.name || product.title,
            price: product.price,
            image: product.images?.[0] || '',
            dateAdded: new Date().toISOString(),
          },
        })
        return true // Added to wishlist
      }
    },

    clearWishlist: () => {
      dispatch({ type: actionTypes.CLEAR_WISHLIST })
    },

    setWishlist: (wishlist) => {
      dispatch({
        type: actionTypes.SET_WISHLIST,
        payload: wishlist,
      })
    },

    // Helper to check if product is in wishlist
    isInWishlist: (productId) => {
      return state.wishlist.some(item => item.productId === productId)
    },

    toggleTheme: () => {
      dispatch({ type: actionTypes.TOGGLE_THEME })
    },

    // Helper method to check if user is authenticated
    isUserAuthenticated: () => {
      return state.isAuthenticated && state.user && state.token
    },

    // Helper method to get user role
    getUserRole: () => {
      return state.user?.role || 'guest'
    },

    // Helper method to get user permissions
    hasPermission: (permission) => {
      const role = state.user?.role
      const permissions = {
        admin: ['read', 'write', 'delete', 'manage'],
        user: ['read', 'write'],
        guest: ['read']
      }
      return permissions[role]?.includes(permission) || false
    }
  }

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth(Component, requiredRole = 'user') {
  return function AuthenticatedComponent(props) {
    const { state, actions } = useApp()

    useEffect(() => {
      if (!state.isAuthenticated) {
        actions.setError('Please log in to access this page')
        // Redirect to login - you might want to use React Router here
      } else if (requiredRole === 'admin' && state.user?.role !== 'admin') {
        actions.setError('Admin access required')
      }
    }, [state.isAuthenticated, state.user?.role, actions])

    if (!state.isAuthenticated) {
      return <div>Please log in...</div>
    }

    if (requiredRole === 'admin' && state.user?.role !== 'admin') {
      return <div>Access denied</div>
    }

    return <Component {...props} />
  }
}

export default AppContext