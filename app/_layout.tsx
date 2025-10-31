import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { CartProvider } from '@/contexts/CartContext';
import { HelpProvider } from '@/contexts/HelpContext';
import { SearchProvider } from '@/contexts/SearchContext';
import HelpModal from '@/components/HelpModal';

export default function RootLayout() {
  useFrameworkReady();

  // Inject minimal mobile web fixes
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Update viewport for better mobile experience
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
      }

      // Minimal CSS fixes - only prevent zoom on inputs
      const style = document.createElement('style');
      style.textContent = `
        /* Prevent zoom on input focus (iOS) */
        input, textarea, select {
          font-size: 16px !important;
        }

        /* Better tap handling */
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <LocationProvider>
            <SearchProvider>
              <HelpProvider>
                <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="cart" options={{ headerShown: false }} />
                <Stack.Screen name="cart-test" options={{ headerShown: false }} />
                <Stack.Screen name="checkout" options={{ headerShown: false }} />
                <Stack.Screen name="pro/[slug]" options={{ headerShown: false }} />
                <Stack.Screen name="pro/index" options={{ headerShown: false }} />
                <Stack.Screen name="pro/packages" options={{ headerShown: false }} />
                <Stack.Screen name="pro/dashboard" options={{ headerShown: false }} />
                <Stack.Screen name="pro/create-store" options={{ headerShown: false }} />
                <Stack.Screen name="pro/promote-listing" options={{ headerShown: false }} />
                <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
                <Stack.Screen name="admin/users" options={{ headerShown: false }} />
                <Stack.Screen name="admin/moderation" options={{ headerShown: false }} />
                <Stack.Screen name="admin/financial-stats" options={{ headerShown: false }} />
                <Stack.Screen name="admin/users-management" options={{ headerShown: false }} />
                <Stack.Screen name="admin/cart-management" options={{ headerShown: false }} />
                <Stack.Screen name="legal/privacy" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
                </Stack>
                <HelpModal />
                <StatusBar style="auto" />
              </HelpProvider>
            </SearchProvider>
          </LocationProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
