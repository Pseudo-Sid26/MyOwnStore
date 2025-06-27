import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsAPI, categoriesAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Card, CardContent, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import { Star, Grid, List, Filter, SortAsc } from 'lucide-react'
import { formatPrice } from '../lib/utils'

const CategoryPage = () => {
  const { categoryId } = useParams() // Get categoryId from URL params
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState({
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: false
  })
  const { actions } = useApp()

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch category details and products in parallel
        const [categoryResponse, productsResponse] = await Promise.all([
          categoriesAPI.getById(categoryId),
          productsAPI.getAll({ category: categoryId })
        ])
        
        setCategory(categoryResponse.data.category)
        setProducts(productsResponse.data.products || [])
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

  const handleAddToCart = (product) => {
    try {
      actions.addToCart(product, 1)
      actions.setSuccess('Product added to cart!')
    } catch (error) {
      console.error('Failed to add to cart:', error)
      actions.setError('Failed to add product to cart')
    }
  }

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      if (filterBy.minPrice && product.price < parseFloat(filterBy.minPrice)) return false
      if (filterBy.maxPrice && product.price > parseFloat(filterBy.maxPrice)) return false
      if (filterBy.rating && product.rating < parseFloat(filterBy.rating)) return false
      if (filterBy.inStock && product.stock === 0) return false
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
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link to="/categories">
            <Button>Browse All Categories</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-blue-600">Categories</Link>
        <span>/</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
            <p className="text-lg text-gray-600 mb-4">
              {category.description || `Discover amazing ${category.name.toLowerCase()} products`}
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {filteredAndSortedProducts.length} products found
              </span>
              {category.productCount && (
                <Badge variant="secondary">
                  {category.productCount} total products
                </Badge>
              )}
            </div>
          </div>
          {category.image && (
            <div className="hidden md:block">
              <img
                src={category.image}
                alt={category.name}
                className="w-32 h-32 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Filters */}
        <div className="lg:w-1/4">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </h3>
            
            <div className="space-y-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filterBy.minPrice}
                    onChange={(e) => setFilterBy({...filterBy, minPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filterBy.maxPrice}
                    onChange={(e) => setFilterBy({...filterBy, maxPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filterBy.rating}
                  onChange={(e) => setFilterBy({...filterBy, rating: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              {/* In Stock */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filterBy.inStock}
                  onChange={(e) => setFilterBy({...filterBy, inStock: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="inStock" className="text-sm text-gray-700">
                  In Stock Only
                </label>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterBy({minPrice: '', maxPrice: '', rating: '', inStock: false})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Products */}
        <div className="lg:w-3/4">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <SortAsc className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid/List */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or check back later</p>
              <Button onClick={() => setFilterBy({minPrice: '', maxPrice: '', rating: '', inStock: false})}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredAndSortedProducts.map((product) => (
                <Card key={product._id} className={`hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}>
                  <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}>
                    <img
                      src={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className={`w-full h-full object-cover ${
                        viewMode === 'list' ? 'rounded-l-lg' : 'rounded-t-lg'
                      }`}
                    />
                  </div>
                  
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400 ml-2">
                          ({product.reviewCount || 0} reviews)
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.stock === 0 && (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryPage