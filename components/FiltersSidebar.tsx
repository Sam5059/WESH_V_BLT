import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface FiltersSidebarProps {
  selectedCategory?: string;
  onFiltersChange: (filters: any) => void;
  totalResults: number;
  onReset: () => void;
  currentSearchQuery?: string;
  currentFilters?: any;
}

interface FilterSection {
  id: string;
  label: string;
  type: 'checkbox' | 'range' | 'select' | 'radio';
  options?: Array<{ value: string; label: string; count?: number }>;
  min?: number;
  max?: number;
}

export default function FiltersSidebar({
  selectedCategory,
  onFiltersChange,
  totalResults,
  onReset,
  currentSearchQuery,
  currentFilters,
}: FiltersSidebarProps) {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['categories', 'location', 'price', 'condition']));
  const [filters, setFilters] = useState<any>(selectedCategory ? { category_id: selectedCategory } : {});
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [brands, setBrands] = useState<any[]>([]);
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [dynamicFilters, setDynamicFilters] = useState<FilterSection[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingWilayas, setLoadingWilayas] = useState(false);
  const [loadingDynamic, setLoadingDynamic] = useState(false);
  const onFiltersChangeRef = useRef(onFiltersChange);

  const isRTL = language === 'ar';

  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  useEffect(() => {
    console.log('FiltersSidebar mounted - loading initial data');
    loadCategories();
    loadWilayas();
  }, []);

  useEffect(() => {
    if (selectedCategory && filters.category_id !== selectedCategory) {
      setFilters(prev => ({ ...prev, category_id: selectedCategory }));
    }
    loadDynamicFilters();
  }, [selectedCategory]);

  // Désactiver temporairement le comptage pour améliorer les performances
  // useEffect(() => {
  //   if (categories.length > 0) {
  //     loadCategoryCounts(categories);
  //   }
  // }, [categories, currentFilters?.wilaya, currentFilters?.price_min, currentFilters?.price_max]);

  useEffect(() => {
    onFiltersChangeRef.current(filters);
  }, [filters]);

  async function loadCategories() {
    setLoadingCategories(true);
    try {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, name_ar, name_en, slug, display_order')
        .is('parent_id', null)
        .order('display_order', { ascending: true, nullsFirst: false });

      if (cats) {
        // Exclure "stores-pro" des catégories de filtres
        const filteredCats = cats.filter(cat => cat.slug !== 'stores-pro');
        setCategories(filteredCats);
        await loadCategoryCounts(filteredCats);
      }
    } finally {
      setLoadingCategories(false);
    }
  }

  async function loadCategoryCounts(cats: any[]) {
    const counts: Record<string, number> = {};
    const searchTerm = currentSearchQuery?.trim().toLowerCase() || '';

    for (const cat of cats) {
      const { data: subcats } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', cat.id);

      const subcatIds = subcats?.map(s => s.id) || [];

      if (subcatIds.length === 0) {
        subcatIds.push(cat.id);
      }

      let query = supabase
        .from('listings')
        .select('id, title, description, attributes')
        .eq('status', 'active')
        .in('category_id', subcatIds);

      if (currentFilters?.price_min) {
        query = query.gte('price', currentFilters.price_min);
      }

      if (currentFilters?.price_max) {
        query = query.lte('price', currentFilters.price_max);
      }

      if (currentFilters?.wilaya) {
        query = query.eq('wilaya', currentFilters.wilaya);
      }

      if (currentFilters?.condition) {
        query = query.eq('condition', currentFilters.condition);
      }

      const { data: listings } = await query;

      let filteredListings = listings || [];

      if (searchTerm) {
        filteredListings = filteredListings.filter((listing: any) => {
          const title = (listing.title || '').toLowerCase();
          const description = (listing.description || '').toLowerCase();
          const brandName = (listing.attributes?.brand_name || '').toLowerCase();
          const modelName = (listing.attributes?.model_name || '').toLowerCase();
          const attributesStr = listing.attributes ? JSON.stringify(listing.attributes).toLowerCase() : '';

          return title.includes(searchTerm) ||
                 description.includes(searchTerm) ||
                 brandName.includes(searchTerm) ||
                 modelName.includes(searchTerm) ||
                 attributesStr.includes(searchTerm);
        });
      }

      counts[cat.id] = filteredListings.length;
    }

    setCategoryCounts(counts);
  }

  async function loadWilayas() {
    setLoadingWilayas(true);
    try {
      const { data, error } = await supabase
        .from('wilayas')
        .select('code, name, name_ar, name_en')
        .order('code');

      if (error) {
        console.error('Error loading wilayas:', error);
      } else if (data) {
        console.log('Wilayas loaded:', data.length);
        setWilayas(data);
      }
    } finally {
      setLoadingWilayas(false);
    }
  }

  async function loadDynamicFilters() {
    if (!selectedCategory) {
      setDynamicFilters([]);
      return;
    }

    setLoadingDynamic(true);
    try {

    const { data: categoryData } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', selectedCategory)
      .single();

    if (!categoryData) return;

    const slug = categoryData.slug;
    const filters: FilterSection[] = [];

    if (slug === 'voitures' || slug === 'motos' || slug === 'camions') {
      const { data: brandsList } = await supabase
        .from('brands')
        .select('id, name')
        .eq('category_type', 'vehicules')
        .order('name');

      filters.push({
        id: 'brand',
        label: language === 'ar' ? 'الماركة' : language === 'en' ? 'Brand' : 'Marque',
        type: 'select',
        options: brandsList?.map(b => ({ value: b.id, label: b.name })) || [],
      });

      filters.push({
        id: 'year',
        label: language === 'ar' ? 'السنة' : language === 'en' ? 'Year' : 'Année',
        type: 'range',
        min: 1990,
        max: new Date().getFullYear(),
      });

      filters.push({
        id: 'mileage',
        label: language === 'ar' ? 'الكيلومتراج' : language === 'en' ? 'Mileage' : 'Kilométrage',
        type: 'range',
        min: 0,
        max: 500000,
      });

    } else if (slug === 'appartements' || slug === 'maisons-villas' || slug === 'terrains') {
      filters.push({
        id: 'surface',
        label: language === 'ar' ? 'المساحة (م²)' : language === 'en' ? 'Surface (m²)' : 'Surface (m²)',
        type: 'range',
        min: 0,
        max: 1000,
      });

      filters.push({
        id: 'rooms',
        label: language === 'ar' ? 'عدد الغرف' : language === 'en' ? 'Rooms' : 'Pièces',
        type: 'checkbox',
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5+', label: '5+' },
        ],
      });
    } else if (slug.includes('telephone') || slug.includes('ordinateur') || slug.includes('tablette')) {
      const { data: brandsList } = await supabase
        .from('brands')
        .select('id, name')
        .eq('category_type', 'electronique')
        .order('name');

      filters.push({
        id: 'brand',
        label: language === 'ar' ? 'الماركة' : language === 'en' ? 'Brand' : 'Marque',
        type: 'select',
        options: brandsList?.map(b => ({ value: b.id, label: b.name })) || [],
      });

      filters.push({
        id: 'storage',
        label: language === 'ar' ? 'التخزين' : language === 'en' ? 'Storage' : 'Stockage',
        type: 'checkbox',
        options: [
          { value: '32GB', label: '32 GB' },
          { value: '64GB', label: '64 GB' },
          { value: '128GB', label: '128 GB' },
          { value: '256GB', label: '256 GB' },
          { value: '512GB', label: '512 GB' },
          { value: '1TB', label: '1 TB' },
        ],
      });
    }

    // Filtres pour Mode & Accessoires
    if (slug.includes('vetement') || slug.includes('chaussure') || slug.includes('accessoire')) {
      filters.push({
        id: 'size',
        label: language === 'ar' ? 'المقاس' : language === 'en' ? 'Size' : 'Taille',
        type: 'checkbox',
        options: [
          { value: 'XS', label: 'XS' },
          { value: 'S', label: 'S' },
          { value: 'M', label: 'M' },
          { value: 'L', label: 'L' },
          { value: 'XL', label: 'XL' },
          { value: 'XXL', label: 'XXL' },
        ],
      });
    }


    setDynamicFilters(filters);
    } finally {
      setLoadingDynamic(false);
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev: any) => {
      if (value === null || value === undefined || value === '') {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };

  const getCategoryName = (cat: any) => {
    if (language === 'ar') return cat.name_ar || cat.name;
    if (language === 'en') return cat.name_en || cat.name;
    return cat.name;
  };

  const getWilayaName = (wilaya: any) => {
    if (language === 'ar') return wilaya.name_ar || wilaya.name;
    if (language === 'en') return wilaya.name_en || wilaya.name;
    return wilaya.name;
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  const renderCheckboxFilter = (filter: FilterSection) => {
    const selectedValues = filters[filter.id] || [];

    return (
      <View style={styles.filterOptions}>
        {filter.options?.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.checkboxOption}
            onPress={() => {
              const newValues = selectedValues.includes(option.value)
                ? selectedValues.filter((v: string) => v !== option.value)
                : [...selectedValues, option.value];
              updateFilter(filter.id, newValues.length > 0 ? newValues : null);
            }}
          >
            <View style={[
              styles.checkbox,
              selectedValues.includes(option.value) && styles.checkboxChecked
            ]}>
              {selectedValues.includes(option.value) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={[styles.checkboxLabel, isRTL && styles.textRTL]}>
              {option.label}
              {option.count !== undefined && ` (${option.count})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRadioFilter = (filter: FilterSection) => {
    const selectedValue = filters[filter.id];

    return (
      <View style={styles.filterOptions}>
        {filter.options?.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.radioOption}
            onPress={() => {
              updateFilter(filter.id, selectedValue === option.value ? null : option.value);
            }}
          >
            <View style={[
              styles.radio,
              selectedValue === option.value && styles.radioSelected
            ]}>
              {selectedValue === option.value && (
                <View style={styles.radioDot} />
              )}
            </View>
            <Text style={[styles.radioLabel, isRTL && styles.textRTL]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRangeFilter = (filter: FilterSection) => {
    const minValue = filters[`${filter.id}_min`] || '';
    const maxValue = filters[`${filter.id}_max`] || '';

    return (
      <View style={styles.rangeContainer}>
        <View style={styles.rangeInputs}>
          <TextInput
            style={[styles.rangeInput, isRTL && styles.textRTL]}
            placeholder={language === 'ar' ? 'الأدنى' : language === 'en' ? 'Min' : 'Min'}
            value={minValue.toString()}
            onChangeText={(text) => updateFilter(`${filter.id}_min`, text ? parseInt(text) : null)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.rangeInput, isRTL && styles.textRTL]}
            placeholder={language === 'ar' ? 'الأقصى' : language === 'en' ? 'Max' : 'Max'}
            value={maxValue.toString()}
            onChangeText={(text) => updateFilter(`${filter.id}_max`, text ? parseInt(text) : null)}
            keyboardType="numeric"
          />
        </View>
      </View>
    );
  };

  const renderSelectFilter = (filter: FilterSection) => {
    const selectedValue = filters[filter.id];

    return (
      <ScrollView style={styles.selectContainer} nestedScrollEnabled>
        {filter.options?.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectOption,
              selectedValue === option.value && styles.selectOptionSelected
            ]}
            onPress={() => {
              updateFilter(filter.id, selectedValue === option.value ? null : option.value);
            }}
          >
            <Text style={[
              styles.selectOptionText,
              selectedValue === option.value && styles.selectOptionTextSelected,
              isRTL && styles.textRTL
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.resultsCount, isRTL && styles.textRTL]}>
          {totalResults} {language === 'ar' ? 'إعلان' : language === 'en' ? 'listings' : 'annonces'}
        </Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetButton}>
            {language === 'ar' ? 'إعادة تعيين' : language === 'en' ? 'Reset' : 'Réinitialiser'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.filterHeader}
            onPress={() => toggleSection('categories')}
          >
            <Text style={[styles.filterTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'الفئات' : language === 'en' ? 'Categories' : 'CATÉGORIES'}
            </Text>
            {expandedSections.has('categories') ? (
              <ChevronUp size={18} color="#64748B" />
            ) : (
              <ChevronDown size={18} color="#64748B" />
            )}
          </TouchableOpacity>

          {expandedSections.has('categories') && (
            <View style={styles.filterContent}>
              {loadingCategories ? (
                <ActivityIndicator size="small" color="#2563EB" style={{ padding: 20 }} />
              ) : categories.length === 0 ? (
                <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'لا توجد فئات' : language === 'en' ? 'No categories' : 'Aucune catégorie'}
                </Text>
              ) : (
                categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      filters.category_id === cat.id && styles.categoryItemActive
                    ]}
                    onPress={() => {
                      // Permettre de désélectionner la catégorie en cliquant à nouveau
                      const newCategoryId = filters.category_id === cat.id ? null : cat.id;
                      updateFilter('category_id', newCategoryId);
                    }}
                  >
                    <Text style={[
                      styles.categoryText,
                      filters.category_id === cat.id && styles.categoryTextActive,
                      isRTL && styles.textRTL
                    ]}>
                      {getCategoryName(cat)}
                    </Text>
                    <Text style={[
                      styles.categoryCount,
                      filters.category_id === cat.id && styles.categoryCountActive
                    ]}>
                      ({categoryCounts[cat.id] || 0})
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Wilaya */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.filterHeader}
            onPress={() => toggleSection('location')}
          >
            <Text style={[styles.filterTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'الولاية' : language === 'en' ? 'Wilaya' : 'Wilaya'}
            </Text>
            {expandedSections.has('location') ? (
              <ChevronUp size={18} color="#64748B" />
            ) : (
              <ChevronDown size={18} color="#64748B" />
            )}
          </TouchableOpacity>

          {expandedSections.has('location') && (
            <View style={styles.filterContent}>
              {loadingWilayas ? (
                <ActivityIndicator size="small" color="#2563EB" style={{ padding: 20 }} />
              ) : wilayas.length === 0 ? (
                <Text style={styles.emptyText}>
                  {language === 'ar' ? 'لا توجد ولايات' : language === 'en' ? 'No wilayas' : 'Aucune wilaya'}
                </Text>
              ) : (
                <ScrollView style={styles.wilayasList} nestedScrollEnabled>
                  {wilayas.map((wilaya) => (
                    <TouchableOpacity
                      key={wilaya.code}
                      style={[
                        styles.wilayaItem,
                        filters.wilaya === wilaya.code && styles.wilayaItemSelected
                      ]}
                      onPress={() => {
                        const newValue = filters.wilaya === wilaya.code ? null : wilaya.code;
                        updateFilter('wilaya', newValue);
                      }}
                    >
                      <Text style={[
                        styles.wilayaText,
                        filters.wilaya === wilaya.code && styles.wilayaTextSelected,
                        isRTL && styles.textRTL
                      ]}>
                        {getWilayaName(wilaya)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* Prix */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.filterHeader}
            onPress={() => toggleSection('price')}
          >
            <Text style={[styles.filterTitle, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
            </Text>
            {expandedSections.has('price') ? (
              <ChevronUp size={18} color="#64748B" />
            ) : (
              <ChevronDown size={18} color="#64748B" />
            )}
          </TouchableOpacity>

          {expandedSections.has('price') && (
            <View style={styles.filterContent}>
              <View style={styles.priceInputsContainer}>
                <TextInput
                  style={[styles.priceInput, isRTL && styles.textRTL]}
                  placeholder={language === 'ar' ? 'السعر الأدنى (دج)' : language === 'en' ? 'Min Price (DA)' : 'Prix Min (DA)'}
                  value={filters.price_min?.toString() || ''}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '').trim();
                    if (numericValue === '') {
                      updateFilter('price_min', null);
                    } else {
                      const parsed = parseInt(numericValue, 10);
                      updateFilter('price_min', isNaN(parsed) ? null : parsed);
                    }
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
                <TextInput
                  style={[styles.priceInput, isRTL && styles.textRTL]}
                  placeholder={language === 'ar' ? 'السعر الأقصى (دج)' : language === 'en' ? 'Max Price (DA)' : 'Prix Max (DA)'}
                  value={filters.price_max?.toString() || ''}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '').trim();
                    if (numericValue === '') {
                      updateFilter('price_max', null);
                    } else {
                      const parsed = parseInt(numericValue, 10);
                      updateFilter('price_max', isNaN(parsed) ? null : parsed);
                    }
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          )}
        </View>

        {/* Dynamic Filters based on category */}
        {dynamicFilters.map((filter) => (
          <View key={filter.id} style={styles.filterSection}>
            <TouchableOpacity
              style={styles.filterHeader}
              onPress={() => toggleSection(filter.id)}
            >
              <Text style={[styles.filterTitle, isRTL && styles.textRTL]}>
                {filter.label}
              </Text>
              {expandedSections.has(filter.id) ? (
                <ChevronUp size={18} color="#64748B" />
              ) : (
                <ChevronDown size={18} color="#64748B" />
              )}
            </TouchableOpacity>

            {expandedSections.has(filter.id) && (
              <View style={styles.filterContent}>
                {filter.type === 'checkbox' && renderCheckboxFilter(filter)}
                {filter.type === 'radio' && renderRadioFilter(filter)}
                {filter.type === 'range' && renderRangeFilter(filter)}
                {filter.type === 'select' && renderSelectFilter(filter)}
              </View>
            )}
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  resetButton: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterContent: {
    padding: 12,
  },
  filterOptions: {
    gap: 12,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2563EB',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  radioLabel: {
    fontSize: 14,
    color: '#475569',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeInput: {
    flex: 1,
    height: 44,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  rangeSeparator: {
    fontSize: 14,
    color: '#94A3B8',
  },
  priceInputsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  priceInput: {
    width: '100%',
    height: 44,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  selectContainer: {
    maxHeight: 200,
  },
  selectOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#475569',
  },
  selectOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    color: '#475569',
  },
  categoryTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  categoryCount: {
    fontSize: 13,
    color: '#94A3B8',
  },
  categoryCountActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  wilayasList: {
    maxHeight: 300,
    minHeight: 100,
  },
  wilayaItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  wilayaItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  wilayaText: {
    fontSize: 14,
    color: '#475569',
  },
  wilayaTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    padding: 20,
  },
});
