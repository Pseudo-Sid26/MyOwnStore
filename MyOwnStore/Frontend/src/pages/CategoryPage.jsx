import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsAPI, categoriesAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Card, CardContent, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import { Star, Grid, List, Filter, ArrowRight, ShoppingCart, ArrowLeft, Search } from 'lucide-react'
import { formatPrice } from '../lib/utils'
import ProductAttributes from '../components/ui/ProductAttributes'
import { getCategoryFilters, getCategoryDisplayName } from '../lib/categoryUtils'

const CategoryPage = () => {
  const { categoryId } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState({
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: false,
    categoryFilters: {}
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { actions } = useApp()

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true)
        
        const [categoryResponse, productsResponse] = await Promise.all([
          categoriesAPI.getById(categoryId),
          productsAPI.getAll({ category: categoryId })
        ])
        
        setCategory(categoryResponse.data.data.category)
        setProducts(productsResponse.data.data.products || [])
      } catch (error) {
        console.error('Error fetching category data:', error)
        actions.setError('Failed to load category data')
      } finally {
        setIsLoading(false)
      }
    }

    if (categoryId) {
      fetchCategoryData()
    }
  }, [categoryId, actions])

  const filteredAndSortedProducts = products
    .filter(product => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Price filter
      if (filterBy.minPrice && product.price < parseFloat(filterBy.minPrice)) {
        return false
      }
      if (filterBy.maxPrice && product.price > parseFloat(filterBy.maxPrice)) {
        return false
      }

      // Rating filter
      if (filterBy.rating && product.rating < parseFloat(filterBy.rating)) {
        return false
      }

      // Stock filter
      if (filterBy.inStock && product.stock <= 0) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const addToCart = async (product) => {
    try {
      await actions.addToCart(product._id, 1)
      actions.setSuccess(`${product.name} added to cart!`)
    } catch (error) {
      actions.setError('Failed to add item to cart')
    }
  }

  const ProductCard = ({ product }) => (
    <Card className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={product.image || '/api/placeholder/300/200'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white animate-pulse">
              Low Stock
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              Out of Stock
            </Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          {product.attributes && (
            <ProductAttributes attributes={product.attributes} className="mb-3" />
          )}
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
              {formatPrice(product.price)}
            </span>
            {product.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">{product.rating}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          asChild
          variant="outline"
          className="flex-1 group-hover:border-blue-300 group-hover:text-blue-600 transition-all duration-300"
        >
          <Link to={`/products/${product._id}`}>
            View Details
          </Link>
        </Button>
        <Button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-slide-in-from-top">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 mb-6 text-sm">
              <Link to="/" className="hover:text-blue-200 transition-colors duration-300">
                Home
              </Link>
              <ArrowRight className="w-4 h-4" />
              <Link to="/products" className="hover:text-blue-200 transition-colors duration-300">
                Products
              </Link>
              <ArrowRight className="w-4 h-4" />
              <span className="text-blue-100">
                {category ? getCategoryDisplayName(category.name) : 'Category'}
              </span>
            </nav>

            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 animate-fade-in">
                  {category ? getCategoryDisplayName(category.name) : 'Category'}
                </h1>
                <p className="text-blue-100 text-lg animate-fade-in-delay-1">
                  {category?.description || `Discover amazing products in ${category ? getCategoryDisplayName(category.name) : 'this category'}`}
                </p>
                <p className="text-blue-200 mt-2 animate-fade-in-delay-2">
                  {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <Link
                to="/products"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 animate-bounce-in"
              >
                <ArrowLeft className="w-5 h-5 mr-2 inline" />
                Back to All Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="mb-8 animate-slide-in-from-bottom">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search in this category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                    showFilters
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 animate-slide-in-from-top">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={filterBy.minPrice}
                    onChange={(e) => setFilterBy(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    placeholder="$1000"
                    value={filterBy.maxPrice}
                    onChange={(e) => setFilterBy(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                  <select
                    value={filterBy.rating}
                    onChange={(e) => setFilterBy(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterBy.inStock}
                      onChange={(e) => setFilterBy(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all duration-300"
                    />
                    <span className="text-sm font-medium text-gray-700">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          } animate-fade-in`}>
            {filteredAndSortedProducts.map((product, index) => (
              <div
                key={product._id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No products match "${searchQuery}" in this category.`
                  : 'No products available in this category at the moment.'
                }
              </p>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
