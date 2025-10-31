import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle, Users, FileText, CheckCircle, XCircle, Eye, Trash2, ArrowLeft } from 'lucide-react-native';

interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  listings?: {
    id: string;
    title: string;
    user_id: string;
  };
  profiles?: {
    full_name: string;
  };
}

interface Stats {
  pending_reports: number;
  total_reports: number;
  banned_users: number;
  flagged_listings: number;
  actions_today: number;
}

export default function ModerationDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [actionReason, setActionReason] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      Alert.alert('Accès refusé', 'Vous n\'avez pas les permissions pour accéder à cette page');
      router.back();
      return;
    }

    loadDashboard();
  }, [profile]);

  const loadDashboard = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadReports()]);
    setLoading(false);
  };

  const loadStats = async () => {
    const { data } = await supabase.rpc('get_moderation_stats');
    if (data && data.length > 0) {
      setStats(data[0]);
    }
  };

  const loadReports = async () => {
    const query = supabase
      .from('reports')
      .select(`
        *,
        listings(id, title, user_id),
        profiles:reporter_id(full_name)
      `)
      .order('created_at', { ascending: false });

    if (activeTab === 'pending') {
      query.eq('status', 'pending');
    }

    const { data } = await query;
    if (data) {
      setReports(data);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const handleReportAction = async (
    reportId: string,
    action: 'approve' | 'reject' | 'ban',
    listingId?: string,
    userId?: string
  ) => {
    if (!actionReason.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une raison');
      return;
    }

    try {
      let newStatus = 'reviewed';
      let listingAction: string | null = null;

      if (action === 'approve') {
        newStatus = 'resolved';
        listingAction = 'flagged';
      } else if (action === 'reject') {
        newStatus = 'dismissed';
      } else if (action === 'ban') {
        newStatus = 'resolved';
        listingAction = 'hidden';

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              is_banned: true,
              banned_reason: actionReason,
              banned_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
      }

      await supabase
        .from('reports')
        .update({
          status: newStatus,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (listingAction && listingId) {
        await supabase
          .from('listings')
          .update({ status: listingAction })
          .eq('id', listingId);
      }

      await supabase.from('moderation_actions').insert({
        moderator_id: user?.id,
        target_type: 'report',
        target_id: reportId,
        action,
        reason: actionReason,
      });

      Alert.alert('Succès', 'Action effectuée avec succès');
      setActionReason('');
      setSelectedReport(null);
      loadDashboard();
    } catch (error) {
      console.error('Error handling report:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: { [key: string]: string } = {
      spam: 'Spam ou publicité',
      inappropriate: 'Contenu inapproprié',
      scam: 'Arnaque suspectée',
      duplicate: 'Annonce en double',
      other: 'Autre',
    };
    return labels[reason] || reason;
  };

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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1A202C" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Modération</Text>
          <Text style={styles.subtitle}>Dashboard administrateur</Text>
        </View>
        <Shield size={32} color="#2563EB" />
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statPending]}>
          <AlertTriangle size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{stats?.pending_reports || 0}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>

        <View style={[styles.statCard, styles.statTotal]}>
          <FileText size={24} color="#2563EB" />
          <Text style={styles.statValue}>{stats?.total_reports || 0}</Text>
          <Text style={styles.statLabel}>Signalements</Text>
        </View>

        <View style={[styles.statCard, styles.statBanned]}>
          <Users size={24} color="#DC2626" />
          <Text style={styles.statValue}>{stats?.banned_users || 0}</Text>
          <Text style={styles.statLabel}>Bannis</Text>
        </View>

        <View style={[styles.statCard, styles.statActions]}>
          <CheckCircle size={24} color="#10B981" />
          <Text style={styles.statValue}>{stats?.actions_today || 0}</Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            En attente ({stats?.pending_reports || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reportsList}>
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>Aucun signalement</Text>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>
                    {getReasonLabel(report.reason)}
                  </Text>
                </View>
                <Text style={styles.reportDate}>
                  {new Date(report.created_at).toLocaleDateString('fr-FR')}
                </Text>
              </View>

              <Text style={styles.reportListing}>
                Annonce: {report.listings?.title || 'N/A'}
              </Text>
              <Text style={styles.reportBy}>
                Signalé par: {report.profiles?.full_name || 'Utilisateur'}
              </Text>

              {report.description && (
                <Text style={styles.reportDescription}>{report.description}</Text>
              )}

              <View style={styles.reportStatus}>
                <Text
                  style={[
                    styles.statusBadge,
                    report.status === 'pending' && styles.statusPending,
                    report.status === 'resolved' && styles.statusResolved,
                    report.status === 'dismissed' && styles.statusDismissed,
                  ]}
                >
                  {report.status === 'pending' && 'En attente'}
                  {report.status === 'resolved' && 'Résolu'}
                  {report.status === 'dismissed' && 'Rejeté'}
                  {report.status === 'reviewed' && 'Examiné'}
                </Text>
              </View>

              {report.status === 'pending' && (
                <>
                  {selectedReport === report.id ? (
                    <View style={styles.actionPanel}>
                      <TextInput
                        style={styles.reasonInput}
                        placeholder="Raison de l'action..."
                        value={actionReason}
                        onChangeText={setActionReason}
                        multiline
                      />
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.approveBtn]}
                          onPress={() =>
                            handleReportAction(
                              report.id,
                              'approve',
                              report.listing_id,
                              report.listings?.user_id
                            )
                          }
                        >
                          <CheckCircle size={18} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Approuver</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => handleReportAction(report.id, 'reject')}
                        >
                          <XCircle size={18} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Rejeter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.banBtn]}
                          onPress={() =>
                            handleReportAction(
                              report.id,
                              'ban',
                              report.listing_id,
                              report.listings?.user_id
                            )
                          }
                        >
                          <Trash2 size={18} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Bannir</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => {
                          setSelectedReport(null);
                          setActionReason('');
                        }}
                      >
                        <Text style={styles.cancelBtnText}>Annuler</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.reportActions}>
                      <TouchableOpacity
                        style={styles.viewBtn}
                        onPress={() =>
                          router.push(`/listing/${report.listing_id}`)
                        }
                      >
                        <Eye size={16} color="#2563EB" />
                        <Text style={styles.viewBtnText}>Voir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.moderateBtn}
                        onPress={() => setSelectedReport(report.id)}
                      >
                        <Shield size={16} color="#FFFFFF" />
                        <Text style={styles.moderateBtnText}>Modérer</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          ))
        )}
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
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statPending: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  statTotal: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  statBanned: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  statActions: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A202C',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#EBF5FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  reportsList: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reportBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  reportDate: {
    fontSize: 12,
    color: '#64748B',
  },
  reportListing: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  reportBy: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  reportStatus: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusResolved: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  statusDismissed: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  viewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  moderateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  moderateBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionPanel: {
    marginTop: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#64748B',
  },
  banBtn: {
    backgroundColor: '#DC2626',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
