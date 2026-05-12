import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Public pages (lazy)
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Categories = lazy(() => import('./pages/Categories'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Nosotros = lazy(() => import('./pages/Nosotros'));
const Envios = lazy(() => import('./pages/Envios'));
const Contacto = lazy(() => import('./pages/Contacto'));

// Admin pages (lazy)
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminBanners = lazy(() => import('./pages/admin/Banners'));
const AdminStock = lazy(() => import('./pages/admin/Stock'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminConfig = lazy(() => import('./pages/admin/SiteConfig'));

function PublicLayout() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function Loading() {
  return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><Home /></Suspense> },
      { path: 'productos', element: <Suspense fallback={<Loading />}><Catalog /></Suspense> },
      { path: 'productos/:slug', element: <Suspense fallback={<Loading />}><ProductDetail /></Suspense> },
      { path: 'categorias', element: <Suspense fallback={<Loading />}><Categories /></Suspense> },
      { path: 'categorias/:slug', element: <Suspense fallback={<Loading />}><CategoryPage /></Suspense> },
      { path: 'carrito', element: <Suspense fallback={<Loading />}><Cart /></Suspense> },
      { path: 'checkout', element: <Suspense fallback={<Loading />}><Checkout /></Suspense> },
      { path: 'orden/:id', element: <Suspense fallback={<Loading />}><OrderConfirmation /></Suspense> },
      { path: 'nosotros', element: <Suspense fallback={<Loading />}><Nosotros /></Suspense> },
      { path: 'envios', element: <Suspense fallback={<Loading />}><Envios /></Suspense> },
      { path: 'contacto', element: <Suspense fallback={<Loading />}><Contacto /></Suspense> },
    ],
  },
  { path: '/admin/login', element: <Suspense fallback={<Loading />}><AdminLogin /></Suspense> },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Suspense fallback={<Loading />}><AdminDashboard /></Suspense> },
          { path: 'productos', element: <Suspense fallback={<Loading />}><AdminProducts /></Suspense> },
          { path: 'productos/nuevo', element: <Suspense fallback={<Loading />}><AdminProductForm /></Suspense> },
          { path: 'productos/:id', element: <Suspense fallback={<Loading />}><AdminProductForm /></Suspense> },
          { path: 'categorias', element: <Suspense fallback={<Loading />}><AdminCategories /></Suspense> },
          { path: 'banners', element: <Suspense fallback={<Loading />}><AdminBanners /></Suspense> },
          { path: 'stock', element: <Suspense fallback={<Loading />}><AdminStock /></Suspense> },
          { path: 'ordenes', element: <Suspense fallback={<Loading />}><AdminOrders /></Suspense> },
          { path: 'ordenes/:id', element: <Suspense fallback={<Loading />}><AdminOrderDetail /></Suspense> },
          { path: 'config', element: <Suspense fallback={<Loading />}><AdminConfig /></Suspense> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
