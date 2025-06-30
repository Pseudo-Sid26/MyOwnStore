import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Heart, ExternalLink, Gift, Truck, Clock, AlertCircle, TrendingUp, Package } from 'lucide-react'
import { cartAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import  Skeleton  from '../components/ui/Skeleton'
import { formatPrice, calculateCartTotal } from '../lib/utils'

const CartPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [savedForLater, setSavedForLater] = useState([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [quantityErrors, setQuantityErrors] = useState({})
  const { state, actions } = useApp()
  const navigate = useNavigate()

  const { cart, user } = state

  // Calculate totals with tax
  const subtotal = calculateCartTotal(cart)
  const shipping = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage / 100) : 0
  const taxRate = 0.08 // 8% tax rate (would come from user location in real app)
  const tax = (subtotal - discount) * taxRate
  const total = subtotal + shipping + tax - discount

  // Load saved for later from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedForLater') || '[]')
    setSavedForLater(saved)
  }, [])

  // Save to localStorage whenever savedForLater changes
  useEffect(() => {
    localStorage.setItem('savedForLater', JSON.stringify(savedForLater))
  }, [savedForLater])

  const updateQuantity = async (productId, newQuantity) => {
    // Clear any existing error for this product
    setQuantityErrors(prev => ({
      ...prev,
      [productId]: null
    }))

    if (newQuantity <= 0) {
      actions.removeFromCart(productId)
      return
    }

    // Find the item to check stock limits
    const item = cart.find(item => item.productId === productId)
    if (item && item.stock && newQuantity > item.stock) {
      setQuantityErrors(prev => ({
        ...prev,
        [productId]: `Only ${item.stock} items available in stock`
      }))
      return
    }

    try {
      actions.updateCartItem(productId, newQuantity)
      
      // If user is logged in, sync with backend
      if (user) {
        await cartAPI.updateItem(productId, newQuantity)
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      actions.setError('Failed to update cart')
      
      // Set specific error for this item
      setQuantityErrors(prev => ({
        ...prev,
        [productId]: 'Failed to update quantity'
      }))
    }
  }

  const removeItem = async (productId) => {
    try {
      actions.removeFromCart(productId)
      
      // If user is logged in, sync with backend
      if (user) {
        await cartAPI.removeItem(productId)
      }
      
      actions.setSuccess('Item removed from cart')
    } catch (error) {
      console.error('Error removing item:', error)
      actions.setError('Failed to remove item')
    }
  }

  const moveToWishlist = async (item) => {
    try {
      // Create product object for wishlist
      const product = {
        _id: item.productId,
        name: item.name,
        title: item.name,
        price: item.price,
        images: [item.image]
      }

      // Add to wishlist
      actions.addToWishlist(product)
      
      // Remove from cart
      actions.removeFromCart(item.productId)
      
      if (user) {
        await cartAPI.removeItem(item.productId)
      }
      
      actions.setSuccess(`${item.name} moved to wishlist`)
    } catch (error) {
      console.error('Error moving to wishlist:', error)
      actions.setError('Failed to move item to wishlist')
    }
  }

  const saveForLater = (item) => {
    try {
      // Add to saved for later
      setSavedForLater(prev => [...prev, item])
      
      // Remove from cart
      actions.removeFromCart(item.productId)
      
      actions.setSuccess(`${item.name} saved for later`)
    } catch (error) {
      console.error('Error saving for later:', error)
      actions.setError('Failed to save item for later')
    }
  }

  const moveBackToCart = (item) => {
    try {
      // Add back to cart with correct structure
      const productData = {
        _id: item.productId,
        name: item.name,
        price: item.price,
        images: [item.image],
        stock: item.stock
      }
      
      actions.addToCart(productData, item.quantity)
      
      // Remove from saved for later
      setSavedForLater(prev => prev.filter(saved => saved.productId !== item.productId))
      
      actions.setSuccess(`${item.name} moved back to cart`)
    } catch (error) {
      console.error('Error moving back to cart:', error)
      actions.setError('Failed to move item back to cart')
    }
  }

  const removeFromSavedForLater = (productId) => {
    setSavedForLater(prev => prev.filter(item => item.productId !== productId))
    actions.setSuccess('Item removed from saved for later')
  }

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return
    
    try {
      actions.clearCart()
      
      if (user) {
        await cartAPI.clear()
      }
      
      actions.setSuccess('Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      actions.setError('Failed to clear cart')
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      setCouponLoading(true)
      
      if (user) {
        const response = await cartAPI.applyCoupon(couponCode)
        setAppliedCoupon(response.data.coupon)
        actions.setSuccess(`Coupon ${couponCode} applied successfully!`)
      } else {
        // For guest users, simulate coupon validation with more options
        const guestCoupons = {
          'SAVE10': { code: 'SAVE10', discountPercentage: 10, description: '10% off your order' },
          'WELCOME15': { code: 'WELCOME15', discountPercentage: 15, description: '15% off for new customers' },
          'FREESHIP': { code: 'FREESHIP', discountPercentage: 0, freeShipping: true, description: 'Free shipping on any order' }
        }
        
        const coupon = guestCoupons[couponCode.toUpperCase()]
        if (coupon) {
          setAppliedCoupon(coupon)
          actions.setSuccess(`Coupon ${couponCode} applied successfully!`)
        } else {
          actions.setError('Invalid coupon code')
        }
      }
      
      setCouponCode('')
    } catch (error) {
      console.error('Error applying coupon:', error)
      actions.setError('Invalid coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = async () => {
    try {
      setAppliedCoupon(null)
      
      if (user) {
        await cartAPI.removeCoupon()
      }
    } catch (error) {
      console.error('Error removing coupon:', error)
    }
  }

  const proceedToCheckout = () => {
    if (cart.length === 0) return
    
    // Check for stock issues before checkout
    const stockIssues = cart.filter(item => item.stock && item.quantity > item.stock)
    if (stockIssues.length > 0) {
      actions.setError('Please update quantities for items with limited stock before checking out')
      return
    }
    
    navigate('/checkout')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0 && savedForLater.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <div className="space-y-4">
            <Button asChild>
              <Link to="/products">
                Continue Shopping
              </Link>
            </Button>
            
            {!user && (
              <div className="text-sm text-gray-500">
                <p className="mb-2">Have an account?</p>
                <Link to="/login" className="text-primary-600 hover:text-primary-700 underline">
                  Sign in to sync your cart
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
          </div>
          
          {cart.length > 1 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart persistence reminder for guests */}
          {!user && cart.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900">Save your cart</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      <Link to="/register" className="underline hover:text-blue-800">
                        Create an account
                      </Link> to save your cart and checkout faster next time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Cart Items */}
          {cart.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Cart Items ({cart.length})
              </h2>
              {cart.map((item) => (
                <Card key={item.productId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 h-24 flex-shrink-0 relative">
                        <Link to={`/products/${item.productId}`}>
                          <img
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md hover:opacity-80 transition-opacity"
                          />
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/products/${item.productId}`}
                          className="group"
                        >
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {item.name}
                            <ExternalLink className="inline h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                        </Link>
                        
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-600">
                            {formatPrice(item.price)} each
                          </p>
                          
                          {/* Show product variants if available */}
                          {(item.selectedSize || item.selectedColor) && (
                            <div className="flex gap-3 text-xs text-gray-500">
                              {item.selectedSize && (
                                <span>Size: <strong>{item.selectedSize}</strong></span>
                              )}
                              {item.selectedColor && (
                                <span>Color: <strong>{item.selectedColor}</strong></span>
                              )}
                            </div>
                          )}
                          
                          {/* Stock status */}
                          {item.stock !== undefined && (
                            <div className="text-xs">
                              {item.stock > 10 ? (
                                <Badge variant="secondary" className="text-xs">In Stock</Badge>
                              ) : item.stock > 0 ? (
                                <Badge variant="outline" className="text-xs text-orange-600">
                                  Only {item.stock} left
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                              )}
                            </div>
                          )}

                          {/* Quantity error */}
                          {quantityErrors[item.productId] && (
                            <div className="flex items-center gap-1 text-red-600 text-xs">
                              <AlertCircle className="h-3 w-3" />
                              {quantityErrors[item.productId]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Actions */}
                      <div className="flex flex-col sm:items-end gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="h-8 w-8 p-0 rounded-none hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1
                              updateQuantity(item.productId, qty)
                            }}
                            className="w-16 h-8 text-center border-0 focus:ring-0 rounded-none"
                            min="1"
                            max={item.stock || 999}
                            aria-label="Quantity"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="h-8 w-8 p-0 rounded-none hover:bg-gray-100"
                            disabled={item.stock && item.quantity >= item.stock}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-500">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveForLater(item)}
                            className="text-gray-600 hover:text-primary-600 p-1 h-auto"
                            title="Save for Later"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-xs">Save</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveToWishlist(item)}
                            className="text-gray-600 hover:text-primary-600 p-1 h-auto"
                            title="Move to Wishlist"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            <span className="text-xs">Wishlist</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-700 p-1 h-auto"
                            title="Remove from Cart"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="text-xs">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Saved for Later Items */}
          {savedForLater.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Saved for Later ({savedForLater.length})
              </h2>
              <div className="space-y-3">
                {savedForLater.map((item) => (
                  <Card key={item.productId} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveBackToCart(item)}
                          >
                            Move to Cart
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromSavedForLater(item.productId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Delivery Estimate */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center text-blue-800">
                  <Truck className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Estimated Delivery</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {shipping === 0 ? '2-3 business days (Free)' : '3-5 business days'}
                </p>
              </div>

              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <Gift className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600">
                          {appliedCoupon.description || `${appliedCoupon.discountPercentage}% off`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                      className="text-green-600 hover:text-green-700 p-1"
                      title="Remove coupon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                        className="flex-1"
                      />
                      <Button
                        onClick={applyCoupon}
                        disabled={!couponCode.trim() || couponLoading}
                        size="sm"
                        variant="outline"
                      >
                        {couponLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Try: <button 
                        className="text-primary-600 hover:text-primary-700 underline"
                        onClick={() => setCouponCode('SAVE10')}
                      >
                        SAVE10
                      </button>{' '}
                      <button 
                        className="text-primary-600 hover:text-primary-700 underline"
                        onClick={() => setCouponCode('WELCOME15')}
                      >
                        WELCOME15
                      </button>{' '}
                      <button 
                        className="text-primary-600 hover:text-primary-700 underline"
                        onClick={() => setCouponCode('FREESHIP')}
                      >
                        FREESHIP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 || (appliedCoupon?.freeShipping) ? (
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  {subtotal <= 50 && !appliedCoupon?.freeShipping && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      💡 Add {formatPrice(50 - subtotal)} more for free shipping
                    </div>
                  )}
                </div>

              <div className="flex justify-between text-lg font-bold pt-4 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>                <Button
                  className="w-full"
                  onClick={proceedToCheckout}
                  disabled={isLoading || cart.length === 0}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <span className="ml-2 text-sm opacity-75">
                        ({cart.length} item{cart.length !== 1 ? 's' : ''})
                      </span>
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-xs text-gray-500 text-center">
                    <Link to="/login" className="text-primary-600 hover:text-primary-700">
                      Sign in
                    </Link>{' '}
                    for faster checkout and order tracking
                  </p>
                )}

                {/* Security badges */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                  <span>🔒 Secure checkout</span>
                  <span>•</span>
                  <span>📦 Fast delivery</span>
                  <span>•</span>
                  <span>↩️ Easy returns</span>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CartPage
