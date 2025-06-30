import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state, actions } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    actions.logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const cartItemCount = state.cart?.reduce((total, item) => total + item.quantity, 0) || 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-xl text-gray-900">MyOwnStore</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
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
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
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