import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Crown, ArrowLeft, Home } from 'lucide-react-native';

interface ProHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  variant?: 'gradient' | 'solid';
}

export default function ProHeader({
  title,
  subtitle,
  showBackButton = true,
  showHomeButton = true,
  variant = 'gradient'
}: ProHeaderProps) {
  const HeaderComponent = variant === 'gradient' ? LinearGradient : View;
  const gradientProps = variant === 'gradient' ? {
    colors: ['#1E40AF', '#3B82F6', '#60A5FA'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  } : {};

  return (
    <HeaderComponent
      {...(variant === 'gradient' ? gradientProps : {})}
      style={[
        styles.header,
        variant === 'solid' && styles.headerSolid
      ]}
    >
      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {showHomeButton && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.7}
          >
            <Home size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Header Content */}
      <View style={styles.headerContent}>
        <View style={styles.crownContainer}>
          <Crown size={32} color="#FFD700" strokeWidth={2.5} />
        </View>

        <Text style={styles.title}>{title}</Text>

        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}

        {/* PRO Badge */}
        <View style={styles.badge}>
          <Crown size={14} color="#FFD700" strokeWidth={3} />
          <Text style={styles.badgeText}>PRO</Text>
        </View>
      </View>

      {/* Decorative Wave */}
      <View style={styles.wave} />
    </HeaderComponent>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerSolid: {
    backgroundColor: '#2563EB',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  wave: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
