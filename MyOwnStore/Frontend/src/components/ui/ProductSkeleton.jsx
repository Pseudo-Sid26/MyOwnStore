import React from 'react'
import { Card, CardContent } from './Card'

export const ProductSkeleton = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <Card className="flex flex-row overflow-hidden animate-pulse">
        <div className="w-48 h-32 bg-gray-200 flex-shrink-0"></div>
        <div className="flex-1 p-4 flex justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="space-y-1">
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-full bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export const ProductSkeletonGrid = ({ count = 6, viewMode = 'grid' }) => {
  return (
    <div className={
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
    }>
      {Array.from({ length: count }, (_, i) => (
        <ProductSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  )
}
