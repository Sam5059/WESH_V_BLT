import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Package, TrendingUp, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';

interface ListingsQuota {
  active_count: number;
  max_listings: number;
  remaining: number;
  can_publish: boolean;
  user_type: 'individual' | 'professional';
  package_name?: string;
  package_expires_at?: string;
}

interface ListingsQuotaCardProps {
  quota: ListingsQuota;
  showUpgradeButton?: boolean;
}

export default function ListingsQuotaCard({ quota, showUpgradeButton = true }: ListingsQuotaCardProps) {
  const { t, isRTL } = useLanguage();

  const getQuotaColor = () => {
    const percentage = (quota.active_count / quota.max_listings) * 100;
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 70) return '#F59E0B';
    return '#10B981';
  };

  const getQuotaMessage = () => {
    if (!quota.can_publish) {
      return {
        title: 'Limite atteinte',
        message: 'Vous avez atteint votre limite d\'annonces actives',
        icon: <AlertCircle size={24} color="#EF4444" />,
      };
    }

    if (quota.remaining <= 1) {
      return {
        title: 'Dernière annonce disponible',
        message: `Il vous reste ${quota.remaining} annonce sur ${quota.max_listings}`,
        icon: <AlertCircle size={24} color="#F59E0B" />,
      };
    }

    return {
      title: 'Quota disponible',
      message: `${quota.remaining} annonces disponibles sur ${quota.max_listings}`,
      icon: <Package size={24} color="#10B981" />,
    };
  };

  const message = getQuotaMessage();
  const quotaColor = getQuotaColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {message.icon}
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{message.title}</Text>
          <Text style={[styles.message, isRTL && styles.textRTL]}>{message.message}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(quota.active_count / quota.max_listings) * 100}%`,
                backgroundColor: quotaColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, isRTL && styles.textRTL]}>
          {quota.active_count} / {quota.max_listings} annonces actives
        </Text>
      </View>

      {quota.package_name && (
        <View style={styles.packageInfo}>
          <Text style={[styles.packageLabel, isRTL && styles.textRTL]}>
            Forfait actuel : <Text style={styles.packageName}>{quota.package_name}</Text>
          </Text>
          {quota.package_expires_at && (
            <Text style={[styles.expiresText, isRTL && styles.textRTL]}>
              Expire le {new Date(quota.package_expires_at).toLocaleDateString('fr-FR')}
            </Text>
          )}
        </View>
      )}

      {showUpgradeButton && (quota.user_type === 'individual' || quota.remaining <= 2) && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push('/pro/packages')}
        >
          <TrendingUp size={20} color="#FFFFFF" />
          <Text style={styles.upgradeButtonText}>
            {quota.user_type === 'individual'
              ? 'Passer en Pro pour plus d\'annonces'
              : 'Améliorer mon forfait'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  packageInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  packageLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  packageName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  expiresText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  textRTL: {
    textAlign: 'right',
  },
});
