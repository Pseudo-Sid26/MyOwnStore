import React from 'react'
import { getCategoryAttributes, renderAttributeValue, getCategoryDisplayName } from '../../lib/categoryUtils'
import { Badge } from './Badge'

const ProductAttributes = ({ product, variant = 'full' }) => {
  if (!product?.categoryId?.name) return null

  const categoryName = product.categoryId.name // Use direct name instead of display name conversion
  const { attributes: attributeConfig, specifications: specConfig } = getCategoryAttributes(categoryName)

  const renderSection = (title, data, config, showIcon = true) => {
    if (!data || Object.keys(data).length === 0) return null

    const relevantItems = config.filter(item => data[item.key])
    if (relevantItems.length === 0) return null

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 flex items-center">
          {showIcon && <span className="mr-2">📋</span>}
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {relevantItems.map(({ key, label, type }) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{label}:</span>
              <span className="text-sm font-medium text-gray-900">
                {type === 'array' && Array.isArray(data[key]) ? (
                  <div className="flex flex-wrap gap-1">
                    {data[key].map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  renderAttributeValue(data[key], type)
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    // Show only key attributes for product cards
    const keyAttributes = attributeConfig.slice(0, 3)
    const relevantItems = keyAttributes.filter(item => product.attributes?.[item.key])
    
    if (relevantItems.length === 0) return null

    return (
      <div className="space-y-2">
        {relevantItems.map(({ key, label, type }) => (
          <div key={key} className="flex justify-between text-xs">
            <span className="text-gray-500">{label}:</span>
            <span className="text-gray-700 font-medium">
              {renderAttributeValue(product.attributes[key], type)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Attributes */}
      {renderSection('Key Features', product.attributes, attributeConfig)}
      
      {/* Specifications */}
      {renderSection('Specifications', product.specifications, specConfig, false)}
      
      {/* Sizes (if applicable) */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📏</span>
            Available Sizes
          </h4>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {size}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🏷️</span>
            Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductAttributes
