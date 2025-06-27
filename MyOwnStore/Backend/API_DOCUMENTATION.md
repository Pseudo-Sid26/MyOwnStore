# MyOwnStore API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

## Product Discovery Endpoints

### Search Products
```http
GET /products/search?query=phone&category=electronics&minPrice=100&maxPrice=1000
```

### Get Search Suggestions
```http
GET /products/search/suggestions?q=iph
```

### Get Product Recommendations
```http
GET /products/{productId}/recommendations
```

### Get Product Alternatives
```http
GET /products/{productId}/alternatives
```

## Product Management

### Get All Products
```http
GET /products?page=1&limit=10&category=electronics&brand=Apple
```

### Get Product by ID
```http
GET /products/{productId}
```

## Category Endpoints

### Get All Categories
```http
GET /categories
```

### Get Products by Category
```http
GET /products?category=electronics
```

## Cart Management (Requires Authentication)

### Add to Cart
```http
POST /cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 2,
  "size": "L"
}
```

### Get Cart
```http
GET /cart
Authorization: Bearer {token}
```

### Update Cart Item
```http
PUT /cart/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 3
}
```

### Apply Coupon
```http
POST /cart/coupon/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "couponCode": "SAVE10"
}
```

## Order Management (Requires Authentication)

### Create Order from Cart
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "shippingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "postalCode": "12345",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "card",
  "notes": "Please handle with care"
}
```

### Get User Orders
```http
GET /orders
Authorization: Bearer {token}
```

### Get Order by ID
```http
GET /orders/{orderId}
Authorization: Bearer {token}
```

### Cancel Order
```http
PUT /orders/{orderId}/cancel
Authorization: Bearer {token}
```

## Order Tracking (Public)

### Track Order by Order Number
```http
GET /orders/{orderNumber}/track
```

## Guest Checkout

### Create Guest Order
```http
POST /guest/order
Content-Type: application/json

{
  "guestName": "Jane Guest",
  "guestEmail": "jane@example.com",
  "guestPhone": "+1234567890",
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 1,
      "size": "M"
    }
  ],
  "shippingAddress": {
    "fullName": "Jane Guest",
    "addressLine1": "456 Oak Ave",
    "city": "Another City",
    "state": "NY",
    "postalCode": "67890",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "paypal",
  "couponCode": "WELCOME5"
}
```

### Get Guest Order
```http
GET /guest/order/{orderNumber}
```

### Get Guest Orders by Email
```http
POST /guest/orders
Content-Type: application/json

{
  "email": "jane@example.com"
}
```

## Review System

### Create Review (Requires Authentication)
```http
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id_here",
  "rating": 5,
  "comment": "Excellent product!"
}
```

### Get Product Reviews
```http
GET /reviews/product/{productId}?page=1&limit=10
```

## Admin Endpoints (Requires Admin Role)

### Update Order Status
```http
PUT /orders/{orderId}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "shipped",
  "notes": "Package shipped via FedEx"
}
```

### Update Order Tracking
```http
PUT /orders/{orderId}/tracking
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "trackingNumber": "1234567890",
  "carrier": "FedEx",
  "trackingUrl": "https://fedex.com/track?number=1234567890",
  "notes": "Tracking information updated"
}
```

### Get Order Statistics
```http
GET /orders/admin/stats
Authorization: Bearer {admin_token}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors if applicable
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Payment Methods Supported

- `card` - Credit/Debit Card
- `paypal` - PayPal
- `stripe` - Stripe
- `cash` - Cash on Delivery

## Order Status Flow

1. `pending` - Order created, awaiting confirmation
2. `confirmed` - Order confirmed, preparing for processing
3. `processing` - Order being prepared/packed
4. `shipped` - Order shipped with tracking
5. `delivered` - Order delivered to customer
6. `cancelled` - Order cancelled

## Coupon Types

- `percentage` - Percentage discount (e.g., 10% off)
- `fixed` - Fixed amount discount (e.g., $5 off)
