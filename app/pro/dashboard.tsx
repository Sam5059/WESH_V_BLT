import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ArrowLeft,
  Crown,
  TrendingUp,
  Eye,
  MousePointer,
  MessageCircle,
  Heart,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react-native';
import HomeButton from '@/components/HomeButton';
import ProHeader from '@/components/ProHeader';

interface ProStatus {
  is_pro: boolean;
  user_type: string;
  expires_at: string | null;
  listings_remaining: number | null;
  featured_remaining: number | null;
  category_id: string | null;
}

interface Analytics {
  period: {
    start_date: string;
    end_date: string;
  };
  totals: {
    views: number;
    clicks: number;
    contacts: number;
    favorites: number;
  };
  daily_data: Array<{
    date: string;
    views: number;
    clicks: number;
    contacts: number;
    favorites: number;
  }>;
}

interface Subscription {
  id: string;
  package_id: string;
  category_id: string;
  starts_at: string;
  expires_at: string;
  status: string;
  listings_used: number;
  featured_used: number;
  paid_amount: number;
  payment_method: string;
}

export default function ProDashboardScreen() {
  const { user, profile } = useAuth();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proStatus, setProStatus] = useState<ProStatus | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        loadProStatus(),
        loadAnalytics(),
        loadSubscriptions(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadProStatus = async () => {
    const { data, error } = await supabase.rpc('check_pro_status', {
      p_user_id: user!.id
    });

    if (!error && data) {
      setProStatus(data);
    }
  };

  const loadAnalytics = async () => {
    const { data, error } = await supabase.rpc('get_pro_analytics', {
      p_user_id: user!.id,
      p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      p_end_date: new Date().toISOString().split('T')[0]
    });

    if (!error && data) {
      setAnalytics(data);
    }
  };

  const loadSubscriptions = async () => {
    const { data, error } = await supabase
      .from('pro_subscriptions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setSubscriptions(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price);
    return formatted.replace('DZD', 'DA');
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 size={16} color="#10B981" />;
      case 'expired':
        return <XCircle size={16} color="#EF4444" />;
      case 'pending':
        return <AlertCircle size={16} color="#F59E0B" />;
      default:
        return <AlertCircle size={16} color="#64748B" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'expired': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return '#D1FAE5';
      case 'expired': return '#FEE2E2';
      case 'pending': return '#FEF3C7';
      default: return '#F1F5F9';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!proStatus?.is_pro) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.notProContainer}>
          <Crown size={64} color="#CBD5E1" />
          <Text style={styles.notProTitle}>Compte non PRO</Text>
          <Text style={styles.notProDescription}>
            Vous n'avez pas d'abonnement PRO actif. Passez au PRO pour accéder aux statistiques et avantages exclusifs.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/pro/packages')}
          >
            <Crown size={20} color="#FFFFFF" />
            <Text style={styles.upgradeButtonText}>Passer au PRO</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const daysRemaining = proStatus.expires_at ? getDaysRemaining(proStatus.expires_at) : 0;
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Modern Pro Header */}
      <ProHeader
        title="Tableau de bord PRO"
        subtitle="Gérez votre activité professionnelle"
        showBackButton={true}
        showHomeButton={true}
      />

      {/* Statut PRO */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIcon}>
            <Crown size={32} color="#FFD700" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Compte PRO Actif</Text>
            <Text style={styles.statusSubtitle}>
              Expire le {proStatus.expires_at && formatDate(proStatus.expires_at)}
            </Text>
          </View>
        </View>

        {isExpiringSoon && (
          <View style={styles.warningBanner}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.warningText}>
              Votre abonnement expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <View style={styles.quotasContainer}>
          <View style={styles.quotaItem}>
            <Text style={styles.quotaValue}>
              {proStatus.listings_remaining === null ? '∞' : proStatus.listings_remaining}
            </Text>
            <Text style={styles.quotaLabel}>Annonces restantes</Text>
          </View>
          <View style={styles.quotaDivider} />
          <View style={styles.quotaItem}>
            <Text style={styles.quotaValue}>{proStatus.featured_remaining || 0}</Text>
            <Text style={styles.quotaLabel}>Mises en avant</Text>
          </View>
          <View style={styles.quotaDivider} />
          <View style={styles.quotaItem}>
            <Text style={styles.quotaValue}>{daysRemaining}</Text>
            <Text style={styles.quotaLabel}>Jours restants</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.renewButton}
          onPress={() => router.push('/pro/packages')}
        >
          <RefreshCw size={18} color="#2563EB" />
          <Text style={styles.renewButtonText}>Renouveler / Améliorer</Text>
        </TouchableOpacity>
      </View>

      {/* Analytics */}
      {analytics && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Statistiques (30 derniers jours)</Text>
          </View>

          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsCard}>
              <View style={[styles.analyticsIcon, { backgroundColor: '#DBEAFE' }]}>
                <Eye size={24} color="#2563EB" />
              </View>
              <Text style={styles.analyticsValue}>{analytics.totals.views.toLocaleString()}</Text>
              <Text style={styles.analyticsLabel}>Vues</Text>
            </View>

            <View style={styles.analyticsCard}>
              <View style={[styles.analyticsIcon, { backgroundColor: '#D1FAE5' }]}>
                <MousePointer size={24} color="#10B981" />
              </View>
              <Text style={styles.analyticsValue}>{analytics.totals.clicks.toLocaleString()}</Text>
              <Text style={styles.analyticsLabel}>Clics</Text>
            </View>

            <View style={styles.analyticsCard}>
              <View style={[styles.analyticsIcon, { backgroundColor: '#FEF3C7' }]}>
                <MessageCircle size={24} color="#F59E0B" />
              </View>
              <Text style={styles.analyticsValue}>{analytics.totals.contacts.toLocaleString()}</Text>
              <Text style={styles.analyticsLabel}>Contacts</Text>
            </View>

            <View style={styles.analyticsCard}>
              <View style={[styles.analyticsIcon, { backgroundColor: '#FCE7F3' }]}>
                <Heart size={24} color="#EC4899" />
              </View>
              <Text style={styles.analyticsValue}>{analytics.totals.favorites.toLocaleString()}</Text>
              <Text style={styles.analyticsLabel}>Favoris</Text>
            </View>
          </View>
        </View>
      )}

      {/* Historique des abonnements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Package size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Historique des abonnements</Text>
        </View>

        {subscriptions.length > 0 ? (
          <View style={styles.subscriptionsList}>
            {subscriptions.map((subscription) => (
              <View key={subscription.id} style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                  <View style={[
                    styles.subscriptionStatus,
                    { backgroundColor: getStatusBg(subscription.status) }
                  ]}>
                    {getStatusIcon(subscription.status)}
                    <Text style={[
                      styles.subscriptionStatusText,
                      { color: getStatusColor(subscription.status) }
                    ]}>
                      {subscription.status === 'active' ? 'Actif' :
                       subscription.status === 'expired' ? 'Expiré' :
                       subscription.status === 'pending' ? 'En attente' : 'Annulé'}
                    </Text>
                  </View>
                  <Text style={styles.subscriptionPrice}>
                    {formatPrice(subscription.paid_amount)}
                  </Text>
                </View>

                <View style={styles.subscriptionDetails}>
                  <View style={styles.subscriptionDetailRow}>
                    <Calendar size={14} color="#64748B" />
                    <Text style={styles.subscriptionDetailText}>
                      Du {formatDate(subscription.starts_at)} au {formatDate(subscription.expires_at)}
                    </Text>
                  </View>
                  <View style={styles.subscriptionDetailRow}>
                    <Package size={14} color="#64748B" />
                    <Text style={styles.subscriptionDetailText}>
                      {subscription.listings_used} annonces utilisées
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Aucun historique d'abonnement</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  homeButtonContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
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
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  notProContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notProTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 12,
  },
  notProDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statusIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#FEF3C7',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },
  quotasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  quotaItem: {
    flex: 1,
    alignItems: 'center',
  },
  quotaValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2563EB',
    marginBottom: 4,
  },
  quotaLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  quotaDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  renewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  renewButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  analyticsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  subscriptionsList: {
    gap: 12,
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  subscriptionStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subscriptionPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subscriptionDetails: {
    gap: 8,
  },
  subscriptionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscriptionDetailText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 32,
  },
});
