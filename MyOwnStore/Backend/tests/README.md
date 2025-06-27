# MyOwnStore Backend Tests

This folder contains all test files, debugging utilities, and data checking scripts for the MyOwnStore backend API.

## Test Files

### Core Feature Tests
- `test-auth.js` - Tests user authentication (register, login, profile, password change)
- `test-products.js` - Tests product CRUD operations, search, filtering
- `test-cart.js` - Tests cart management (add, update, remove, coupon application)
- `test-orders.js` - Tests order creation, management, and status updates
- `test-reviews.js` - Tests product review and rating system
- `test-category.js` - Tests category CRUD operations

### Specialized Tests
- `test-db.js` - Tests database connection and model validation
- `test-products-basic.js` - Basic product functionality tests
- `test-latest-changes.js` - Tests the most recent features (guest orders, search suggestions)
- `test-comprehensive.js` - Complete end-to-end test suite for all features

### Debug Utilities
- `debug-auth.js` - Authentication debugging and troubleshooting
- `debug-admin.js` - Admin functionality debugging
- `debug-products.js` - Product-related debugging
- `debug-search.js` - Search functionality debugging

### Data Management
- `check-data.js` - Checks database state and creates test data if needed

## Running Tests

### Using npm scripts:
```bash
npm run test-db          # Test database connection
npm run test-auth        # Test authentication
npm run test-products    # Test products
npm run test-cart        # Test cart functionality
npm run test-orders      # Test orders
npm run test-reviews     # Test reviews
npm run test-latest      # Test latest changes
npm run test-comprehensive  # Run comprehensive test suite
npm run check-data       # Check and setup test data
```

### Running directly:
```bash
node tests/test-auth.js
node tests/test-products.js
node tests/test-comprehensive.js
```

## Test Requirements

1. **Server must be running** on port 5000 before running most tests
2. **MongoDB must be connected** and accessible
3. **Test data** will be created automatically if not present

## Test Data

The tests will automatically create test data including:
- Test user accounts
- Sample products
- Test categories
- Sample coupons

## Test Coverage

✅ **Authentication**: Register, login, JWT validation, admin roles  
✅ **Products**: CRUD, search, filtering, recommendations  
✅ **Categories**: CRUD operations, slug generation  
✅ **Cart**: Add/remove items, quantity updates, coupon application  
✅ **Orders**: Creation, status tracking, cancellation, admin management  
✅ **Reviews**: Create, update, delete, rating aggregation  
✅ **Guest Checkout**: Guest order creation and tracking  
✅ **Search**: Suggestions, autocomplete, filtering  
✅ **Payment**: Multiple payment method support (placeholder)  
✅ **Coupons**: Apply discounts, validation, usage limits  

## Expected Results

All tests should pass with ✅ indicators. Any ❌ indicates an issue that needs investigation.

## Debugging

If tests fail:
1. Check server is running (`node server.js`)
2. Verify database connection
3. Run `npm run check-data` to ensure test data exists
4. Use debug scripts for specific issues
5. Check server logs for error details
