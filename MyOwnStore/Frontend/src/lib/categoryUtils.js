// Category-specific attribute and filter configurations

// Category attribute configurations
export const CATEGORY_ATTRIBUTES = {
  Electronics: {
    attributes: [
      { key: 'brand', label: 'Brand', type: 'string' },
      { key: 'warranty', label: 'Warranty', type: 'string' },
      { key: 'color', label: 'Color', type: 'array' },
      { key: 'connectivity', label: 'Connectivity', type: 'array' }
    ],
    specifications: [
      { key: 'powerConsumption', label: 'Power Consumption', type: 'string' },
      { key: 'dimensions', label: 'Dimensions', type: 'string' },
      { key: 'weight', label: 'Weight', type: 'string' },
      { key: 'certifications', label: 'Certifications', type: 'array' }
    ]
  },
  Laptops: {
    attributes: [
      { key: 'brand', label: 'Brand', type: 'string' },
      { key: 'processor', label: 'Processor', type: 'string' },
      { key: 'ram', label: 'RAM', type: 'string' },
      { key: 'storage', label: 'Storage', type: 'string' },
      { key: 'screenSize', label: 'Screen Size', type: 'string' },
      { key: 'operatingSystem', label: 'Operating System', type: 'string' }
    ],
    specifications: [
      { key: 'graphics', label: 'Graphics Card', type: 'string' },
      { key: 'batteryLife', label: 'Battery Life', type: 'string' },
      { key: 'weight', label: 'Weight', type: 'string' },
      { key: 'ports', label: 'Ports', type: 'array' },
      { key: 'wireless', label: 'Wireless', type: 'array' }
    ]
  },
  Mobiles: {
    attributes: [
      { key: 'brand', label: 'Brand', type: 'string' },
      { key: 'operatingSystem', label: 'OS', type: 'string' },
      { key: 'screenSize', label: 'Screen Size', type: 'string' },
      { key: 'storage', label: 'Storage', type: 'string' },
      { key: 'ram', label: 'RAM', type: 'string' },
      { key: 'color', label: 'Color', type: 'array' }
    ],
    specifications: [
      { key: 'camera', label: 'Camera', type: 'string' },
      { key: 'batteryCapacity', label: 'Battery', type: 'string' },
      { key: 'connectivity', label: 'Connectivity', type: 'array' },
      { key: 'sensors', label: 'Sensors', type: 'array' },
      { key: 'waterResistance', label: 'Water Resistance', type: 'string' }
    ]
  },
  Clothing: {
    attributes: [
      { key: 'brand', label: 'Brand', type: 'string' },
      { key: 'size', label: 'Size', type: 'array' },
      { key: 'color', label: 'Color', type: 'array' },
      { key: 'material', label: 'Material', type: 'string' },
      { key: 'fit', label: 'Fit', type: 'string' },
      { key: 'gender', label: 'Gender', type: 'string' }
    ],
    specifications: [
      { key: 'careInstructions', label: 'Care Instructions', type: 'array' },
      { key: 'season', label: 'Season', type: 'string' },
      { key: 'occasion', label: 'Occasion', type: 'array' },
      { key: 'pattern', label: 'Pattern', type: 'string' }
    ]
  },
  Books: {
    attributes: [
      { key: 'author', label: 'Author', type: 'string' },
      { key: 'publisher', label: 'Publisher', type: 'string' },
      { key: 'genre', label: 'Genre', type: 'array' },
      { key: 'language', label: 'Language', type: 'string' },
      { key: 'format', label: 'Format', type: 'string' },
      { key: 'isbn', label: 'ISBN', type: 'string' }
    ],
    specifications: [
      { key: 'pages', label: 'Pages', type: 'number' },
      { key: 'publicationYear', label: 'Publication Year', type: 'number' },
      { key: 'dimensions', label: 'Dimensions', type: 'string' },
      { key: 'weight', label: 'Weight', type: 'string' },
      { key: 'edition', label: 'Edition', type: 'string' }
    ]
  }
}

// Filter configurations for each category
export const CATEGORY_FILTERS = {
  Electronics: [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Samsung', 'Apple', 'Sony', 'LG', 'Panasonic'] },
    { key: 'warranty', label: 'Warranty', type: 'select', options: ['1 Year', '2 Years', '3 Years'] },
    { key: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Silver', 'Blue', 'Red'] }
  ],
  Laptops: [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer'] },
    { key: 'processor', label: 'Processor', type: 'select', options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'AMD Ryzen 5', 'AMD Ryzen 7'] },
    { key: 'ram', label: 'RAM', type: 'select', options: ['4GB', '8GB', '16GB', '32GB'] },
    { key: 'storage', label: 'Storage', type: 'select', options: ['256GB SSD', '512GB SSD', '1TB SSD', '1TB HDD'] }
  ],
  Mobiles: [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi'] },
    { key: 'operatingSystem', label: 'OS', type: 'select', options: ['iOS', 'Android'] },
    { key: 'storage', label: 'Storage', type: 'select', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
    { key: 'ram', label: 'RAM', type: 'select', options: ['4GB', '6GB', '8GB', '12GB'] }
  ],
  Clothing: [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Nike', 'Adidas', 'H&M', 'Zara', 'Uniqlo'] },
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Denim'] }
  ],
  Books: [
    { key: 'author', label: 'Author', type: 'text' },
    { key: 'genre', label: 'Genre', type: 'select', options: ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Biography'] },
    { key: 'language', label: 'Language', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Italian'] },
    { key: 'format', label: 'Format', type: 'select', options: ['Hardcover', 'Paperback', 'E-book', 'Audiobook'] }
  ]
}

// Helper functions
export const getCategoryAttributes = (categoryName) => {
  const config = CATEGORY_ATTRIBUTES[categoryName]
  if (!config) {
    return { attributes: [], specifications: [] }
  }
  return config
}

export const getCategoryFilters = (categoryName) => {
  return CATEGORY_FILTERS[categoryName] || []
}

export const getCategoryDisplayName = (categorySlug) => {
  // Convert slug to display name
  const displayNames = {
    'electronics': 'Electronics',
    'laptops': 'Laptops',
    'mobiles': 'Mobiles',
    'clothing': 'Clothing',
    'books': 'Books'
  }
  return displayNames[categorySlug?.toLowerCase()] || categorySlug
}

export const renderAttributeValue = (value, type) => {
  if (value === null || value === undefined) return 'N/A'
  
  switch (type) {
    case 'array':
      return Array.isArray(value) ? value.join(', ') : value
    case 'number':
      return value.toString()
    case 'string':
    default:
      return value.toString()
  }
}

export const getFilterOptions = (products, filterKey) => {
  const options = new Set()
  
  products.forEach(product => {
    // Check in attributes
    if (product.attributes && product.attributes[filterKey]) {
      const value = product.attributes[filterKey]
      if (Array.isArray(value)) {
        value.forEach(v => options.add(v))
      } else {
        options.add(value)
      }
    }
    
    // Check in specifications
    if (product.specifications && product.specifications[filterKey]) {
      const value = product.specifications[filterKey]
      if (Array.isArray(value)) {
        value.forEach(v => options.add(v))
      } else {
        options.add(value)
      }
    }
    
    // Check in main product fields
    if (product[filterKey]) {
      options.add(product[filterKey])
    }
  })
  
  return Array.from(options).sort()
}
