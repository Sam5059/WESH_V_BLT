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
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, X, MapPin, Upload, DollarSign, ShoppingCart, Package, Search as SearchIcon, Gift, Repeat, Home } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import TopBar from '@/components/TopBar';

export default function PublishScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [loading, setLoading] = useState(false);

  // Form states
  const [listingType, setListingType] = useState<'offer' | 'request'>('offer');
  const [offerType, setOfferType] = useState<'sale' | 'free' | 'exchange' | 'rent'>('sale');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [wilayaCode, setWilayaCode] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Options data
  const [categories, setCategories] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
    if (isEditing) loadListingData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, wilayasRes] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('wilayas').select('*').order('code'),
      ]);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (wilayasRes.data) setWilayas(wilayasRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadListingData = async () => {
    try {
      const { data, error } = await supabase.from('listings').select('*').eq('id', params.id).single();
      if (error) throw error;
      if (data) {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setPrice(data.price?.toString() || '');
        setCategoryId(data.category_id || '');
        setWilayaCode(data.wilaya_code || '');
        setCommuneId(data.commune_id || '');
        setImages(data.images || []);
        setListingType(data.listing_type === 'purchase' ? 'request' : 'offer');
        setOfferType(data.offer_type || 'sale');
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'annonce');
    }
  };

  useEffect(() => {
    if (wilayaCode) loadCommunes(wilayaCode);
  }, [wilayaCode]);

  const loadCommunes = async (code: string) => {
    try {
      const { data } = await supabase.from('communes').select('*').eq('wilaya_code', code).order('name_fr');
      if (data) setCommunes(data);
    } catch (error) {
      console.error('Error loading communes:', error);
    }
  };

  const handleImagePick = async () => {
    Alert.alert('Info', 'Fonctionnalité d\'upload d\'images à venir');
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }
    if (!title || !description || !categoryId || !wilayaCode) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (offerType === 'sale' && !price) {
      Alert.alert('Erreur', 'Le prix est obligatoire pour une vente');
      return;
    }
    setLoading(true);
    try {
      const listingData = {
        title,
        description,
        price: offerType === 'sale' ? parseFloat(price) : 0,
        category_id: categoryId,
        wilaya_code: wilayaCode,
        commune_id: communeId || null,
        images,
        user_id: user.id,
        listing_type: listingType === 'offer' ? 'offer' : 'purchase',
        offer_type: offerType,
        status: 'active',
      };
      if (isEditing) {
        const { error } = await supabase.from('listings').update(listingData).eq('id', params.id);
        if (error) throw error;
        Alert.alert('Succès', 'Annonce modifiée avec succès');
      } else {
        const { error } = await supabase.from('listings').insert([listingData]);
        if (error) throw error;
        Alert.alert('Succès', 'Annonce publiée avec succès');
      }
      router.back();
    } catch (error: any) {
      console.error('Error saving listing:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  const handlePayAtPartner = () => {
    router.push('/pro/packages' as any);
  };

  const isOfferTypeDisabled = (type: 'sale' | 'free' | 'exchange' | 'rent') => {
    return listingType === 'request' && type === 'free';
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isEditing ? 'Modifier l\'annonce' : 'Déposer une annonce'}</Text>
          <Text style={styles.headerSubtitle}>Remplissez les informations ci-dessous</Text>
        </View>

        {/* Type d'annonce */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type d'annonce <Text style={styles.required}>*</Text></Text>
          <View style={styles.typeCards}>
            <TouchableOpacity style={[styles.typeCard, listingType === 'offer' && styles.typeCardActive]} onPress={() => setListingType('offer')}>
              <Package size={32} color={listingType === 'offer' ? '#1e40af' : '#666'} />
              <Text style={[styles.typeCardTitle, listingType === 'offer' && styles.typeCardTitleActive]}>Offre</Text>
              <Text style={styles.typeCardDescription}>Je vends ou propose quelque chose</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeCard, listingType === 'request' && styles.typeCardActive]} onPress={() => setListingType('request')}>
              <SearchIcon size={32} color={listingType === 'request' ? '#1e40af' : '#666'} />
              <Text style={[styles.typeCardTitle, listingType === 'request' && styles.typeCardTitleActive]}>Demande</Text>
              <Text style={styles.typeCardDescription}>Je cherche quelque chose</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Type d'offre avec émojis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type d'offre <Text style={styles.required}>*</Text></Text>
          <View style={styles.offerTypes}>
            <TouchableOpacity style={[styles.offerTypeChip, offerType === 'sale' && styles.offerTypeChipActive]} onPress={() => setOfferType('sale')}>
              <Text style={styles.offerTypeEmoji}>💰</Text>
              <Text style={[styles.offerTypeText, offerType === 'sale' && styles.offerTypeTextActive]}>Vente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.offerTypeChip, offerType === 'free' && styles.offerTypeChipActive,
