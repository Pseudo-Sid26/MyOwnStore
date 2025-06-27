# MyOwnStore Backend

A Node.js/Express backend API for the MyOwnStore e-commerce application.

## Features

- RESTful API with Express.js
- MongoDB integration with Mongoose
- Authentication with JWT
- Security with Helmet and CORS
- Environment variable management
- Organized project structure

## Project Structure

```
Backend/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore file
├── routes/            # API routes
│   ├── auth.js        # Authentication routes
│   ├── products.js    # Product routes
│   ├── cart.js        # Cart routes
│   ├── orders.js      # Order routes
│   ├── reviews.js     # Review routes
│   ├── categories.js  # Category routes
│   └── guest.js       # Guest checkout routes
├── models/            # Database models
├── controllers/       # Route controllers
├── middleware/        # Custom middleware
├── config/            # Configuration files
└── tests/             # Test files and scripts
    ├── test-*.js      # Feature test files
    ├── debug-*.js     # Debug utilities
    ├── check-data.js  # Data validation script
    └── README.md      # Test documentation
```

## Getting Started

1. **Install dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Start the production server:**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (Admin)

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `BCRYPT_ROUNDS` - Bcrypt hashing rounds

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Helmet for security
- CORS for cross-origin requests
- dotenv for environment variables

## Testing

The backend includes comprehensive tests located in the `tests/` folder.

### Running Tests

```bash
# Test database connection and models
npm run test-db

# Test authentication
npm run test-auth

# Test products functionality
npm run test-products

# Test cart operations
npm run test-cart

# Test order management
npm run test-orders

# Test review system
npm run test-reviews

# Test latest features (guest orders, search)
npm run test-latest

# Run comprehensive test suite
npm run test-comprehensive

# Check database data
npm run check-data
```

### Test Requirements

1. Start the server: `npm start` or `node server.js`
2. Ensure MongoDB is running
3. Tests will create test data automatically

See `tests/README.md` for detailed test documentation.
