# 🛒 MyOwnStore - Modern E-commerce Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen)](https://myownstore-sooty.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20Vite-blue)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20+%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB-orange)](https://mongodb.com/)

A full-stack e-commerce platform built with modern web technologies, featuring a beautiful user interface, robust backend API, and comprehensive shopping functionality.

## 🌟 Live Demo

**🚀 [Visit MyOwnStore](https://myownstore-sooty.vercel.app/)**

Experience the full functionality of our e-commerce platform including product browsing, cart management, user authentication, and order processing.


## ✨ Features

### 🛍️ **User Features**
- **Product Catalog**: Browse products with advanced filtering and search
- **User Authentication**: Secure registration, login, and profile management
- **Shopping Cart**: Add, remove, and manage items with real-time updates
- **Wishlist**: Save favorite products for later
- **Order Management**: Place orders and track order history
- **Guest Checkout**: Shop without creating an account
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🎨 **User Interface**
- **Modern Design**: Clean, intuitive interface with glassmorphism effects
- **Dark/Light Themes**: Customizable appearance preferences
- **Interactive Animations**: Smooth transitions and hover effects
- **Product Grid/List Views**: Multiple viewing options for products
- **Advanced Search**: Real-time search with auto-suggestions
- **Category Filtering**: Browse products by categories

### 🔧 **Admin Features**
- **Product Management**: Add, edit, and delete products
- **Category Management**: Organize products into categories
- **Order Management**: View and process customer orders
- **User Management**: Manage customer accounts and permissions
- **Analytics Dashboard**: Track sales and user activity

### 🚀 **Technical Features**
- **RESTful API**: Well-structured backend with comprehensive endpoints
- **Authentication & Authorization**: JWT-based secure authentication
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error management
- **Performance Optimization**: Lazy loading and code splitting
- **SEO Friendly**: Optimized for search engines

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18+ with Hooks
- **Build Tool**: Vite for fast development and builds
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for beautiful icons
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios for API communication
- **Animations**: CSS transitions and Tailwind animations

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Express Validator
- **Security**: CORS, Rate Limiting, Input Sanitization
- **File Upload**: Multer for image handling

### **Development Tools**
- **Package Manager**: npm
- **Code Formatting**: Prettier
- **Linting**: ESLint
- **Version Control**: Git
- **Deployment**: Vercel (Frontend), MongoDB Atlas (Database)

## 📁 Project Structure

```
MyOwnStore/
├── 📁 Frontend/                 # React frontend application
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   │   ├── 📁 layout/      # Layout components (Header, Footer)
│   │   │   └── 📁 ui/          # UI components (Button, Card, Input)
│   │   ├── 📁 pages/           # Route components
│   │   ├── 📁 services/        # API service functions
│   │   ├── 📁 store/           # Context and state management
│   │   ├── 📁 lib/             # Utility functions
│   │   ├── 📁 assets/          # Images and static files
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── vite.config.js          # Vite configuration
│   └── README.md               # Frontend documentation
│
├── 📁 Backend/                  # Node.js backend application
│   ├── 📁 config/              # Configuration files
│   ├── 📁 controllers/         # Route controllers
│   ├── 📁 middleware/          # Custom middleware
│   ├── 📁 models/              # MongoDB models
│   ├── 📁 routes/              # API routes
│   ├── 📁 tests/               # Test files
│   ├── server.js               # Main server file
│   ├── package.json            # Backend dependencies
│   ├── API_DOCUMENTATION.md    # API documentation
│   └── README.md               # Backend documentation
│
├── README.md                   # Main project documentation
├── package.json                # Root package configuration
└── .gitignore                  # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MongoDB** (v4.4 or higher) or MongoDB Atlas account
- **Git** for version control

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/MyOwnStore.git
cd MyOwnStore

# Install root dependencies
npm install

# Install frontend dependencies
cd Frontend
npm install

# Install backend dependencies
cd ../Backend
npm install
```

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/MyOwnStore.git
cd MyOwnStore
```

### 2. Backend Setup
```bash
cd Backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# See Configuration section below
```

### 3. Frontend Setup
```bash
cd ../Frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
```

### 4. Database Setup
```bash
# If using local MongoDB
mongod --dbpath /path/to/your/db

# Or use MongoDB Atlas (recommended)
# Create account at https://cloud.mongodb.com
# Create cluster and get connection string
```

## ⚙️ Configuration

### Backend Environment Variables
Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/myownstore
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myownstore

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

```

### Frontend Environment Variables
Create a `.env` file in the `Frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
# For production:
# VITE_API_URL=https://your-backend-url.com/api

# App Configuration
VITE_APP_NAME=MyOwnStore
VITE_APP_VERSION=1.0.0

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

## 🏃‍♂️ Usage

### Development Mode

1. **Start the Backend Server**
```bash
cd Backend
npm run dev
# Server will run on http://localhost:5000
```

2. **Start the Frontend Development Server**
```bash
cd Frontend
npm run dev
# Application will run on http://localhost:3000
```

3. **Access the Application**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- API Documentation: `http://localhost:5000/api-docs` (if implemented)

### Production Mode

```bash
# Build frontend for production
cd Frontend
npm run build

# Start backend in production mode
cd ../Backend
npm start
```

### Available Scripts

#### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

#### Backend Scripts
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm test             # Run tests
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

## 📚 API Documentation

The backend provides a comprehensive RESTful API. Here are the main endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get single order


## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Build the Frontend**
```bash
cd Frontend
npm run build
```

2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

3. **Environment Variables**
Set the following in Vercel dashboard:
- `VITE_API_URL`: Your backend API URL

### Backend Deployment Options

#### Option 1: Render
1. Create account on [Render](https://render.com)
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

#### Option 2: Railway
1. Create account on [Railway](https://railway.app)
2. Connect GitHub repository
3. Configure environment variables
4. Deploy


### Database Deployment
Use [MongoDB Atlas](https://cloud.mongodb.com) for production database:
1. Create cluster
2. Set up database user
3. Configure network access
4. Get connection string
5. Update environment variables

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/AmazingFeature
```
3. **Commit your changes**
```bash
git commit -m 'Add some AmazingFeature'
```
4. **Push to the branch**
```bash
git push origin feature/AmazingFeature
```
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting


### 🙏 **Acknowledgments**
- Thanks to all contributors who helped build this project
- Inspired by modern e-commerce platforms
- Special thanks to the open-source community


## 📞 Support

If you have any questions, issues, or suggestions:

### 🐛 **Bug Reports**
- Check existing [Issues](https://github.com/YourUsername/MyOwnStore/issues)
- Create new issue with detailed description
- Include steps to reproduce the problem

### 💡 **Feature Requests**
- Open an issue with "Feature Request" label
- Describe the feature and its benefits
- Provide mockups or examples if possible

### 📧 **Contact**
- **Email**: support@myownstore.com
- **Discord**: [Join our community](https://discord.gg/myownstore)
- **Twitter**: [@MyOwnStore](https://twitter.com/myownstore)


---


<div align="center">

**⭐ Don't forget to star this repository if you found it helpful! ⭐**

**🚀 [Visit Live Demo](https://myownstore-sooty.vercel.app/) | 📚 [Documentation](docs/) | 🐛 [Report Bug](issues/)**

**Made with ❤️ by the MyOwnStore Team**

</div>
