import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { X, Navigation, MapIcon, ExternalLink, ChevronLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface MapModalProps {
  visible: boolean;
  onClose: () => void;
  wilaya: string;
  commune?: string;
  title?: string;
}

export default function MapModal({ visible, onClose, wilaya, commune, title }: MapModalProps) {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const wilayaCoordinates: Record<string, { lat: number; lng: number }> = {
    'Alger': { lat: 36.7538, lng: 3.0588 },
    'Oran': { lat: 35.6969, lng: -0.6331 },
    'Constantine': { lat: 36.3650, lng: 6.6147 },
    'Annaba': { lat: 36.9000, lng: 7.7667 },
    'Blida': { lat: 36.4703, lng: 2.8277 },
    'Batna': { lat: 35.5559, lng: 6.1741 },
    'Béjaïa': { lat: 36.7525, lng: 5.0556 },
    'Biskra': { lat: 34.8481, lng: 5.7248 },
    'Béchar': { lat: 31.6167, lng: -2.2167 },
    'Bouira': { lat: 36.3689, lng: 3.9014 },
    'Tamanrasset': { lat: 22.7850, lng: 5.5228 },
    'Tébessa': { lat: 35.4042, lng: 8.1242 },
    'Tlemcen': { lat: 34.8781, lng: -1.3150 },
    'Tiaret': { lat: 35.3708, lng: 1.3228 },
    'Tizi Ouzou': { lat: 36.7119, lng: 4.0478 },
    'Djelfa': { lat: 34.6703, lng: 3.2500 },
    'Jijel': { lat: 36.8200, lng: 5.7667 },
    'Sétif': { lat: 36.1906, lng: 5.4131 },
    'Saïda': { lat: 34.8417, lng: 0.1500 },
    'Skikda': { lat: 36.8781, lng: 6.9089 },
    'Sidi Bel Abbès': { lat: 35.1908, lng: -0.6389 },
    'Guelma': { lat: 36.4628, lng: 7.4331 },
    'Ghardaïa': { lat: 32.4864, lng: 3.6714 },
    'Mostaganem': { lat: 35.9314, lng: 0.0892 },
    'Médéa': { lat: 36.2636, lng: 2.7539 },
    'Mascara': { lat: 35.3961, lng: 0.1403 },
    'Ouargla': { lat: 31.9494, lng: 5.3250 },
    'Oum el Bouaghi': { lat: 35.8753, lng: 7.1139 },
    'El Bayadh': { lat: 33.6806, lng: 1.0194 },
    'Illizi': { lat: 26.5069, lng: 8.4833 },
    'Bordj Bou Arreridj': { lat: 36.0686, lng: 4.7689 },
    'Boumerdès': { lat: 36.7606, lng: 3.4769 },
    'El Tarf': { lat: 36.7672, lng: 8.3139 },
    'Tindouf': { lat: 27.6711, lng: -8.1475 },
    'Tissemsilt': { lat: 35.6050, lng: 1.8103 },
    'El Oued': { lat: 33.3608, lng: 6.8636 },
    'Khenchela': { lat: 35.4361, lng: 7.1433 },
    'Souk Ahras': { lat: 36.2864, lng: 7.9511 },
    'Tipaza': { lat: 36.5894, lng: 2.4475 },
    'Mila': { lat: 36.4503, lng: 6.2642 },
    'Aïn Defla': { lat: 36.2647, lng: 1.9681 },
    'Naâma': { lat: 33.2667, lng: -0.3167 },
    'Aïn Témouchent': { lat: 35.2989, lng: -1.1392 },
    'Laghouat': { lat: 33.8000, lng: 2.8667 },
    'Relizane': { lat: 35.7378, lng: 0.5558 },
    'Chlef': { lat: 36.1647, lng: 1.3347 },
    'M\'Sila': { lat: 35.7017, lng: 4.5450 },
    'Adrar': { lat: 27.8742, lng: -0.2939 },
    'El M\'ghair': { lat: 33.9500, lng: 5.9167 },
    'El Menia': { lat: 30.5833, lng: 2.8833 },
    'Ouled Djellal': { lat: 34.4167, lng: 4.9667 },
    'Bordj Badji Mokhtar': { lat: 21.3333, lng: 0.9500 },
    'Béni Abbès': { lat: 30.1333, lng: -2.1667 },
    'Timimoun': { lat: 29.2500, lng: 0.2333 },
    'Touggourt': { lat: 33.1067, lng: 6.0583 },
    'Djanet': { lat: 24.5542, lng: 9.4847 },
    'In Salah': { lat: 27.1942, lng: 2.4606 },
    'In Guezzam': { lat: 19.5667, lng: 5.7667 },
  };

  const listingCoords = wilayaCoordinates[wilaya] || { lat: 36.7538, lng: 3.0588 };

  useEffect(() => {
    if (visible) {
      getUserLocationFromProfile();
    }
  }, [visible]);

  const getUserLocationFromProfile = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('wilaya_id, commune')
        .eq('id', user.id)
        .single();

      if (error || !profile?.wilaya_id) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
      }

      const { data: wilayaData } = await supabase
        .from('wilayas')
        .select('name, name_ar, name_en')
        .eq('id', profile.wilaya_id)
        .single();

      const userWilayaName = wilayaData?.name || '';
      const userCoords = wilayaCoordinates[userWilayaName];

      if (!userCoords) {
        console.error('Wilaya coordinates not found for:', userWilayaName);
        setLoading(false);
        return;
      }

      const address = profile.commune
        ? `${profile.commune}, ${userWilayaName}`
        : userWilayaName;

      setUserLocation({
        ...userCoords,
        address,
      });

      const calculatedDistance = calculateDistance(
        userCoords.lat,
        userCoords.lng,
        listingCoords.lat,
        listingCoords.lng
      );
      setDistance(calculatedDistance);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location from profile:', error);
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const openInGoogleMaps = async () => {
    const label = encodeURIComponent(commune || wilaya);
    const url = Platform.select({
      ios: `maps:0,0?q=${listingCoords.lat},${listingCoords.lng}(${label})`,
      android: `geo:0,0?q=${listingCoords.lat},${listingCoords.lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${listingCoords.lat},${listingCoords.lng}`,
    });

    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${listingCoords.lat},${listingCoords.lng}`;
        await Linking.openURL(webUrl);
      }
    }
  };

  const openDirections = async () => {
    if (!userLocation) {
      return;
    }

    const url = Platform.select({
      ios: `maps:?saddr=${userLocation.lat},${userLocation.lng}&daddr=${listingCoords.lat},${listingCoords.lng}`,
      android: `google.navigation:q=${listingCoords.lat},${listingCoords.lng}`,
      default: `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${listingCoords.lat},${listingCoords.lng}&travelmode=driving`,
    });

    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${listingCoords.lat},${listingCoords.lng}&travelmode=driving`;
        await Linking.openURL(webUrl);
      }
    }
  };

  const openInWaze = async () => {
    const url = `https://waze.com/ul?ll=${listingCoords.lat},${listingCoords.lng}&navigate=yes`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ChevronLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>📍 Localisation</Text>
            <Text style={styles.headerSubtitle}>
              {commune && `${commune}, `}{wilaya}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Calcul de la distance...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🗺️ Ouvrir dans une application</Text>
              <Text style={styles.sectionDescription}>
                Choisissez votre application de navigation préférée
              </Text>
            </View>

            <View style={styles.mapButtonsContainer}>
              <TouchableOpacity style={styles.mapButton} onPress={openInGoogleMaps}>
                <View style={styles.mapButtonIconContainer}>
                  <MapIcon size={32} color="#4285F4" />
                </View>
                <View style={styles.mapButtonContent}>
                  <Text style={styles.mapButtonTitle}>Google Maps</Text>
                  <Text style={styles.mapButtonDescription}>Voir la localisation</Text>
                </View>
                <ExternalLink size={20} color="#64748B" />
              </TouchableOpacity>

              {userLocation && (
                <TouchableOpacity style={styles.mapButton} onPress={openDirections}>
                  <View style={styles.mapButtonIconContainer}>
                    <Navigation size={32} color="#34A853" />
                  </View>
                  <View style={styles.mapButtonContent}>
                    <Text style={styles.mapButtonTitle}>Itinéraire</Text>
                    <Text style={styles.mapButtonDescription}>
                      Navigation GPS depuis votre position
                    </Text>
                  </View>
                  <ExternalLink size={20} color="#64748B" />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.mapButton} onPress={openInWaze}>
                <View style={styles.mapButtonIconContainer}>
                  <Text style={styles.wazeIcon}>🚗</Text>
                </View>
                <View style={styles.mapButtonContent}>
                  <Text style={styles.mapButtonTitle}>Waze</Text>
                  <Text style={styles.mapButtonDescription}>Ouvrir dans Waze</Text>
                </View>
                <ExternalLink size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📌 Informations</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Wilaya:</Text>
                <Text style={styles.infoValue}>{wilaya}</Text>
              </View>
              {commune && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Commune:</Text>
                  <Text style={styles.infoValue}>{commune}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Coordonnées:</Text>
                <Text style={styles.infoValue}>
                  {listingCoords.lat.toFixed(4)}, {listingCoords.lng.toFixed(4)}
                </Text>
              </View>
            </View>

            {distance !== null && userLocation && (
              <View style={styles.distanceCard}>
                <View style={styles.distanceIconContainer}>
                  <Navigation size={28} color="#2563EB" />
                </View>
                <View style={styles.distanceInfo}>
                  <Text style={styles.distanceLabel}>
                    Distance depuis {userLocation.address || 'votre adresse'}
                  </Text>
                  <Text style={styles.distanceValue}>{distance.toFixed(1)} km</Text>
                </View>
              </View>
            )}

            {!userLocation && user && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertIcon}>ℹ️</Text>
                <View style={styles.infoAlertContent}>
                  <Text style={styles.infoAlertTitle}>Adresse non configurée</Text>
                  <Text style={styles.infoAlertText}>
                    Ajoutez votre adresse dans votre profil pour calculer la distance
                  </Text>
                </View>
              </View>
            )}

            {!user && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertIcon}>🔒</Text>
                <View style={styles.infoAlertContent}>
                  <Text style={styles.infoAlertTitle}>Connexion requise</Text>
                  <Text style={styles.infoAlertText}>
                    Connectez-vous pour calculer la distance depuis votre adresse
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  headerSpacer: {
    width: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  distanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  distanceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceInfo: {
    flex: 1,
  },
  distanceLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  distanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563EB',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  mapButtonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mapButtonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wazeIcon: {
    fontSize: 32,
  },
  mapButtonContent: {
    flex: 1,
  },
  mapButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  mapButtonDescription: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginTop: 16,
    marginBottom: 24,
  },
  infoAlertIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  infoAlertContent: {
    flex: 1,
  },
  infoAlertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  infoAlertText: {
    fontSize: 13,
    color: '#78350F',
    fontWeight: '500',
    lineHeight: 18,
  },
});
