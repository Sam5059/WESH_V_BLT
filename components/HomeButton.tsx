import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Home } from 'lucide-react-native';

interface HomeButtonProps {
  style?: any;
  label?: string;
}

export default function HomeButton({ style, label = 'Accueil' }: HomeButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.homeButton, style]}
      onPress={() => router.push('/(tabs)')}
      activeOpacity={0.7}
    >
      <Home size={20} color="#2563EB" />
      <Text style={styles.homeButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
});
