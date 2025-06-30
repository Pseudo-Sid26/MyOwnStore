import React from 'react'
import { CheckCircle, X, Package, Calendar, RefreshCw } from 'lucide-react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal'
import { Button } from './Button'
import { formatPrice } from '../../lib/utils'

const OrderCancellationSuccessModal = ({ 
  isOpen, 
  onClose, 
  order,
  onViewOrders,
  onContinueShopping 
}) => {
  if (!order) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <ModalHeader>
        <div className="text-center">
          {/* Animated Success Icon */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
            <CheckCircle className="h-10 w-10 text-green-600 animate-pulse" />
          </div>
          
          {/* Title with gradient */}
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-3">
            Order Cancelled Successfully!
          </h3>
          
          {/* Subtitle */}
          <p className="text-gray-600 leading-relaxed">
            Your order has been cancelled successfully. Your payment will be refunded within 3-5 business days.
          </p>
        </div>
      </ModalHeader>

      <ModalBody>
        {/* Order Details Card with subtle animation */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-5 mb-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">Order #{order.orderNumber}</h4>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(order.pricing?.total || order.totalAmount || 0)}
              </p>
              <p className="text-sm text-gray-600">
                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* Order Items Preview with improved styling */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3">
              <div className="border-t border-gray-200 pt-3">
                <h5 className="text-sm font-medium text-gray-800 mb-3">Cancelled Items:</h5>
              </div>
              {order.items.slice(0, 2).map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.title || item.productId?.title || 'Product'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                      {item.size && ` • Size: ${item.size}`}
                      {item.color && ` • Color: ${item.color}`}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.totalPrice || (item.price * item.quantity))}
                  </p>
                </div>
              ))}
              
              {order.items.length > 2 && (
                <p className="text-sm text-gray-600 text-center py-2 bg-gray-50 rounded-lg">
                  +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Refund Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
          <div className="flex items-center mb-3">
            <RefreshCw className="h-5 w-5 text-blue-600 mr-2" />
            <h5 className="font-semibold text-blue-900">Refund Information</h5>
          </div>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Your payment will be refunded to the original payment method
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Refund processing time: 3-5 business days
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              You'll receive an email confirmation once the refund is processed
            </li>
          </ul>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onViewOrders}
            className="flex-1 hover:bg-gray-50 transition-colors"
          >
            View All Orders
          </Button>
          <Button
            onClick={onContinueShopping}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
          >
            Continue Shopping
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default OrderCancellationSuccessModal
