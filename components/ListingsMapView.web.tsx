import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
} from 'react-native';
import { MapPin, X } from 'lucide-react-native';

interface Listing {
  id: string;
  title: string;
  price: number;
  commune?: string;
  wilaya?: string;
  images?: string[];
  distance?: number | null;
}

interface ListingsMapViewProps {
  listings: Listing[];
  userCommune?: string | null;
  onClose?: () => void;
}

export default function ListingsMapView({
  listings,
  userCommune,
  onClose,
}: ListingsMapViewProps) {
  const openInGoogleMaps = () => {
    const firstListing = listings.find(l => l.commune);
    if (!firstListing?.commune) {
      Linking.openURL('https://www.google.com/maps/search/Alger,+Algeria');
      return;
    }

    const commune = encodeURIComponent(firstListing.commune);
    const wilaya = firstListing.wilaya ? encodeURIComponent(firstListing.wilaya) : 'Alger';
    const url = `https://www.google.com/maps/search/${commune}+${wilaya}+Algeria`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
      )}

      <View style={styles.webContainer}>
        <MapPin size={64} color="#2563EB" />
        <Text style={styles.webTitle}>Vue carte interactive</Text>
        <Text style={styles.webDescription}>
          La carte interactive n'est disponible que sur l'application mobile.
        </Text>
        <TouchableOpacity style={styles.webButton} onPress={openInGoogleMaps}>
          <Text style={styles.webButtonText}>Ouvrir dans Google Maps</Text>
        </TouchableOpacity>
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            {listings.length} annonce{listings.length > 1 ? 's' : ''} disponible{listings.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  webDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 400,
  },
  webButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  webButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statsBar: {
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
});
