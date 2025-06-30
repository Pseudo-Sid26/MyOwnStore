import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Heart } from 'lucide-react'
import { authAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/Loading'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { actions } = useApp()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const response = await authAPI.login(data)

      console.log('Login response:', response.data) // Debug log

      if (response.data.success) {
        const { user, token } = response.data.data

        console.log('Login successful:', { user, token }) // Debug log

        // Store token and user data
        localStorage.setItem('token', token) // Don't stringify token
        localStorage.setItem('user', JSON.stringify(user))

        // Use the login action (now async) and wait for cart sync
        console.log('🔄 Starting login process with cart sync...')
        await actions.login(user, token)
        console.log('✅ Login process completed, including cart sync')
        
        actions.setSuccess('Login successful!')
        navigate('/')
      } else {
        setError('root', { message: response.data.message || 'Login failed' })
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'An error occurred during login'
      setError('root', { message: errorMessage })
      actions.setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl opacity-20 animate-bounce slow"></div>
        <div className="absolute bottom-32 left-1/3 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full blur-xl opacity-25 animate-ping slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-full blur-3xl opacity-15"></div>
      </div>

      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="login-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#login-pattern)" className="text-blue-600"/>
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          {/* Header Section */}
          <div className="text-center animate-fade-in">
            <div className="mb-6">
              {/* Logo/Icon */}
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                <Lock className="h-7 w-7 text-white" />
              </div>
              
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-base text-gray-600">
                Sign in to continue your shopping journey
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-slide-in-from-bottom overflow-hidden">
            {/* Card background decoration */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            </div>

            <CardHeader className="relative z-10 text-center pb-4">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Sign In
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">Access your account</p>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0 pb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                    Email address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className={`pl-10 h-11 border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg ${
                        errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center animate-fade-in">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password')}
                      className={`pl-10 pr-12 h-11 border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg ${
                        errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 flex items-center animate-fade-in">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Root Error */}
                {errors.root && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-3 animate-fade-in">
                    <p className="text-sm text-red-700 font-medium flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {errors.root.message}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing you in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                {/* Register Link */}
                <div className="text-center py-3">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Guest Checkout */}
                <Link to="/guest-checkout" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full h-10 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-lg transition-all duration-300 hover:shadow-md"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Continue as Guest
                  </Button>
                </Link>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-2 animate-fade-in-delay-1">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-gray-700 transition-colors duration-200">
                Privacy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-gray-700 transition-colors duration-200">
                Terms
              </Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-gray-700 transition-colors duration-200">
                Support
              </Link>
            </div>
            <p className="text-xs text-gray-400">
              Protected by industry-standard security
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage