import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown, X, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface CommuneAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  wilayaId: string | null;
  wilayaName?: string | null;
  onSelect: (value: string) => void;
  isRTL?: boolean;
  disabled?: boolean;
}

export default function CommuneAutocomplete({
  label,
  placeholder = 'Sélectionner une commune',
  value,
  wilayaId,
  wilayaName,
  onSelect,
  isRTL = false,
  disabled = false,
}: CommuneAutocompleteProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [communes, setCommunes] = useState<string[]>([]);
  const [filteredCommunes, setFilteredCommunes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wilayaName) {
      loadCommunes(wilayaName);
    } else {
      setCommunes([]);
      setFilteredCommunes([]);
    }
  }, [wilayaName]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = communes.filter((commune) =>
        commune.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommunes(filtered);
    } else {
      setFilteredCommunes(communes);
    }
  }, [searchQuery, communes]);

  const loadCommunes = async (wilayaNameValue: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('communes')
        .select('name')
        .eq('wilaya_name', wilayaNameValue)
        .order('name');

      if (error) throw error;

      if (data) {
        const communeNames = data.map((c) => c.name);
        setCommunes(communeNames);
        setFilteredCommunes(communeNames);
      }
    } catch (error) {
      console.error('Error loading communes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (commune: string) => {
    onSelect(commune);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onSelect('');
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isRTL && styles.textRTL]}>{label}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.selector,
          (disabled || !wilayaName) && styles.selectorDisabled,
          !value && styles.selectorEmpty,
        ]}
        onPress={() => !disabled && wilayaName && setIsOpen(true)}
        disabled={disabled || !wilayaName}
      >
        <View style={styles.selectorContent}>
          <MapPin size={16} color="#64748B" />
          <Text
            style={[
              styles.selectorText,
              !value && styles.placeholderText,
              !wilayaName && styles.disabledText,
              isRTL && styles.textRTL,
            ]}
            numberOfLines={1}
          >
            {!wilayaName ? '⚠️ Sélectionnez d\'abord une wilaya' : (value || placeholder)}
          </Text>
        </View>
        <View style={styles.selectorRight}>
          {value && !disabled && wilayaName && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
          <ChevronDown size={18} color="#64748B" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                {label || 'Communes'}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, isRTL && styles.textRTL]}
                placeholder={t('search.searchPlaceholder') || 'Rechercher...'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={[styles.loadingText, isRTL && styles.textRTL]}>
                  {t('publish.loadingCommunes')}
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.optionsList}>
                {filteredCommunes.length > 0 ? (
                  filteredCommunes.map((commune) => (
                    <TouchableOpacity
                      key={commune}
                      style={[
                        styles.optionItem,
                        value === commune && styles.optionItemSelected,
                      ]}
                      onPress={() => handleSelect(commune)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          value === commune && styles.optionTextSelected,
                          isRTL && styles.textRTL,
                        ]}
                      >
                        {commune}
                      </Text>
                      {value === commune && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
                      {t('publish.noCommuneFound')}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 50,
  },
  selectorDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.6,
  },
  selectorEmpty: {
    borderColor: '#E5E7EB',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectorText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  disabledText: {
    color: '#CBD5E1',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  selectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionItemSelected: {
    backgroundColor: '#EBF5FF',
  },
  optionText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
