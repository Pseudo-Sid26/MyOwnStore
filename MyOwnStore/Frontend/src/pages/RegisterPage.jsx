import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react'
import { authAPI } from '../services/api'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/Loading'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { actions } = useApp()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const { confirmPassword, ...registerData } = data
      const response = await authAPI.register(registerData)
      
      if (response.data.success) {
        const { user, token } = response.data.data
        
        // Store token and user data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Use the login action and wait for cart sync
        await actions.login(user, token)
        actions.setSuccess('Registration successful!')
        navigate('/')
      } else {
        setError('root', { message: response.data.message || 'Registration failed' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 'An error occurred during registration'
      setError('root', { message: errorMessage })
      actions.setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-full blur-2xl opacity-20 animate-bounce slow"></div>
        <div className="absolute bottom-32 left-1/3 w-32 h-32 bg-gradient-to-br from-green-100 to-purple-100 rounded-full blur-xl opacity-25 animate-ping slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-100 to-indigo-100 rounded-full blur-3xl opacity-15"></div>
      </div>

      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="register-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#register-pattern)" className="text-purple-600"/>
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4">
          {/* Header Section */}
          <div className="text-center animate-fade-in">
            <div className="mb-4">
              {/* Logo/Icon */}
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg hover:scale-110 transition-transform duration-300">
                <UserPlus className="h-7 w-7 text-white" />
              </div>
              
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Join MyOwnStore
              </h1>
              <p className="text-base text-gray-600">
                Create your account and start shopping
              </p>
            </div>
          </div>

          {/* Register Card */}
          <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-slide-in-from-bottom overflow-hidden">
            {/* Card background decoration */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            </div>

            <CardHeader className="relative z-10 text-center pb-3">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <p className="text-gray-600 text-sm mt-1">Join our community today</p>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0 pb-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* Name Field */}
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      {...register('name')}
                      className={`pl-10 h-10 border-2 transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg ${
                        errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-600 flex items-center animate-fade-in">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                    Email address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className={`pl-10 h-10 border-2 transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg ${
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
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...register('password')}
                      className={`pl-10 pr-12 h-10 border-2 transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg ${
                        errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Create a password"
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

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                      className={`pl-10 pr-12 h-10 border-2 transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg ${
                        errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center animate-fade-in">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2 py-1">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors duration-200"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors duration-200">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors duration-200">
                      Privacy Policy
                    </Link>
                  </label>
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
                  className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center py-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-bold text-purple-600 hover:text-purple-700 transition-colors duration-200 hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
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
              Secure registration with industry-standard encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage