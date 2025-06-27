import { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext'; // Changed from useAppContext to useApp
import { productsAPI } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingPage } from '../components/ui/Loading';

const DealsPage = () => {
  const { actions } = useApp(); // Changed from destructuring addToCart to getting actions
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ onSale: true });
      setDeals(response.data.products || []);
    } catch (err) {
      setError('Failed to load deals');
      console.error('Error fetching deals:', err);
      actions.setError('Failed to load deals'); // Added proper error handling
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      actions.addToCart(product, 1); // Changed to use actions.addToCart with product object
      actions.setSuccess('Product added to cart!'); // Added success message
    } catch (error) {
      console.error('Failed to add to cart:', error);
      actions.setError('Failed to add product to cart');
    }
  };

  const calculateDiscount = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const filteredDeals = deals.filter(deal => {
    if (filter === 'all') return true;
    if (filter === 'electronics') return deal.category?.name === 'Electronics';
    if (filter === 'clothing') return deal.category?.name === 'Clothing';
    if (filter === 'home') return deal.category?.name === 'Home & Garden';
    return true;
  });

  if (loading) return <LoadingPage message="Loading deals..." />; // Fixed Loading component

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDeals}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🔥 Hot Deals & Special Offers
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Limited time offers - Don't miss out on these amazing deals!
        </p>
        
        {/* Deal Counter */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 inline-block">
          <p className="text-red-700 font-semibold">
            ⏰ Flash Sale Ends in: 
            <span className="ml-2 text-xl font-bold">23:45:32</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { value: 'all', label: 'All Deals' },
            { value: 'electronics', label: 'Electronics' },
            { value: 'clothing', label: 'Clothing' },
            { value: 'home', label: 'Home & Garden' }
          ].map(filterOption => (
            <Button
              key={filterOption.value}
              variant={filter === filterOption.value ? 'primary' : 'outline'}
              onClick={() => setFilter(filterOption.value)}
              className="mb-2"
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Banner Deal */}
      {filteredDeals.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-3xl font-bold mb-2">Deal of the Day</h2>
              <p className="text-xl mb-2">{filteredDeals[0].name}</p>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">${filteredDeals[0].salePrice || filteredDeals[0].price}</span>
                {filteredDeals[0].salePrice && (
                  <>
                    <span className="text-xl line-through text-gray-300">
                      ${filteredDeals[0].price}
                    </span>
                    <Badge variant="success" className="text-lg px-3 py-1">
                      {calculateDiscount(filteredDeals[0].price, filteredDeals[0].salePrice)}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <div className="text-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleAddToCart(filteredDeals[0])}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Grab This Deal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals found</h3>
          <p className="text-gray-600">Check back later for amazing offers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDeals.map(deal => (
            <Card key={deal._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={deal.images?.[0] || '/api/placeholder/300/200'}
                  alt={deal.name}
                  className="w-full h-48 object-cover"
                />
                {deal.salePrice && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 left-2 text-white font-bold"
                  >
                    {calculateDiscount(deal.price, deal.salePrice)}% OFF
                  </Badge>
                )}
                {deal.stock < 10 && (
                  <Badge
                    variant="warning"
                    className="absolute top-2 right-2"
                  >
                    Only {deal.stock} left!
                  </Badge>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {deal.name}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      ${deal.salePrice || deal.price}
                    </span>
                    {deal.salePrice && (
                      <span className="text-sm line-through text-gray-500">
                        ${deal.price}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-yellow-500">
                    {'★'.repeat(Math.floor(deal.rating || 4))}
                    <span className="text-gray-600 text-sm ml-1">
                      ({deal.reviewCount || 0})
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {deal.description}
                </p>

                <Button
                  onClick={() => handleAddToCart(deal)}
                  className="w-full"
                  disabled={deal.stock === 0}
                >
                  {deal.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Never Miss a Deal!
        </h3>
        <p className="text-gray-600 mb-6">
          Subscribe to our newsletter and be the first to know about exclusive offers and flash sales.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button>Subscribe</Button>
        </div>
      </div>
    </div>
  );
};

export default DealsPage;