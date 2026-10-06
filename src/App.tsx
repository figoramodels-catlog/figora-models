import { useEffect, useState } from 'react';
import { HashRouter, Outlet, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
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
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminOrders } from './pages/admin/AdminOrders';
import { Account } from './pages/Account';

function StoreLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <TopNav />
      <Outlet />
      <footer className="mt-auto border-t border-border py-4 text-center">
        <p className="text-[12px] text-muted-foreground">
          Developed by <a href="https://snopiz.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-foreground hover:underline">Snopiz.com</a>
        </p>
      </footer>
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
        <CategoriesProvider>
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
                      <Route path="/account" element={<Account />} />
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
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="orders" element={<AdminOrders />} />
                    </Route>
                  </Routes>
                </HashRouter>
              </ToastProvider>
            </CartProvider>
          </ProductsProvider>
        </CategoriesProvider>
      </AuthProvider>
    </ThemeProvider>);

}