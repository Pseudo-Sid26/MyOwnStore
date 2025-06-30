import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  Shield, 
  Zap,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  Users,
  Gift
} from 'lucide-react'
import { productsAPI, categoriesAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardFooter } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/Loading'
import { formatPrice } from '../lib/utils'

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState({})
  const [currentSlide, setCurrentSlide] = useState(0)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const { actions } = useApp()

  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }))
  }

  // Hero slides data
  const heroSlides = [
    {
      id: 1,
      title: "Latest Smartphones",
      subtitle: "Up to 50% Off",
      description: "Discover cutting-edge technology and premium mobile devices",
      gradient: "from-blue-600 via-purple-600 to-indigo-700",
      accent: "from-cyan-400 to-blue-500",
      icon: "📱",
      cta: "Shop Phones",
      link: "/products"
    },
    {
      id: 2,
      title: "Premium Laptops",
      subtitle: "Best Performance",
      description: "Powerful laptops for work, gaming, and creative professionals",
      gradient: "from-emerald-600 via-teal-600 to-cyan-700",
      accent: "from-green-400 to-emerald-500",
      icon: "💻",
      cta: "Explore Laptops",
      link: "/categories"
    },
    {
      id: 3,
      title: "Athletic Footwear",
      subtitle: "Step Up Your Game",
      description: "Comfort meets style in our premium athletic shoe collection",
      gradient: "from-orange-600 via-red-600 to-pink-700",
      accent: "from-orange-400 to-red-500",
      icon: "👟",
      cta: "Shop Shoes",
      link: "/products"
    }
  ]

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  // Update the useEffect to handle correct data structure:
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const [productsResponse, categoriesResponse] = await Promise.all([
          productsAPI.getAll({ limit: 8, featured: true }),
          categoriesAPI.getAll()
        ])

        console.log('Products response:', productsResponse.data)
        console.log('Categories response:', categoriesResponse.data)

        // ✅ Fix: Access the correct nested data structure
        setFeaturedProducts(productsResponse.data.data?.products || [])
        setCategories(categoriesResponse.data.data?.categories || [])

      } catch (error) {
        console.error('Error fetching homepage data:', error)
        actions.setError('Failed to load homepage data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [actions])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <LoadingSpinner size="xl" />
            <div className="absolute inset-0 animate-ping">
              <div className="w-16 h-16 border-4 border-blue-500 rounded-full opacity-20"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 animate-pulse font-medium">Crafting your perfect shopping experience...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Slider Section */}
      <section className="relative h-screen max-h-[800px] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'translate-x-0 opacity-100' : 
                index < currentSlide ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
              }`}
            >
              {/* Creative Background with Gradient and Shapes */}
              <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} relative overflow-hidden`}>
                {/* Animated Background Shapes */}
                <div className="absolute inset-0">
                  <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute top-40 right-32 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-bounce slow"></div>
                  <div className="absolute bottom-32 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl animate-ping slow"></div>
                  <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                {/* Geometric Patterns */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id={`pattern-${slide.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1" fill="white" opacity="0.3"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill={`url(#pattern-${slide.id})`}/>
                  </svg>
                </div>

                {/* Content Container */}
                <div className="relative z-20 h-full flex items-center">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      {/* Left Content */}
                      <div className="text-white">
                        <div className="transform translate-y-8 opacity-0 animate-fadeInUp" style={{
                          animation: index === currentSlide ? 'fadeInUp 1s ease-out 0.5s forwards' : 'none'
                        }}>
                          <Badge className={`mb-6 bg-gradient-to-r ${slide.accent} text-white border-0 px-6 py-2 text-sm font-semibold`}>
                            <Gift className="h-4 w-4 mr-2" />
                            {slide.subtitle}
                          </Badge>
                          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                            {slide.title}
                          </h1>
                          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-lg">
                            {slide.description}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Link to={slide.link}>
                              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                {slide.cta}
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </Button>
                            </Link>
                            <Link to="/categories">
                              <Button size="lg" className="bg-transparent border-2 border-white/50 text-white hover:bg-white hover:text-gray-900 backdrop-blur-sm font-semibold px-8 py-4 rounded-full transition-all duration-300">
                                Browse Categories
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Right Creative Visual */}
                      <div className="hidden lg:flex justify-center items-center">
                        <div className="relative">
                          {/* Main Icon Circle */}
                          <div className={`w-80 h-80 bg-gradient-to-br ${slide.accent} rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-1000 ${
                            index === currentSlide ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
                          }`}>
                            <span className="text-9xl filter drop-shadow-lg">
                              {slide.icon}
                            </span>
                          </div>

                          {/* Orbiting Elements */}
                          <div className={`absolute inset-0 animate-spin-slow ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                              <Star className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                              <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                              <TrendingUp className="h-7 w-7 text-white" />
                            </div>
                            <div className="absolute top-1/2 -left-8 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                              <Heart className="h-5 w-5 text-white" />
                            </div>
                          </div>

                          {/* Floating Cards */}
                          <div className={`absolute -top-12 -right-12 transform transition-all duration-1000 delay-300 ${
                            index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                          }`}>
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-white border border-white/30">
                              <div className="text-2xl font-bold">50%</div>
                              <div className="text-sm opacity-80">OFF</div>
                            </div>
                          </div>

                          <div className={`absolute -bottom-12 -left-12 transform transition-all duration-1000 delay-500 ${
                            index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                          }`}>
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-white border border-white/30">
                              <div className="text-2xl font-bold">4.9★</div>
                              <div className="text-sm opacity-80">Rating</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Floating stats */}
        <div className="absolute bottom-20 right-8 z-30 hidden lg:flex flex-col space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white border border-white/20">
            <div className="text-2xl font-bold">{categories.length}+</div>
            <div className="text-sm opacity-80">Categories</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white border border-white/20">
            <div className="text-2xl font-bold">{featuredProducts.length * 125}+</div>
            <div className="text-sm opacity-80">Products</div>
          </div>
        </div>
      </section>

      {/* Services Bar */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-blue-400" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-400" />
              <span>24/7 Customer Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <span>Secure Payment Guaranteed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-400" />
              <span>30-Day Money Back</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending Categories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our carefully curated selection across all major categories
            </p>
          </div>

          <div className="flex justify-center items-center">
            <div className="w-full max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {categories.slice(0, 10).map((category, index) => (
                  <Link
                    key={category._id}
                    to={`/categories/${category._id}`}
                    className="group"
                  >
                    <Card className="text-center p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 border-0 bg-gradient-to-br from-white via-gray-50 to-slate-50 hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 overflow-hidden relative min-h-[220px] group-hover:ring-2 group-hover:ring-blue-200 group-hover:ring-opacity-50">
                      {/* Enhanced background decorations */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-all duration-700 opacity-20 group-hover:opacity-40"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-all duration-500 opacity-15 group-hover:opacity-30"></div>
                      
                      {/* Animated shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                      
                      <CardContent className="relative z-10 space-y-4 flex flex-col items-center justify-center h-full">
                        <div className={`w-18 h-18 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-125 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-2xl ${
                          index % 6 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-400 group-hover:to-blue-700' :
                          index % 6 === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600 group-hover:from-purple-400 group-hover:to-purple-700' :
                          index % 6 === 2 ? 'bg-gradient-to-br from-green-500 to-green-600 group-hover:from-green-400 group-hover:to-green-700' :
                          index % 6 === 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600 group-hover:from-orange-400 group-hover:to-orange-700' :
                          index % 6 === 4 ? 'bg-gradient-to-br from-pink-500 to-pink-600 group-hover:from-pink-400 group-hover:to-pink-700' :
                          'bg-gradient-to-br from-indigo-500 to-indigo-600 group-hover:from-indigo-400 group-hover:to-indigo-700'
                        }`}>
                          <span className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                            {category.description || `Educational and entertainment content for all ages`}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-300">
                          {category.productCount || Math.floor(Math.random() * 10) + 2} items
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/categories">
              <Button size="lg" variant="outline" className="px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 border-2">
                View All Categories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16">
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Star className="h-4 w-4 mr-2" />
                Editor's Choice
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Handpicked products that our customers love most
              </p>
            </div>
            <Link to="/products" className="hidden md:block">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <Card 
                key={product._id} 
                className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 bg-white overflow-hidden relative"
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="aspect-square overflow-hidden relative">
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={imageErrors[product._id] ? '/placeholder-product.jpg' : (product.images?.[0] || '/placeholder-product.jpg')}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={() => handleImageError(product._id)}
                    />
                  </Link>
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Action buttons */}
                  <div className={`absolute top-4 right-4 flex flex-col space-y-2 transform transition-all duration-300 ${
                    hoveredProduct === product._id ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-red-500 transition-all duration-300 shadow-lg">
                      <Heart className="h-4 w-4" />
                    </button>
                    <Link to={`/products/${product._id}`}>
                      <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-blue-500 transition-all duration-300 shadow-lg">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                  
                  {/* Quick add button */}
                  <div className={`absolute bottom-4 left-4 right-4 transform transition-all duration-500 ${
                    hoveredProduct === product._id ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}>
                    <Button
                      className="w-full bg-white/95 text-gray-900 hover:bg-white font-semibold rounded-full shadow-xl backdrop-blur-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        actions.addToCart(product)
                        actions.setSuccess(`${product.title} added to cart!`)
                      }}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Quick Add
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1 rounded-full shadow-lg">
                        SALE
                      </Badge>
                    )}
                    {index < 2 && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-3 py-1 rounded-full shadow-lg">
                        NEW
                      </Badge>
                    )}
                  </div>

                  {/* Discount percentage */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-lg leading-tight line-clamp-2">
                        {product.title}
                      </h3>
                    </Link>
                    
                    {product.brand && (
                      <p className="text-sm text-gray-500 font-medium">
                        {product.brand}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2 font-medium">
                          {product.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.reviewCount || 0} reviews
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="text-center mt-12 md:hidden">
            <Link to="/products">
              <Button size="lg" className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Shop With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the difference with our premium shopping features and customer-first approach
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Search className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">1</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Smart Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered search and intelligent filters help you find exactly what you're looking for in seconds.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <TrendingUp className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">2</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Best Prices</h3>
              <p className="text-gray-600 leading-relaxed">
                Competitive pricing with price matching, exclusive member discounts, and seasonal sales.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Truck className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">3</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Lightning Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Same-day delivery in major cities, express shipping options, and real-time package tracking.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">4</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Secure & Safe</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level security, encrypted payments, fraud protection, and 30-day money-back guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-6 py-2">
              <Users className="h-4 w-4 mr-2" />
              Join Our Community
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Ready to Start Your
              <br />
              Shopping Journey?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Join millions of satisfied customers and discover amazing products with exclusive member benefits
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-bold px-10 py-5 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg">
                  <Gift className="mr-3 h-6 w-6" />
                  Create Free Account
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/30 text-white border-2 border-white/80 hover:bg-white hover:text-blue-600 backdrop-blur-sm font-bold px-10 py-5 rounded-full transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Eye className="mr-3 h-6 w-6" />
                  Continue as Guest
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5" />
                <span>Exclusive member deals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Priority support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage