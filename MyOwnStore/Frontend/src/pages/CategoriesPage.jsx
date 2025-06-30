import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categoriesAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Card, CardContent } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/Loading'
import { Search, ShoppingBag } from 'lucide-react'

const CategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { actions } = useApp()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://localhost:5000/api/categories')
        const data = await response.json()
        console.log('Categories response:', data) // Debug log
        
        setCategories(data.data?.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        actions.setError('Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [actions])

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Browse Categories
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our wide range of product categories to find exactly what you're looking for.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Link
              key={category._id}
              to={`/categories/${category._id}`}
              className="group"
            >
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <CardContent className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    ) : (
                      <ShoppingBag className="h-10 w-10 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.description || 'Explore this category'}
                    </p>
                    {category.productCount && (
                      <p className="text-xs text-gray-500 mt-1">
                        {category.productCount} products
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Popular Categories Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={`popular-${category._id}`}
              to={`/categories/${category._id}`}
              className="group"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-center hover:from-blue-100 hover:to-purple-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-lg font-bold text-blue-600">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoriesPage