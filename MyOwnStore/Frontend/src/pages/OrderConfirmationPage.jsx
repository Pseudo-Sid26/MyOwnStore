import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight,
  Download,
  Star
} from 'lucide-react'
import { ordersAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import { formatPrice } from '../lib/utils'

const OrderConfirmationPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { actions } = useApp()

  // Check if this is order details page (not confirmation)
  const isOrderDetails = location.pathname.startsWith('/order-details')

  useEffect(() => {
    const fetchOrder = async () => {
      // Check if orderId is passed via URL params or query params
      const urlParams = new URLSearchParams(window.location.search)
      const queryOrderId = urlParams.get('orderId')
      const finalOrderId = orderId || queryOrderId
      
      if (!finalOrderId) {
        navigate('/orders')
        return
      }

      try {
        setIsLoading(true)
        const response = await ordersAPI.getById(finalOrderId)
        
        if (response.data?.success && response.data?.data?.order) {
          setOrder(response.data.data.order)
        } else {
          throw new Error('Order not found')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        actions.setError('Failed to load order details')
        navigate('/orders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, navigate, actions])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-orange-100 text-orange-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Calendar className="h-5 w-5" />
      case 'processing':
        return <Package className="h-5 w-5" />
      case 'shipped':
        return <Truck className="h-5 w-5" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <Button onClick={() => navigate('/orders')}>
          View All Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          {!isOrderDetails && (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isOrderDetails ? 'Order Details' : 'Order Confirmed!'}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {isOrderDetails 
              ? 'View and manage your order details below.'
              : 'Thank you for your order. We\'ve received your order and will begin processing it soon.'
            }
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>Order Number: <strong>#{order.orderNumber}</strong></span>
            <span>•</span>
            <span>Order Date: {new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className="ml-2">Order Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  {order.trackingInfo?.trackingNumber && (
                    <Button variant="outline" size="sm">
                      Track Package
                    </Button>
                  )}
                </div>
                {order.statusNotes && (
                  <p className="text-sm text-gray-600 mt-2">{order.statusNotes}</p>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                      <img
                        src={item.productId?.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.title || 'Product'}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.title || 'Product'}
                        </h4>
                        <div className="text-sm text-gray-600">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span className="ml-2">Color: {item.color}</span>}
                        </div>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.totalPrice || (item.price * item.quantity))}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice
                    </Button>
                    <Button variant="outline" size="sm">
                      Reorder Items
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping & Billing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p className="mt-2">{order.shippingAddress.phone}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">
                      {order.paymentMethod === 'card' && 'Credit/Debit Card'}
                      {order.paymentMethod === 'paypal' && 'PayPal'}
                      {order.paymentMethod === 'stripe' && 'Stripe'}
                      {order.paymentMethod === 'cash' && 'Cash on Delivery'}
                    </p>
                    <p className="mt-2">
                      Status: <span className="text-green-600 font-medium">Paid</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(order.pricing?.subtotal || 0)}</span>
                  </div>
                  {order.pricing?.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.pricing.discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg">{formatPrice(order.pricing?.total || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button className="w-full" asChild>
                    <Link to="/products">
                      Continue Shopping
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/orders">View All Orders</Link>
                  </Button>
                </div>

                {/* Estimated Delivery */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Estimated Delivery</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="mr-2 h-4 w-4" />
                    <span>
                      {order.estimatedDelivery 
                        ? new Date(order.estimatedDelivery).toLocaleDateString()
                        : '3-5 business days'
                      }
                    </span>
                  </div>
                </div>

                {/* Customer Support */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                  <div className="space-y-2 text-sm">
                    <button className="text-primary-600 hover:text-primary-700">
                      Contact Customer Support
                    </button>
                    <br />
                    <button className="text-primary-600 hover:text-primary-700">
                      Track Your Order
                    </button>
                    <br />
                    <button className="text-primary-600 hover:text-primary-700">
                      Return Policy
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Review Prompt */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-400 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Love your purchase?</h3>
                  <p className="text-sm text-gray-600">
                    Help others by sharing your experience with these products.
                  </p>
                </div>
              </div>
              <Button variant="outline">
                Write Reviews
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OrderConfirmationPage
