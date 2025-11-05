import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Search, Clock, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface SearchHistoryItem {
  id: string;
  search_query: string;
  category_id: string | null;
  results_count: number;
  created_at: string;
  category?: {
    name: string;
    name_ar: string;
    name_en: string;
  };
}

interface SearchHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSearch: (query: string, categoryId?: string) => void;
}

export default function SearchHistoryModal({
  visible,
  onClose,
  onSelectSearch,
}: SearchHistoryModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => {
    if (visible && user) {
      loadHistory();
    }
  }, [visible, user]);

  const loadHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select(`
          id,
          search_query,
          category_id,
          results_count,
          created_at,
          category:categories(name, name_ar, name_en)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error loading search history:', error);
      } else {
        setHistory(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id);

      if (!error) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const clearAllHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);

      if (!error) {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return language === 'ar' ? 'الآن' : language === 'en' ? 'Now' : 'Maintenant';
    }
    if (diffMins < 60) {
      return language === 'ar'
        ? `منذ ${diffMins} دقيقة`
        : language === 'en'
        ? `${diffMins}m ago`
        : `Il y a ${diffMins}min`;
    }
    if (diffHours < 24) {
      return language === 'ar'
        ? `منذ ${diffHours} ساعة`
        : language === 'en'
        ? `${diffHours}h ago`
        : `Il y a ${diffHours}h`;
    }
    if (diffDays < 7) {
      return language === 'ar'
        ? `منذ ${diffDays} يوم`
        : language === 'en'
        ? `${diffDays}d ago`
        : `Il y a ${diffDays}j`;
    }

    return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getCategoryName = (item: SearchHistoryItem) => {
    if (!item.category) return null;
    if (language === 'ar') return item.category.name_ar || item.category.name;
    if (language === 'en') return item.category.name_en || item.category.name;
    return item.category.name;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Clock size={24} color="#2563EB" />
              <Text style={[styles.title, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'سجل البحث' : language === 'en' ? 'Search History' : 'Mes recherches'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {history.length > 0 && (
            <TouchableOpacity
              onPress={clearAllHistory}
              style={styles.clearAllButton}
            >
              <Trash2 size={16} color="#EF4444" />
              <Text style={styles.clearAllText}>
                {language === 'ar' ? 'مسح الكل' : language === 'en' ? 'Clear all' : 'Tout effacer'}
              </Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Search size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {language === 'ar'
                  ? 'لا يوجد سجل بحث'
                  : language === 'en'
                  ? 'No search history'
                  : 'Aucun historique de recherche'}
              </Text>
              <Text style={styles.emptySubtext}>
                {language === 'ar'
                  ? 'ستظهر عمليات البحث الخاصة بك هنا'
                  : language === 'en'
                  ? 'Your searches will appear here'
                  : 'Vos recherches apparaîtront ici'}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {history.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <TouchableOpacity
                    style={styles.historyItemContent}
                    onPress={() => {
                      onSelectSearch(item.search_query, item.category_id || undefined);
                      onClose();
                    }}
                  >
                    <Search size={18} color="#64748B" />
                    <View style={styles.historyItemText}>
                      <Text style={[styles.searchQuery, isRTL && styles.textRTL]} numberOfLines={1}>
                        {item.search_query}
                      </Text>
                      <View style={styles.historyMeta}>
                        {getCategoryName(item) && (
                          <Text style={[styles.categoryBadge, isRTL && styles.textRTL]}>
                            {getCategoryName(item)}
                          </Text>
                        )}
                        <Text style={styles.metaText}>
                          {item.results_count}{' '}
                          {language === 'ar'
                            ? 'نتيجة'
                            : language === 'en'
                            ? 'result(s)'
                            : 'résultat(s)'}
                        </Text>
                        <Text style={styles.metaText}>•</Text>
                        <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteHistoryItem(item.id)}
                    style={styles.deleteButton}
                  >
                    <X size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-end',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyItemText: {
    flex: 1,
    gap: 4,
  },
  searchQuery: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  deleteButton: {
    padding: 8,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
