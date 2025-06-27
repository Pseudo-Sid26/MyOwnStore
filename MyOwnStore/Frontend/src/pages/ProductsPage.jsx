import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List, Star, ShoppingCart } from 'lucide-react'
import { productsAPI, categoriesAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardFooter } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import { formatPrice } from '../lib/utils'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [searchParams, setSearchParams] = useSearchParams()
  const [pagination, setPagination] = useState(null)
  const { actions } = useApp()

  // Get initial search query from URL
  useEffect(() => {
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    if (query) setSearchQuery(query)
    if (category) setSelectedCategory(category)
  }, [searchParams])

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Build API parameters
        const productParams = {
          limit: 50, // Get more products for client-side filtering
          sort: sortBy
        }
        
        // Add search if exists
        if (searchQuery) {
          productParams.search = searchQuery
        }
        
        // Add category filter if exists
        if (selectedCategory) {
          productParams.category = selectedCategory
        }

        const [productsResponse, categoriesResponse] = await Promise.all([
          productsAPI.getAll(productParams),
          categoriesAPI.getAll()
        ])
        
        console.log('Products Response:', productsResponse.data) // Debug log
        console.log('Categories Response:', categoriesResponse.data) // Debug log
        
        // ✅ Fix: Access correct data structure
        const productsData = productsResponse.data?.data?.products || []
        const categoriesData = categoriesResponse.data?.data?.categories || []
        
        setProducts(productsData)
        setCategories(categoriesData)
        setPagination(productsResponse.data?.data?.pagination || null)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        actions.setError('Failed to load products')
        setProducts([])
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [actions, searchQuery, selectedCategory, sortBy])

  // Filter and sort products (client-side for additional filtering)
  useEffect(() => {
    let filtered = [...products]

    // Price range filter (client-side)
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max))
    }

    setFilteredProducts(filtered)
  }, [products, priceRange])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (searchQuery) params.q = searchQuery
    if (selectedCategory) params.category = selectedCategory
    setSearchParams(params)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    const params = {}
    if (searchQuery) params.q = searchQuery
    if (categoryId) params.category = categoryId
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSortBy('title')
    setSearchParams({})
  }

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      actions.addToCart({
        id: product._id,
        title: product.title,
        price: product.discountedPrice || product.price,
        image: product.images?.[0],
        quantity: 1
      })
      actions.setSuccess(`${product.title} added to cart!`)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="xl" />
          <span className="ml-3 text-gray-600">Loading products...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="mr-2"
                    />
                    All Categories
                  </label>
                  {categories.map((category) => (
                    <label key={category._id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={selectedCategory === category._id}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {category.name} ({category.productCount || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Products Section */}
        <main className="lg:w-3/4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="text-sm text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              {pagination && (
                <span className="ml-2 text-gray-400">
                  (Page {pagination.currentPage} of {pagination.totalPages})
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="title">Sort by Name</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Highest Rated</option>
                <option value="-createdAt">Newest First</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {searchQuery || selectedCategory 
                  ? 'No products found matching your criteria' 
                  : 'No products available'
                }
              </p>
              {(searchQuery || selectedCategory) && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  viewMode={viewMode}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ✅ Fixed Product Card Component
const ProductCard = ({ product, viewMode, onAddToCart }) => {
  // Calculate display price
  const displayPrice = product.discountedPrice || product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price

  if (viewMode === 'list') {
    return (
      <Card className="flex flex-row overflow-hidden hover:shadow-lg transition-shadow">
        <div className="w-48 h-32 flex-shrink-0">
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg'
            }}
          />
        </div>
        <div className="flex-1 p-4 flex justify-between">
          <div className="flex-1">
            <Link to={`/products/${product._id}`} className="group">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-2">
                {product.title}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600 ml-1">
                  {product.rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-sm text-gray-400">
                ({product.numReviews || 0} reviews)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {product.isAvailable ? (
                <Badge variant="secondary">In Stock ({product.stock})</Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
          </div>
          <div className="ml-4 flex flex-col justify-center">
            <Button 
              onClick={onAddToCart}
              disabled={!product.isAvailable || product.stock === 0}
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden rounded-t-lg relative">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg'
            }}
          />
        </Link>
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-red-500">
            -{product.discount?.percentage}%
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <Link to={`/products/${product._id}`} className="group">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 truncate">
              {product.title}
            </h3>
          </Link>
          
          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-gray-500">{product.brand}</p>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 ml-1">
                {product.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <span className="text-sm text-gray-400">
              ({product.numReviews || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {product.isAvailable ? (
              <Badge variant="secondary" className="text-xs">
                In Stock
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={onAddToCart}
          disabled={!product.isAvailable || product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductsPage