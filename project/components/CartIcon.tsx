import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useCart } from '@/contexts/CartContext';

interface CartIconProps {
  size?: number;
  color?: string;
}

export default function CartIcon({ size = 24, color = '#1E293B' }: CartIconProps) {
  const { cartCount } = useCart();

  console.log('[CART ICON v2] Rendering - Cart count:', cartCount);

  const handlePress = () => {
    console.log('[CART ICON v2] ===== CLICKED =====');
    console.log('[CART ICON v2] Current cart count:', cartCount);
    console.log('[CART ICON v2] Navigating to /cart...');
    router.push('/cart');
    console.log('[CART ICON v2] Navigation called');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      style={styles.container}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ShoppingCart size={size} color={color} />
      {cartCount > 0 && (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>
            {cartCount > 99 ? '99+' : cartCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
