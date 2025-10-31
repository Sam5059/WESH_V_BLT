import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ArrowLeft,
  Store,
  Check,
  AlertCircle,
  Crown,
  Lock,
} from 'lucide-react-native';
import HomeButton from '@/components/HomeButton';

interface ProSubscription {
  id: string;
  status: string;
  expires_at: string;
  category_id: string;
  category?: {
    name: string;
    name_ar: string;
    name_en: string;
  };
}

export default function CreateStoreScreen() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [activeSubscription, setActiveSubscription] =
    useState<ProSubscription | null>(null);
  const [existingStore, setExistingStore] = useState<any>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdStoreSlug, setCreatedStoreSlug] = useState('');

  // Form state
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    checkProStatus();
  }, [user]);

  const checkProStatus = async () => {
    console.log('🔍 Début vérification status PRO');
    if (!user) {
      console.log('❌ Pas de user, redirection login');
      router.replace('/(auth)/login');
      return;
    }

    console.log('✅ User ID:', user.id);
    setLoading(true);

    try {
      // Vérifier si l'utilisateur a un store existant
      console.log('📦 Vérification store existant...');
      const { data: existingStoreData, error: storeError } = await supabase
        .from('pro_stores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (storeError) {
        console.error('❌ Erreur vérification store:', storeError);
      }

      console.log('Store existant:', existingStoreData);

      if (existingStoreData) {
        console.log('✅ Store trouvé:', existingStoreData.slug);
        setExistingStore(existingStoreData);
        setLoading(false);
        Alert.alert(
          'Store déjà créé',
          'Vous avez déjà un store professionnel. Vous allez être redirigé vers votre store.',
          [
            {
              text: 'OK',
              onPress: () => router.replace(`/pro/${existingStoreData.slug}`),
            },
          ]
        );
        return;
      }

      // Vérifier l'abonnement PRO actif
      console.log('📋 Vérification abonnement PRO...');
      const { data: subscriptionData, error: subError } = await supabase
        .from('pro_subscriptions')
        .select(
          `
          *,
          category:categories(name, name_ar, name_en)
        `
        )
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        console.error('❌ Erreur vérification abonnement:', subError);
      }

      console.log('Abonnement trouvé:', subscriptionData);

      if (subscriptionData) {
        console.log('✅ Abonnement actif trouvé');
        setHasActiveSubscription(true);
        setActiveSubscription(subscriptionData);
        setContactEmail(user.email || '');
      } else {
        console.log('❌ Aucun abonnement actif');
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error('💥 Exception dans checkProStatus:', error);
    } finally {
      console.log('🏁 Fin vérification, setLoading(false)');
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateStore = async () => {
    console.log('=== DÉBUT CRÉATION STORE ===');
    console.log('Store name:', storeName);
    console.log('Description:', description);
    console.log('Contact phone:', contactPhone);
    console.log('Active subscription:', activeSubscription);

    if (!storeName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour votre store');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une description');
      return;
    }

    if (!contactPhone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone');
      return;
    }

    if (!activeSubscription) {
      Alert.alert('Erreur', 'Aucun abonnement PRO actif trouvé');
      return;
    }

    setSaving(true);

    try {
      const slug = generateSlug(storeName);
      console.log('Slug généré:', slug);

      // Vérifier si le slug existe déjà
      console.log('Vérification slug existant...');
      const { data: existingSlug, error: checkError } = await supabase
        .from('pro_stores')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (checkError) {
        console.error('Erreur vérification slug:', checkError);
      }

      if (existingSlug) {
        console.log('Slug existe déjà');
        Alert.alert(
          'Erreur',
          'Ce nom de store existe déjà. Veuillez choisir un autre nom.'
        );
        setSaving(false);
        return;
      }

      // Créer le store
      console.log('Création du store...');
      const storeData = {
        user_id: user!.id,
        name: storeName,
        slug,
        description,
        location: location || null,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        website_url: websiteUrl || null,
        whatsapp_number: whatsappNumber || null,
        category_id: activeSubscription.category_id,
        is_active: true,
      };
      console.log('Données du store:', storeData);

      const { data: newStore, error } = await supabase
        .from('pro_stores')
        .insert(storeData)
        .select()
        .single();

      if (error) {
        console.error('Erreur création store:', error);
        console.error('Détails erreur:', JSON.stringify(error, null, 2));
        Alert.alert(
          'Erreur',
          `Impossible de créer le store: ${error.message || 'Erreur inconnue'}`
        );
        setSaving(false);
        return;
      }

      console.log('Store créé:', newStore);

      // Mettre à jour le profil en "professional"
      console.log('Mise à jour du profil...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: 'professional' })
        .eq('id', user!.id);

      if (profileError) {
        console.error('Erreur mise à jour profil:', profileError);
      }

      console.log('=== STORE CRÉÉ AVEC SUCCÈS ===');

      setCreatedStoreSlug(newStore.slug);
      setSaving(false);
      setSuccessModalVisible(true);
    } catch (error) {
      console.error('Exception:', error);
      Alert.alert('Erreur', `Une erreur est survenue: ${error}`);
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = () => {
    if (!activeSubscription?.category) return '';
    const cat = activeSubscription.category;
    if (language === 'ar' && cat.name_ar) return cat.name_ar;
    if (language === 'en' && cat.name_en) return cat.name_en;
    return cat.name;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Vérification de votre abonnement...</Text>
      </View>
    );
  }

  // Pas d'abonnement PRO actif
  if (!hasActiveSubscription) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer mon Store PRO</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.noSubscriptionContainer}>
          <View style={styles.lockIconContainer}>
            <Lock size={64} color="#94A3B8" />
          </View>

          <Text style={styles.noSubTitle}>Abonnement PRO requis</Text>
          <Text style={styles.noSubText}>
            Pour créer votre Store PRO et profiter de tous les avantages, vous
            devez d'abord souscrire à un forfait PRO.
          </Text>

          <View style={styles.benefitsBox}>
            <Text style={styles.benefitsTitle}>Avec un Store PRO :</Text>

            <View style={styles.benefitRow}>
              <Check size={20} color="#10B981" />
              <Text style={styles.benefitText}>Vitrine professionnelle</Text>
            </View>

            <View style={styles.benefitRow}>
              <Check size={20} color="#10B981" />
              <Text style={styles.benefitText}>Logo et bannière personnalisés</Text>
            </View>

            <View style={styles.benefitRow}>
              <Check size={20} color="#10B981" />
              <Text style={styles.benefitText}>
                URL dédiée (buygo.dz/store/votre-nom)
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <Check size={20} color="#10B981" />
              <Text style={styles.benefitText}>Badge PRO visible</Text>
            </View>

            <View style={styles.benefitRow}>
              <Check size={20} color="#10B981" />
              <Text style={styles.benefitText}>
                Annonces illimitées dans votre catégorie
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/pro/packages')}
          >
            <Crown size={20} color="#FFF" />
            <Text style={styles.upgradeButtonText}>
              Découvrir les forfaits PRO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLinkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backLinkText}>Retour</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Formulaire de création de store
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Home Button */}
      <View style={styles.homeButtonContainer}>
        <HomeButton />
      </View>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer mon Store PRO</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer}>
        {/* Info catégorie */}
        <View style={styles.categoryInfo}>
          <Store size={24} color="#2563EB" />
          <View style={{ flex: 1 }}>
            <Text style={styles.categoryInfoLabel}>Catégorie de votre store</Text>
            <Text style={styles.categoryInfoValue}>{getCategoryName()}</Text>
          </View>
          <Check size={24} color="#10B981" />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <AlertCircle size={20} color="#3B82F6" />
          <Text style={styles.instructionsText}>
            Remplissez les informations pour créer votre vitrine professionnelle
          </Text>
        </View>

        {/* Nom du store */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Nom du Store <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={storeName}
            onChangeText={setStoreName}
            placeholder="Ex: Garage El Amine"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez votre activité, vos services, vos produits..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Localisation */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Localisation</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Bab Ezzouar, Alger"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Email de contact */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Email de contact <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="contact@exemple.dz"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Téléphone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Téléphone <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="0555 12 34 56"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />
        </View>

        {/* WhatsApp */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>WhatsApp (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={whatsappNumber}
            onChangeText={setWhatsappNumber}
            placeholder="0555 12 34 56"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />
        </View>

        {/* Site web */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Site web (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
            placeholder="https://www.votre-site.dz"
            placeholderTextColor="#94A3B8"
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Bouton de création */}
        <TouchableOpacity
          style={[styles.createButton, saving && styles.createButtonDisabled]}
          onPress={handleCreateStore}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Store size={20} color="#FFF" />
              <Text style={styles.createButtonText}>Créer mon Store PRO</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de succès */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setSuccessModalVisible(false);
          router.push(`/pro/${createdStoreSlug}`);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Check size={48} color="#10B981" strokeWidth={3} />
            </View>

            <Text style={styles.modalTitle}>Félicitations !</Text>
            <Text style={styles.modalDescription}>
              Votre Store PRO <Text style={styles.storeName}>{storeName}</Text> a été créé avec succès !
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSuccessModalVisible(false);
                router.push(`/pro/${createdStoreSlug}`);
              }}
            >
              <Store size={20} color="#FFF" />
              <Text style={styles.modalButtonText}>Voir mon Store</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => {
                setSuccessModalVisible(false);
                router.push('/pro/dashboard');
              }}
            >
              <Text style={styles.modalButtonSecondaryText}>Aller au Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  homeButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  noSubscriptionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noSubTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  noSubText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsBox: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#475569',
    flex: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  backLinkButton: {
    marginTop: 20,
    padding: 12,
  },
  backLinkText: {
    fontSize: 15,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryInfoLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  categoryInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionsText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  storeName: {
    fontWeight: '700',
    color: '#10B981',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalButtonSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
});
