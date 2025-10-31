import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, X } from 'lucide-react-native';
import { router } from 'expo-router';

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
  const mapRef = useRef<MapView>(null);

  // Centre par défaut: Alger
  const defaultRegion = {
    latitude: 36.7538,
    longitude: 3.0588,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  useEffect(() => {
    if (mapRef.current && listings.length > 0) {
      const coordinates = listings
        .filter((l) => l.commune)
        .map((l) => ({
          latitude: getCommuneLatitude(l.commune!),
          longitude: getCommuneLongitude(l.commune!),
        }))
        .filter((c) => c.latitude !== 0 && c.longitude !== 0);

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [listings]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleMarkerPress = (listing: Listing) => {
    router.push(`/listing/${listing.id}`);
  };

  return (
    <View style={styles.container}>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
      )}

      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={defaultRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {listings.map((listing) => {
          if (!listing.commune) return null;

          const latitude = getCommuneLatitude(listing.commune);
          const longitude = getCommuneLongitude(listing.commune);

          if (latitude === 0 || longitude === 0) return null;

          return (
            <Marker
              key={listing.id}
              coordinate={{ latitude, longitude }}
              onPress={() => handleMarkerPress(listing)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <MapPin size={20} color="#FFFFFF" />
                </View>
                <View style={styles.markerCallout}>
                  <Text style={styles.markerPrice} numberOfLines={1}>
                    {formatPrice(listing.price)}
                  </Text>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {listings.length} annonce{listings.length > 1 ? 's' : ''} sur la carte
        </Text>
      </View>
    </View>
  );
}

// Coordonnées approximatives des principales communes algériennes
function getCommuneLatitude(commune: string): number {
  const coordinates: Record<string, number> = {
    'Alger Centre': 36.7538,
    'Bab El Oued': 36.7840,
    'Hydra': 36.7456,
    'El Biar': 36.7644,
    'Kouba': 36.7267,
    'Bir Mourad Raïs': 36.7333,
    'Bab Ezzouar': 36.7161,
    'Dar El Beïda': 36.6911,
    'Rouiba': 36.8008,
    'Reghaia': 36.8519,
    'Bachdjerrah': 36.7456,
    'Hussein Dey': 36.7247,
    'Cheraga': 36.7522,
    'Dely Ibrahim': 36.7833,
    'Baraki': 36.7000,
    'Oran': 35.6969,
    'Bir El Djir': 35.7500,
    'Es Senia': 35.6500,
    'Sidi Chami': 35.6333,
    'Aïn El Turck': 35.7000,
    'Oued Tlélat': 35.7833,
    'Blida': 36.4803,
    'Boufarik': 36.5167,
    'Bougara': 36.6167,
    'Mouzaia': 36.4500,
    'Bouinan': 36.5500,
    'Tizi Ouzou': 36.7167,
    'Draa Ben Khedda': 36.7333,
    'Azazga': 36.7833,
    'Aïn El Hammam': 36.7167,
    'Tigzirt': 36.8000,
    'Béjaïa': 36.7525,
    'Akbou': 36.6833,
    'El Kseur': 36.7167,
    'Amizour': 36.6333,
    'Seddouk': 36.7000,
    'Constantine': 36.3650,
    'El Khroub': 36.3333,
    'Aïn Smara': 36.3833,
    'Hamma Bouziane': 36.4167,
    'Didouche Mourad': 36.3500,
    'Annaba': 36.9000,
    'El Bouni': 36.8833,
    'El Hadjar': 36.8500,
    'Berrahal': 36.9167,
    'Sétif': 36.1900,
    'El Eulma': 36.1833,
    'Aïn Oulmène': 36.3500,
    'Bougaa': 36.1167,
    'Bouira': 36.3744,
    'Lakhdaria': 36.4667,
    'Aïn Bessem': 36.3500,
    'Aïn Defla': 36.2639,
    'Khemis Miliana': 36.3167,
    'El Attaf': 36.3500,
    'Médéa': 36.2667,
    'Berrouaghia': 36.3333,
    'Ksar El Boukhari': 36.4667,
    'Chlef': 36.1650,
    'Oued Fodda': 36.2667,
    'Ténès': 36.1833,
    'Tlemcen': 34.8781,
    'Mansourah': 34.9333,
    'Chetouane': 34.8667,
    'Maghnia': 34.9000,
    'Tiaret': 35.3711,
    'Sougueur': 35.4167,
    'Medroussa': 35.3833,
    'Laghouat': 33.8069,
    'Aflou': 34.0833,
    'Ouargla': 31.9489,
    'Hassi Messaoud': 31.7833,
    'Touggourt': 32.9167,
    'Ghardaïa': 32.4917,
    'Berriane': 32.8667,
    'Metlili': 32.2167,
    'Adrar': 27.8667,
    'Reggane': 28.0333,
    'Tamanrasset': 22.7850,
    'In Salah': 23.6167,
  };

  return coordinates[commune] || 0;
}

function getCommuneLongitude(commune: string): number {
  const coordinates: Record<string, number> = {
    'Alger Centre': 3.0588,
    'Bab El Oued': 3.0470,
    'Hydra': 3.0293,
    'El Biar': 3.0383,
    'Kouba': 3.0833,
    'Bir Mourad Raïs': 3.0500,
    'Bab Ezzouar': 3.1489,
    'Dar El Beïda': 3.1644,
    'Rouiba': 3.1117,
    'Reghaia': 3.1778,
    'Bachdjerrah': 3.0756,
    'Hussein Dey': 3.1150,
    'Cheraga': 2.9900,
    'Dely Ibrahim': 2.9667,
    'Baraki': 3.2000,
    'Oran': -0.6331,
    'Bir El Djir': -0.6167,
    'Es Senia': -0.5833,
    'Sidi Chami': -0.5000,
    'Aïn El Turck': -0.7000,
    'Oued Tlélat': -0.6333,
    'Blida': 2.8279,
    'Boufarik': 2.9333,
    'Bougara': 2.9500,
    'Mouzaia': 2.7333,
    'Bouinan': 2.7833,
    'Tizi Ouzou': 4.0500,
    'Draa Ben Khedda': 4.0833,
    'Azazga': 4.2500,
    'Aïn El Hammam': 4.2333,
    'Tigzirt': 4.0333,
    'Béjaïa': 5.0556,
    'Akbou': 5.0833,
    'El Kseur': 4.9833,
    'Amizour': 4.8333,
    'Seddouk': 4.7667,
    'Constantine': 6.6147,
    'El Khroub': 6.6667,
    'Aïn Smara': 6.7167,
    'Hamma Bouziane': 6.5833,
    'Didouche Mourad': 6.5667,
    'Annaba': 7.7667,
    'El Bouni': 7.7167,
    'El Hadjar': 7.8000,
    'Berrahal': 7.6833,
    'Sétif': 5.4100,
    'El Eulma': 5.4667,
    'Aïn Oulmène': 5.3667,
    'Bougaa': 5.5500,
    'Bouira': 3.9000,
    'Lakhdaria': 3.8500,
    'Aïn Bessem': 3.7833,
    'Aïn Defla': 1.9681,
    'Khemis Miliana': 2.0333,
    'El Attaf': 1.7833,
    'Médéa': 2.7500,
    'Berrouaghia': 2.8167,
    'Ksar El Boukhari': 2.6833,
    'Chlef': 1.3350,
    'Oued Fodda': 1.3000,
    'Ténès': 1.2500,
    'Tlemcen': -1.3150,
    'Mansourah': -1.3667,
    'Chetouane': -1.2500,
    'Maghnia': -1.4667,
    'Tiaret': 1.3228,
    'Sougueur': 1.3833,
    'Medroussa': 1.2500,
    'Laghouat': 2.8639,
    'Aflou': 2.9167,
    'Ouargla': 5.3250,
    'Hassi Messaoud': 5.4167,
    'Touggourt': 6.1167,
    'Ghardaïa': 3.6739,
    'Berriane': 3.7000,
    'Metlili': 3.7833,
    'Adrar': -0.2833,
    'Reggane': -0.5000,
    'Tamanrasset': 5.5228,
    'In Salah': 2.8833,
  };

  return coordinates[commune] || 0;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  map: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: '#2563EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerCallout: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  markerPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  statsBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
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
