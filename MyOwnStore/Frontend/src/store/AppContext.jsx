import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getStorageItem, setStorageItem, removeStorageItem } from '../lib/utils'

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

  // Action creators
  const actions = {
    // Login action - sets both user and token
    login: (user, token) => {
      console.log('AppContext login called with:', { user, token })

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

    addToCart: (product, quantity = 1) => {
      console.log('Adding to cart:', {
        productId: product._id,
        name: product.name || product.title,
        price: product.price,
        quantity
      })
      
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
    },

    updateCartItem: (productId, quantity) => {
      if (quantity <= 0) {
        dispatch({
          type: actionTypes.REMOVE_FROM_CART,
          payload: productId,
        })
      } else {
        dispatch({
          type: actionTypes.UPDATE_CART_ITEM,
          payload: { productId, quantity },
        })
      }
    },

    removeFromCart: (productId) => {
      dispatch({
        type: actionTypes.REMOVE_FROM_CART,
        payload: productId,
      })
    },

    clearCart: () => {
      dispatch({ type: actionTypes.CLEAR_CART })
    },

    setCart: (cart) => {
      dispatch({
        type: actionTypes.SET_CART,
        payload: cart,
      })
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