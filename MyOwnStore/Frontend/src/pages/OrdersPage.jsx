import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Star,
  Eye,
  Calendar,
  Filter,
  Search
} from 'lucide-react'
import { ordersAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/Loading'
import { formatPrice } from '../lib/utils'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { state, actions } = useApp()

  const statusOptions = [
    { value: 'all', label: 'All Orders', icon: Package },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { value: 'processing', label: 'Processing', icon: Package },
    { value: 'shipped', label: 'Shipped', icon: Truck },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle },
  ]

  useEffect(() => {
    fetchOrders()
  }, [currentPage])

  // Refresh orders when component mounts (useful after redirect from checkout)
  useEffect(() => {
    console.log('📄 OrdersPage mounted, refreshing orders...')
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter, searchQuery])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await ordersAPI.getAll({ 
        page: currentPage, 
        limit: 10,
        sort: '-createdAt'
      })
      
      if (response.data.success) {
        setOrders(response.data.data.orders || [])
        setTotalPages(response.data.data.pagination?.totalPages || 1)
      } else {
        setOrders([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      actions.setError('Failed to load orders')
      setOrders([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.items.some(item => 
          item.title?.toLowerCase().includes(query) ||
          item.productId?.title?.toLowerCase().includes(query)
        )
      )
    }

    setFilteredOrders(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    const IconComponent = statusOptions.find(option => option.value === status)?.icon || Package
    return <IconComponent className="h-4 w-4" />
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by number or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const IconComponent = option.icon
              const count = option.value === 'all' 
                ? orders.length 
                : orders.filter(order => order.status === option.value).length
              
              return (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === option.value
                      ? 'bg-primary-100 text-primary-800 border border-primary-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{option.label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {orders.length === 0 ? 'No orders yet' : 'No orders found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {orders.length === 0 
                    ? "You haven't placed any orders yet. Start shopping to see your orders here."
                    : "No orders match your current filter criteria."
                  }
                </p>
                {orders.length === 0 && (
                  <Button asChild>
                    <Link to="/products">Start Shopping</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.orderNumber}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(order.pricing?.total || 0)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/order-details/${order._id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Order Items Preview */}
                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center space-x-4">
                        <img
                          src={item.productId?.images?.[0] || '/placeholder-product.jpg'}
                          alt={item.title || 'Product'}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {item.title || item.productId?.title || 'Product'}
                          </h4>
                          <div className="text-xs text-gray-600">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span className="ml-2">Color: {item.color}</span>}
                            <span className="ml-2">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.totalPrice || (item.price * item.quantity))}
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-600 text-center pt-2">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/order-details/${order._id}`}>
                        View Order Details
                      </Link>
                    </Button>
                    
                    {order.status === 'shipped' && order.trackingInfo?.trackingNumber && (
                      <Button variant="outline" size="sm">
                        <Truck className="h-4 w-4 mr-2" />
                        Track Package
                      </Button>
                    )}
                    
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-2" />
                        Write Review
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      Reorder Items
                    </Button>
                    
                    {['pending', 'confirmed'].includes(order.status) && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
