import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LayoutGrid, Package, Heart, MessageCircle, ShoppingBag, Search } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuickAccessMenuProps {
  activeTab?: string;
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function QuickAccessMenu({ activeTab }: QuickAccessMenuProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isWeb = Platform.OS === 'web';

  const menuItems = [
    {
      id: 'categories',
      icon: LayoutGrid,
      label: {
        fr: 'Catégories',
        en: 'Categories',
        ar: 'الفئات',
      },
      route: '/(tabs)/search',
    },
    {
      id: 'my-listings',
      icon: Package,
      label: {
        fr: 'Mes annonces',
        en: 'My listings',
        ar: 'إعلاناتي',
      },
      route: '/my-listings',
    },
    {
      id: 'favorites',
      icon: Heart,
      label: {
        fr: 'Favoris',
        en: 'Favorites',
        ar: 'المفضلة',
      },
      route: '/(tabs)/profile',
    },
    {
      id: 'offers',
      icon: ShoppingBag,
      label: {
        fr: 'Offres',
        en: 'Offers',
        ar: 'العروض',
      },
      route: '/(tabs)/search?listing_type=sale',
      highlight: true,
    },
    {
      id: 'requests',
      icon: Search,
      label: {
        fr: 'Demandes',
        en: 'Requests',
        ar: 'الطلبات',
      },
      route: '/(tabs)/search?listing_type=purchase',
      highlight: true,
    },
  ];

  const getLabel = (item: typeof menuItems[0]) => {
    return item.label[language as keyof typeof item.label] || item.label.fr;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                isActive && styles.menuItemActive,
                item.highlight && styles.menuItemHighlight,
                item.id === 'requests' && styles.menuItemOrange,
              ]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.iconContainerActive,
                item.highlight && styles.iconContainerHighlight,
                item.id === 'requests' && styles.iconContainerOrange,
              ]}>
                <Icon
                  size={20}
                  color={
                    item.id === 'requests'
                      ? '#F97316'
                      : isActive
                        ? '#2563EB'
                        : item.highlight
                          ? '#3B82F6'
                          : '#64748B'
                  }
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </View>
              <Text style={[
                styles.label,
                isActive && styles.labelActive,
                item.highlight && styles.labelHighlight,
                item.id === 'requests' && styles.labelOrange,
              ]}>
                {getLabel(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isMobile ? 12 : 16,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    minWidth: isMobile ? 90 : 110,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemHighlight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  menuItemOrange: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  iconContainer: {
    width: isMobile ? 36 : 40,
    height: isMobile ? 36 : 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainerActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  iconContainerHighlight: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  iconContainerOrange: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  label: {
    fontSize: isMobile ? 11 : 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    maxWidth: isMobile ? 80 : 100,
  },
  labelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  labelHighlight: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  labelOrange: {
    color: '#F97316',
    fontWeight: '700',
  },
});
