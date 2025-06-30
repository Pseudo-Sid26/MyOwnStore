import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { productsAPI } from '../../services/api'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)
  
  const { state, actions } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    actions.logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  // Handle search suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      try {
        setIsSearchLoading(true)
        const response = await productsAPI.getSearchSuggestions(searchQuery)
        
        // Parse the response and flatten suggestions
        const suggestionData = response.data?.data?.suggestions || {}
        const allSuggestions = []
        
        // Add product suggestions
        if (suggestionData.products) {
          allSuggestions.push(...suggestionData.products.map(item => ({
            type: 'product',
            value: item.value,
            id: item.id
          })))
        }
        
        // Add brand suggestions  
        if (suggestionData.brands) {
          allSuggestions.push(...suggestionData.brands.map(item => ({
            type: 'brand',
            value: item.value
          })))
        }
        
        // Add category suggestions
        if (suggestionData.categories) {
          allSuggestions.push(...suggestionData.categories.map(item => ({
            type: 'category',
            value: item.value,
            slug: item.slug,
            id: item.id
          })))
        }
        
        // Add tag suggestions
        if (suggestionData.tags) {
          allSuggestions.push(...suggestionData.tags.map(item => ({
            type: 'tag',
            value: item.value
          })))
        }
        
        setSuggestions(allSuggestions)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsSearchLoading(false)
      }
    }

    const debounceTimer = setTimeout(getSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setShowSuggestions(false)
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.value)
    setShowSuggestions(false)
    
    // Navigate based on suggestion type
    if (suggestion.type === 'category' && suggestion.slug) {
      navigate(`/categories/${suggestion.slug}`)
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion.value)}`)
    }
  }

  const handleMobileSearch = (e) => {
    e.preventDefault()
    const mobileQuery = e.target.elements.mobileSearch.value.trim()
    if (!mobileQuery) return

    setIsMenuOpen(false)
    navigate(`/search?q=${encodeURIComponent(mobileQuery)}`)
  }

  const cartItemCount = state.cart?.reduce((total, item) => total + item.quantity, 0) || 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center mr-12">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-2xl text-gray-900">MyOwnStore</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Products
            </Link>
            <Link 
              to="/categories" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Categories
            </Link>
            <Link 
              to="/deals" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Deals
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              
              {/* Clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSuggestions([])
                  }}
                  className="absolute right-12 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {/* Search button */}
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1 h-8 px-3"
                disabled={!searchQuery.trim()}
              >
                Go
              </Button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (searchQuery.length > 0 || suggestions.length > 0) && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto"
              >
                {isSearchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500 mx-auto"></div>
                    <span className="mt-2 text-sm">Searching...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Suggestions
                    </div>
                    {suggestions.slice(0, 8).map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                      >
                        <div className="flex items-center mr-3 flex-shrink-0">
                          {suggestion.type === 'product' && <Search className="h-4 w-4 text-blue-500" />}
                          {suggestion.type === 'brand' && <span className="text-xs bg-gray-200 px-1 rounded">Brand</span>}
                          {suggestion.type === 'category' && <span className="text-xs bg-green-200 px-1 rounded">Category</span>}
                          {suggestion.type === 'tag' && <span className="text-xs bg-purple-200 px-1 rounded">Tag</span>}
                        </div>
                        <span className="truncate">{suggestion.value}</span>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length > 1 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Search className="h-5 w-5 mx-auto mb-2 text-gray-300" />
                    <span className="text-sm">No suggestions found</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <Heart className="h-6 w-6" />
              {state.wishlist?.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {state.wishlist.length}
                </Badge>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Link>

            {/* User Menu */}
            {state.user ? (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{state.user.name}</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <form onSubmit={handleMobileSearch}>
                  <div className="relative">
                    <input
                      name="mobileSearch"
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Button
                      type="submit"
                      size="sm"
                      className="absolute right-1 top-1 h-8 px-2"
                    >
                      Go
                    </Button>
                  </div>
                </form>
              </div>

              {/* Mobile Navigation Links */}
              <Link
                to="/products"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/deals"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Deals
              </Link>

              {/* Mobile Wishlist */}
              <Link
                to="/wishlist"
                className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="h-5 w-5 mr-2" />
                Wishlist
                {state.wishlist?.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {state.wishlist.length}
                  </Badge>
                )}
              </Link>

              {/* Mobile Cart */}
              <Link
                to="/cart"
                className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {cartItemCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>

              {/* Mobile User Menu */}
              {state.user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    {state.user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:text-red-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header