import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, TrendingUp, ArrowRight, Grid, Sparkles, Star, Eye } from 'lucide-react'
import { categoriesAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/Loading'

const CategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { actions } = useApp()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await categoriesAPI.getAll()
        console.log('Categories response:', response.data) // Debug log
        
        // Handle different possible response structures
        setCategories(response.data?.data?.categories || response.data?.categories || response.data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        actions.setError('Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [actions])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative">
            <LoadingSpinner size="xl" />
            <div className="absolute inset-0 animate-ping">
              <div className="w-16 h-16 border-4 border-blue-500 rounded-full opacity-20"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 animate-pulse font-medium">Loading amazing categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Hero Header Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background decorations matching HomePage */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-ping"></div>
          <div className="absolute bottom-32 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="category-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#category-pattern)"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-in-up">
            <Badge className="mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-0 px-6 py-2 text-sm font-semibold">
              <Grid className="h-4 w-4 mr-2" />
              Browse Categories
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Discover
              <br />
              Categories
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Explore our carefully curated selection across all major categories and find exactly what you're looking for
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold">{categories.length}+</div>
                <div className="text-sm opacity-80">Categories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold">{categories.reduce((acc, cat) => acc + (cat.productCount || 0), 0)}+</div>
                <div className="text-sm opacity-80">Products</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold">4.9★</div>
                <div className="text-sm opacity-80">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="max-w-lg mx-auto">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-bounce-in">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No categories available</h3>
              <p className="text-gray-600 mb-8 text-lg">We're working on adding more categories for you</p>
            </div>
          </div>
        ) : (
          <>
            {/* Categories count and title */}
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                All Categories
              </h2>
              <p className="text-lg text-gray-600">
                {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} available
              </p>
            </div>

            {/* Enhanced Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-20 justify-items-center">
              {categories.map((category, index) => (
                <div
                  key={category._id}
                  className="opacity-0 animate-fade-in-up hover-lift"
                  style={{
                    animationDelay: `${Math.min(index * 100, 800)}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <Link to={`/categories/${category._id}`} className="group block">
                    <Card className="text-center p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 border-0 bg-gradient-to-br from-white via-gray-50 to-slate-50 hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 overflow-hidden relative min-h-[280px] group-hover:ring-2 group-hover:ring-blue-200 group-hover:ring-opacity-50">
                      {/* Enhanced background decorations matching HomePage */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-all duration-700 opacity-20 group-hover:opacity-40"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-all duration-500 opacity-15 group-hover:opacity-30"></div>
                      
                      {/* Animated shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                      
                      <CardContent className="relative z-10 space-y-6 flex flex-col items-center justify-center h-full">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-125 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-2xl ${
                          index % 6 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-400 group-hover:to-blue-700' :
                          index % 6 === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600 group-hover:from-purple-400 group-hover:to-purple-700' :
                          index % 6 === 2 ? 'bg-gradient-to-br from-green-500 to-green-600 group-hover:from-green-400 group-hover:to-green-700' :
                          index % 6 === 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600 group-hover:from-orange-400 group-hover:to-orange-700' :
                          index % 6 === 4 ? 'bg-gradient-to-br from-pink-500 to-pink-600 group-hover:from-pink-400 group-hover:to-pink-700' :
                          'bg-gradient-to-br from-indigo-500 to-indigo-600 group-hover:from-indigo-400 group-hover:to-indigo-700'
                        }`}>
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-10 h-10 object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                              {category.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-3 text-center">
                          <h3 className="font-bold text-gray-900 text-xl group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                            {category.description || `Discover amazing ${category.name.toLowerCase()} products and accessories`}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between w-full">
                          <Badge variant="secondary" className="text-xs font-medium bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-300">
                            {category.productCount || Math.floor(Math.random() * 50) + 5} products
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Popular Categories Section */}
        {categories.length > 0 && (
          <section className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Star className="h-4 w-4 mr-2" />
                Popular Categories
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trending Now
              </h2>
              <p className="text-lg text-gray-600">
                Most searched and popular categories this month
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
              {categories.slice(0, 6).map((category, index) => (
                <Link
                  key={`popular-${category._id}`}
                  to={`/categories/${category._id}`}
                  className="group animate-bounce-in hover-lift"
                  style={{
                    animationDelay: `${1000 + index * 150}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 text-center hover:from-blue-100 hover:to-purple-100 transition-all duration-300 hover:shadow-lg transform hover:scale-105 w-[180px]">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                      <span className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-sm">
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {category.productCount || Math.floor(Math.random() * 30) + 5} items
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action Section */}
        <section className="relative py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl text-white overflow-hidden animate-fade-in-up" style={{ animationDelay: '1s' }}>
          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-8 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 right-8 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10 text-center px-8">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-6 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Start Shopping
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Ready to Explore Products?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Browse through thousands of amazing products across all these categories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/products">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Browse All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="bg-white/30 text-white border-2 border-white/80 hover:bg-white hover:text-blue-600 backdrop-blur-sm font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Eye className="mr-2 h-5 w-5" />
                  Back to Home
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CategoriesPage