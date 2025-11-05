import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { HelpCircle, X, Search, Package, Store, Heart, MessageCircle, ShoppingCart, Camera, DollarSign, UserCheck, Shield, Settings, Rocket } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useHelp } from '../contexts/HelpContext';

export default function HelpModal() {
  const { showGlobalHelp, setShowGlobalHelp, helpItems } = useHelp();
  const { language, isRTL, t } = useLanguage();

  const getIconForCategory = (id: string) => {
    switch (id) {
      case 'getting-started':
        return <Rocket size={24} color="#8B5CF6" />;
      case 'search':
        return <Search size={24} color="#2563EB" />;
      case 'publish':
        return <Package size={24} color="#10B981" />;
      case 'photos':
        return <Camera size={24} color="#EC4899" />;
      case 'pricing':
        return <DollarSign size={24} color="#F59E0B" />;
      case 'contact':
        return <MessageCircle size={24} color="#3B82F6" />;
      case 'favorites':
        return <Heart size={24} color="#EF4444" />;
      case 'messages':
        return <MessageCircle size={24} color="#8B5CF6" />;
      case 'pro-account':
        return <Store size={24} color="#F59E0B" />;
      case 'pro-store':
        return <ShoppingCart size={24} color="#7C3AED" />;
      case 'safety':
        return <Shield size={24} color="#059669" />;
      case 'manage-ads':
        return <Settings size={24} color="#64748B" />;
      default:
        return <HelpCircle size={24} color="#64748B" />;
    }
  };

  return (
    <Modal
      visible={showGlobalHelp}
      transparent
      animationType="slide"
      onRequestClose={() => setShowGlobalHelp(false)}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => setShowGlobalHelp(false)}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <HelpCircle size={28} color="#2563EB" />
                <Text style={[styles.title, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'مركز المساعدة' : language === 'en' ? 'Help Center' : 'Centre d\'Aide'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGlobalHelp(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'دليل الاستخدام' : language === 'en' ? 'User Guide' : 'Guide d\'utilisation'}
              </Text>

              {helpItems.map((item) => (
                <View key={item.id} style={styles.helpCard}>
                  <View style={styles.helpCardHeader}>
                    <View style={styles.iconContainer}>
                      {getIconForCategory(item.id)}
                    </View>
                    <Text style={[styles.helpCardTitle, isRTL && styles.textRTL]}>
                      {item.title}
                    </Text>
                  </View>
                  <Text style={[styles.helpCardContent, isRTL && styles.textRTL]}>
                    {item.content}
                  </Text>
                </View>
              ))}

              <View style={styles.contactSection}>
                <Text style={[styles.contactTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'هل تحتاج إلى مزيد من المساعدة؟' : language === 'en' ? 'Need more help?' : 'Besoin d\'aide supplémentaire ?'}
                </Text>
                <Text style={[styles.contactText, isRTL && styles.textRTL]}>
                  {language === 'ar' ? 'اتصل بنا على' : language === 'en' ? 'Contact us at' : 'Contactez-nous à'} support@buygo.dz
                </Text>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
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
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  helpCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  helpCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  helpCardContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    whiteSpace: 'pre-wrap',
  },
  contactSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
