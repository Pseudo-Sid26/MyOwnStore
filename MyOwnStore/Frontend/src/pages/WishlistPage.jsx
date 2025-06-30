import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardFooter } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { formatPrice } from '../lib/utils'

const WishlistPage = () => {
  const { state, actions } = useApp()
  const navigate = useNavigate()

  const { wishlist } = state

  const handleRemoveFromWishlist = (productId, productName) => {
    actions.removeFromWishlist(productId)
    actions.setSuccess(`${productName} removed from wishlist`)
  }

  const handleAddToCart = (item) => {
    // Create a product-like object for the cart
    const product = {
      _id: item.productId,
      title: item.name,
      name: item.name,
      price: item.price,
      images: [item.image],
      stock: 999, // Assume in stock, real implementation would check
      isAvailable: true
    }

    actions.addToCart(product, 1)
    actions.setSuccess(`${item.name} added to cart!`)
  }

  const handleMoveToCart = (item) => {
    handleAddToCart(item)
    handleRemoveFromWishlist(item.productId, item.name)
  }

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      actions.clearWishlist()
      actions.setSuccess('Wishlist cleared')
    }
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8">
            Save items you love by clicking the heart icon on any product. 
            We'll keep them safe here for you!
          </p>
          <Button size="lg" onClick={() => navigate('/products')}>
            Start Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          
          {wishlist.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleClearWishlist}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <Card key={item.productId} className="group hover:shadow-lg transition-shadow">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg'
                  }}
                />
                
                {/* Remove from wishlist button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.productId, item.name)}
                  className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
                  title="Remove from wishlist"
                >
                  <Heart className="h-4 w-4 text-red-600 fill-current" />
                </button>

                {/* Quick view button */}
                <Link
                  to={`/products/${item.productId}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                    Quick View
                  </span>
                </Link>
              </div>

              <CardContent className="p-4">
                <Link to={`/products/${item.productId}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(item.price)}
                  </p>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>4.5</span>
                  </div>
                </div>

                {item.dateAdded && (
                  <p className="text-xs text-gray-500 mb-3">
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleMoveToCart(item)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Move to Cart
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFromWishlist(item.productId, item.name)}
                  >
                    Remove
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Suggestions */}
        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Continue Shopping
          </h2>
          <p className="text-gray-600 mb-6">
            Discover more products you might love
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/products')}>
              All Products
            </Button>
            <Button variant="outline" onClick={() => navigate('/categories')}>
              Browse Categories
            </Button>
            <Button variant="outline" onClick={() => navigate('/deals')}>
              Special Deals
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WishlistPage
