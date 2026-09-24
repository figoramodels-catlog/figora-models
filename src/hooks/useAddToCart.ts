import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

/**
 * Adds a product to the cart, requiring a signed-in customer first.
 */
export function useAddToCart() {
  const { user } = useAuth();
  const { add } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (productId: string) => {
      if (!user) {
        showToast('Sign in to add items');
        navigate('/login', { state: { from: location.pathname } });
        return false;
      }
      add(productId);
      showToast('Added to cart');
      return true;
    },
    [user, add, showToast, navigate, location.pathname]
  );
}