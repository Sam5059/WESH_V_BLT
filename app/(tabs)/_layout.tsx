import { Tabs, Redirect } from 'expo-router';
import { Home, Search, PlusCircle, MessageCircle, User, Store } from 'lucide-react-native';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TabLayout() {
  const { session, loading } = useAuth();
  const { language } = useLanguage();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <View style={styles.loadingTextContainer}>
          <View style={styles.logoPlaceholder} />
        </View>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'web' ? 68 : 72,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: language === 'ar' ? 'الرئيسية' : language === 'en' ? 'Home' : 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <Home size={size} color={focused ? '#2563EB' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search-new"
        options={{
          title: language === 'ar' ? 'بحث' : language === 'en' ? 'Search' : 'Recherche',
          tabBarIcon: ({ color, size, focused }) => (
            <Search size={size} color={focused ? '#2563EB' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: language === 'ar' ? 'نشر' : language === 'en' ? 'Post' : 'Publier',
          tabBarIcon: ({ color, size, focused }) => (
            <PlusCircle size={size + 4} color={focused ? '#2563EB' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: language === 'ar' ? 'متاجر' : language === 'en' ? 'Stores' : 'Boutiques',
          tabBarIcon: ({ color, size, focused }) => (
            <Store size={size} color={focused ? '#2563EB' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: language === 'ar' ? 'الملف الشخصي' : language === 'en' ? 'Profile' : 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <User size={size} color={focused ? '#2563EB' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="search copy"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingTextContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 40,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
});
