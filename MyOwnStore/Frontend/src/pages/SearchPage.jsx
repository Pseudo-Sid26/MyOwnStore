import React, { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Heart,
  ShoppingCart,
  X,
  TrendingUp
} from 'lucide-react'
import { productsAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardFooter } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/Loading'
import { formatPrice } from '../lib/utils'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const { actions } = useApp()

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'relevance',
    inStock: searchParams.get('inStock') === 'true'
  })

  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches')
    return saved ? JSON.parse(saved) : []
  })

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'name', label: 'Name A-Z' },
    { value: '-name', label: 'Name Z-A' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-rating', label: 'Highest Rated' },
    { value: '-createdAt', label: 'Newest First' }
  ]

  const popularSearches = ['iPhone', 'Laptop', 'Headphones', 'Shoes', 'Watch', 'Camera']

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query)
      addToRecentSearches(query)
    }
  }, [searchParams])

  const performSearch = async (query = searchQuery) => {
    if (!query.trim()) return

    try {
      setIsLoading(true)
      
      const queryParams = {
        q: query,
        page: searchParams.get('page') || 1,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '' && value !== false)
        )
      }

      const response = await productsAPI.search(queryParams)
      
      // Handle the backend response format
      if (response.data.success) {
        const { products, pagination } = response.data.data
        setProducts(products || [])
        setTotalProducts(pagination?.totalProducts || 0)
        setTotalPages(pagination?.totalPages || 1)
        setCurrentPage(pagination?.currentPage || 1)
      } else {
        throw new Error(response.data.message || 'Search failed')
      }
      
    } catch (error) {
      console.error('Search error:', error)
      actions.setError('Failed to search products')
      setProducts([])
      setTotalProducts(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const newSearchParams = new URLSearchParams()
    newSearchParams.set('q', searchQuery.trim())
    
    // Include active filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        newSearchParams.set(key, value)
      }
    })

    setSearchParams(newSearchParams)
    setShowSuggestions(false)
  }

  const getSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await productsAPI.getSearchSuggestions(query)
      const suggestionData = response.data?.data?.suggestions || {}
      const allSuggestions = []
      
      // Flatten all suggestion types into a simple array
      if (suggestionData.products) {
        allSuggestions.push(...suggestionData.products.map(item => item.value))
      }
      if (suggestionData.brands) {
        allSuggestions.push(...suggestionData.brands.map(item => item.value))
      }
      if (suggestionData.categories) {
        allSuggestions.push(...suggestionData.categories.map(item => item.value))
      }
      if (suggestionData.tags) {
        allSuggestions.push(...suggestionData.tags.map(item => item.value))
      }
      
      setSuggestions([...new Set(allSuggestions)]) // Remove duplicates
    } catch (error) {
      console.error('Suggestions error:', error)
      setSuggestions([])
    }
  }

  const addToRecentSearches = (query) => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    const updated = [
      trimmedQuery,
      ...recentSearches.filter(s => s !== trimmedQuery)
    ].slice(0, 5)
    
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const newSearchParams = new URLSearchParams(searchParams)
    if (value) {
      newSearchParams.set(key, value)
    } else {
      newSearchParams.delete(key)
    }
    newSearchParams.delete('page')
    setSearchParams(newSearchParams)
  }

  const clearFilters = () => {
    const newFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      rating: '',
      sort: 'relevance',
      inStock: false
    }
    setFilters(newFilters)
    
    const newSearchParams = new URLSearchParams()
    if (searchQuery) {
      newSearchParams.set('q', searchQuery)
    }
    newSearchParams.set('sort', 'relevance')
    setSearchParams(newSearchParams)
  }

  const handlePageChange = (page) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('page', page.toString())
    setSearchParams(newSearchParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasResults = products.length > 0
  const hasQuery = searchParams.get('q')

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {hasQuery ? `Search Results` : 'Search Products'}
        </h1>
        
        {/* Enhanced Search Bar */}
        <div className="max-w-2xl relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  getSuggestions(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 pr-12 py-3 text-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSuggestions([])
                  }}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (searchQuery.length > 0 || recentSearches.length > 0) && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10">
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Suggestions</div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                        const newSearchParams = new URLSearchParams()
                        newSearchParams.set('q', suggestion)
                        setSearchParams(newSearchParams)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center"
                    >
                      <Search className="h-4 w-4 text-gray-400 mr-2" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {recentSearches.length > 0 && !searchQuery && (
                <div className="p-2 border-t">
                  <div className="text-xs font-medium text-gray-500 mb-2">Recent Searches</div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search)
                        setShowSuggestions(false)
                        const newSearchParams = new URLSearchParams()
                        newSearchParams.set('q', search)
                        setSearchParams(newSearchParams)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        {search}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {hasQuery && (
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Searching for: <strong>"{searchParams.get('q')}"</strong>
            </span>
            {totalProducts > 0 && (
              <span className="text-sm text-gray-600">
                {totalProducts} result{totalProducts !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
        )}
      </div>

      {/* No Search Query - Show Popular Searches */}
      {!hasQuery && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Searches</h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => {
                    const newSearchParams = new URLSearchParams()
                    newSearchParams.set('q', search)
                    setSearchParams(newSearchParams)
                  }}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {search}
                </button>
              ))}
            </div>
          </div>

          {recentSearches.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Searches</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newSearchParams = new URLSearchParams()
                      newSearchParams.set('q', search)
                      setSearchParams(newSearchParams)
                    }}
                    className="px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-full text-sm transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {hasQuery && (
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                <Input
                  placeholder="Enter category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                />
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Brand</h4>
                <Input
                  placeholder="Enter brand name"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                />
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.rating === rating.toString()}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* In Stock Filter */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="xl" />
              </div>
            ) : hasResults ? (
              <>
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-gray-600">
                    {totalProducts} result{totalProducts !== 1 ? 's' : ''} for "{searchParams.get('q')}"
                  </span>

                  <div className="flex items-center space-x-4">
                    {/* Sort */}
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* View Mode */}
                    <div className="flex border border-gray-300 rounded-md">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }`}>
                  {products.map((product) => (
                    <Card key={product._id} className="group hover:shadow-lg transition-shadow">
                      <Link to={`/products/${product._id}`}>
                        <div className="aspect-square overflow-hidden rounded-t-lg">
                          <img
                            src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                            alt={product.title || product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'
                            }}
                          />
                        </div>
                      </Link>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Link to={`/products/${product._id}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                              {product.title || product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600 ml-1">
                                {product.rating?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-400">
                              ({product.reviewCount || 0})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {(product.inventory <= 0 || product.stock <= 0) && (
                              <Badge variant="destructive">Out of Stock</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex space-x-2">
                        <Button
                          className="flex-1"
                          onClick={() => actions.addToCart(product)}
                          disabled={product.inventory <= 0 || product.stock <= 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            const wasAdded = actions.toggleWishlist(product)
                            const productName = product.title || product.name
                            if (wasAdded) {
                              actions.setSuccess(`${productName} added to wishlist!`)
                            } else {
                              actions.setSuccess(`${productName} removed from wishlist!`)
                            }
                          }}
                          className={actions.isInWishlist(product._id) ? "text-red-600 hover:text-red-700" : ""}
                        >
                          <Heart className={`h-4 w-4 ${actions.isInWishlist(product._id) ? 'fill-current' : ''}`} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                        const page = index + 1
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                      
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* No Results */
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any products matching "{searchParams.get('q')}".
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Try:</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Checking your spelling</li>
                    <li>• Using different or fewer keywords</li>
                    <li>• Browsing our categories</li>
                  </ul>
                </div>
                <div className="mt-6 space-x-4">
                  <Button onClick={clearFilters}>Clear Filters</Button>
                  <Link to="/products">
                    <Button variant="outline">Browse All Products</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage
