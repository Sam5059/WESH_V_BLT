import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Download,
  RefreshCw,
  Crown,
  Target,
  Percent,
} from 'lucide-react-native';

interface FinancialStats {
  total_revenue: number;
  monthly_revenue: number;
  weekly_revenue: number;
  daily_revenue: number;
  total_packages_sold: number;
  monthly_packages_sold: number;
  active_subscriptions: number;
  average_package_price: number;
  revenue_growth: number;
  top_selling_package: string;
  conversion_rate: number;
  churn_rate: number;
}

interface PackageSale {
  id: string;
  package_name: string;
  category: string;
  price: number;
  sales_count: number;
  total_revenue: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  packages_sold: number;
}

export default function FinancialStatsPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [packageSales, setPackageSales] = useState<PackageSale[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (profile?.role !== 'admin') {
      Alert.alert('Accès refusé', 'Seuls les administrateurs peuvent accéder à cette page');
      router.back();
      return;
    }
    loadFinancialStats();
  }, [profile, timeRange]);

  const loadFinancialStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const { data: subscriptions, error: subsError } = await supabase
        .from('profile_pro_subscriptions')
        .select('*');

      if (subsError) {
        console.error('Error loading subscriptions:', subsError);
      }

      const { data: packages, error: packagesError } = await supabase
        .from('pro_packages')
        .select('*');

      if (packagesError) {
        console.error('Error loading packages:', packagesError);
      }

      const totalRevenue = (subscriptions || []).reduce((sum, sub) => {
        const pkg = packages?.find(p => p.id === sub.package_id);
        return sum + (pkg?.price || 0);
      }, 0);

      const monthlyRevenue = (subscriptions || [])
        .filter(sub => new Date(sub.subscribed_at) >= startOfMonth)
        .reduce((sum, sub) => {
          const pkg = packages?.find(p => p.id === sub.package_id);
          return sum + (pkg?.price || 0);
        }, 0);

      const weeklyRevenue = (subscriptions || [])
        .filter(sub => new Date(sub.subscribed_at) >= startOfWeek)
        .reduce((sum, sub) => {
          const pkg = packages?.find(p => p.id === sub.package_id);
          return sum + (pkg?.price || 0);
        }, 0);

      const dailyRevenue = (subscriptions || [])
        .filter(sub => new Date(sub.subscribed_at) >= startOfDay)
        .reduce((sum, sub) => {
          const pkg = packages?.find(p => p.id === sub.package_id);
          return sum + (pkg?.price || 0);
        }, 0);

      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const lastMonthRevenue = (subscriptions || [])
        .filter(sub => {
          const date = new Date(sub.subscribed_at);
          return date >= lastMonthStart && date <= lastMonthEnd;
        })
        .reduce((sum, sub) => {
          const pkg = packages?.find(p => p.id === sub.package_id);
          return sum + (pkg?.price || 0);
        }, 0);

      const revenueGrowth = lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      const packageSalesMap = new Map<string, PackageSale>();
      (subscriptions || []).forEach(sub => {
        const pkg = packages?.find(p => p.id === sub.package_id);
        if (pkg) {
          const existing = packageSalesMap.get(pkg.id);
          if (existing) {
            existing.sales_count++;
            existing.total_revenue += pkg.price;
          } else {
            packageSalesMap.set(pkg.id, {
              id: pkg.id,
              package_name: pkg.name,
              category: pkg.category || 'Général',
              price: pkg.price,
              sales_count: 1,
              total_revenue: pkg.price,
            });
          }
        }
      });

      const topPackages = Array.from(packageSalesMap.values())
        .sort((a, b) => b.sales_count - a.sales_count);

      const monthlyRevenueData: MonthlyRevenue[] = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthRevenue = (subscriptions || [])
          .filter(sub => {
            const date = new Date(sub.subscribed_at);
            return date >= month && date <= monthEnd;
          })
          .reduce((sum, sub) => {
            const pkg = packages?.find(p => p.id === sub.package_id);
            return sum + (pkg?.price || 0);
          }, 0);

        const monthPackages = (subscriptions || [])
          .filter(sub => {
            const date = new Date(sub.subscribed_at);
            return date >= month && date <= monthEnd;
          }).length;

        monthlyRevenueData.push({
          month: month.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          packages_sold: monthPackages,
        });
      }

      const { data: proUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'professional');

      const activeSubscriptions = (subscriptions || []).filter(sub => {
        const expiresAt = new Date(sub.expires_at);
        return expiresAt > now;
      }).length;

      const avgPrice = totalRevenue / (subscriptions?.length || 1);

      setStats({
        total_revenue: totalRevenue,
        monthly_revenue: monthlyRevenue,
        weekly_revenue: weeklyRevenue,
        daily_revenue: dailyRevenue,
        total_packages_sold: subscriptions?.length || 0,
        monthly_packages_sold: (subscriptions || []).filter(
          sub => new Date(sub.subscribed_at) >= startOfMonth
        ).length,
        active_subscriptions: activeSubscriptions,
        average_package_price: avgPrice,
        revenue_growth: revenueGrowth,
        top_selling_package: topPackages[0]?.package_name || 'N/A',
        conversion_rate: proUsers?.length ? (activeSubscriptions / proUsers.length) * 100 : 0,
        churn_rate: 0,
      });

      setPackageSales(topPackages);
      setMonthlyData(monthlyRevenueData);
    } catch (error) {
      console.error('Error loading financial stats:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques financières');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Statistiques Financières</Text>
          <Text style={styles.headerSubtitle}>Revenus et ventes de packages</Text>
        </View>
        <TouchableOpacity onPress={loadFinancialStats} style={styles.refreshButton}>
          <RefreshCw size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.timeRangeSelector}>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === 'week' && styles.timeRangeButtonActive]}
          onPress={() => setTimeRange('week')}
        >
          <Text style={[styles.timeRangeText, timeRange === 'week' && styles.timeRangeTextActive]}>
            Semaine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === 'month' && styles.timeRangeButtonActive]}
          onPress={() => setTimeRange('month')}
        >
          <Text style={[styles.timeRangeText, timeRange === 'month' && styles.timeRangeTextActive]}>
            Mois
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === 'year' && styles.timeRangeButtonActive]}
          onPress={() => setTimeRange('year')}
        >
          <Text style={[styles.timeRangeText, timeRange === 'year' && styles.timeRangeTextActive]}>
            Année
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainStatsGrid}>
          <View style={[styles.mainStatCard, styles.revenueCard]}>
            <View style={styles.mainStatHeader}>
              <View style={styles.mainStatIcon}>
                <DollarSign size={28} color="#10B981" />
              </View>
              <View style={styles.mainStatGrowth}>
                {stats && stats.revenue_growth >= 0 ? (
                  <TrendingUp size={18} color="#10B981" />
                ) : (
                  <TrendingDown size={18} color="#EF4444" />
                )}
                <Text
                  style={[
                    styles.growthText,
                    { color: stats && stats.revenue_growth >= 0 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {stats ? formatPercentage(stats.revenue_growth) : '0%'}
                </Text>
              </View>
            </View>
            <Text style={styles.mainStatValue}>
              {stats ? formatCurrency(stats.monthly_revenue) : '0 DA'}
            </Text>
            <Text style={styles.mainStatLabel}>Revenu mensuel</Text>
            <View style={styles.mainStatDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Aujourd'hui</Text>
                <Text style={styles.detailValue}>
                  {stats ? formatCurrency(stats.daily_revenue) : '0 DA'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cette semaine</Text>
                <Text style={styles.detailValue}>
                  {stats ? formatCurrency(stats.weekly_revenue) : '0 DA'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.smallStatsGrid}>
            <View style={[styles.smallStatCard, { borderLeftColor: '#F59E0B' }]}>
              <Package size={20} color="#F59E0B" />
              <Text style={styles.smallStatValue}>{stats?.total_packages_sold || 0}</Text>
              <Text style={styles.smallStatLabel}>Packages vendus</Text>
            </View>

            <View style={[styles.smallStatCard, { borderLeftColor: '#3B82F6' }]}>
              <Crown size={20} color="#3B82F6" />
              <Text style={styles.smallStatValue}>{stats?.active_subscriptions || 0}</Text>
              <Text style={styles.smallStatLabel}>Abonnements actifs</Text>
            </View>

            <View style={[styles.smallStatCard, { borderLeftColor: '#8B5CF6' }]}>
              <CreditCard size={20} color="#8B5CF6" />
              <Text style={styles.smallStatValue}>
                {stats ? formatCurrency(stats.average_package_price) : '0 DA'}
              </Text>
              <Text style={styles.smallStatLabel}>Prix moyen</Text>
            </View>

            <View style={[styles.smallStatCard, { borderLeftColor: '#10B981' }]}>
              <Percent size={20} color="#10B981" />
              <Text style={styles.smallStatValue}>
                {stats ? stats.conversion_rate.toFixed(1) : '0'}%
              </Text>
              <Text style={styles.smallStatLabel}>Taux conversion</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Packages Vendus</Text>
            <TouchableOpacity style={styles.exportButton}>
              <Download size={18} color="#6B7280" />
              <Text style={styles.exportButtonText}>Exporter</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.packagesTable}>
            {packageSales.slice(0, 5).map((pkg, index) => (
              <View key={pkg.id} style={styles.packageRow}>
                <View style={styles.packageRank}>
                  <Text style={styles.packageRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.packageInfo}>
                  <Text style={styles.packageName}>{pkg.package_name}</Text>
                  <Text style={styles.packageCategory}>{pkg.category}</Text>
                </View>
                <View style={styles.packageStats}>
                  <Text style={styles.packageSales}>{pkg.sales_count} ventes</Text>
                  <Text style={styles.packageRevenue}>{formatCurrency(pkg.total_revenue)}</Text>
                </View>
              </View>
            ))}
            {packageSales.length === 0 && (
              <View style={styles.emptyState}>
                <Package size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>Aucune vente pour le moment</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Évolution des Revenus (6 derniers mois)</Text>
          <View style={styles.chartContainer}>
            {monthlyData.map((data, index) => {
              const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
              const height = (data.revenue / maxRevenue) * 120;

              return (
                <View key={index} style={styles.chartBar}>
                  <Text style={styles.chartValue}>
                    {data.revenue > 0 ? formatCurrency(data.revenue) : '-'}
                  </Text>
                  <View style={styles.chartBarContainer}>
                    <View
                      style={[
                        styles.chartBarFill,
                        { height: Math.max(height, 4) },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{data.month}</Text>
                  <Text style={styles.chartSales}>{data.packages_sold} pkg</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques Additionnelles</Text>
          <View style={styles.additionalStats}>
            <View style={styles.additionalStatCard}>
              <Target size={24} color="#F59E0B" />
              <Text style={styles.additionalStatLabel}>Objectif mensuel</Text>
              <Text style={styles.additionalStatValue}>100 000 DA</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(
                        ((stats?.monthly_revenue || 0) / 100000) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {stats ? Math.round(((stats.monthly_revenue / 100000) * 100)) : 0}% atteint
              </Text>
            </View>

            <View style={styles.additionalStatCard}>
              <Calendar size={24} color="#3B82F6" />
              <Text style={styles.additionalStatLabel}>Ventes ce mois</Text>
              <Text style={styles.additionalStatValue}>{stats?.monthly_packages_sold || 0}</Text>
              <Text style={styles.additionalStatSubtext}>
                packages professionnels
              </Text>
            </View>

            <View style={styles.additionalStatCard}>
              <BarChart3 size={24} color="#8B5CF6" />
              <Text style={styles.additionalStatLabel}>Meilleure vente</Text>
              <Text style={styles.additionalStatValue} numberOfLines={2}>
                {stats?.top_selling_package || 'N/A'}
              </Text>
              <Text style={styles.additionalStatSubtext}>
                Package le plus populaire
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prévisions</Text>
          <View style={styles.forecastCard}>
            <View style={styles.forecastItem}>
              <Text style={styles.forecastLabel}>Revenus prévus (mois prochain)</Text>
              <Text style={styles.forecastValue}>
                {stats
                  ? formatCurrency(stats.monthly_revenue * (1 + stats.revenue_growth / 100))
                  : '0 DA'}
              </Text>
              <Text style={styles.forecastNote}>
                Basé sur la croissance actuelle de {stats ? formatPercentage(stats.revenue_growth) : '0%'}
              </Text>
            </View>
            <View style={styles.forecastDivider} />
            <View style={styles.forecastItem}>
              <Text style={styles.forecastLabel}>Revenus annuels estimés</Text>
              <Text style={styles.forecastValue}>
                {stats ? formatCurrency(stats.monthly_revenue * 12) : '0 DA'}
              </Text>
              <Text style={styles.forecastNote}>
                Projection basée sur le mois en cours
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#10B981',
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#10B981',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  mainStatsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  mainStatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  mainStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainStatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainStatGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthText: {
    fontSize: 16,
    fontWeight: '700',
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 16,
  },
  mainStatDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  smallStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  smallStatCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  smallStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  smallStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  packagesTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  packageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  packageRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packageRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  packageCategory: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  packageStats: {
    alignItems: 'flex-end',
  },
  packageSales: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  packageRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartValue: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  chartBarContainer: {
    width: '80%',
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
  },
  chartSales: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  additionalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  additionalStatCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  additionalStatLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  additionalStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  additionalStatSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 6,
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  forecastItem: {
    paddingVertical: 12,
  },
  forecastLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  forecastValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  forecastNote: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  forecastDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
});
