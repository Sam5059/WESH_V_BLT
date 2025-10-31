import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X, Calendar, MapPin, Clock, DollarSign } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';
import CommuneAutocomplete from './CommuneAutocomplete';

interface ReservationModalProps {
  visible: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    price: number;
    user_id: string;
    category_slug?: string;
    subcategory_slug?: string;
  };
  onSuccess: () => void;
}

export default function ReservationModal({
  visible,
  onClose,
  listing,
  onSuccess,
}: ReservationModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedWilayaName, setSelectedWilayaName] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Déterminer le type de bien selon la catégorie
  const getItemType = () => {
    const category = listing.category_slug || '';

    if (category.includes('immobilier') || category.includes('location-immobiliere')) {
      return {
        name: 'bien',
        title: 'Réserver ce bien',
        locationLabel: 'Dates de location',
        pickupLabel: 'Lieu de visite',
        dropoffLabel: 'Adresse du bien',
      };
    }

    if (category.includes('vehicule') || category.includes('automobile') ||
        category.includes('moto') || category.includes('location-vehicules')) {
      return {
        name: 'véhicule',
        title: 'Réserver ce véhicule',
        locationLabel: 'Dates de location',
        pickupLabel: 'Lieu de prise en charge',
        dropoffLabel: 'Lieu de retour',
      };
    }

    if (category.includes('vacances') || category.includes('location-vacances')) {
      return {
        name: 'logement',
        title: 'Réserver ce logement',
        locationLabel: 'Dates du séjour',
        pickupLabel: 'Date d\'arrivée',
        dropoffLabel: 'Date de départ',
      };
    }

    // Par défaut
    return {
      name: 'article',
      title: 'Réserver cet article',
      locationLabel: 'Dates de location',
      pickupLabel: 'Lieu de récupération',
      dropoffLabel: 'Lieu de retour',
    };
  };

  const itemType = getItemType();

  // Charger les wilayas
  useEffect(() => {
    loadWilayas();
  }, []);

  const loadWilayas = async () => {
    try {
      const { data, error } = await supabase
        .from('wilayas')
        .select('code, name')
        .order('code');

      if (error) throw error;
      setWilayas(data || []);
    } catch (error) {
      console.error('Error loading wilayas:', error);
    }
  };

  const handleWilayaChange = (code: string) => {
    setSelectedWilaya(code);
    const wilaya = wilayas.find(w => w.code === parseInt(code));
    setSelectedWilayaName(wilaya?.name || '');
    setSelectedCommune(''); // Reset commune quand wilaya change
  };

  // Convertir date JJ/MM/AAAA vers AAAA-MM-JJ
  const convertToISODate = (dateStr: string): string | null => {
    if (!dateStr || dateStr.length !== 10) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Formater input date JJ/MM/AAAA
  const formatDateInput = (text: string, setValue: (val: string) => void) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) {
      setValue(cleaned);
    } else if (cleaned.length <= 4) {
      setValue(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setValue(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const isoStart = convertToISODate(startDate);
    const isoEnd = convertToISODate(endDate);
    if (!isoStart || !isoEnd) return 0;
    const start = new Date(isoStart);
    const end = new Date(isoEnd);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();
  const totalAmount = days * listing.price;

  const handleReserve = async () => {
    setError('');

    // Validation
    if (!startDate || !endDate) {
      setError('Veuillez sélectionner les dates de début et de fin');
      return;
    }

    // Convertir les dates
    const isoStartDate = convertToISODate(startDate);
    const isoEndDate = convertToISODate(endDate);

    if (!isoStartDate || !isoEndDate) {
      setError('Format de date invalide. Utilisez JJ/MM/AAAA');
      return;
    }

    // Vérifier que la date de début n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateObj = new Date(isoStartDate);

    if (startDateObj < today) {
      setError('La date de début ne peut pas être inférieure à aujourd\'hui');
      return;
    }

    if (new Date(isoStartDate) >= new Date(isoEndDate)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    if (days < 1) {
      setError('La réservation doit être d\'au moins 1 jour');
      return;
    }

    if (!selectedWilaya || !selectedCommune) {
      setError('Veuillez sélectionner une wilaya et une commune');
      return;
    }

    try {
      setLoading(true);

      // Vérifier la disponibilité
      const { data: availabilityData, error: availabilityError } = await supabase.rpc(
        'check_vehicle_availability',
        {
          p_listing_id: listing.id,
          p_start_date: isoStartDate,
          p_end_date: isoEndDate,
        }
      );

      if (availabilityError) {
        console.error('Availability check error:', availabilityError);
        setError('Erreur lors de la vérification de disponibilité');
        return;
      }

      if (!availabilityData) {
        setError(`Ce ${itemType.name} n'est pas disponible pour ces dates`);
        return;
      }

      // Obtenir l'ID de l'utilisateur
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Vous devez être connecté pour réserver');
        return;
      }

      // Construire la localisation
      const locationString = [selectedCommune, selectedWilayaName].filter(Boolean).join(', ');

      // Créer la réservation
      const { error: insertError } = await supabase.from('vehicle_reservations').insert({
        user_id: user.id,
        listing_id: listing.id,
        start_date: isoStartDate,
        end_date: isoEndDate,
        total_days: days,
        daily_rate: listing.price,
        total_amount: totalAmount,
        status: 'pending',
        pickup_location: locationString || null,
        dropoff_location: locationString || null,
        notes: notes || null,
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        setError('Erreur lors de la création de la réservation');
        return;
      }

      // Succès
      if (Platform.OS === 'web') {
        alert('Réservation créée avec succès ! Le propriétaire va la confirmer.');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Reservation error:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setSelectedWilaya('');
    setSelectedCommune('');
    setNotes('');
    setError('');
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{itemType.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Nom du bien */}
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle}>{listing.title}</Text>
              <View style={styles.priceInfo}>
                <DollarSign size={16} color="#10B981" />
                <Text style={styles.priceText}>{listing.price.toLocaleString()} DA / jour</Text>
              </View>
            </View>

            {/* Dates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Calendar size={16} color="#2563EB" /> {itemType.locationLabel}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date de début *</Text>
                <View style={styles.inputWithHelper}>
                  <TextInput
                    style={styles.input}
                    value={startDate}
                    onChangeText={(text) => formatDateInput(text, setStartDate)}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  <Text style={styles.helperText}>À partir d'aujourd'hui</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date de fin *</Text>
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={(text) => formatDateInput(text, setEndDate)}
                  placeholder="JJ/MM/AAAA"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              {days > 0 && (
                <View style={styles.daysInfo}>
                  <Clock size={16} color="#10B981" />
                  <Text style={styles.daysText}>
                    {days} jour{days > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Localisation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <MapPin size={16} color="#2563EB" /> Localisation
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Wilaya *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedWilaya}
                    onValueChange={(value) => handleWilayaChange(value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Sélectionnez une wilaya" value="" />
                    {wilayas.map((wilaya) => (
                      <Picker.Item
                        key={wilaya.code}
                        label={`${wilaya.code} - ${wilaya.name}`}
                        value={wilaya.code.toString()}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <CommuneAutocomplete
                  label="Commune *"
                  placeholder="Rechercher une commune..."
                  value={selectedCommune}
                  wilayaId={selectedWilaya}
                  wilayaName={selectedWilayaName}
                  onSelect={setSelectedCommune}
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Informations complémentaires..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Total */}
            {days > 0 && (
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tarif journalier:</Text>
                  <Text style={styles.totalValue}>{listing.price.toLocaleString()} DA</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Nombre de jours:</Text>
                  <Text style={styles.totalValue}>{days}</Text>
                </View>
                <View style={[styles.totalRow, styles.totalRowFinal]}>
                  <Text style={styles.totalLabelFinal}>Total:</Text>
                  <Text style={styles.totalValueFinal}>
                    {totalAmount.toLocaleString()} DA
                  </Text>
                </View>
              </View>
            )}

            {/* Erreur */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reserveButton, loading && styles.reserveButtonDisabled]}
              onPress={handleReserve}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.reserveButtonText}>
                  {days > 0 ? `Réserver (${totalAmount.toLocaleString()} DA)` : 'Réserver'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  listingInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputWithHelper: {
    gap: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  daysInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  daysText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  totalSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalRowFinal: {
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValueFinal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  reserveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  reserveButtonDisabled: {
    opacity: 0.6,
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
