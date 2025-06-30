import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List, Star, ShoppingCart, Heart } from 'lucide-react'
import { productsAPI, categoriesAPI, cartAPI } from '../services/api'
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
  const [isSearching, setIsSearching] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('') // Separate input state
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
    if (query) {
      setSearchQuery(query)
      setSearchInput(query)
    }
    if (category) setSelectedCategory(category)
  }, [searchParams])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput)
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [searchInput, searchQuery])

  // Update URL when search query or category changes (but not on every keystroke)
  useEffect(() => {
    const params = {}
    if (searchQuery) params.q = searchQuery
    if (selectedCategory) params.category = selectedCategory
    
    // Only update URL if there's an actual change
    const currentParams = Object.fromEntries(searchParams.entries())
    const hasChanged = JSON.stringify(params) !== JSON.stringify(currentParams)
    
    if (hasChanged) {
      setSearchParams(params)
    }
  }, [searchQuery, selectedCategory, setSearchParams, searchParams])

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Set appropriate loading state
        if (!products.length) {
          setIsLoading(true)
        } else {
          setIsSearching(true)
        }
        
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

        // Only fetch categories on initial load
        const promises = [productsAPI.getAll(productParams)]
        if (!categories.length) {
          promises.push(categoriesAPI.getAll())
        }

        const responses = await Promise.all(promises)
        const productsResponse = responses[0]
        const categoriesResponse = responses[1]
        
        console.log('Products Response:', productsResponse.data) // Debug log
        if (categoriesResponse) {
          console.log('Categories Response:', categoriesResponse.data) // Debug log
        }
        
        // ✅ Fix: Access correct data structure
        const productsData = productsResponse.data?.data?.products || []
        
        setProducts(productsData)
        setPagination(productsResponse.data?.data?.pagination || null)
        
        // Only update categories if we fetched them
        if (categoriesResponse) {
          const categoriesData = categoriesResponse.data?.data?.categories || []
          setCategories(categoriesData)
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
        actions.setError('Failed to load products')
        setProducts([])
      } finally {
        setIsLoading(false)
        setIsSearching(false)
      }
    }

    // Add a small delay to prevent rapid API calls
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [actions, searchQuery, selectedCategory, sortBy, categories.length, products.length])

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
    // Immediately update search query when form is submitted
    setSearchQuery(searchInput)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSortBy('title')
    setSearchParams({})
  }

  const handleAddToCart = async (product) => {
    if (product.stock > 0) {
      try {
        // Use the correct structure that the action expects
        const productData = {
          _id: product._id,
          name: product.title, // Map title to name
          price: product.discountedPrice || product.price,
          images: product.images,
          stock: product.stock
        }
        
        actions.addToCart(productData, 1)
        
        // If user is logged in, sync with backend
        if (state.user) {
          await cartAPI.addItem(product._id, 1)
        }
        
        actions.setSuccess(`${product.title} added to cart!`)
      } catch (error) {
        console.error('Error adding to cart:', error)
        actions.setError('Failed to add item to cart')
      }
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
              placeholder="Search products... (Press Enter or wait 500ms)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
          {searchInput !== searchQuery && searchInput && (
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to search immediately or wait for auto-search...
            </p>
          )}
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
              {isSearching ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Searching...
                </span>
              ) : (
                <>
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  {searchQuery && (
                    <span className="ml-2 text-primary-600">
                      for "{searchQuery}"
                    </span>
                  )}
                </>
              )}
              {pagination && !isSearching && (
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
          {isSearching ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-500">Searching products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {searchQuery || selectedCategory 
                  ? `No products found ${searchQuery ? `for "${searchQuery}"` : ''} ${selectedCategory ? 'in this category' : ''}`
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
              {filteredProducts.map((product) => (                <ProductCard
                  key={product._id}
                  product={product}
                  viewMode={viewMode}
                  onAddToCart={() => handleAddToCart(product)}
                  actions={actions}
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
const ProductCard = ({ product, viewMode, onAddToCart, actions }) => {
  // Calculate display price
  const displayPrice = product.discountedPrice || product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price

  const handleWishlistToggle = () => {
    const wasAdded = actions.toggleWishlist(product)
    if (wasAdded) {
      actions.setSuccess(`${product.title} added to wishlist!`)
    } else {
      actions.setSuccess(`${product.title} removed from wishlist!`)
    }
  }

  const isInWishlist = actions.isInWishlist(product._id)

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
          <div className="ml-4 flex flex-col justify-center space-y-2">
            <Button 
              onClick={onAddToCart}
              disabled={!product.isAvailable || product.stock === 0}
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleWishlistToggle}
              className={isInWishlist ? "text-red-600 hover:text-red-700" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
              {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
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
        {/* Wishlist button overlay */}
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-2 right-2 bg-white/80 hover:bg-white shadow-sm ${
            isInWishlist ? 'text-red-600 hover:text-red-700' : ''
          }`}
          onClick={handleWishlistToggle}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </Button>
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
      <CardFooter className="p-4 pt-0 flex space-x-2">
        <Button 
          className="flex-1" 
          onClick={onAddToCart}
          disabled={!product.isAvailable || product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleWishlistToggle}
          className={isInWishlist ? "text-red-600 hover:text-red-700" : ""}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductsPage