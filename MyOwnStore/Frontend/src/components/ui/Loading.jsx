import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const LoadingSpinner = ({ className, size = 'default', ...props }) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <Loader2
      className={cn('animate-spin', sizes[size], className)}
      {...props}
    />
  )
}

const LoadingOverlay = ({ children, isLoading, className }) => {
  if (!isLoading) return children

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  )
}

const LoadingPage = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <LoadingSpinner size="xl" />
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

export { LoadingSpinner, LoadingOverlay, LoadingPage }
