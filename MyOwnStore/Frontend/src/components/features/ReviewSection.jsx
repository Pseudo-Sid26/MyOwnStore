import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, MessageCircle, Flag, Edit, Trash2 } from 'lucide-react'
import { reviewsAPI } from '../../services/api'
import { useApp } from '../../store/AppContext'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { LoadingSpinner } from '../ui/Loading'
import { formatDate } from '../../lib/utils'

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('newest')
  const [ratingFilter, setRatingFilter] = useState('')
  const [ratingDistribution, setRatingDistribution] = useState({})
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const { state, actions } = useApp()

  useEffect(() => {
    fetchReviews()
  }, [productId, currentPage, sortBy, ratingFilter])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        sort: sortBy,
        ...(ratingFilter && { rating: ratingFilter })
      }
      
      const response = await reviewsAPI.getByProduct(productId, params)
      const data = response.data.data
      
      setReviews(data.reviews || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setRatingDistribution(data.ratingDistribution || {})
      setAverageRating(data.averageRating || 0)
      setTotalReviews(data.totalReviews || 0)
      
    } catch (error) {
      console.error('Error fetching reviews:', error)
      actions.setError('Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handleRatingFilter = (rating) => {
    setRatingFilter(rating === ratingFilter ? '' : rating)
    setCurrentPage(1)
  }

  const handleHelpful = async (reviewId) => {
    if (!state.user) {
      actions.setError('Please login to mark reviews as helpful')
      return
    }

    try {
      await reviewsAPI.toggleHelpful(reviewId)
      fetchReviews() // Refresh reviews
      actions.setSuccess('Thank you for your feedback!')
    } catch (error) {
      actions.setError('Failed to update review')
    }
  }

  const RatingStars = ({ rating, size = 'sm' }) => {
    const starSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const RatingDistribution = () => (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = ratingDistribution[rating] || 0
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
        
        return (
          <button
            key={rating}
            onClick={() => handleRatingFilter(rating)}
            className={`w-full flex items-center space-x-2 p-2 rounded hover:bg-gray-50 ${
              ratingFilter === rating.toString() ? 'bg-blue-50 border border-blue-200' : ''
            }`}
          >
            <span className="text-sm font-medium">{rating}</span>
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{count}</span>
          </button>
        )
      })}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            {state.user && (
              <Button 
                onClick={() => setShowWriteReview(true)}
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <RatingStars rating={Math.round(averageRating)} size="lg" />
              <p className="text-sm text-gray-600 mt-1">
                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-900 mb-3">Rating Breakdown</h4>
              <RatingDistribution />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        {ratingFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRatingFilter('')}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your thoughts about this product.
            </p>
            {state.user && (
              <Button onClick={() => setShowWriteReview(true)}>
                Write First Review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard 
              key={review._id} 
              review={review} 
              onHelpful={handleHelpful}
              currentUser={state.user}
              onRefresh={fetchReviews}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1
            if (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-2">...</span>
            }
            return null
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Write Review Modal */}
      {showWriteReview && (
        <WriteReviewModal
          productId={productId}
          onClose={() => setShowWriteReview(false)}
          onSuccess={() => {
            setShowWriteReview(false)
            fetchReviews()
            actions.setSuccess('Review submitted successfully!')
          }}
        />
      )}
    </div>
  )
}

const ReviewCard = ({ review, onHelpful, currentUser, onRefresh }) => {
  const [showActions, setShowActions] = useState(false)

  const isOwner = currentUser && currentUser.id === review.userId._id

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    
    try {
      await reviewsAPI.delete(review._id)
      onRefresh()
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {review.userId.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{review.userId.name}</h4>
              <div className="flex items-center space-x-2">
                <RatingStars rating={review.rating} />
                <span className="text-sm text-gray-600">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>

        {review.comment && (
          <p className="text-gray-700 mb-4 leading-relaxed">
            {review.comment}
          </p>
        )}

        {review.verified && (
          <Badge variant="secondary" className="mb-3">
            ✓ Verified Purchase
          </Badge>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => onHelpful(review._id)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            disabled={!currentUser}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Helpful ({review.helpful || 0})</span>
          </button>

          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
            <Flag className="h-4 w-4" />
            <span>Report</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

const WriteReviewModal = ({ productId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      setIsSubmitting(true)
      await reviewsAPI.create({
        productId,
        rating,
        comment: comment.trim()
      })
      onSuccess()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your thoughts about this product..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/1000 characters
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const RatingStars = ({ rating, size = 'sm' }) => {
  const starSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

export default ReviewSection
export { RatingStars }
