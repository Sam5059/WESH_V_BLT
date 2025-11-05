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
  Shield,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Package,
  Crown,
  BarChart3,
  Settings,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react-native';

interface DashboardStats {
  total_users: number;
  pro_users: number;
  total_listings: number;
  active_listings: number;
  pending_reports: number;
  banned_users: number;
  total_revenue: number;
  new_users_today: number;
}

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions pour accéder à cette page');
      router.back();
      return;
    }

    loadDashboardStats();
  }, [profile]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .menuCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          border-color: #2563EB !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);

    try {
      console.log('[ADMIN DASHBOARD] Loading statistics...');

      const [
        usersRes,
        proUsersRes,
        listingsRes,
        activeListingsRes,
        reportsRes,
        bannedRes,
        newUsersRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('user_type', 'professional'),
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('is_banned', true),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      ]);

      console.log('[ADMIN DASHBOARD] Query results:', {
        users: { count: usersRes.count, error: usersRes.error },
        proUsers: { count: proUsersRes.count, error: proUsersRes.error },
        listings: { count: listingsRes.count, error: listingsRes.error },
        activeListings: { count: activeListingsRes.count, error: activeListingsRes.error },
        reports: { count: reportsRes.count, error: reportsRes.error },
        banned: { count: bannedRes.count, error: bannedRes.error },
        newUsers: { count: newUsersRes.count, error: newUsersRes.error },
      });

      if (usersRes.error) console.error('[ADMIN DASHBOARD] Users error:', usersRes.error);
      if (proUsersRes.error) console.error('[ADMIN DASHBOARD] Pro users error:', proUsersRes.error);
      if (listingsRes.error) console.error('[ADMIN DASHBOARD] Listings error:', listingsRes.error);
      if (activeListingsRes.error) console.error('[ADMIN DASHBOARD] Active listings error:', activeListingsRes.error);
      if (reportsRes.error) console.error('[ADMIN DASHBOARD] Reports error:', reportsRes.error);
      if (bannedRes.error) console.error('[ADMIN DASHBOARD] Banned users error:', bannedRes.error);
      if (newUsersRes.error) console.error('[ADMIN DASHBOARD] New users error:', newUsersRes.error);

      setStats({
        total_users: usersRes.count || 0,
        pro_users: proUsersRes.count || 0,
        total_listings: listingsRes.count || 0,
        active_listings: activeListingsRes.count || 0,
        pending_reports: reportsRes.count || 0,
        banned_users: bannedRes.count || 0,
        total_revenue: 0,
        new_users_today: newUsersRes.count || 0,
      });

      console.log('[ADMIN DASHBOARD] Stats loaded successfully');
    } catch (error) {
      console.error('[ADMIN DASHBOARD] Error loading stats:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    }

    setLoading(false);
  };

  const menuItems = [
    {
      title: 'Modération',
      description: 'Gérer les signalements',
      details: 'Modérer annonces, gérer reports',
      icon: Shield,
      color: '#F59E0B',
      route: '/admin/moderation',
      badge: stats?.pending_reports || 0,
      actions: ['Approuver', 'Rejeter', 'Bannir'],
      enabled: true,
    },
    {
      title: 'Utilisateurs',
      description: 'Gérer les comptes',
      details: 'Réinitialiser MDP, bannir, promouvoir admin',
      icon: Users,
      color: '#2563EB',
      route: '/admin/users',
      badge: stats?.new_users_today || 0,
      actions: ['Reset MDP', 'Bannir', 'Admin', 'Supprimer'],
      enabled: true,
    },
    {
      title: 'Gestion Paniers',
      description: 'Voir tous les paniers',
      details: 'Consulter, vider, supprimer articles',
      icon: ShoppingBag,
      color: '#EC4899',
      route: '/admin/cart-management',
      badge: 0,
      actions: ['Voir', 'Vider', 'Supprimer'],
      enabled: true,
    },
    {
      title: 'Statistiques Financières',
      description: 'Revenus et ventes',
      details: 'CA, packages vendus, prévisions',
      icon: DollarSign,
      color: '#10B981',
      route: '/admin/financial-stats',
      badge: 0,
      actions: ['Revenus', 'Ventes', 'Prévisions', 'Export'],
      enabled: true,
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Retour"
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Dashboard Admin</Text>
          <Text style={styles.subtitle}>Vue d'ensemble de la plateforme</Text>
        </View>
        <View accessible={false} importantForAccessibility="no">
          <Shield size={32} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#2563EB' }]}>
          <View style={styles.statIcon} accessible={false} importantForAccessibility="no">
            <Users size={24} color="#2563EB" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats?.total_users || 0}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
            {stats && stats.new_users_today > 0 && (
              <Text style={styles.statBadge}>+{stats.new_users_today} aujourd'hui</Text>
            )}
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#FFD700' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF7ED' }]} accessible={false} importantForAccessibility="no">
            <Crown size={24} color="#FFD700" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats?.pro_users || 0}</Text>
            <Text style={styles.statLabel}>Comptes PRO</Text>
            <Text style={styles.statPercentage}>
              {stats?.total_users
                ? Math.round(((stats?.pro_users || 0) / stats.total_users) * 100)
                : 0}
              % du total
            </Text>
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]} accessible={false} importantForAccessibility="no">
            <FileText size={24} color="#10B981" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats?.active_listings || 0}</Text>
            <Text style={styles.statLabel}>Annonces actives</Text>
            <Text style={styles.statPercentage}>
              {stats?.total_listings || 0} au total
            </Text>
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]} accessible={false} importantForAccessibility="no">
            <AlertTriangle size={24} color="#F59E0B" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats?.pending_reports || 0}</Text>
            <Text style={styles.statLabel}>Signalements</Text>
            {stats && stats.pending_reports > 0 && (
              <Text style={[styles.statBadge, { color: '#DC2626' }]}>
                Action requise
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#DC2626' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]} accessible={false} importantForAccessibility="no">
            <Users size={24} color="#DC2626" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats?.banned_users || 0}</Text>
            <Text style={styles.statLabel}>Utilisateurs bannis</Text>
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
          <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]} accessible={false} importantForAccessibility="no">
            <TrendingUp size={24} color="#8B5CF6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>
              {((stats?.active_listings || 0) / (stats?.total_users || 1)).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Annonces/utilisateur</Text>
            <Text style={styles.statPercentage}>Moyenne</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuCard,
                Platform.OS === 'web' && { transition: 'all 0.2s ease' }
              ]}
              {...(Platform.OS === 'web' ? { className: 'menuCard' } : {})}
              onPress={() => {
                console.log('[ADMIN DASHBOARD] Navigating to:', item.route);
                router.push(item.route as any);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]} accessible={false} importantForAccessibility="no">
                <item.icon size={28} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {item.badge > 0 && (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.menuDescription}>{item.description}</Text>
                <Text style={styles.menuDetails}>{item.details}</Text>
                <View style={styles.menuActions}>
                  {item.actions.map((action, idx) => (
                    <View key={idx} style={styles.actionTag}>
                      <Text style={styles.actionTagText}>{action}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Activité récente</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                {stats?.new_users_today || 0} nouveaux utilisateurs aujourd'hui
              </Text>
              <Text style={styles.activityTime}>Dernières 24h</Text>
            </View>
          </View>

          {stats && stats.pending_reports > 0 && (
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  {stats.pending_reports} signalements en attente de modération
                </Text>
                <Text style={styles.activityTime}>Action requise</Text>
              </View>
            </View>
          )}

          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: '#2563EB' }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                {stats?.active_listings || 0} annonces actives sur la plateforme
              </Text>
              <Text style={styles.activityTime}>En temps réel</Text>
            </View>
          </View>

          {stats && stats.pro_users > 0 && (
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#FFD700' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  {stats.pro_users} comptes professionnels actifs
                </Text>
                <Text style={styles.activityTime}>Abonnés</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.systemStatus}>
        <Text style={styles.sectionTitle}>État du système</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.statusOk]} />
            <Text style={styles.statusText}>Base de données</Text>
            <Text style={styles.statusValue}>Opérationnelle</Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.statusOk]} />
            <Text style={styles.statusText}>Authentification</Text>
            <Text style={styles.statusValue}>Opérationnelle</Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.statusOk]} />
            <Text style={styles.statusText}>Messagerie</Text>
            <Text style={styles.statusValue}>Opérationnelle</Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, styles.statusOk]} />
            <Text style={styles.statusText}>Recherche</Text>
            <Text style={styles.statusValue}>Opérationnelle</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  statsGrid: {
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A202C',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  statBadge: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
  },
  statPercentage: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 16,
  },
  menuGrid: {
    gap: 12,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    cursor: 'pointer',
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  menuDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  menuDetails: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  menuActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  actionTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  menuBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recentActivity: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1A202C',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  systemStatus: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOk: {
    backgroundColor: '#10B981',
  },
  statusWarning: {
    backgroundColor: '#F59E0B',
  },
  statusError: {
    backgroundColor: '#DC2626',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
});
