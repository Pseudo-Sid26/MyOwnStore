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
import { productsAPI, cartAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import ProductAttributes from '../components/ui/ProductAttributes'
import { formatPrice } from '../lib/utils'
import  ReviewSection  from '../components/features/ReviewSection'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const { state, actions } = useApp()

  // Check if product is in wishlist
  const isInWishlist = product ? actions.isInWishlist(product._id) : false

  // In the useEffect, update the recommendation fetching:
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true)

        // Fetch product details
        const productResponse = await productsAPI.getById(id)
        console.log('Product Response:', productResponse.data)

        // ✅ Fix: Access correct data structure
        const productData = productResponse.data?.data?.product

        if (!productData) {
          throw new Error('Product not found')
        }

        setProduct(productData)

        // Set default size if available
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0])
        }

        // ✅ Fix: Fetch recommendations with correct data access
        try {
          const recommendationsResponse = await productsAPI.getRecommendations(id)
          console.log('Recommendations Response:', recommendationsResponse.data)

          // Access the products array from the response
          const recsData = recommendationsResponse.data?.data?.products || []
          setRecommendations(recsData)
        } catch (error) {
          console.log('Recommendations not available:', error.message)
          setRecommendations([])
        }

      } catch (error) {
        console.error('Error fetching product:', error)
        actions.setError('Failed to load product details')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProductData()
    }
  }, [id, actions])
  const handleAddToCart = async () => {
    if (!product) return

    try {
      setIsAddingToCart(true)

      // Use the correct structure that the action expects
      const productData = {
        _id: product._id,
        name: product.title, // Map title to name
        price: product.discountedPrice || product.price,
        images: product.images,
        stock: product.stock,
        selectedSize: selectedSize,
        selectedColor: selectedColor
      }

      actions.addToCart(productData, quantity)
      
      // If user is logged in, sync with backend
      if (state.user) {
        await cartAPI.addItem(product._id, quantity)
      }
      
      actions.setSuccess(`${product.title} added to cart!`)

    } catch (error) {
      console.error('Add to cart error:', error)
      actions.setError('Failed to add product to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    // ✅ Fix: Use 'stock' instead of 'inventory'
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 999)) {
      setQuantity(newQuantity)
    }
  }

  const handleWishlistToggle = () => {
    if (!product) return
    
    const wasAdded = actions.toggleWishlist(product)
    if (wasAdded) {
      actions.setSuccess(`${product.title} added to wishlist!`)
    } else {
      actions.setSuccess(`${product.title} removed from wishlist!`)
    }
  }

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImage((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const DetailRow = ({ label, value, valueClass = "text-gray-600" }) => (
    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
      <span className="font-medium text-gray-900">{label}:</span>
      <span className={valueClass}>{value}</span>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="xl" />
        <span className="ml-3 text-gray-600">Loading product...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    )
  }

  const displayPrice = product.discountedPrice || product.price
  const originalPrice = product.price
  const hasDiscount = product.hasActiveDiscount || (product.discountedPrice && product.discountedPrice < product.price)
  const discountPercentage = product.discountPercentage ||
    (hasDiscount ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0)
  const savingsAmount = product.savingsAmount ||
    (hasDiscount ? originalPrice - displayPrice : 0)

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
          <li className="text-gray-900 font-medium">{product.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg'
                }}
              />
            </div>

            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
                {selectedImage + 1} / {product.images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            {/* ✅ Fix: Use 'title' instead of 'name' */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>

            {/* Brand */}
            {product.brand && (
              <p className="text-lg text-gray-600 mb-4">by {product.brand}</p>
            )}

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {(product.rating || 0).toFixed(1)} ({product.numReviews || 0} reviews)
                </span>
              </div>

              {/* ✅ Fix: Use 'stock' and 'isAvailable' */}
              <Badge variant={product.isAvailable ? 'secondary' : 'destructive'}>
                {product.isAvailable
                  ? `In Stock (${product.stock})`
                  : 'Out of Stock'
                }
              </Badge>
            </div>
          </div>

          {/* Price Section with Better Discount Display */}

          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive" className="text-sm font-semibold">
                      {discountPercentage}% OFF
                    </Badge>
                    <span className="text-sm text-green-600 font-medium">
                      Save {formatPrice(savingsAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Discount Validity */}
            {product.discount?.validTill && hasDiscount && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-orange-600">🔥</span>
                <span className="text-orange-600 font-medium">
                  Limited time offer expires on{' '}
                  {new Date(product.discount.validTill).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Product Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'No description available.'}
              </p>
            </div>
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${selectedSize === size
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

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
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
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.stock || 0)}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {product.stock || 0} available
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.isAvailable || product.stock === 0 || isAddingToCart}
                className="flex-1"
              >
                {isAddingToCart ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleWishlistToggle}
                title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                className={isInWishlist ? "text-red-600 hover:text-red-700" : ""}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline" size="lg" title="Share">
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
            {['description', 'details', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
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
              <div className="text-gray-700 leading-relaxed">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p>No detailed description available for this product.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Product Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <DetailRow label="Brand" value={product.brand || 'N/A'} />
                    <DetailRow
                      label="Category"
                      value={product.categoryId?.name || 'N/A'}
                    />
                    <DetailRow label="Stock Quantity" value={product.stock || 0} />
                    <DetailRow
                      label="Availability"
                      value={product.isAvailable ? 'In Stock' : 'Out of Stock'}
                      valueClass={product.isAvailable ? 'text-green-600' : 'text-red-600'}
                    />
                  </div>
                  <div className="space-y-3">
                    <DetailRow label="SKU" value={product._id?.slice(-8) || 'N/A'} />
                    <DetailRow
                      label="Rating"
                      value={`${product.rating?.toFixed(1) || '0.0'}/5.0`}
                    />
                    <DetailRow label="Total Reviews" value={product.numReviews || product.reviewsCount || 0} />
                    <DetailRow
                      label="Sizes Available"
                      value={product.sizes?.length > 0 ? product.sizes.join(', ') : 'One Size'}
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Pricing Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Pricing Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <DetailRow
                      label="Original Price"
                      value={formatPrice(product.price)}
                    />
                    <DetailRow
                      label="Current Price"
                      value={formatPrice(displayPrice)}
                      valueClass={hasDiscount ? "text-green-600 font-semibold" : "text-gray-600"}
                    />

                    {hasDiscount && (
                      <>
                        <DetailRow
                          label="Discount"
                          value={`${discountPercentage}%`}
                          valueClass="text-red-600 font-semibold"
                        />
                        <DetailRow
                          label="You Save"
                          value={formatPrice(savingsAmount)}
                          valueClass="text-green-600 font-semibold"
                        />
                      </>
                    )}

                    {product.discount?.validTill && hasDiscount && (
                      <DetailRow
                        label="Offer Valid Till"
                        value={new Date(product.discount.validTill).toLocaleDateString()}
                        valueClass="text-orange-600 font-medium"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <ReviewSection productId={product._id} />
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
              <Card
                key={recommendedProduct._id}
                className="group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/products/${recommendedProduct._id}`)}
              >
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={recommendedProduct.images?.[0] || '/placeholder-product.jpg'}
                    alt={recommendedProduct.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg'
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">
                    {recommendedProduct.title}
                  </h3>
                  {recommendedProduct.brand && (
                    <p className="text-sm text-gray-600 mb-2">{recommendedProduct.brand}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(recommendedProduct.discountedPrice || recommendedProduct.price)}
                    </p>
                    {recommendedProduct.discountedPrice && recommendedProduct.discountedPrice < recommendedProduct.price && (
                      <Badge variant="destructive" className="text-xs">
                        Sale
                      </Badge>
                    )}
                  </div>
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