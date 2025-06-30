import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CreditCard, 
  MapPin, 
  User, 
  Truck,
  Shield,
  ArrowLeft,
  Check
} from 'lucide-react'
import { ordersAPI, cartAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import { formatPrice } from '../lib/utils'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { state, actions } = useApp()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [useDefaultAddress, setUseDefaultAddress] = useState(false)
  const [orderData, setOrderData] = useState({
    shippingAddress: {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      phone: ''
    },
    paymentMethod: 'card',
    notes: ''
  })

  const steps = [
    { id: 1, name: 'Shipping', icon: MapPin },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: Check }
  ]

  useEffect(() => {
    // If cart is empty, redirect to cart page
    if (state.cart.length === 0) {
      navigate('/cart')
      return
    }

    // Pre-fill with user data if available
    if (state.user) {
      console.log('User found:', state.user)
      console.log('User address array:', state.user.address)
      
      const userFullName = state.user.name || `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() || ''
      
      // Get the first address from the address array (if it exists)
      const userDefaultAddress = state.user.address && Array.isArray(state.user.address) && state.user.address.length > 0 
        ? state.user.address[0] 
        : null

      console.log('Default address from array:', userDefaultAddress)
      
      // Check if user has a complete address
      const hasCompleteAddress = userDefaultAddress && 
        userDefaultAddress.street && 
        userDefaultAddress.city && 
        userDefaultAddress.state && 
        userDefaultAddress.postalCode

      console.log('Has complete address:', hasCompleteAddress)
      
      if (hasCompleteAddress) {
        console.log('Using default address for user')
        // Set default address as an option and pre-fill
        setUseDefaultAddress(true)
        setOrderData(prev => ({
          ...prev,
          shippingAddress: {
            fullName: userFullName,
            addressLine1: userDefaultAddress.street || '',
            addressLine2: '', // User model doesn't have addressLine2
            city: userDefaultAddress.city || '',
            state: userDefaultAddress.state || '',
            postalCode: userDefaultAddress.postalCode || '',
            country: userDefaultAddress.country || 'USA',
            phone: state.user.phone || ''
          }
        }))
      } else {
        console.log('Address not found or incomplete. Details:')
        if (!state.user.address || !Array.isArray(state.user.address) || state.user.address.length === 0) {
          console.log('- No address array found or empty array')
        } else if (!userDefaultAddress) {
          console.log('- First address in array is null/undefined')
        } else {
          console.log('- Missing required fields in address:')
          if (!userDefaultAddress.street) console.log('  - Missing street')
          if (!userDefaultAddress.city) console.log('  - Missing city')
          if (!userDefaultAddress.state) console.log('  - Missing state')
          if (!userDefaultAddress.postalCode) console.log('  - Missing postalCode')
        }
        
        // Only pre-fill name if no complete address
        setOrderData(prev => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            fullName: userFullName,
            phone: state.user.phone || ''
          }
        }))
      }
    } else {
      console.log('No user found - guest checkout')
    }
  }, [state.cart, state.user, navigate])

  const handleInputChange = (section, field, value) => {
    setOrderData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleAddressOptionChange = (useDefault) => {
    console.log('Address option changed to:', useDefault ? 'default' : 'new')
    setUseDefaultAddress(useDefault)
    
    if (useDefault && state.user?.address && Array.isArray(state.user.address) && state.user.address.length > 0) {
      console.log('Switching to default address')
      const userDefaultAddress = state.user.address[0]
      const userFullName = state.user.name || `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() || ''
      
      // Use default address
      setOrderData(prev => ({
        ...prev,
        shippingAddress: {
          fullName: userFullName,
          addressLine1: userDefaultAddress.street || '',
          addressLine2: '', // User model doesn't have addressLine2
          city: userDefaultAddress.city || '',
          state: userDefaultAddress.state || '',
          postalCode: userDefaultAddress.postalCode || '',
          country: userDefaultAddress.country || 'USA',
          phone: state.user.phone || ''
        }
      }))
    } else {
      console.log('Switching to new address entry')
      // Clear for new address
      const userFullName = state.user?.name || `${state.user?.firstName || ''} ${state.user?.lastName || ''}`.trim() || ''
      setOrderData(prev => ({
        ...prev,
        shippingAddress: {
          fullName: userFullName,
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'USA',
          phone: state.user?.phone || ''
        }
      }))
    }
  }

  const validateStep = (step) => {
    switch (step) {
      case 1: // Shipping
        const { shippingAddress } = orderData
        return (
          shippingAddress.fullName &&
          shippingAddress.addressLine1 &&
          shippingAddress.city &&
          shippingAddress.state &&
          shippingAddress.postalCode &&
          shippingAddress.phone
        )
      case 2: // Payment
        return orderData.paymentMethod
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    } else {
      actions.setError('Please fill in all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmitOrder = async () => {
    if (!validateStep(currentStep)) {
      actions.setError('Please complete all required fields')
      return
    }

    try {
      setIsProcessing(true)
      console.log('📤 Submitting order:', orderData)
      
      const response = await ordersAPI.create(orderData)
      console.log('📥 Order response:', response.data)
      
      if (response.data.success) {
        const order = response.data.data.order
        
        // Clear cart both locally and sync with backend
        await actions.clearCart()
        
        // Double-check by loading cart from backend to ensure it's empty
        if (state.isAuthenticated) {
          await actions.loadCart()
        }
        
        console.log('✅ Cart cleared and verified after order placement')
        actions.setSuccess(`Order #${order.orderNumber} placed successfully! Redirecting to your orders...`)
        
        // Small delay to show the success message, then navigate to orders page
        setTimeout(() => {
          navigate('/orders')
        }, 1500)
      } else {
        actions.setError(response.data.message || 'Failed to place order')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to place order'
      actions.setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const shippingCost = cartTotal > 50 ? 0 : 9.99
  const tax = cartTotal * 0.08 // 8% tax
  const orderTotal = cartTotal + shippingCost + tax

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                        step.id < currentStep
                          ? 'bg-primary-600'
                          : step.id === currentStep
                          ? 'border-2 border-primary-600 bg-white'
                          : 'border-2 border-gray-300 bg-white'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <step.icon
                          className={`h-5 w-5 ${
                            step.id === currentStep ? 'text-primary-600' : 'text-gray-400'
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`ml-4 text-sm font-medium ${
                        step.id <= currentStep ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div
                      className={`absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 ${
                        step.id < currentStep ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Address Selection for Logged-in Users */}
                  {state.user && state.user.address && 
                   Array.isArray(state.user.address) && 
                   state.user.address.length > 0 &&
                   state.user.address[0].street && 
                   state.user.address[0].city && 
                   state.user.address[0].state && 
                   state.user.address[0].postalCode && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Choose Shipping Address</h4>
                      
                      {/* Default Address Option */}
                      <div
                        className={`relative border rounded-lg p-4 cursor-pointer ${
                          useDefaultAddress
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handleAddressOptionChange(true)}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name="addressOption"
                            value="default"
                            checked={useDefaultAddress}
                            onChange={() => handleAddressOptionChange(true)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 mt-1"
                          />
                          <div className="ml-3 flex-1">
                            <label className="block text-sm font-medium text-gray-900">
                              Use My Default Address
                            </label>
                            <div className="mt-1 text-sm text-gray-600">
                              <p>{state.user.name}</p>
                              <p>{state.user.address[0].street}</p>
                              <p>{state.user.address[0].city}, {state.user.address[0].state} {state.user.address[0].postalCode}</p>
                              <p>{state.user.address[0].country}</p>
                              {state.user.phone && <p>{state.user.phone}</p>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* New Address Option */}
                      <div
                        className={`relative border rounded-lg p-4 cursor-pointer ${
                          !useDefaultAddress
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handleAddressOptionChange(false)}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="addressOption"
                            value="new"
                            checked={!useDefaultAddress}
                            onChange={() => handleAddressOptionChange(false)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3">
                            <label className="block text-sm font-medium text-gray-900">
                              Use a Different Address
                            </label>
                            <p className="text-sm text-gray-600">Enter a new shipping address</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address Form - Show when no default address or when "new address" is selected */}
                  {(!state.user || 
                    !state.user.address || 
                    !Array.isArray(state.user.address) ||
                    state.user.address.length === 0 ||
                    !state.user.address[0].street || 
                    !useDefaultAddress) && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <Input
                            value={orderData.shippingAddress.fullName}
                            onChange={(e) => handleInputChange('shippingAddress', 'fullName', e.target.value)}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <Input
                            value={orderData.shippingAddress.phone}
                            onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1 *
                        </label>
                        <Input
                          value={orderData.shippingAddress.addressLine1}
                          onChange={(e) => handleInputChange('shippingAddress', 'addressLine1', e.target.value)}
                          placeholder="123 Main Street"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 2
                        </label>
                        <Input
                          value={orderData.shippingAddress.addressLine2}
                          onChange={(e) => handleInputChange('shippingAddress', 'addressLine2', e.target.value)}
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <Input
                            value={orderData.shippingAddress.city}
                            onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                            placeholder="New York"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State *
                          </label>
                          <Input
                            value={orderData.shippingAddress.state}
                            onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                            placeholder="NY"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code *
                          </label>
                          <Input
                            value={orderData.shippingAddress.postalCode}
                            onChange={(e) => handleInputChange('shippingAddress', 'postalCode', e.target.value)}
                            placeholder="10001"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { id: 'card', name: 'Credit/Debit Card', description: 'Pay with Visa, Mastercard, or American Express' },
                      { id: 'paypal', name: 'PayPal', description: 'Pay securely with your PayPal account' },
                      { id: 'stripe', name: 'Stripe', description: 'Secure payment processing with Stripe' },
                      { id: 'cash', name: 'Cash on Delivery', description: 'Pay when your order arrives' }
                    ].map((method) => (
                      <div
                        key={method.id}
                        className={`relative border rounded-lg p-4 cursor-pointer ${
                          orderData.paymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handleInputChange('', 'paymentMethod', method.id)}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={orderData.paymentMethod === method.id}
                            onChange={() => handleInputChange('', 'paymentMethod', method.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3">
                            <label className="block text-sm font-medium text-gray-900">
                              {method.name}
                            </label>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={orderData.notes}
                      onChange={(e) => handleInputChange('', 'notes', e.target.value)}
                      placeholder="Special instructions for your order..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p>{orderData.shippingAddress.fullName}</p>
                          <p>{orderData.shippingAddress.addressLine1}</p>
                          {orderData.shippingAddress.addressLine2 && (
                            <p>{orderData.shippingAddress.addressLine2}</p>
                          )}
                          <p>
                            {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.postalCode}
                          </p>
                          <p>{orderData.shippingAddress.phone}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                        <p className="text-sm text-gray-600">
                          {orderData.paymentMethod === 'card' && 'Credit/Debit Card'}
                          {orderData.paymentMethod === 'paypal' && 'PayPal'}
                          {orderData.paymentMethod === 'stripe' && 'Stripe'}
                          {orderData.paymentMethod === 'cash' && 'Cash on Delivery'}
                        </p>
                      </div>

                      {orderData.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Order Notes</h4>
                          <p className="text-sm text-gray-600">{orderData.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {state.cart.map((item) => (
                        <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center space-x-4">
                          <img
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <div className="text-sm text-gray-600">
                              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                              {item.selectedColor && <span className="ml-2">Color: {item.selectedColor}</span>}
                            </div>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={nextStep}>
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmitOrder}
                  disabled={isProcessing}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {state.cart.map((item) => (
                    <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <Badge variant="secondary">FREE</Badge>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg">{formatPrice(orderTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="mr-2 h-4 w-4" />
                    Secure checkout
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="mr-2 h-4 w-4" />
                    Free shipping over $50
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
