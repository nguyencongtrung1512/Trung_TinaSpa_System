import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('about', 'routes/about.tsx'),
  route('products', 'routes/products.tsx'),
  route('products/:productId', 'routes/product-detail.tsx'),
  route('booking', 'routes/booking.tsx'),
  route('login', 'routes/login.tsx')
] satisfies RouteConfig
