import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function Index() {
  const { session, loading } = useAuth();

  useEffect(() => {
    console.log('[Index] Component mounted');
    console.log('[Index] Loading:', loading);
    console.log('[Index] Session:', session ? 'exists' : 'null');
  }, [session, loading]);

  if (loading) {
    console.log('[Index] Rendering loading state');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Chargement de BuyGo...</Text>
      </View>
    );
  }

  if (session) {
    console.log('[Index] Redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  }

  console.log('[Index] Redirecting to tabs (no auth required)');
  // Redirect to tabs anyway - auth is optional
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
});
