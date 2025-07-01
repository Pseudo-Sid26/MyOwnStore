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

  // Debounced search effect with scroll animation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchQuery && searchInput.trim()) {
        setSearchQuery(searchInput)
        
        // Auto-scroll to results with subtle animation for debounced search
        setTimeout(() => {
          scrollToProducts('subtle')
        }, 100)
      } else if (searchInput !== searchQuery) {
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

  // Helper function for smooth scroll animations
  const scrollToProducts = (intensity = 'normal') => {
    const productsSection = document.getElementById('products-section')
    if (productsSection) {
      const yOffset = -80
      const y = productsSection.getBoundingClientRect().top + window.pageYOffset + yOffset
      
      // Different animation intensities
      const animations = {
        subtle: { scale: 0.99, duration: 200 },
        normal: { scale: 0.98, duration: 300 },
        strong: { scale: 0.96, duration: 400 }
      }
      
      const { scale, duration } = animations[intensity] || animations.normal
      
      productsSection.style.transform = `scale(${scale})`
      productsSection.style.transition = `transform ${duration}ms ease-in-out`
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      })
      
      setTimeout(() => {
        productsSection.style.transform = 'scale(1)'
        setTimeout(() => {
          productsSection.style.transition = ''
        }, duration)
      }, duration + 100)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Immediately update search query when form is submitted
    setSearchQuery(searchInput)
    
    // Add visual feedback to search input
    const searchInputElement = e.target.querySelector('input')
    if (searchInputElement) {
      searchInputElement.style.transform = 'scale(0.98)'
      searchInputElement.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.3)'
      setTimeout(() => {
        searchInputElement.style.transform = 'scale(1)'
        searchInputElement.style.boxShadow = ''
      }, 200)
    }
    
    // Enhanced smooth scroll with strong animation for manual search
    setTimeout(() => {
      scrollToProducts('strong')
    }, 250)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    
    // Scroll to products when category changes
    setTimeout(() => {
      scrollToProducts('normal')
    }, 150)
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
        
        // AppContext now handles backend sync automatically
        await actions.addToCart(productData, 1)
        
        actions.setSuccess(`${product.title} added to cart!`)
      } catch (error) {
        console.error('Error adding to cart:', error)
        actions.setError('Failed to add item to cart')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-emerald-50">
        <div className="text-center">
          <div className="relative">
            <LoadingSpinner size="xl" />
            <div className="absolute inset-0 animate-ping">
              <div className="w-16 h-16 border-4 border-blue-500 rounded-full opacity-20"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 animate-pulse font-medium">Loading amazing products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-emerald-50">
      {/* Enhanced Hero Header Section - Distinct from CategoriesPage */}
      <section className="relative py-16 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white overflow-hidden">
        {/* Background decorations with different pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-8 right-16 w-40 h-40 bg-white/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-32 left-24 w-28 h-28 bg-white/6 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-16 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-ping"></div>
          <div className="absolute bottom-24 left-16 w-36 h-36 bg-white/4 rounded-full blur-3xl"></div>
        </div>

        {/* Geometric patterns - hexagons instead of circles */}
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="product-hex-pattern" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
                <polygon points="12.5,2 22,7.5 22,17.5 12.5,23 3,17.5 3,7.5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.4"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#product-hex-pattern)"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 animate-fade-in-up">
            {/* Left side - Text content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <Badge className="mb-6 bg-gradient-to-r from-orange-400 to-pink-500 text-white border-0 px-6 py-2 text-sm font-semibold inline-flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Shop Now
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Find Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  Perfect Product
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Browse through thousands of quality products. From electronics to fashion, we have everything you need.
              </p>
            </div>

            {/* Right side - Search and stats */}
            <div className="lg:w-1/2 w-full max-w-lg">
              {/* Enhanced search bar */}
              <form onSubmit={handleSearch} className="relative mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={`w-full pl-12 pr-6 py-4 text-lg text-gray-900 bg-white/95 backdrop-blur-sm border-2 rounded-2xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-300 focus:bg-white transition-all duration-300 placeholder-gray-500 shadow-lg transform hover:scale-105 focus:scale-105 ${
                      searchInput ? 'border-orange-300 shadow-xl animate-pulse' : 'border-white/30'
                    } ${isSearching ? 'animate-bounce' : ''}`}
                  />
                  <Search className="absolute left-4 top-4 h-6 w-6 text-gray-500" />
                  {isSearching && (
                    <div className="absolute right-4 top-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                {searchInput !== searchQuery && searchInput && (
                  <div className="text-xs text-white/80 mt-2 flex items-center justify-center">
                    <div className="animate-pulse flex items-center">
                      <div className="w-2 h-2 bg-white/60 rounded-full mr-2 animate-bounce"></div>
                      <span>Press Enter to search immediately or wait for auto-search...</span>
                      <div className="w-2 h-2 bg-white/60 rounded-full ml-2 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    </div>
                  </div>
                )}
              </form>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-orange-200">{filteredProducts.length}</div>
                  <div className="text-sm opacity-80">Products</div>
                </div>
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-orange-200">{categories.length}</div>
                  <div className="text-sm opacity-80">Categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar */}
          <aside className="lg:w-1/4">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center">
                    <Filter className="mr-3 h-5 w-5" />
                    Filters
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:bg-white/20">
                    Clear All
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-8">
                {/* Category Filter */}
                <div>
                  <h4 className="font-black text-gray-900 mb-4 text-lg flex items-center">
                    <span className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-3 animate-pulse"></span>
                    Categories
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={selectedCategory === ''}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="mr-3 text-emerald-500"
                      />
                      <span className="font-semibold text-gray-900">All Categories</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category._id} className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category._id}
                          checked={selectedCategory === category._id}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="mr-3 text-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700 flex-1">
                          {category.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {category.productCount || 0}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h4 className="font-black text-gray-900 mb-4 text-lg flex items-center">
                    <span className="w-3 h-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mr-3 animate-pulse"></span>
                    Price Range
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Min Price</label>
                        <Input
                          type="number"
                          placeholder="$0"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl border-2 border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Max Price</label>
                        <Input
                          type="number"
                          placeholder="$999"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl border-2 border-gray-200"
                        />
                      </div>
                    </div>
                    {(priceRange.min || priceRange.max) && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 p-4 rounded-xl">
                        <span className="text-sm font-bold text-emerald-700">Active filter:</span>{' '}
                        <span className="font-bold text-emerald-800">
                          {priceRange.min && `$${priceRange.min}`}
                          {priceRange.min && priceRange.max && ' - '}
                          {priceRange.max && `$${priceRange.max}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Enhanced Products Section */}
          <main id="products-section" className="lg:w-3/4">
            {/* Enhanced Toolbar */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 mb-8 overflow-hidden">
              {/* Background decorations */}
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-cyan-100 to-emerald-100 rounded-full blur-2xl opacity-50"></div>
              </div>
              
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-6">
                    <div className="text-base text-gray-700">
                      {isSearching ? (
                        <span className="flex items-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          <span className="font-bold text-emerald-600">Searching...</span>
                        </span>
                      ) : (
                        <>
                          <span className="font-black text-gray-900 text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {filteredProducts.length}
                          </span>
                          <span className="ml-2 text-lg font-semibold">
                            product{filteredProducts.length !== 1 ? 's' : ''} found
                          </span>
                        </>
                      )}
                      {pagination && !isSearching && (
                        <div className="hidden sm:block text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full font-medium mt-2">
                          Page {pagination.currentPage} of {pagination.totalPages}
                        </div>
                      )}
                    </div>
                  </div>
                  {(searchQuery || selectedCategory) && (
                    <div className="mt-3 flex items-center space-x-3">
                      <span className="text-sm text-gray-600 font-semibold">Active filters:</span>
                      {searchQuery && (
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Search: {searchQuery}
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Category: {categories.find(cat => cat._id === selectedCategory)?.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Sort Dropdown */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700 font-semibold whitespace-nowrap">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                    >
                      <option value="title">Name A-Z</option>
                      <option value="price">Price: Low to High</option>
                      <option value="-price">Price: High to Low</option>
                      <option value="-rating">Highest Rated</option>
                      <option value="-createdAt">Newest First</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`rounded-lg transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-white shadow-md text-emerald-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid className="h-5 w-5" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`rounded-lg transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-white shadow-md text-emerald-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Products Grid/List */}
            <div className="transition-all duration-500 ease-in-out">
              {isSearching ? (
                <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 animate-pulse transform transition-all duration-500 scale-100">
                  <div className="relative">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-20 animate-ping"></div>
                  </div>
                  <p className="text-emerald-600 text-lg font-semibold">Searching products...</p>
                  <p className="text-gray-500 text-sm mt-2">Finding the best matches for you</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 animate-fade-in-up transform transition-all duration-500 scale-100">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">No Products Found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    {searchQuery || selectedCategory 
                      ? `We couldn't find any products ${searchQuery ? `for "${searchQuery}"` : ''} ${selectedCategory ? 'in this category' : ''}`
                      : 'No products available'
                    }
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <Button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className={`transform transition-all duration-500 scale-100 ${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center'
                    : 'space-y-6 flex flex-col items-center'
                }`}>
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="opacity-0 animate-fade-in-up hover-lift transform transition-all duration-300"
                      style={{
                        animationDelay: `${Math.min(index * 100, 800)}ms`,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <ProductCard
                        product={product}
                        viewMode={viewMode}
                        onAddToCart={() => handleAddToCart(product)}
                        actions={actions}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
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
    <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-0 bg-gradient-to-br from-white via-gray-50 to-slate-50 hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 overflow-hidden relative">
      {/* Enhanced background decorations */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 group-hover:scale-125 transition-all duration-700 opacity-20 group-hover:opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-all duration-500 opacity-15 group-hover:opacity-30"></div>
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
      
      <div className="aspect-square overflow-hidden rounded-t-lg relative">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg'
            }}
          />
        </Link>
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1 rounded-full shadow-lg">
            -{product.discount?.percentage}%
          </Badge>
        )}
        {/* Enhanced Wishlist button overlay */}
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm border-2 transition-all duration-300 hover:scale-110 ${
            isInWishlist ? 'text-red-600 hover:text-red-700 border-red-200' : 'border-gray-200'
          }`}
          onClick={handleWishlistToggle}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </Button>
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="space-y-4">
          <Link to={`/products/${product._id}`} className="group/link">
            <h3 className="font-bold text-gray-900 group-hover/link:text-blue-600 transition-colors duration-300 text-lg leading-tight line-clamp-2">
              {product.title}
            </h3>
          </Link>
          
          {/* Brand */}
          {product.brand && (
            <p className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">{product.brand}</p>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 ml-1 font-medium">
                {product.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <span className="text-sm text-gray-400">
              ({product.numReviews || 0} reviews)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {product.isAvailable ? (
              <Badge variant="secondary" className="text-xs font-bold bg-green-100 text-green-700">
                In Stock
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs font-bold">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex space-x-3 relative z-10">
        <Button 
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
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
          className={`shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
            isInWishlist ? "text-red-600 hover:text-red-700 border-red-200" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductsPage