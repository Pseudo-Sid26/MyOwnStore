# MyOwnStore Frontend

A modern React + Vite + Tailwind CSS e-commerce frontend application.

## 🚀 Features

- **Modern Tech Stack**: React 19, Vite 7, Tailwind CSS 4
- **Responsive Design**: Mobile-first approach with responsive components
- **State Management**: Context API with custom hooks
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors for API communication
- **Routing**: React Router v6 for navigation
- **UI Components**: Custom component library with Tailwind CSS
- **Icons**: Lucide React for modern icons
- **Type Safety**: PropTypes and JSDoc for better development experience

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   └── Loading.jsx
│   ├── layout/             # Layout components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   └── features/           # Feature-specific components
├── pages/                  # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   └── ...
├── hooks/                  # Custom React hooks
├── services/               # API services
│   └── api.js
├── store/                  # State management
│   └── AppContext.jsx
├── lib/                    # Utility libraries
│   └── utils.js
├── utils/                  # Helper functions
└── assets/                 # Static assets
```

## 🛠️ Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 UI Components

### Button Component
```jsx
import { Button } from './components/ui/Button'

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
<Button variant="primary" size="lg">Click me</Button>
```

### Input Component
```jsx
import { Input } from './components/ui/Input'

<Input type="email" placeholder="Enter email" />
```

### Card Components
```jsx
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

## 🔧 State Management

The application uses React Context for global state management:

```jsx
import { useApp } from './store/AppContext'

function MyComponent() {
  const { state, actions } = useApp()
  
  // Access state
  const { user, cart, isLoading } = state
  
  // Use actions
  actions.setUser(userData)
  actions.addToCart(product)
}
```

## 🌐 API Integration

API services are centralized in `src/services/api.js`:

```jsx
import { authAPI, productsAPI } from '../services/api'

// Login user
const response = await authAPI.login(credentials)

// Get products
const products = await productsAPI.getAll({ page: 1, limit: 10 })
```

## 🎯 Key Features Implemented

### ✅ Authentication System
- Login page with form validation
- JWT token management
- Protected routes
- User context management

### ✅ Product Catalog
- Product listing
- Search functionality
- Category filtering
- Product details

### ✅ Shopping Cart
- Add/remove items
- Quantity management
- Cart persistence
- Coupon system

### ✅ Responsive Layout
- Mobile-first design
- Navigation header
- Footer with links
- Responsive grid layouts

### ✅ UI Components Library
- Consistent design system
- Reusable components
- Tailwind CSS styling
- Loading states

## 🚧 TODO - Next Steps

### Core Pages
- [ ] Register page
- [ ] Product listing page
- [ ] Product detail page
- [ ] Shopping cart page
- [ ] Checkout page
- [ ] Order confirmation page
- [ ] User profile page
- [ ] Order history page

### Advanced Features
- [ ] Search with filters
- [ ] Product recommendations
- [ ] Wishlist functionality
- [ ] Guest checkout
- [ ] Order tracking
- [ ] Reviews and ratings
- [ ] Category navigation

### Enhancements
- [ ] Dark mode toggle
- [ ] PWA functionality
- [ ] Image optimization
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] Error boundaries
- [ ] Loading skeletons

## 🔧 Development Guidelines

### Component Creation
1. Use functional components with hooks
2. Implement proper PropTypes or TypeScript
3. Follow the compound component pattern for complex UI
4. Use Tailwind CSS for styling
5. Implement proper error handling

### State Management
1. Use Context for global state
2. Keep component state local when possible
3. Implement proper loading and error states
4. Use React Query for server state

### Styling
1. Use Tailwind CSS utility classes
2. Follow mobile-first responsive design
3. Maintain consistent spacing and typography
4. Use CSS variables for theme colors

### API Integration
1. Centralize API calls in service files
2. Implement proper error handling
3. Use loading states for better UX
4. Handle authentication tokens properly

## 🚀 Deployment

The application is ready for deployment to any static hosting service:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

Popular deployment options:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🤝 Contributing

1. Follow the established code structure
2. Use ESLint for code quality
3. Test components thoroughly
4. Update documentation as needed

## 📝 Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=MyOwnStore
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
```

## 🎉 What's Done

✅ **Complete Frontend Setup**
- React + Vite + Tailwind CSS configured
- Component library with Button, Input, Card, Badge, Loading
- Layout components (Header, Footer, Layout)
- State management with Context API
- API service integration
- Responsive design system
- Home page with featured products
- Login page with form validation
- Environment configuration

✅ **Backend Integration Ready**
- API service configured for all backend endpoints
- Authentication system integrated
- Cart management connected
- Error handling implemented

The frontend is now ready for development and can be easily extended with additional pages and features!+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
