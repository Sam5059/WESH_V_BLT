import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category, Wilaya } from '@/types/database';
import { Upload, X, ShoppingBag, Search } from 'lucide-react-native';
import TopBar from '@/components/TopBar';
import CommuneAutocomplete from '@/components/CommuneAutocomplete';
import ListingsQuotaCard from '@/components/ListingsQuotaCard';
import { DateRangePicker } from '@/components/DateRangePicker';
import HelpTooltip from '@/components/HelpTooltip';

export default function PublishScreen() {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const { t, isRTL, language } = useLanguage();
  const searchParams = useLocalSearchParams();
  const editId = searchParams.editId as string | undefined;
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [condition, setCondition] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [listingType, setListingType] = useState<'offre' | 'je_cherche'>('offre');
  const [userType, setUserType] = useState<'individual' | 'pro'>('individual');
  const [images, setImages] = useState<string[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<Record<string, any>>({});
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [listingsQuota, setListingsQuota] = useState<any>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [availableFrom, setAvailableFrom] = useState<Date | null>(null);
  const [availableTo, setAvailableTo] = useState<Date | null>(null);
  const [isDateFlexible, setIsDateFlexible] = useState(true);
  const [offerType, setOfferType] = useState<'sale' | 'free' | 'exchange' | 'rent'>('sale');
  const [priceType, setPriceType] = useState<'fixed' | 'quote' | 'free'>('fixed');

  // Inject CSS styles for web platform
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        input[type="text"]:focus,
        input[type="number"]:focus,
        textarea:focus {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
          outline: none !important;
        }
        select:focus {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
          outline: none !important;
        }
        select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px !important;
          cursor: pointer;
        }
        select:hover {
          border-color: #3B82F6;
          background-color: #FAFBFC;
        }
        input[type="text"]:hover,
        input[type="number"]:hover,
        textarea:hover {
          border-color: #94A3B8;
          background-color: #FAFBFC;
        }
        textarea {
          resize: vertical;
          min-height: 120px;
        }
        input, select, textarea {
          transition: all 0.2s ease-in-out;
        }
        input::placeholder, textarea::placeholder {
          color: #94A3B8;
          opacity: 1;
        }
        input:disabled, select:disabled, textarea:disabled {
          background-color: #F1F5F9;
          cursor: not-allowed;
          opacity: 0.6;
        }
        input.error, select.error, textarea.error {
          border-color: #DC2626 !important;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadWilayas();
    if (user) {
      loadUserProfile();
      loadListingsQuota();
    } else {
      setProfileLoading(false);
    }
    if (editId) {
      setIsEditMode(true);
      loadListingForEdit(editId);
    }
  }, [user, editId]);

  // Déterminer le type de formulaire selon la catégorie
  const getFormType = (): 'sale' | 'rent' | 'job' | 'service' | 'purchase' => {
    const selectedCat = categories.find(c => c.id === parentCategoryId);
    const selectedSubcat = subcategories.find(c => c.id === categoryId);

    const catSlug = selectedCat?.slug || '';
    const subcatSlug = selectedSubcat?.slug || '';

    // Emploi & Services
    if (catSlug.includes('emploi') || subcatSlug.includes('emploi') || subcatSlug.includes('offres-emploi') || subcatSlug.includes('demandes-emploi')) {
      return 'job';
    }

    // Location (Immobilier, Véhicules, Vacances)
    if (catSlug.includes('location') || subcatSlug.includes('location')) {
      return 'rent';
    }

    // Services (cours, réparation, etc.)
    if (catSlug.includes('service') || subcatSlug.includes('cours') || subcatSlug.includes('reparation')) {
      return 'service';
    }

    // Par défaut: vente
    return 'sale';
  };

  const needsDatePicker = (): 'range' | 'single' | null => {
    const selectedCat = categories.find(c => c.id === parentCategoryId);
    const selectedSubcat = subcategories.find(c => c.id === categoryId);

    const catSlug = selectedCat?.slug || '';
    const catName = selectedCat?.name || '';
    const subcatSlug = selectedSubcat?.slug || '';
    const subcatName = selectedSubcat?.name || '';

    console.log('[DATE_PICKER] needsDatePicker check:', {
      catSlug,
      catName,
      subcatSlug,
      subcatName,
      offerType
    });

    // UNIQUEMENT les locations nécessitent des dates!
    // Vérifier slug ET nom pour être sûr
    const isLocation =
      catSlug.includes('location') ||
      catSlug.includes('vacances') ||
      catName.toLowerCase().includes('location') ||
      catName.toLowerCase().includes('vacances') ||
      subcatSlug.includes('location') ||
      subcatSlug.includes('vacances') ||
      subcatName.toLowerCase().includes('location') ||
      subcatName.toLowerCase().includes('vacances');

    if (isLocation) {
      console.log('[DATE_PICKER] → LOCATION détectée, retour range');
      return 'range';
    }

    // IMPORTANT: Services, Emploi, Immobilier, etc.
    // N'ONT PAS besoin de dates obligatoires!
    console.log('[DATE_PICKER] → Pas de location, retour null (pas de dates)');
    return null;
  };

  const needsQuotePricing = (): boolean => {
    const selectedCat = categories.find(c => c.id === parentCategoryId);
    const selectedSubcat = subcategories.find(c => c.id === categoryId);

    const catSlug = selectedCat?.slug || '';
    const catName = selectedCat?.name || '';
    const subcatSlug = selectedSubcat?.slug || '';
    const subcatName = selectedSubcat?.name || '';

    // Services: sur devis
    if (
      catSlug.includes('service') ||
      catName.includes('Service') ||
      catSlug.includes('emploi') ||
      catName.includes('Emploi') ||
      subcatSlug.includes('service') ||
      subcatSlug.includes('emploi') ||
      subcatSlug.includes('cours') ||
      subcatSlug.includes('reparation') ||
      subcatSlug.includes('maintenance') ||
      subcatSlug.includes('traduction') ||
      subcatSlug.includes('evenementiel') ||
      subcatName.includes('Service') ||
      subcatName.includes('Emploi') ||
      subcatName.includes('cours') ||
      subcatName.includes('réparation') ||
      subcatName.includes('Réparation')
    ) {
      return true;
    }

    return false;
  };

  const loadUserProfile = async () => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    try {
      setProfileLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        console.log('[PROFILE] User profile loaded:', {
          has_active_pro_package: data.has_active_pro_package,
          user_type: data.user_type,
          pro_package_expires_at: data.pro_package_expires_at
        });
        setUserProfile(data);
        // Force 'pro' for active PRO accounts
        if (data.has_active_pro_package) {
          setUserType('pro');
        } else {
          setUserType('individual');
        }
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const loadListingsQuota = async () => {
    if (!user) return;

    try {
      setQuotaLoading(true);
      const { data, error } = await supabase.rpc('get_user_listings_quota', {
        p_user_id: user.id
      });

      if (error) {
        console.error('[QUOTA] Error loading quota:', error);
        return;
      }

      console.log('[QUOTA] Loaded quota:', data);
      setListingsQuota(data);
    } catch (error) {
      console.error('[QUOTA] Exception:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  const loadListingForEdit = async (listingId: string) => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      Alert.alert(t('common.error'), t('publish.loadError'));
      router.back();
      return;
    }

    if (data) {
      setTitle(data.title);
      setDescription(data.description);
      // Ne pas afficher "0" pour les emplois et services
      if (data.listing_type === 'job' || data.listing_type === 'service') {
        setPrice('');
      } else {
        setPrice(data.price > 0 ? data.price.toString() : '');
      }
      setCategoryId(data.category_id);
      setWilaya(data.wilaya);
      setCommune(data.commune || '');
      setCondition(data.condition);
      setIsNegotiable(data.is_negotiable);
      const reverseMap: { [key: string]: 'offre' | 'je_cherche' } = {
        'offre': 'offre',
        'je_cherche': 'je_cherche',
        'sell': 'offre',
        'sale': 'offre',
        'offer': 'je_cherche',
        'purchase': 'je_cherche',
        'wanted': 'je_cherche'
      };
      setListingType(reverseMap[data.listing_type] || 'offre');
      setImages(data.images || []);
      setCategoryAttributes(data.attributes || {});

      // Charger les dates si disponibles
      if (data.available_from) {
        setAvailableFrom(new Date(data.available_from + 'T12:00:00'));
      }
      if (data.available_to) {
        setAvailableTo(new Date(data.available_to + 'T12:00:00'));
      }
      if (data.is_date_flexible !== undefined) {
        setIsDateFlexible(data.is_date_flexible);
      }

      // Charger le type d'offre
      if (data.offer_type) {
        setOfferType(data.offer_type);
      }

      const { data: categoryData } = await supabase
        .from('categories')
        .select('parent_id')
        .eq('id', data.category_id)
        .maybeSingle();

      if (categoryData?.parent_id) {
        setParentCategoryId(categoryData.parent_id);
        await loadSubcategories(categoryData.parent_id);

        // Load brands if this is a vehicle or electronics category
        const { data: parentCategory } = await supabase
          .from('categories')
          .select('slug')
          .eq('id', categoryData.parent_id)
          .maybeSingle();

        if (parentCategory?.slug === 'vehicules') {
          await loadBrands('vehicles');
          // Load models if brand is already selected
          if (data.attributes?.brand_id) {
            await loadModels(data.attributes.brand_id);
          }
        } else if (parentCategory?.slug === 'electronique') {
          await loadBrands('electronics');
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setWilaya(currentLocation);
  }, [currentLocation]);

  useEffect(() => {
    if (categoryId || parentCategoryId) {
      const isQuote = needsQuotePricing();
      setPriceType(isQuote ? 'quote' : 'fixed');
      if (isQuote) {
        setPrice('');
      }
    }
  }, [categoryId, parentCategoryId]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('display_order', { ascending: true, nullsFirst: false });

    if (data) setCategories(data);
  };

  const loadWilayas = async () => {
    const { data } = await supabase.from('wilayas').select('*').order('id');

    if (data) setWilayas(data);
  };

  const loadSubcategories = async (parentId: string) => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('order_position');

    if (data) {
      setSubcategories(data);
    } else {
      setSubcategories([]);
    }
  };

  const handleCategoryChange = async (value: string) => {
    setParentCategoryId(value);
    setCategoryId('');
    setSubcategories([]);
    setCategoryAttributes({});
    if (value) {
      loadSubcategories(value);
      const category = categories.find(c => c.id === value);
      if (category?.slug === 'vehicules') {
        await loadBrands('vehicles');
      } else if (category?.slug === 'electronique') {
        await loadBrands('electronics');
      }
    }
  };

  const loadBrands = async (categoryType: string) => {
    console.log('[BRANDS] Loading brands for category type:', categoryType);
    setLoadingBrands(true);
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('category_type', categoryType)
      .order('name');

    setLoadingBrands(false);

    if (error) {
      console.error('[BRANDS] Error loading brands:', error);
      Alert.alert('Erreur', 'Impossible de charger les marques');
      return;
    }

    console.log('[BRANDS] Loaded brands:', data?.length || 0, 'brands');
    if (data && data.length > 0) {
      setBrands(data);
      console.log('[BRANDS] Brands state updated:', data.map(b => b.name));
    } else {
      console.warn('[BRANDS] No brands found for category type:', categoryType);
      setBrands([]);
    }
  };

  const loadModels = async (brandId: string) => {
    console.log('[MODELS] Loading models for brand:', brandId);
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('brand_id', brandId)
      .order('name');

    if (error) {
      console.error('[MODELS] Error loading models:', error);
      setModels([]);
      return;
    }

    console.log('[MODELS] Loaded models:', data?.length || 0, 'models');
    if (data) {
      setModels(data);
      console.log('[MODELS] Models:', data.map(m => m.name));
    } else {
      setModels([]);
    }
  };

  const handleAttributeChange = (key: string, value: any) => {
    setCategoryAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Format number with thousand separators
  const formatNumberWithSpaces = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Remove spaces from formatted number
  const parseFormattedNumber = (value: string): string => {
    return value.replace(/\s/g, '');
  };

  const getCategoryName = (category: Category) => {
    if (language === 'ar') return category.name_ar || category.name;
    if (language === 'en') return category.name_en || category.name;
    return category.name;
  };

  const getAvailableListingTypes = () => {
    // Toutes les catégories: offre et je_cherche uniquement
    // La location est maintenant dans les catégories elles-mêmes
    return ['offre', 'je_cherche'];
  };

  const getWilayaName = (wilaya: Wilaya) => {
    if (language === 'ar') return wilaya.name_ar || wilaya.name;
    if (language === 'en') return wilaya.name_en || wilaya.name;
    return wilaya.name;
  };

  const handleAddImage = async () => {
    console.log('[IMAGE UPLOAD] 👆 handleAddImage called');
    console.log('[IMAGE UPLOAD] 📊 Current images count:', images.length);
    console.log('[IMAGE UPLOAD] 👤 User authenticated:', !!user);
    console.log('[IMAGE UPLOAD] 🔑 User ID:', user?.id);

    // Vérifier l'authentification
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour ajouter des photos',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    if (images.length >= 8) {
      console.warn('[IMAGE UPLOAD] ⚠️ Maximum photos reached');
      Alert.alert(t('common.error'), language === 'ar' ? 'الحد الأقصى 8 صور' : language === 'en' ? 'Maximum 8 photos' : 'Maximum 8 photos');
      return;
    }

    if (Platform.OS === 'web') {
      console.log('[IMAGE UPLOAD] 🌐 Platform: Web');
      console.log('[IMAGE UPLOAD] 📋 Creating file input element...');

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;

      console.log('[IMAGE UPLOAD] 📋 File input created successfully');
      console.log('[IMAGE UPLOAD] 📋 Accept:', input.accept);
      console.log('[IMAGE UPLOAD] 📋 Multiple:', input.multiple);

      input.onchange = async (e: any) => {
        try {
          console.log('[IMAGE UPLOAD] 🚀 File input changed');
          const files = Array.from(e.target.files || []) as File[];
          console.log('[IMAGE UPLOAD] 📊 Files selected:', files.length);

          if (files.length === 0) {
            console.warn('[IMAGE UPLOAD] ⚠️ No files selected');
            return;
          }

          const remainingSlots = 8 - images.length;
          console.log('[IMAGE UPLOAD] 📊 Remaining slots:', remainingSlots, '(current:', images.length, ')');

          const filesToProcess = files.slice(0, remainingSlots);
          console.log('[IMAGE UPLOAD] 📊 Files to process:', filesToProcess.length);

          if (filesToProcess.length === 0) {
            Alert.alert('Limite atteinte', 'Vous avez déjà ajouté 8 photos (maximum)');
            return;
          }

          console.log('[IMAGE UPLOAD] 🚀 Starting upload for', filesToProcess.length, 'files');
          console.log('[IMAGE UPLOAD] 🔑 User ID:', user?.id);

          setLoading(true);
          const uploadedUrls: string[] = [];
          let successCount = 0;
          let errorCount = 0;

          for (let i = 0; i < filesToProcess.length; i++) {
            const file = filesToProcess[i];
            try {
              console.log(`[IMAGE UPLOAD] 📄 [${i + 1}/${filesToProcess.length}] Processing:`, file.name);
              console.log(`[IMAGE UPLOAD] 📊 Size: ${(file.size / 1024).toFixed(2)} KB (${file.size} bytes)`);
              console.log(`[IMAGE UPLOAD] 🎭 Type: ${file.type}`);

              // Check file size (max 5MB)
              if (file.size > 5 * 1024 * 1024) {
                console.warn('[IMAGE UPLOAD] ⚠️ File too large:', file.name);
                Alert.alert('Fichier trop volumineux', `${file.name} dépasse 5MB. Veuillez choisir une image plus petite.`);
                errorCount++;
                continue;
              }

              // Validate file type
              const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
              if (!validTypes.includes(file.type)) {
                console.warn('[IMAGE UPLOAD] ⚠️ Invalid file type:', file.type);
                Alert.alert('Format non supporté', `${file.name} n'est pas une image valide. Formats acceptés: JPG, PNG, WebP, GIF`);
                errorCount++;
                continue;
              }

              const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
              const timestamp = Date.now();
              const random = Math.random().toString(36).substring(7);
              const fileName = `${timestamp}_${random}.${fileExt}`;
              const filePath = `${user!.id}/${fileName}`;

              console.log('[IMAGE UPLOAD] 📂 Upload path:', filePath);
              console.log('[IMAGE UPLOAD] 🚀 Starting upload to Supabase...');

              // Vérifier la session avant l'upload
              const { data: sessionData } = await supabase.auth.getSession();
              console.log('[IMAGE UPLOAD] 🔐 Session exists:', !!sessionData.session);
              console.log('[IMAGE UPLOAD] 🔐 Session user ID:', sessionData.session?.user?.id);

              const { data, error: uploadError } = await supabase.storage
                .from('listings')
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: false
                });

              if (uploadError) {
                console.error('[IMAGE UPLOAD] ❌ Upload error:', uploadError);
                console.error('[IMAGE UPLOAD] ❌ Error details:', JSON.stringify(uploadError, null, 2));
                console.error('[IMAGE UPLOAD] ❌ Error name:', uploadError.name);
                console.error('[IMAGE UPLOAD] ❌ Error message:', uploadError.message);

                let errorMsg = uploadError.message;
                if (uploadError.message?.includes('new row violates row-level security')) {
                  errorMsg = 'Erreur de permission. Veuillez vous reconnecter et réessayer.';
                } else if (uploadError.message?.includes('JWT')) {
                  errorMsg = 'Session expirée. Veuillez vous reconnecter.';
                }

                Alert.alert('Erreur d\'upload', `${file.name}: ${errorMsg}`);
                errorCount++;
                continue;
              }

              console.log('[IMAGE UPLOAD] ✅ File uploaded successfully!');
              console.log('[IMAGE UPLOAD] 📂 Storage path:', data?.path);

              const { data: { publicUrl } } = supabase.storage
                .from('listings')
                .getPublicUrl(filePath);

              console.log('[IMAGE UPLOAD] 🌐 Public URL generated:', publicUrl);
              uploadedUrls.push(publicUrl);
              successCount++;

              // Update images progressively for better UX
              console.log('[IMAGE UPLOAD] 🔄 Updating state with new image...');
              setImages(prev => {
                const newImages = [...prev, publicUrl];
                console.log('[IMAGE UPLOAD] 📊 New images array length:', newImages.length);
                return newImages;
              });

              console.log('[IMAGE UPLOAD] ✅ Image added to state successfully!');
            } catch (error: any) {
              console.error('[IMAGE UPLOAD] 💥 Unexpected error processing file:', file.name);
              console.error('[IMAGE UPLOAD] 💥 Error details:', error);
              console.error('[IMAGE UPLOAD] 💥 Error stack:', error?.stack);
              Alert.alert('Erreur', `Impossible de traiter ${file.name}: ${error?.message || 'Erreur inconnue'}`);
              errorCount++;
            }
          }

          console.log('[IMAGE UPLOAD] ✅ Upload complete!');
          console.log('[IMAGE UPLOAD] 📊 Success:', successCount, '| Errors:', errorCount);
          console.log('[IMAGE UPLOAD] 📊 Total URLs:', uploadedUrls.length);
          console.log('[IMAGE UPLOAD] 📊 URLs:', uploadedUrls);

          setLoading(false);

          if (successCount > 0) {
            Alert.alert('✅ Succès', `${successCount} photo(s) ajoutée(s) avec succès!`);
          }

          if (errorCount > 0 && successCount === 0) {
            Alert.alert('❌ Échec', `Aucune image n'a pu être uploadée. ${errorCount} erreur(s).`);
          } else if (errorCount > 0) {
            Alert.alert('⚠️ Partiellement terminé', `${successCount} succès, ${errorCount} échec(s).`);
          }
        } catch (error: any) {
          console.error('[IMAGE UPLOAD] 💥 FATAL ERROR in onchange handler:', error);
          console.error('[IMAGE UPLOAD] 💥 Error stack:', error?.stack);
          setLoading(false);
          Alert.alert('❌ Erreur fatale', `Une erreur critique est survenue: ${error?.message || 'Erreur inconnue'}`);
        }
      };

      console.log('[IMAGE UPLOAD] 🖱️ Triggering file input click...');
      input.click();
      console.log('[IMAGE UPLOAD] ✅ File input click triggered');
    } else {
      const placeholderImages = [
        'https://images.pexels.com/photos/1667849/pexels-photo-1667849.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/279810/pexels-photo-279810.jpeg?auto=compress&cs=tinysrgb&w=400',
      ];
      const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      setImages([...images, randomImage]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!user) {
      Alert.alert(t('common.error'), language === 'ar' ? 'يجب تسجيل الدخول أولاً' : language === 'en' ? 'Please login first' : 'Veuillez vous connecter d\'abord');
      return;
    }

    if (userType === 'pro' && !userProfile?.has_active_pro_package) {
      Alert.alert(
        'Forfait PRO requis',
        'Pour publier en tant que professionnel, vous devez d\'abord acheter un forfait PRO.',
        [
          {
            text: 'Annuler',
            style: 'cancel'
          },
          {
            text: 'Acheter un forfait',
            onPress: () => router.push('/pro/packages')
          }
        ]
      );
      return;
    }

    // Vérifier le quota d'annonces (sauf en mode édition)
    if (!isEditMode && listingsQuota && !listingsQuota.can_publish) {
      Alert.alert(
        'Limite atteinte',
        `Vous avez atteint votre limite de ${listingsQuota.max_listings} annonces actives.\n\n` +
        `Désactivez ou supprimez une annonce existante, ou passez à un forfait supérieur pour publier plus d'annonces.`,
        [
          {
            text: 'Mes annonces',
            onPress: () => router.push('/my-listings')
          },
          {
            text: listingsQuota.user_type === 'individual' ? 'Devenir Pro' : 'Améliorer mon forfait',
            onPress: () => router.push('/pro/packages')
          },
          {
            text: 'Annuler',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    const finalCategoryId = categoryId || parentCategoryId;

    // Validation avec marquage des erreurs
    const errors: Record<string, boolean> = {};
    const formType = getFormType();

    if (!title) errors.title = true;
    if (!description) errors.description = true;

    // Prix obligatoire SEULEMENT pour vente et location avec prix fixe, PAS pour emploi, services et dons gratuits
    if (formType !== 'job' && formType !== 'service' && offerType !== 'free') {
      if (priceType === 'fixed' && !price) errors.price = true;
    }

    // Pour emploi: type de contrat obligatoire
    if (formType === 'job' && !categoryAttributes.contrat) {
      errors.contrat = true;
    }

    // Pour service: tarif obligatoire SEULEMENT pour les OFFRES (professionnels) avec prix fixe
    // PAS obligatoire pour les demandes clients (Je cherche) ni pour les devis
    if (formType === 'service' && listingType === 'offre' && priceType === 'fixed' && !categoryAttributes.tarif) {
      errors.tarif = true;
    }

    // Validation des dates: UNIQUEMENT pour les locations
    // PAS obligatoire pour Services, Emploi, Immobilier, etc.
    const datePickerType = needsDatePicker();
    if (datePickerType === 'range' && (!availableFrom || !availableTo)) {
      // Dates obligatoires UNIQUEMENT pour les locations
      errors.availableFrom = !availableFrom;
      errors.availableTo = !availableTo;
    }
    // Note: datePickerType === 'single' ou null → Dates OPTIONNELLES (pas d'erreur)

    if (!finalCategoryId) errors.category = true;
    if (subcategories.length > 0 && !categoryId) errors.subcategory = true;
    if (!wilaya) errors.wilaya = true;
    if (!commune) errors.commune = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const errorFields = Object.keys(errors).join(', ');
      const errorMessage = `Veuillez remplir tous les champs obligatoires en rouge :\n${
        errors.title ? '• Titre\n' : ''
      }${
        errors.description ? '• Description\n' : ''
      }${
        errors.price ? '• Prix\n' : ''
      }${
        errors.contrat ? '• Type de contrat\n' : ''
      }${
        errors.tarif ? '• Tarif\n' : ''
      }${
        errors.category ? '• Catégorie\n' : ''
      }${
        errors.subcategory ? '• Sous-catégorie\n' : ''
      }${
        errors.wilaya ? '• Wilaya\n' : ''
      }${
        errors.commune ? '• Commune\n' : ''
      }`;
      Alert.alert('⚠️ Champs manquants', errorMessage);
      return;
    }

    setFieldErrors({});

    // Validation du prix pour vente et location uniquement (sauf si gratuit)
    let priceNum = 0;
    if (offerType === 'free') {
      // Prix automatiquement à 0 pour les dons gratuits
      priceNum = 0;
    } else if (formType !== 'job' && formType !== 'service') {
      priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        setFieldErrors({ price: true });
        Alert.alert(t('common.error'), t('publish.validPrice'));
        return;
      }
    }

    setLoading(true);

    try {
      const contentToCheck = `${title} ${description}`;
      const { data: spamCheck } = await supabase.rpc('check_content_for_spam', {
        content_text: contentToCheck,
      });

      let listingStatus = 'active';
      let showWarning = false;

      if (spamCheck && spamCheck.length > 0) {
        const result = spamCheck[0];

        if (result.has_spam) {
          if (result.suggested_action === 'block') {
            Alert.alert(
              'Contenu Bloqué',
              'Votre annonce contient des mots-clés interdits et ne peut pas être publiée. Veuillez modifier le contenu.',
              [{ text: 'OK' }]
            );
            setLoading(false);
            return;
          } else if (result.suggested_action === 'hide') {
            listingStatus = 'flagged';
            showWarning = true;
          } else if (result.suggested_action === 'flag') {
            showWarning = true;
          }
        }
      }

      await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', user!.id);

      let insertedData, error;

      if (isEditMode && editId) {
        // Déterminer le bon listing_type selon la catégorie
        let dbListingType: 'sale' | 'rent' | 'job' | 'service' | 'purchase' = formType;
        if (formType === 'sale') {
          dbListingType = listingType === 'offre' ? 'sale' : 'purchase';
        }

        const { data, error: updateError } = await supabase
          .from('listings')
          .update({
            title,
            description,
            price: priceNum || 0, // 0 pour emploi et services
            category_id: finalCategoryId,
            wilaya,
            commune,
            condition,
            is_negotiable: isNegotiable,
            listing_type: dbListingType,
            images,
            attributes: categoryAttributes,
            available_from: availableFrom ? availableFrom.toISOString().split('T')[0] : null,
            available_to: availableTo ? availableTo.toISOString().split('T')[0] : null,
            is_date_flexible: isDateFlexible,
            offer_type: offerType,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId)
          .eq('user_id', user!.id)
          .select();

        insertedData = data;
        error = updateError;
      } else {
        // Déterminer le bon listing_type selon la catégorie
        let dbListingType: 'sale' | 'rent' | 'job' | 'service' | 'purchase' = formType;
        if (formType === 'sale') {
          dbListingType = listingType === 'offre' ? 'sale' : 'purchase';
        }

        const { data, error: insertError } = await supabase
          .from('listings')
          .insert({
            user_id: user!.id,
            title,
            description,
            price: priceType === 'quote' ? null : (priceNum || 0),
            price_type: priceType,
            category_id: finalCategoryId,
            wilaya,
            commune,
            condition,
            is_negotiable: isNegotiable,
            listing_type: dbListingType,
            images,
            status: listingStatus,
            attributes: categoryAttributes,
            available_from: availableFrom ? availableFrom.toISOString().split('T')[0] : null,
            available_to: availableTo ? availableTo.toISOString().split('T')[0] : null,
            is_date_flexible: isDateFlexible,
            offer_type: offerType,
          })
          .select();

        insertedData = data;
        error = insertError;
      }

      if (error) {
        console.error('Error inserting listing:', error);
        let detailedError = error.message;
        if (error.details) detailedError += `\n${error.details}`;
        if (error.hint) detailedError += `\n${error.hint}`;
        if (error.code) detailedError = `[${error.code}] ${detailedError}`;
        setModalMessage(`Une erreur est survenue lors de la publication:\n\n${detailedError}`);
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      console.log('Listing inserted successfully:', insertedData);

      if (isEditMode) {
        setModalMessage(t('publish.updateSuccess') || 'Annonce modifiée avec succès');
      } else if (showWarning) {
        setModalMessage('Votre annonce a été créée mais sera examinée par nos modérateurs avant d\'être visible publiquement.');
      } else {
        setModalMessage(t('publish.success'));
      }
      setShowSuccessModal(true);

      // Recharger le quota après publication
      loadListingsQuota();

      // Ne pas réinitialiser en mode édition
      if (!isEditMode) {
        setTitle('');
        setDescription('');
        setPrice('');
        setParentCategoryId('');
        setCategoryId('');
        setSubcategories([]);
        setWilaya('');
        setCommune('');
        setCondition('good');
        setIsNegotiable(true);
        setListingType('offre');
        setUserType('individual');
        setImages([]);
        setCategoryAttributes({});
        setBrands([]);
        setModels([]);
      }
    } catch (error: any) {
      console.error('Publish error:', error);
      let detailedError = error?.message || 'Erreur inconnue';
      if (error?.details) detailedError += `\n${error.details}`;
      if (error?.hint) detailedError += `\n${error.hint}`;
      if (error?.code) detailedError = `[${error.code}] ${detailedError}`;
      setModalMessage(`Erreur lors de la publication:\n\n${detailedError}`);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={[styles.title, { textAlign: 'center', marginBottom: 16 }]}>
            {language === 'ar' ? 'يجب تسجيل الدخول' : language === 'en' ? 'Login Required' : 'Connexion requise'}
          </Text>
          <Text style={[styles.subtitle, { textAlign: 'center' }]}>
            {language === 'ar' ? 'يجب عليك تسجيل الدخول لنشر إعلان' : language === 'en' ? 'You need to login to publish a listing' : 'Vous devez vous connecter pour publier une annonce'}
          </Text>
        </View>
      </View>
    );
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (isEditMode && editId) {
      // En mode édition: revenir à la page de détails de l'annonce
      router.push(`/listing/${editId}`);
    } else {
      // En mode création: revenir à l'accueil
      router.push('/(tabs)');
    }
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  return (
    <ScrollView style={styles.container}>
      <TopBar />
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>
          {isEditMode ? (t('publish.editTitle') || 'Modifier l\'annonce') : t('publish.title')}
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {isEditMode ? (t('publish.editSubtitle') || 'Modifiez les informations de votre annonce') : t('publish.subtitle')}
        </Text>
      </View>

      {!isEditMode && listingsQuota && !quotaLoading && (
        <View style={styles.quotaContainer}>
          <ListingsQuotaCard quota={listingsQuota} showUpgradeButton={true} />
        </View>
      )}

      <View style={styles.form}>
        {/* 1. TYPE D'ANNONCEUR - EN PREMIER */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('publish.advertiserType')}</Text>

          <View style={styles.inputGroup}>
            {profileLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.loadingText}>{t('common.loading')}</Text>
              </View>
            ) : userProfile?.has_active_pro_package === true ? (
              <View style={styles.proBadgeContainer}>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeIcon}>💼</Text>
                  <View style={styles.proBadgeTextContainer}>
                    <Text style={styles.proBadgeTitle}>Compte PRO Actif</Text>
                    <Text style={styles.proBadgeSubtitle}>
                      Expire le {userProfile.pro_package_expires_at ? new Date(userProfile.pro_package_expires_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => router.push('/pro/packages')}
                >
                  <Text style={styles.upgradeButtonText}>⭐ Renouveler</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nonProContainer}>
                <View style={styles.userTypeBadge}>
                  <View style={styles.userTypeIcon}>
                    <Text style={styles.userTypeIconText}>👤</Text>
                  </View>
                  <View style={styles.userTypeInfo}>
                    <Text style={styles.userTypeLabel}>Type de compte</Text>
                    <Text style={styles.userTypeName}>Particulier</Text>
                  </View>
                </View>

                <View style={styles.proInfoBox}>
                  <View style={styles.proInfoHeader}>
                    <Text style={styles.proInfoIcon}>✨</Text>
                    <View style={styles.proInfoHeaderText}>
                      <Text style={[styles.proInfoTitle, isRTL && styles.textRTL]}>Passez en PRO</Text>
                      <Text style={[styles.proInfoSubtitle, isRTL && styles.textRTL]}>
                        Plus d'annonces • Plus de visibilité
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.proUpgradeButton}
                    onPress={() => router.push('/pro/packages')}
                  >
                    <Text style={[styles.proUpgradeButtonText, isRTL && styles.textRTL]}>
                      Achetez un forfait PRO
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 2. INFORMATIONS DE BASE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('publish.informations')}</Text>

          {/* 2.1 Titre */}
          <View style={styles.inputGroup}>
            <View style={styles.labelWithHelp}>
              <Text style={[styles.label, isRTL && styles.textRTL]}>
                {t('publish.listingTitle')} <Text style={styles.required}>*</Text>
              </Text>
              <HelpTooltip
                title={language === 'ar' ? 'نصيحة للعنوان' : language === 'en' ? 'Title Tip' : 'Astuce pour le titre'}
                content={language === 'ar' ? 'اختر عنوانًا واضحًا ووصفيًا. قم بتضمين العلامة التجارية والطراز والمعلومات الأساسية.' : language === 'en' ? 'Choose a clear and descriptive title. Include brand, model, and key information.' : 'Choisissez un titre clair et descriptif. Incluez la marque, le modèle et les informations clés.'}
              />
            </View>
            <TextInput
              style={[styles.input, isRTL && styles.textRTL, fieldErrors.title && styles.inputError, !title && styles.inputPlaceholder]}
              placeholder={t('publish.listingTitleQuestion')}
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: false });
              }}
              maxLength={100}
            />
          </View>

          {/* 2.2 Description */}
          <View style={styles.inputGroup}>
            <View style={styles.labelWithHelp}>
              <Text style={[styles.label, isRTL && styles.textRTL]}>
                Description <Text style={styles.required}>*</Text>
              </Text>
              <HelpTooltip
                title={language === 'ar' ? 'نصيحة للوصف' : language === 'en' ? 'Description Tip' : 'Astuce pour la description'}
                content={language === 'ar' ? 'قدم وصفًا مفصلاً وصادقًا. اذكر الحالة والمميزات والعيوب إن وجدت.' : language === 'en' ? 'Provide a detailed and honest description. Mention condition, features, and any defects.' : 'Fournissez une description détaillée et honnête. Mentionnez l\'état, les caractéristiques et les défauts éventuels.'}
              />
            </View>
            <TextInput
              style={[styles.input, styles.textArea, isRTL && styles.textRTL, fieldErrors.description && styles.inputError, !description && styles.inputPlaceholder]}
              placeholder={t('publish.descriptionPlaceholder')}
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: false });
              }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* 2.3 Catégorie */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>
              {t('publish.category')} <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, fieldErrors.category && styles.inputError]}>
              <Picker
                selectedValue={parentCategoryId}
                onValueChange={(value) => {
                  handleCategoryChange(value);
                  if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: false });
                }}
                style={[styles.picker, !parentCategoryId && styles.pickerPlaceholder]}
              >
                <Picker.Item label={t('publish.categoryQuestion')} value="" color="#94A3B8" />
                {categories.map((cat) => (
                  <Picker.Item key={cat.id} label={getCategoryName(cat)} value={cat.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 2.4 Sous-catégorie */}
          {subcategories.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.textRTL]}>
                {t('publish.subcategory')} <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.pickerContainer, fieldErrors.subcategory && styles.inputError]}>
                <Picker
                  selectedValue={categoryId}
                  onValueChange={async (value) => {
                    setCategoryId(value);
                    if (fieldErrors.subcategory) setFieldErrors({ ...fieldErrors, subcategory: false });

                    // Load brands if this is a vehicle subcategory
                    const parentCategory = categories.find(c => c.id === parentCategoryId);
                    if (parentCategory?.slug === 'vehicules' && value) {
                      await loadBrands('vehicles');
                    } else if (parentCategory?.slug === 'electronique' && value) {
                      await loadBrands('electronics');
                    }
                  }}
                  style={[styles.picker, !categoryId && styles.pickerPlaceholder]}
                >
                  <Picker.Item label="Quelle sous-catégorie ?" value="" color="#94A3B8" />
                  {subcategories.map((cat) => (
                    <Picker.Item key={cat.id} label={getCategoryName(cat)} value={cat.id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {categories.find(c => c.id === parentCategoryId)?.slug === 'location-vacances' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📍 Informations sur le logement</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Nombre de chambres <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 2"
                  value={categoryAttributes.bedrooms}
                  onChangeText={(value) => handleAttributeChange('bedrooms', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Nombre de salles de bain <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 1"
                  value={categoryAttributes.bathrooms}
                  onChangeText={(value) => handleAttributeChange('bathrooms', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Capacité (personnes) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 4"
                  value={categoryAttributes.max_guests}
                  onChangeText={(value) => handleAttributeChange('max_guests', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Surface (m²)
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 80"
                  value={categoryAttributes.surface_area}
                  onChangeText={(value) => handleAttributeChange('surface_area', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>✨ Équipements & Commodités</Text>
              </View>

              <View style={styles.checkboxGrid}>
                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('has_wifi', !categoryAttributes.has_wifi)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.has_wifi && styles.checkboxBoxChecked]}>
                    {categoryAttributes.has_wifi && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>WiFi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('has_parking', !categoryAttributes.has_parking)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.has_parking && styles.checkboxBoxChecked]}>
                    {categoryAttributes.has_parking && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Parking</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('has_pool', !categoryAttributes.has_pool)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.has_pool && styles.checkboxBoxChecked]}>
                    {categoryAttributes.has_pool && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Piscine</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('has_air_conditioning', !categoryAttributes.has_air_conditioning)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.has_air_conditioning && styles.checkboxBoxChecked]}>
                    {categoryAttributes.has_air_conditioning && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Climatisation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('has_kitchen', !categoryAttributes.has_kitchen)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.has_kitchen && styles.checkboxBoxChecked]}>
                    {categoryAttributes.has_kitchen && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Cuisine équipée</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('has_tv', !categoryAttributes.has_tv)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.has_tv && styles.checkboxBoxChecked]}>
                    {categoryAttributes.has_tv && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>TV</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('pet_friendly', !categoryAttributes.pet_friendly)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.pet_friendly && styles.checkboxBoxChecked]}>
                    {categoryAttributes.pet_friendly && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Animaux acceptés</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('smoking_allowed', !categoryAttributes.smoking_allowed)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.smoking_allowed && styles.checkboxBoxChecked]}>
                    {categoryAttributes.smoking_allowed && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Fumeur autorisé</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>💰 Tarification</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Prix par jour (DA)
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 5000"
                  value={categoryAttributes.price_per_day}
                  onChangeText={(value) => handleAttributeChange('price_per_day', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Prix par semaine (DA)
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 30000"
                  value={categoryAttributes.price_per_week}
                  onChangeText={(value) => handleAttributeChange('price_per_week', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Prix par mois (DA)
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 100000"
                  value={categoryAttributes.price_per_month}
                  onChangeText={(value) => handleAttributeChange('price_per_month', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Caution (DA)
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 10000"
                  value={categoryAttributes.deposit_required}
                  onChangeText={(value) => handleAttributeChange('deposit_required', value)}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}

          {categories.find(c => c.id === parentCategoryId)?.slug === 'location-vehicules' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🚗 Informations sur le véhicule</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Marque <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: Renault, Peugeot"
                  value={categoryAttributes.vehicle_brand}
                  onChangeText={(value) => handleAttributeChange('vehicle_brand', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Modèle <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: Clio, 208"
                  value={categoryAttributes.vehicle_model}
                  onChangeText={(value) => handleAttributeChange('vehicle_model', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Année <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 2020"
                  value={categoryAttributes.vehicle_year}
                  onChangeText={(value) => handleAttributeChange('vehicle_year', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Carburant <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={categoryAttributes.fuel_type}
                    onValueChange={(value) => handleAttributeChange('fuel_type', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Sélectionner un carburant" value="" />
                    <Picker.Item label="Essence" value="essence" />
                    <Picker.Item label="Diesel" value="diesel" />
                    <Picker.Item label="Hybride" value="hybride" />
                    <Picker.Item label="Électrique" value="electrique" />
                    <Picker.Item label="GPL" value="gpl" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Transmission <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={categoryAttributes.transmission}
                    onValueChange={(value) => handleAttributeChange('transmission', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Sélectionner" value="" />
                    <Picker.Item label="Manuelle" value="manuelle" />
                    <Picker.Item label="Automatique" value="automatique" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Nombre de places <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 5"
                  value={categoryAttributes.seats}
                  onChangeText={(value) => handleAttributeChange('seats', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Kilométrage
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 50000"
                  value={categoryAttributes.mileage}
                  onChangeText={(value) => handleAttributeChange('mileage', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>✨ Équipements</Text>
              </View>

              <View style={styles.checkboxGrid}>
                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('has_gps', !categoryAttributes.has_gps)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.has_gps && styles.checkboxBoxChecked]}>
                    {categoryAttributes.has_gps && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>GPS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('has_air_conditioning_vehicle', !categoryAttributes.has_air_conditioning_vehicle)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.has_air_conditioning_vehicle && styles.checkboxBoxChecked]}>
                    {categoryAttributes.has_air_conditioning_vehicle && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Climatisation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxItem}
                  onPress={() => handleAttributeChange('insurance_included', !categoryAttributes.insurance_included)}
                >
                  <View style={[styles.checkboxBox, categoryAttributes.insurance_included && styles.checkboxBoxChecked]}>
                    {categoryAttributes.insurance_included && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Assurance incluse</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>💰 Tarification</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Prix par jour (DA) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 3000"
                  value={categoryAttributes.price_per_day}
                  onChangeText={(value) => handleAttributeChange('price_per_day', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Prix par semaine (DA)
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 18000"
                  value={categoryAttributes.price_per_week}
                  onChangeText={(value) => handleAttributeChange('price_per_week', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Prix par mois (DA)
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 60000"
                  value={categoryAttributes.price_per_month}
                  onChangeText={(value) => handleAttributeChange('price_per_month', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Durée minimale de location (jours)
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 1"
                  value={categoryAttributes.min_rental_days}
                  onChangeText={(value) => handleAttributeChange('min_rental_days', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Caution (DA) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 20000"
                  value={categoryAttributes.deposit_required}
                  onChangeText={(value) => handleAttributeChange('deposit_required', value)}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}

          {categories.find(c => c.id === parentCategoryId)?.slug === 'vehicules' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Marque <Text style={styles.required}>*</Text>
                </Text>
                {loadingBrands ? (
                  <View style={[styles.input, { justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10 }]}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={{ color: '#64748B' }}>Chargement des marques...</Text>
                  </View>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={categoryAttributes.brand_id}
                      onValueChange={(value) => {
                        handleAttributeChange('brand_id', value);
                        setModels([]);
                        if (value) loadModels(value);
                      }}
                      style={styles.picker}
                      enabled={brands.length > 0}
                    >
                      <Picker.Item
                        label={brands.length > 0 ? "Sélectionner une marque" : "Aucune marque disponible"}
                        value=""
                        color="#94A3B8"
                      />
                      {brands.map((brand) => (
                        <Picker.Item key={brand.id} label={brand.name} value={brand.id} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              {categoryAttributes.brand_id && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isRTL && styles.textRTL]}>
                    Modèle <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={categoryAttributes.model_id}
                      onValueChange={(value) => handleAttributeChange('model_id', value)}
                      style={styles.picker}
                      enabled={models.length > 0}
                    >
                      <Picker.Item
                        label={models.length > 0 ? "Sélectionner un modèle" : "Chargement..."}
                        value=""
                        color="#94A3B8"
                      />
                      {models.map((model) => (
                        <Picker.Item key={model.id} label={model.name} value={model.id} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Année <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 2020"
                  value={categoryAttributes.year}
                  onChangeText={(value) => handleAttributeChange('year', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Kilométrage <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: 50000"
                  value={categoryAttributes.mileage}
                  onChangeText={(value) => handleAttributeChange('mileage', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Carburant <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={categoryAttributes.fuel}
                    onValueChange={(value) => handleAttributeChange('fuel', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Sélectionner un carburant" value="" />
                    <Picker.Item label="Essence" value="essence" />
                    <Picker.Item label="Diesel" value="diesel" />
                    <Picker.Item label="Hybride" value="hybride" />
                    <Picker.Item label="Électrique" value="electrique" />
                    <Picker.Item label="GPL" value="gpl" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Boîte de vitesse <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={categoryAttributes.transmission}
                    onValueChange={(value) => handleAttributeChange('transmission', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Sélectionner" value="" />
                    <Picker.Item label="Manuelle" value="manuelle" />
                    <Picker.Item label="Automatique" value="automatique" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Couleur
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder="Ex: Noir"
                  value={categoryAttributes.color}
                  onChangeText={(value) => handleAttributeChange('color', value)}
                />
              </View>
            </>
          )}

          {/* Prix: Affiché seulement pour vente et location, PAS pour emploi et services, et PAS si gratuit */}
          {getFormType() !== 'job' && getFormType() !== 'service' && offerType !== 'free' && (
            <>
              {priceType === 'quote' ? (
                <View style={styles.quotePriceContainer}>
                  <View style={styles.quotePriceHeader}>
                    <View style={styles.quotePriceIconContainer}>
                      <Text style={styles.quotePriceIcon}>💼</Text>
                    </View>
                    <View style={styles.quotePriceTextContainer}>
                      <Text style={[styles.quotePriceTitle, isRTL && styles.textRTL]}>
                        Tarification sur devis
                      </Text>
                      <Text style={[styles.quotePriceDescription, isRTL && styles.textRTL]}>
                        Les clients vous contacteront pour demander un devis personnalisé
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.quotePriceToggle}
                    onPress={() => {
                      setPriceType('fixed');
                    }}
                  >
                    <Text style={styles.quotePriceToggleText}>Mettre un prix fixe</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, isRTL && styles.textRTL]}>
                      {getFormType() === 'rent' ? 'Prix de location (DA)' : 'Prix (DA)'} <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, isRTL && styles.textRTL, fieldErrors.price && styles.inputError, !price && styles.inputPlaceholder]}
                      placeholder={getFormType() === 'rent' ? 'Prix par jour/semaine/mois' : 'Quel est le prix ?'}
                      placeholderTextColor="#94A3B8"
                      value={formatNumberWithSpaces(price)}
                      onChangeText={(text) => {
                        const numericValue = parseFormattedNumber(text);
                        setPrice(numericValue);
                        if (fieldErrors.price) setFieldErrors({ ...fieldErrors, price: false });
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => setIsNegotiable(!isNegotiable)}
                    >
                      <View style={[styles.checkboxBox, isNegotiable && styles.checkboxBoxChecked]}>
                        {isNegotiable && <Text style={styles.checkboxCheck}>✓</Text>}
                      </View>
                      <Text style={[styles.checkboxLabel, isRTL && styles.textRTL]}>{t('publish.priceNegotiable')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}

          {/* Champs spécifiques pour EMPLOI */}
          {getFormType() === 'job' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Type de contrat <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={categoryAttributes.contrat || ''}
                    onValueChange={(value) => handleAttributeChange('contrat', value)}
                    style={[styles.picker, !categoryAttributes.contrat && styles.pickerPlaceholder]}
                  >
                    <Picker.Item label="Sélectionnez le type" value="" color="#94A3B8" />
                    <Picker.Item label="CDI (Contrat à Durée Indéterminée)" value="CDI" />
                    <Picker.Item label="CDD (Contrat à Durée Déterminée)" value="CDD" />
                    <Picker.Item label="Stage" value="Stage" />
                    <Picker.Item label="Freelance / Mission" value="Freelance" />
                    <Picker.Item label="Temps partiel" value="Temps partiel" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Salaire (DA/mois) <Text style={styles.subdued}>(optionnel)</Text>
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL, !categoryAttributes.salaire && styles.inputPlaceholder]}
                  placeholder="Ex: 50000"
                  placeholderTextColor="#94A3B8"
                  value={categoryAttributes.salaire || ''}
                  onChangeText={(value) => handleAttributeChange('salaire', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Expérience requise
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={categoryAttributes.experience || ''}
                    onValueChange={(value) => handleAttributeChange('experience', value)}
                    style={[styles.picker, !categoryAttributes.experience && styles.pickerPlaceholder]}
                  >
                    <Picker.Item label="Sélectionnez" value="" color="#94A3B8" />
                    <Picker.Item label="Débutant / Sans expérience" value="Débutant" />
                    <Picker.Item label="1-2 ans" value="1-2 ans" />
                    <Picker.Item label="3-5 ans" value="3-5 ans" />
                    <Picker.Item label="5-10 ans" value="5-10 ans" />
                    <Picker.Item label="10+ ans" value="10+ ans" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  Secteur d'activité
                </Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL, !categoryAttributes.secteur && styles.inputPlaceholder]}
                  placeholder="Ex: Informatique, Commerce, Santé..."
                  placeholderTextColor="#94A3B8"
                  value={categoryAttributes.secteur || ''}
                  onChangeText={(value) => handleAttributeChange('secteur', value)}
                />
              </View>
            </>
          )}

          {/* Champs spécifiques pour SERVICES */}
          {getFormType() === 'service' && (
            <>
              {/* Tarif: UNIQUEMENT pour les OFFRES (professionnels), PAS pour "Je cherche" (clients) */}
              {listingType === 'offre' && (
                <>
                  {priceType === 'quote' ? (
                    <View style={styles.quotePriceContainer}>
                      <View style={styles.quotePriceHeader}>
                        <View style={styles.quotePriceIconContainer}>
                          <Text style={styles.quotePriceIcon}>💼</Text>
                        </View>
                        <View style={styles.quotePriceTextContainer}>
                          <Text style={[styles.quotePriceTitle, isRTL && styles.textRTL]}>
                            Tarification sur devis
                          </Text>
                          <Text style={[styles.quotePriceDescription, isRTL && styles.textRTL]}>
                            Les clients vous contacteront pour demander un devis personnalisé
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.quotePriceToggle}
                        onPress={() => {
                          setPriceType('fixed');
                        }}
                      >
                        <Text style={styles.quotePriceToggleText}>Indiquer un tarif horaire</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, isRTL && styles.textRTL]}>
                        Tarif (DA/heure)
                      </Text>
                      <TextInput
                        style={[styles.input, isRTL && styles.textRTL, !categoryAttributes.tarif && styles.inputPlaceholder]}
                        placeholder="Ex: 1500 DA/heure"
                        placeholderTextColor="#94A3B8"
                        value={categoryAttributes.tarif || ''}
                        onChangeText={(value) => handleAttributeChange('tarif', value)}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={styles.switchToQuoteButton}
                        onPress={() => {
                          setPriceType('quote');
                          handleAttributeChange('tarif', '');
                        }}
                      >
                        <Text style={styles.switchToQuoteText}>Passer en mode "Sur devis"</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {/* Disponibilité: pour les OFFRES uniquement */}
              {listingType === 'offre' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isRTL && styles.textRTL]}>
                    Disponibilité
                  </Text>
                  <TextInput
                    style={[styles.input, isRTL && styles.textRTL, !categoryAttributes.disponibilite && styles.inputPlaceholder]}
                    placeholder="Ex: Du lundi au vendredi, 9h-18h"
                    placeholderTextColor="#94A3B8"
                    value={categoryAttributes.disponibilite || ''}
                    onChangeText={(value) => handleAttributeChange('disponibilite', value)}
                  />
                </View>
              )}

              {/* Pour "Je cherche": Aucun tarif demandé, juste description du besoin */}
              {listingType === 'je_cherche' && (
                <View style={styles.clientRequestInfo}>
                  <View style={styles.clientRequestHeader}>
                    <View style={styles.clientRequestIconContainer}>
                      <Text style={styles.clientRequestIcon}>🔍</Text>
                    </View>
                    <View style={styles.clientRequestTextContainer}>
                      <Text style={[styles.clientRequestTitle, isRTL && styles.textRTL]}>
                        Demande de service
                      </Text>
                      <Text style={[styles.clientRequestDescription, isRTL && styles.textRTL]}>
                        Les professionnels vous contacteront avec leurs propositions et tarifs
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('publish.condition')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={condition}
                onValueChange={(value) => setCondition(value)}
                style={[styles.picker, !condition && styles.pickerPlaceholder]}
              >
                <Picker.Item label={t('publish.conditionQuestion')} value="" color="#94A3B8" />
                <Picker.Item label={t('publish.conditionNew')} value="new" />
                <Picker.Item label={t('publish.conditionLikeNew')} value="like_new" />
                <Picker.Item label={t('publish.conditionGood')} value="good" />
                <Picker.Item label={t('publish.conditionFair')} value="fair" />
                <Picker.Item label={t('publish.conditionPoor')} value="poor" />
              </Picker>
            </View>
          </View>
        </View>

        {/* 3. PHOTOS - AVANT LOCALISATION */}
        <View style={styles.section}>
          <View style={styles.photoHeader}>
            <View>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('publish.photos')}</Text>
              <Text style={[styles.sectionSubtitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'أضف حتى 8 صور' : language === 'en' ? 'Add up to 8 photos' : 'Ajoutez jusqu\'à 8 photos'}
              </Text>
            </View>
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>{images.length}/8</Text>
            </View>
          </View>

          {images.length === 0 && (
            <View style={styles.noPhotosMessage}>
              <Upload size={40} color="#94A3B8" />
              <Text style={styles.noPhotosText}>
                {language === 'ar' ? 'لم يتم إضافة صور بعد' : language === 'en' ? 'No photos added yet' : 'Aucune photo ajoutée'}
              </Text>
              <Text style={styles.noPhotosSubtext}>
                {language === 'ar' ? 'اضغط على زر "أضف صور" للبدء' : language === 'en' ? 'Tap "Add photos" to start' : 'Appuyez sur "Ajouter" pour commencer'}
              </Text>
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {images.map((image, index) => (
              <View key={`image-${index}-${image.substring(image.length - 10)}`} style={styles.imageContainer}>
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={(e) => {
                    console.error('[IMAGE] ❌ Failed to load:', image, e.nativeEvent?.error);
                  }}
                  onLoad={() => console.log('[IMAGE] ✅ Loaded:', index + 1)}
                  onLoadStart={() => console.log('[IMAGE] ⏳ Loading:', index + 1)}
                />
                {/* Badge numero de photo */}
                <View style={styles.imageBadge}>
                  <Text style={styles.imageBadgeText}>{index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                  disabled={loading}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 8 && (
              <TouchableOpacity
                style={[styles.addImageButton, loading && styles.addImageButtonDisabled]}
                onPress={handleAddImage}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={[styles.addImageText, styles.addImageTextLoading]}>
                      {language === 'ar' ? 'جاري التحميل...' : language === 'en' ? 'Uploading...' : 'Envoi...'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Upload size={32} color="#2563EB" />
                    <Text style={[styles.addImageText, isRTL && styles.textRTL]}>
                      {language === 'ar' ? 'أضف صور' : language === 'en' ? 'Add' : 'Ajouter'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* 4. TYPE D'ANNONCE FUSIONNÉ - AVANT LOCALISATION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>Type d'annonce</Text>

          <View style={styles.inputGroup}>
            {/* Sélection du mode: Offre ou Demande */}
            {getFormType() !== 'job' && getFormType() !== 'service' && (
              <View style={styles.typeSelector}>
                {getAvailableListingTypes().map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      listingType === type && styles.typeButtonActive,
                      type === 'offre' && listingType === type && styles.typeButtonOffreActive,
                      type === 'je_cherche' && listingType === type && styles.typeButtonDemandeActive,
                    ]}
                    onPress={() => {
                      setListingType(type as 'offre' | 'je_cherche');
                      if (type === 'je_cherche') {
                        setOfferType('sale');
                      }
                    }}
                  >
                    <View style={styles.typeButtonContent}>
                      {type === 'offre' ? (
                        <View style={[
                          styles.typeIconContainer,
                          listingType === type && styles.typeIconContainerActive
                        ]}>
                          <ShoppingBag
                            size={24}
                            color={listingType === type ? '#FFFFFF' : '#10B981'}
                            strokeWidth={2.5}
                          />
                        </View>
                      ) : (
                        <View style={[
                          styles.typeIconContainer,
                          styles.typeIconContainerSearch,
                          listingType === type && styles.typeIconContainerActive
                        ]}>
                          <Search
                            size={24}
                            color={listingType === type ? '#FFFFFF' : '#2563EB'}
                            strokeWidth={2.5}
                          />
                        </View>
                      )}
                      <View style={styles.typeTextContainer}>
                        <Text style={[
                          styles.typeButtonText,
                          listingType === type && styles.typeButtonTextActive
                        ]}>
                          {type === 'offre' ? 'Je vends' : 'Je cherche'}
                        </Text>
                        <Text style={[
                          styles.typeButtonDescription,
                          listingType === type && styles.typeButtonDescriptionActive
                        ]}>
                          {type === 'offre' ? 'Proposer un produit/service' : 'Rechercher un produit/service'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Grille fusionnée des types d'offre */}
            {getFormType() !== 'job' && getFormType() !== 'service' && (
              <View style={styles.offerTypeContainer}>
                <Text style={[styles.label, isRTL && styles.textRTL]}>
                  {listingType === 'offre' ? 'Type d\'offre' : 'Type de recherche'} <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.offerTypeGrid}>
                  {listingType === 'offre' ? (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.offerTypeButton,
                          offerType === 'sale' && styles.offerTypeButtonActive,
                          offerType === 'sale' && { borderColor: '#10B981' },
                        ]}
                        onPress={() => setOfferType('sale')}
                      >
                        <Text style={styles.offerTypeIcon}>💰</Text>
                        <Text style={[
                          styles.offerTypeLabel,
                          offerType === 'sale' && styles.offerTypeLabelActive,
                          offerType === 'sale' && { color: '#10B981' },
                        ]}>
                          À vendre
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.offerTypeButton,
                          offerType === 'free' && styles.offerTypeButtonActive,
                          offerType === 'free' && { borderColor: '#8B5CF6' },
                        ]}
                        onPress={() => setOfferType('free')}
                      >
                        <Text style={styles.offerTypeIcon}>🎁</Text>
                        <Text style={[
                          styles.offerTypeLabel,
                          offerType === 'free' && styles.offerTypeLabelActive,
                          offerType === 'free' && { color: '#8B5CF6' },
                        ]}>
                          À donner
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.offerTypeButton,
                          offerType === 'exchange' && styles.offerTypeButtonActive,
                          offerType === 'exchange' && { borderColor: '#F59E0B' },
                        ]}
                        onPress={() => setOfferType('exchange')}
                      >
                        <Text style={styles.offerTypeIcon}>🔄</Text>
                        <Text style={[
                          styles.offerTypeLabel,
                          offerType === 'exchange' && styles.offerTypeLabelActive,
                          offerType === 'exchange' && { color: '#F59E0B' },
                        ]}>
                          À échanger
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.offerTypeButton,
                          offerType === 'rent' && styles.offerTypeButtonActive,
                          offerType === 'rent' && { borderColor: '#3B82F6' },
                        ]}
                        onPress={() => setOfferType('rent')}
                      >
                        <Text style={styles.offerTypeIcon}>🏠</Text>
                        <Text style={[
                          styles.offerTypeLabel,
                          offerType === 'rent' && styles.offerTypeLabelActive,
                          offerType === 'rent' && { color: '#3B82F6' },
                        ]}>
                          À louer
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.offerTypeButton,
                          offerType === 'sale' && styles.offerTypeButtonActive,
                          offerType === 'sale' && { borderColor: '#2563EB' },
                        ]}
                        onPress={() => setOfferType('sale')}
                      >
                        <Text style={styles.offerTypeIcon}>🛒</Text>
                        <Text style={[
                          styles.offerTypeLabel,
                          offerType === 'sale' && styles.offerTypeLabelActive,
                          offerType === 'sale' && { color: '#2563EB' },
                        ]}>
                          J'achète
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.offerTypeButton,
                          offerType === 'free' && styles.offerTypeButtonActive,
                          offerType === 'free' && { borderColor: '#8B5CF6' },
                        ]}
                        onPress={() => setOfferType('free')}
                      >
                        <Text style={styles.offerTypeIcon}>🙏</Text>
                        <Text style={[
                          styles.offerTypeLabel,
                          offerType === 'free' && styles.offerTypeLabelActive,
                          offerType === 'free' && { color: '#8B5CF6' },
                        ]}>
                          Je souhaite recevoir
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.offerTypeButton,
                          offerType === 'exchange' && styles.offerTypeButtonActive,
                          offerType === 'exchange' && { borderColor: '#F59E0B' },
                        ]}
                        onPress={() => setOfferType('exchange')}
                      >
                        <Text style={styles.offerTypeIcon}>🔄</Text>
                        <Text style={[
                          styles.offerTypeLabel,
                          offerType === 'exchange' && styles.offerTypeLabelActive,
                          offerType === 'exchange' && { color: '#F59E0B' },
                        ]}>
                          J'échange
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.offerTypeButton,
                          offerType === 'rent' && styles.offerTypeButtonActive,
                          offerType === 'rent' && { borderColor: '#3B82F6' },
                        ]}
                        onPress={() => setOfferType('rent')}
                      >
                        <Text style={styles.offerTypeIcon}>🔑</Text>
                        <Text style={[
                          styles.offerTypeLabel,
                          offerType === 'rent' && styles.offerTypeLabelActive,
                          offerType === 'rent' && { color: '#3B82F6' },
                        ]}>
                          Je loue
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                {offerType === 'free' && (
                  <View style={styles.offerTypeNotice}>
                    <Text style={styles.offerTypeNoticeIcon}>ℹ️</Text>
                    <Text style={styles.offerTypeNoticeText}>
                      {listingType === 'offre'
                        ? 'Le prix sera automatiquement défini comme gratuit'
                        : 'Vous recherchez quelque chose gratuitement'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* 5. LOCALISATION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('publish.location')}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>
              Wilaya <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, fieldErrors.wilaya && styles.inputError]}>
              <Picker
                selectedValue={wilaya}
                onValueChange={(value) => {
                  setWilaya(value);
                  if (fieldErrors.wilaya) setFieldErrors({ ...fieldErrors, wilaya: false });
                }}
                style={[styles.picker, !wilaya && styles.pickerPlaceholder]}
              >
                <Picker.Item label="Dans quelle wilaya ?" value="" color="#94A3B8" />
                {wilayas.map((w) => (
                  <Picker.Item key={w.id} label={`${w.code} - ${getWilayaName(w)}`} value={w.name} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <CommuneAutocomplete
              label="Commune *"
              placeholder="Dans quelle commune ?"
              value={commune}
              wilayaId={wilayas.find(w => w.name === wilaya)?.id.toString() || null}
              wilayaName={wilaya || null}
              onSelect={(value) => {
                setCommune(value);
                if (fieldErrors.commune) setFieldErrors({ ...fieldErrors, commune: false });
              }}
              isRTL={isRTL}
            />
            {fieldErrors.commune && (
              <Text style={styles.errorText}>Champ requis</Text>
            )}
          </View>
        </View>

        {/* 6. DATES DE DISPONIBILITÉ / PÉRIODE */}
        {needsDatePicker() && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {needsDatePicker() === 'range' ? 'Période de disponibilité' : 'Date de disponibilité'}
            </Text>

            <DateRangePicker
              label={
                getFormType() === 'rent'
                  ? (listingType === 'offre' ? 'Période de location proposée' : 'Période de location souhaitée')
                  : getFormType() === 'job'
                  ? 'Date de début souhaitée'
                  : getFormType() === 'service'
                  ? 'Date de rendez-vous disponible'
                  : 'Date de disponibilité'
              }
              startDate={availableFrom}
              endDate={availableTo}
              onStartDateChange={(date) => {
                setAvailableFrom(date);
                if (fieldErrors.availableFrom) {
                  setFieldErrors({ ...fieldErrors, availableFrom: false });
                }
              }}
              onEndDateChange={(date) => {
                setAvailableTo(date);
                if (fieldErrors.availableTo) {
                  setFieldErrors({ ...fieldErrors, availableTo: false });
                }
              }}
              isFlexible={isDateFlexible}
              onFlexibleChange={setIsDateFlexible}
              isRTL={isRTL}
              singleDate={needsDatePicker() === 'single'}
              error={fieldErrors.availableFrom || fieldErrors.availableTo}
            />
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.cancelButton, loading && styles.cancelButtonDisabled]}
            onPress={() => {
              if (title || description || price || images.length > 0) {
                if (Platform.OS === 'web') {
                  if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.')) {
                    router.back();
                  }
                } else {
                  Alert.alert(
                    'Annuler',
                    isEditMode
                      ? 'Êtes-vous sûr de vouloir annuler ? Les modifications ne seront pas sauvegardées.'
                      : 'Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.',
                    [
                      { text: 'Non', style: 'cancel' },
                      { text: 'Oui', onPress: () => router.back(), style: 'destructive' }
                    ]
                  );
                }
              } else {
                router.back();
              }
            }}
            disabled={loading}
          >
            <Text style={[styles.cancelButtonText, isRTL && styles.textRTL]}>
              {isEditMode ? '✕ ANNULER' : '✕ ANNULER'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.publishButton,
              isEditMode && styles.updateButton,
              loading && styles.publishButtonDisabled
            ]}
            onPress={handlePublish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.publishButtonText, isRTL && styles.textRTL]}>
                {isEditMode ? '✓ METTRE À JOUR' : '✓ PUBLIER'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleSuccessModalClose}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.success')}</Text>
            </View>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={handleErrorModalClose}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleErrorModalClose}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#DC2626' }]}>{t('common.error')}</Text>
            </View>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#DC2626' }]}
              onPress={handleErrorModalClose}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  quotaContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  form: {
    padding: 16,
    ...(Platform.OS === 'web' && {
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  photoCounter: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  photoCounterText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  noPhotosMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  noPhotosText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    textAlign: 'center',
  },
  noPhotosSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  imagesScroll: {
    marginTop: 8,
    paddingVertical: 4,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#2563EB',
    backgroundColor: '#F1F5F9',
  },
  imageBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addImageButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F3F4F6',
    borderColor: '#CBD5E1',
  },
  addImageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 8,
    textAlign: 'center',
  },
  addImageTextLoading: {
    color: '#2563EB',
    fontSize: 12,
  },
  addImageTextDisabled: {
    color: '#94A3B8',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  labelWithHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  required: {
    color: '#DC2626',
  },
  subdued: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
      transition: 'all 0.2s ease',
    }),
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
    shadowColor: '#DC2626',
    shadowOpacity: 0.2,
  },
  textArea: {
    height: 120,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 54,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
      cursor: 'pointer',
    }),
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  publishButton: {
    flex: 2,
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  updateButton: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
  },
  publishButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    minHeight: 130,
  },
  typeButtonContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  typeIconContainerSearch: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  typeIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  typeTextContainer: {
    flex: 1,
    paddingTop: 4,
  },
  typeButtonActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1.02 }],
  },
  typeButtonOffreActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    shadowColor: '#10B981',
  },
  typeButtonDemandeActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
  },
  typeButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  typeButtonDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'left',
    lineHeight: 18,
    fontWeight: '500',
  },
  typeButtonDescriptionActive: {
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '600',
  },
  typeButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F1F5F9',
  },
  typeButtonTextDisabled: {
    color: '#94A3B8',
  },
  typeButtonProUpgrade: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  typeButtonTextProUpgrade: {
    color: '#2563EB',
    fontWeight: '700',
  },
  typeButtonSubtextSmall: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  offerTypeContainer: {
    marginTop: 20,
  },
  offerTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  offerTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  offerTypeButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  offerTypeIcon: {
    fontSize: 32,
  },
  offerTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  offerTypeLabelActive: {
    fontWeight: '800',
    fontSize: 15,
  },
  offerTypeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  offerTypeNoticeIcon: {
    fontSize: 18,
  },
  offerTypeNoticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1E40AF',
    lineHeight: 18,
  },
  typeButtonFullWidth: {
    marginBottom: 16,
  },
  nonProContainer: {
    width: '100%',
  },
  proBadgeContainer: {
    width: '100%',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 12,
  },
  proBadgeIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  proBadgeTextContainer: {
    flex: 1,
  },
  proBadgeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  proBadgeSubtitle: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 16,
  },
  userTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userTypeIconText: {
    fontSize: 24,
  },
  userTypeInfo: {
    flex: 1,
  },
  userTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userTypeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#047857',
  },
  proInfoBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
    gap: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  proInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proInfoIcon: {
    fontSize: 32,
  },
  proInfoHeaderText: {
    flex: 1,
  },
  proInfoTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  proInfoSubtitle: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '600',
  },
  proUpgradeButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  proUpgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  pickerPlaceholder: {
    color: '#94A3B8',
  },
  inputPlaceholder: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
  proPackageButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  proPackageButtonActive: {
    backgroundColor: '#1D4ED8',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  proPackageButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  proPackageButtonTextActive: {
    color: '#FFFFFF',
  },
  typeButtonPro: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FB923C',
    alignItems: 'center',
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonSubtext: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '600',
    marginTop: 4,
  },
  proWarningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  proWarningText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 12,
    lineHeight: 20,
  },
  proWarningButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  proWarningButtonText: {
    color: '#1A202C',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  quotePriceContainer: {
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quotePriceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  quotePriceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  quotePriceIcon: {
    fontSize: 28,
  },
  quotePriceTextContainer: {
    flex: 1,
  },
  quotePriceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  quotePriceDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 20,
  },
  quotePriceToggle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  quotePriceToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  switchToQuoteButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  switchToQuoteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  clientRequestInfo: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  clientRequestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  clientRequestIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  clientRequestIcon: {
    fontSize: 28,
  },
  clientRequestTextContainer: {
    flex: 1,
  },
  clientRequestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  clientRequestDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 20,
  },
});
