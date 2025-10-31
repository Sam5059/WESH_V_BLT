import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  listing_id: string;
  quantity: number;
  listing: {
    id: string;
    title: string;
    price: number;
    images: string[];
    user_id: string;
    listing_type: string;
    wilaya: string;
    category_id: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (listingId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.listing.price * item.quantity), 0);

  const refreshCart = async () => {
    if (!user) {
      console.log('[CART v2] No user, clearing cart');
      setCartItems([]);
      return;
    }

    console.log('[CART v2] ===== REFRESHING CART =====');
    console.log('[CART v2] User ID:', user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          listing_id,
          quantity,
          listing:listings(
            id,
            title,
            price,
            images,
            user_id,
            listing_type,
            wilaya,
            category_id
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('[CART v2] Error fetching cart:', error);
        throw error;
      }
      console.log('[CART v2] ===== CART DATA LOADED =====');
      console.log('[CART v2] Items count:', data?.length || 0);
      console.log('[CART v2] Raw data:', JSON.stringify(data, null, 2));
      setCartItems(data || []);
    } catch (error) {
      console.error('[CART v2] Error fetching cart:', error);
    } finally {
      setLoading(false);
      console.log('[CART v2] Loading finished');
    }
  };

  const addToCart = async (listingId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error('Must be logged in to add items to cart');
    }

    try {
      const existingItem = cartItems.find(item => item.listing_id === listingId);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            listing_id: listingId,
            quantity
          });

        if (error) throw error;
        await refreshCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    // IMPORTANT: Bloquer la quantité à 1 pour tous les produits (articles uniques)
    const finalQuantity = 1;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: finalQuantity })
        .eq('id', cartItemId);

      if (error) throw error;
      await refreshCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
