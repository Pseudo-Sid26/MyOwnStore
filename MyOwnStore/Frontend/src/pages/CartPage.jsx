import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { cartAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import { formatPrice, calculateCartTotal } from '../lib/utils'

const CartPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const { state, actions } = useApp()
  const navigate = useNavigate()

  const { cart, user } = state

  // Calculate totals
  const subtotal = calculateCartTotal(cart)
  const shipping = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage / 100) : 0
  const total = subtotal + shipping - discount

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      actions.removeFromCart(productId)
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
    }
  }

  const removeItem = async (productId) => {
    try {
      actions.removeFromCart(productId)
      
      // If user is logged in, sync with backend
      if (user) {
        await cartAPI.removeItem(productId)
      }
    } catch (error) {
      console.error('Error removing item:', error)
      actions.setError('Failed to remove item')
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      setCouponLoading(true)
      
      if (user) {
        const response = await cartAPI.applyCoupon(couponCode)
        setAppliedCoupon(response.data.coupon)
      } else {
        // For guest users, simulate coupon validation
        // In a real app, you'd validate against a public endpoint
        if (couponCode.toUpperCase() === 'SAVE10') {
          setAppliedCoupon({
            code: 'SAVE10',
            discountPercentage: 10,
            description: '10% off your order'
          })
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
    navigate('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild>
            <Link to="/products">
              Continue Shopping
            </Link>
          </Button>
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
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-24 flex-shrink-0">
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPrice(item.price)} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-8 w-8 p-0 rounded-none"
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
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-8 w-8 p-0 rounded-none"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        className="text-red-600 hover:text-red-700 p-0 h-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                      className="text-green-600 hover:text-green-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                    />
                    <Button
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      size="sm"
                    >
                      {couponLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <Badge variant="secondary" className="text-xs">Free</Badge>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}

                {subtotal <= 50 && (
                  <div className="text-xs text-gray-500">
                    Add {formatPrice(50 - subtotal)} more for free shipping
                  </div>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold pt-4 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button
                className="w-full"
                onClick={proceedToCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>

              {!user && (
                <p className="text-xs text-gray-500 text-center">
                  <Link to="/login" className="text-primary-600 hover:text-primary-700">
                    Sign in
                  </Link>{' '}
                  for faster checkout
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CartPage
