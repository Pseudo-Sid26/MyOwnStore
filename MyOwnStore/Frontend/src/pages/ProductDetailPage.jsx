import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Star, 
  Heart, 
  Share2, 
  Plus, 
  Minus, 
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { productsAPI, reviewsAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import { formatPrice } from '../lib/utils'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const { state, actions } = useApp()

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true)
        const [productResponse, reviewsResponse] = await Promise.all([
          productsAPI.getById(id),
          reviewsAPI.getByProduct(id, { limit: 5 })
        ])
        
        const productData = productResponse.data.product
        setProduct(productData)
        setReviews(reviewsResponse.data.reviews || [])

        // Set default selections
        if (productData.variants?.sizes?.length > 0) {
          setSelectedSize(productData.variants.sizes[0])
        }
        if (productData.variants?.colors?.length > 0) {
          setSelectedColor(productData.variants.colors[0])
        }

        // Fetch recommendations
        try {
          const recommendationsResponse = await productsAPI.getRecommendations(id)
          setRecommendations(recommendationsResponse.data.products || [])
        } catch (error) {
          console.log('Recommendations not available')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        actions.setError('Failed to load product details')
        navigate('/products')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProductData()
    }
  }, [id, actions, navigate])

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      setIsAddingToCart(true)
      await actions.addToCart({
        ...product,
        selectedSize,
        selectedColor,
        quantity
      })
      actions.setSuccess('Product added to cart!')
    } catch (error) {
      actions.setError('Failed to add product to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= (product?.inventory || 999)) {
      setQuantity(newQuantity)
    }
  }

  const nextImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Button onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    )
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <button 
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              Home
            </button>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <button 
              onClick={() => navigate('/products')}
              className="text-gray-500 hover:text-gray-700"
            >
              Products
            </button>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
              <Badge variant={product.inventory > 0 ? 'default' : 'destructive'}>
                {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="destructive">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Off
                  </Badge>
                </>
              )}
            </div>
            <p className="text-gray-600">{product.shortDescription}</p>
          </div>

          {/* Variants */}
          {(product.variants?.sizes?.length > 0 || product.variants?.colors?.length > 0) && (
            <div className="space-y-4">
              {product.variants?.sizes?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          selectedSize === size
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.variants?.colors?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          selectedColor === color
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.inventory || 999)}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {product.inventory} available
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.inventory === 0 || isAddingToCart}
                className="flex-1"
              >
                {isAddingToCart ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <ShoppingCart className="mr-2 h-5 w-5" />
                )}
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-600">30-day returns</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Warranty</p>
                  <p className="text-xs text-gray-600">1-year warranty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="border-t pt-16">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="max-w-4xl">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="space-y-4">
              {product.specifications ? (
                Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex border-b border-gray-200 pb-2">
                    <dt className="w-1/3 font-medium text-gray-900">{key}</dt>
                    <dd className="w-2/3 text-gray-600">{value}</dd>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No specifications available.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {review.user?.firstName} {review.user?.lastName}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              )}
              
              {state.user && (
                <div className="mt-8">
                  <Button onClick={() => navigate(`/products/${product._id}/review`)}>
                    Write a Review
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {recommendations.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((recommendedProduct) => (
              <Card key={recommendedProduct._id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <div 
                  onClick={() => navigate(`/products/${recommendedProduct._id}`)}
                  className="aspect-square overflow-hidden rounded-t-lg"
                >
                  <img
                    src={recommendedProduct.images?.[0] || '/placeholder-product.jpg'}
                    alt={recommendedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{recommendedProduct.name}</h3>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {formatPrice(recommendedProduct.price)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetailPage
