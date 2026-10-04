import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('about', 'routes/about.tsx'),
  route('services', 'routes/services.tsx'),
  route('contact', 'routes/contac.tsx'),
  route('products', 'routes/products.tsx'),
  route('products/:productId', 'routes/product-detail.tsx'),
  route('booking', 'routes/booking.tsx'),
  route('login', 'routes/login.tsx'),
  route('account', 'routes/account.tsx'),
  route('portal/*', 'routes/portal.tsx')
] satisfies RouteConfig
