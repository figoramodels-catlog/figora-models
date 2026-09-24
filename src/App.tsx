import { useEffect, useState } from 'react';
import { HashRouter, Outlet, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoadingScreen } from './components/LoadingScreen';
import { TopNav } from './components/TopNav';
import { CartDrawer } from './components/CartDrawer';
import { RequireAdmin } from './components/RequireAdmin';
import { AdminLayout } from './components/admin/AdminLayout';
import { Catalogue } from './pages/Catalogue';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';

function StoreLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <TopNav />
      <Outlet />
      <CartDrawer />
    </div>);

}

interface AppProps {
  /** Default theme before the visitor has picked one */
  initialTheme?: 'dark' | 'light';
  /** Play the brand loading animation on open */
  showLoadingScreen?: boolean;
}

export function App({
  initialTheme = 'dark',
  showLoadingScreen = true
}: AppProps) {
  const [loading, setLoading] = useState(showLoadingScreen);

  useEffect(() => {
    if (!showLoadingScreen) return;
    const timeout = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [showLoadingScreen]);

  return (
    <ThemeProvider defaultTheme={initialTheme}>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <ToastProvider>
              <HashRouter>
                <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>
                <Routes>
                  <Route element={<StoreLayout />}>
                    <Route path="/" element={<Catalogue />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Catalogue />} />
                  </Route>
                  <Route
                    path="/admin"
                    element={
                    <RequireAdmin>
                        <AdminLayout />
                      </RequireAdmin>
                    }>
                    
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                  </Route>
                </Routes>
              </HashRouter>
            </ToastProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>);

}