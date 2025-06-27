import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getStorageItem, setStorageItem, removeStorageItem } from '../lib/utils'

// Initial state
const initialState = {
  user: getStorageItem('user'),
  token: getStorageItem('token'),
  cart: getStorageItem('cart', []),
  isLoading: false,
  error: null,
  theme: getStorageItem('theme', 'light'),
}

// Action types
export const actionTypes = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  SET_CART: 'SET_CART',
  TOGGLE_THEME: 'TOGGLE_THEME',
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
      }

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        cart: [],
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
      }

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case actionTypes.ADD_TO_CART:
      const existingItemIndex = state.cart.findIndex(
        item => item.productId === action.payload.productId
      )
      
      if (existingItemIndex >= 0) {
        const updatedCart = [...state.cart]
        updatedCart[existingItemIndex].quantity += action.payload.quantity
        return {
          ...state,
          cart: updatedCart,
        }
      } else {
        return {
          ...state,
          cart: [...state.cart, action.payload],
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
    } else {
      removeStorageItem('user')
      removeStorageItem('token')
    }
  }, [state.user, state.token])

  useEffect(() => {
    setStorageItem('cart', state.cart)
  }, [state.cart])

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
    setUser: (user, token) => {
      dispatch({
        type: actionTypes.SET_USER,
        payload: { user, token },
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
    },

    clearError: () => {
      dispatch({ type: actionTypes.CLEAR_ERROR })
    },

    addToCart: (product, quantity = 1) => {
      dispatch({
        type: actionTypes.ADD_TO_CART,
        payload: {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          quantity,
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

    toggleTheme: () => {
      dispatch({ type: actionTypes.TOGGLE_THEME })
    },
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

export default AppContext
