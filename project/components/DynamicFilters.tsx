import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Car, Home, Smartphone, Briefcase, RotateCcw } from 'lucide-react-native';

interface DynamicFiltersProps {
  categorySlug?: string;
  onFiltersApply: (listings: any[]) => void;
  language?: 'fr' | 'ar' | 'en';
}

interface FilterState {
  brand?: string;
  model?: string;
  yearMin?: string;
  yearMax?: string;
  priceMin?: string;
  priceMax?: string;
  fuel?: string;
  transmission?: string;
  propertyType?: string;
  city?: string;
  surface?: string;
  rooms?: string;
  deviceType?: string;
  condition?: string;
  serviceType?: string;
  tariff?: string;
}

const isWeb = Platform.OS === 'web';

export default function DynamicFilters({
  categorySlug,
  onFiltersApply,
  language = 'fr',
}: DynamicFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getCategoryIcon = () => {
    if (categorySlug?.includes('vehicule') || categorySlug?.includes('auto')) {
      return <Car size={24} color="#2563EB" />;
    }
    if (categorySlug?.includes('immobilier') || categorySlug?.includes('location')) {
      return <Home size={24} color="#2563EB" />;
    }
    if (categorySlug?.includes('electronique') || categorySlug?.includes('telephone')) {
      return <Smartphone size={24} color="#2563EB" />;
    }
    return <Briefcase size={24} color="#2563EB" />;
  };

  const getFilterTitle = () => {
    const titles = {
      fr: 'Filtres dynamiques',
      ar: 'المرشحات الديناميكية',
      en: 'Dynamic Filters',
    };
    return titles[language];
  };

  useEffect(() => {
    if (categorySlug?.includes('vehicule') || categorySlug?.includes('auto')) {
      loadBrands();
    }
  }, [categorySlug]);

  useEffect(() => {
    if (filters.brand) {
      loadModels(filters.brand);
    }
  }, [filters.brand]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  async function loadBrands() {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .order('name');
    if (data) setBrands(data);
  }

  async function loadModels(brandId: string) {
    const { data } = await supabase
      .from('models')
      .select('*')
      .eq('brand_id', brandId)
      .order('name');
    if (data) setModels(data);
  }

  async function applyFilters() {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active');

      if (categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();

        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      if (filters.priceMin) {
        query = query.gte('price', parseFloat(filters.priceMin));
      }
      if (filters.priceMax) {
        query = query.lte('price', parseFloat(filters.priceMax));
      }

      if (filters.brand) {
        query = query.contains('attributes', { brand_id: filters.brand });
      }
      if (filters.model) {
        query = query.contains('attributes', { model_id: filters.model });
      }
      if (filters.yearMin) {
        query = query.gte('attributes->year', parseInt(filters.yearMin));
      }
      if (filters.yearMax) {
        query = query.lte('attributes->year', parseInt(filters.yearMax));
      }
      if (filters.fuel) {
        query = query.contains('attributes', { fuel_type: filters.fuel });
      }
      if (filters.transmission) {
        query = query.contains('attributes', { transmission: filters.transmission });
      }

      if (filters.propertyType) {
        query = query.contains('attributes', { property_type: filters.propertyType });
      }
      if (filters.surface) {
        query = query.gte('attributes->surface', parseFloat(filters.surface));
      }
      if (filters.rooms) {
        query = query.contains('attributes', { rooms: filters.rooms });
      }

      if (filters.deviceType) {
        query = query.contains('attributes', { device_type: filters.deviceType });
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }

      if (filters.city) {
        query = query.ilike('commune', `%${filters.city}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        onFiltersApply(data);
      }
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setFilters({});
    setModels([]);
  }

  function updateFilter(key: keyof FilterState, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const renderVehicleFilters = () => (
    <>
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'العلامة التجارية' : language === 'en' ? 'Brand' : 'Marque'}
          </Text>
          <View style={styles.selectContainer}>
            <select
              style={styles.select as any}
              value={filters.brand || ''}
              onChange={(e) => updateFilter('brand', e.target.value)}
            >
              <option value="">
                {language === 'ar' ? 'اختر' : language === 'en' ? 'Select' : 'Sélectionner'}
              </option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </View>
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'الطراز' : language === 'en' ? 'Model' : 'Modèle'}
          </Text>
          <View style={styles.selectContainer}>
            <select
              style={styles.select as any}
              value={filters.model || ''}
              onChange={(e) => updateFilter('model', e.target.value)}
              disabled={!filters.brand}
            >
              <option value="">
                {language === 'ar' ? 'اختر' : language === 'en' ? 'Select' : 'Sélectionner'}
              </option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'السنة من' : language === 'en' ? 'Year from' : 'Année min'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="2010"
            value={filters.yearMin || ''}
            onChangeText={(text) => updateFilter('yearMin', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'السنة إلى' : language === 'en' ? 'Year to' : 'Année max'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="2024"
            value={filters.yearMax || ''}
            onChangeText={(text) => updateFilter('yearMax', text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'الوقود' : language === 'en' ? 'Fuel' : 'Carburant'}
          </Text>
          <View style={styles.selectContainer}>
            <select
              style={styles.select as any}
              value={filters.fuel || ''}
              onChange={(e) => updateFilter('fuel', e.target.value)}
            >
              <option value="">
                {language === 'ar' ? 'اختر' : language === 'en' ? 'Select' : 'Sélectionner'}
              </option>
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="electrique">Électrique</option>
              <option value="hybride">Hybride</option>
            </select>
          </View>
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'ناقل الحركة' : language === 'en' ? 'Transmission' : 'Boîte'}
          </Text>
          <View style={styles.selectContainer}>
            <select
              style={styles.select as any}
              value={filters.transmission || ''}
              onChange={(e) => updateFilter('transmission', e.target.value)}
            >
              <option value="">
                {language === 'ar' ? 'اختر' : language === 'en' ? 'Select' : 'Sélectionner'}
              </option>
              <option value="manuelle">Manuelle</option>
              <option value="automatique">Automatique</option>
            </select>
          </View>
        </View>
      </View>
    </>
  );

  const renderRealEstateFilters = () => (
    <>
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'نوع العقار' : language === 'en' ? 'Property Type' : 'Type'}
          </Text>
          <View style={styles.selectContainer}>
            <select
              style={styles.select as any}
              value={filters.propertyType || ''}
              onChange={(e) => updateFilter('propertyType', e.target.value)}
            >
              <option value="">
                {language === 'ar' ? 'اختر' : language === 'en' ? 'Select' : 'Sélectionner'}
              </option>
              <option value="appartement">Appartement</option>
              <option value="maison">Maison</option>
              <option value="studio">Studio</option>
              <option value="villa">Villa</option>
              <option value="terrain">Terrain</option>
            </select>
          </View>
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'المدينة' : language === 'en' ? 'City' : 'Ville'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={language === 'ar' ? 'ابحث عن مدينة' : 'Rechercher...'}
            value={filters.city || ''}
            onChangeText={(text) => updateFilter('city', text)}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'المساحة (م²)' : language === 'en' ? 'Surface (m²)' : 'Surface (m²)'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="50"
            value={filters.surface || ''}
            onChangeText={(text) => updateFilter('surface', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'عدد الغرف' : language === 'en' ? 'Rooms' : 'Nombre de pièces'}
          </Text>
          <View style={styles.selectContainer}>
            <select
              style={styles.select as any}
              value={filters.rooms || ''}
              onChange={(e) => updateFilter('rooms', e.target.value)}
            >
              <option value="">
                {language === 'ar' ? 'اختر' : language === 'en' ? 'Select' : 'Sélectionner'}
              </option>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </View>
        </View>
      </View>
    </>
  );

  const renderElectronicsFilters = () => (
    <>
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'النوع' : language === 'en' ? 'Type' : 'Type'}
          </Text>
          <View style={styles.selectContainer}>
            <select
              style={styles.select as any}
              value={filters.deviceType || ''}
              onChange={(e) => updateFilter('deviceType', e.target.value)}
            >
              <option value="">
                {language === 'ar' ? 'اختر' : language === 'en' ? 'Select' : 'Sélectionner'}
              </option>
              <option value="smartphone">Smartphone</option>
              <option value="laptop">Ordinateur portable</option>
              <option value="tablet">Tablette</option>
              <option value="tv">Télévision</option>
            </select>
          </View>
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.label}>
            {language === 'ar' ? 'الحالة' : language === 'en' ? 'Condition' : 'État'}
          </Text>
          <View style={styles.selectContainer}>
            <select
              style={styles.select as any}
              value={filters.condition || ''}
              onChange={(e) => updateFilter('condition', e.target.value)}
            >
              <option value="">
                {language === 'ar' ? 'اختر' : language === 'en' ? 'Select' : 'Sélectionner'}
              </option>
              <option value="neuf">Neuf</option>
              <option value="comme_neuf">Comme neuf</option>
              <option value="bon_etat">Bon état</option>
              <option value="usage">Usage</option>
            </select>
          </View>
        </View>
      </View>
    </>
  );

  const renderPriceFilters = () => (
    <View style={styles.filterRow}>
      <View style={styles.filterItem}>
        <Text style={styles.label}>
          {language === 'ar' ? 'السعر من (دج)' : language === 'en' ? 'Price from (DA)' : 'Prix min (DA)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="10000"
          value={filters.priceMin || ''}
          onChangeText={(text) => updateFilter('priceMin', text)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.filterItem}>
        <Text style={styles.label}>
          {language === 'ar' ? 'السعر إلى (دج)' : language === 'en' ? 'Price to (DA)' : 'Prix max (DA)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="1000000"
          value={filters.priceMax || ''}
          onChangeText={(text) => updateFilter('priceMax', text)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const getCategoryType = () => {
    if (categorySlug?.includes('vehicule') || categorySlug?.includes('auto')) return 'vehicle';
    if (categorySlug?.includes('immobilier') || categorySlug?.includes('location')) return 'realestate';
    if (categorySlug?.includes('electronique') || categorySlug?.includes('telephone')) return 'electronics';
    return 'other';
  };

  const categoryType = getCategoryType();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          {getCategoryIcon()}
          <Text style={styles.title}>{getFilterTitle()}</Text>
        </View>

        <ScrollView style={styles.filtersContainer}>
          {categoryType === 'vehicle' && renderVehicleFilters()}
          {categoryType === 'realestate' && renderRealEstateFilters()}
          {categoryType === 'electronics' && renderElectronicsFilters()}
          {renderPriceFilters()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetFilters}
            activeOpacity={0.8}
          >
            <RotateCcw size={18} color="#6B7280" />
            <Text style={styles.resetButtonText}>
              {language === 'ar' ? 'إعادة تعيين' : language === 'en' ? 'Reset' : 'Réinitialiser'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={applyFilters}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.applyButtonText}>
              {loading
                ? language === 'ar'
                  ? 'جاري التحميل...'
                  : language === 'en'
                  ? 'Loading...'
                  : 'Chargement...'
                : language === 'ar'
                ? 'تطبيق الفلاتر'
                : language === 'en'
                ? 'Apply Filters'
                : 'Appliquer les filtres'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: isWeb ? 16 : 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: isWeb ? 24 : 16,
    padding: isWeb ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isWeb ? 24 : 16,
    gap: 12,
  },
  title: {
    fontSize: isWeb ? 22 : 18,
    fontWeight: '700',
    color: '#111827',
  },
  filtersContainer: {
    maxHeight: 600,
  },
  filterRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    marginBottom: 20,
  },
  filterItem: {
    flex: 1,
    minWidth: isWeb ? 200 : undefined,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  selectContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  select: {
    height: 48,
    border: 'none',
    outline: 'none',
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: 15,
    backgroundColor: 'transparent',
    color: '#111827',
    cursor: 'pointer',
  },
  buttonContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 12,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
