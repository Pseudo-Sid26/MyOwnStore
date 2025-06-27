import React from 'react'
import { cn } from '../../lib/utils'

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'border-transparent bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'border-transparent bg-secondary-100 text-secondary-900 hover:bg-secondary-200',
    success: 'border-transparent bg-success-600 text-white hover:bg-success-700',
    destructive: 'border-transparent bg-error-600 text-white hover:bg-error-700',
    warning: 'border-transparent bg-warning-500 text-white hover:bg-warning-600',
    outline: 'text-gray-950 border-gray-200',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  )
})

Badge.displayName = 'Badge'

export { Badge }
