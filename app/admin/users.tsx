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
  Modal,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Search,
  Shield,
  ShieldOff,
  Lock,
  Unlock,
  Mail,
  User,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Crown,
} from 'lucide-react-native';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  is_admin: boolean;
  is_banned: boolean;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

export default function AdminUsersManagement() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'banned' | 'pro'>('all');

  useEffect(() => {
    if (profile?.role !== 'admin') {
      Alert.alert('Accès refusé', 'Seuls les administrateurs peuvent accéder à cette page');
      router.back();
      return;
    }
    loadUsers();
  }, [profile]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users, filterType]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Charger les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Charger les rôles depuis admin_roles
      const { data: roles, error: rolesError } = await supabase
        .from('admin_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('[ADMIN USERS] Error loading roles:', rolesError);
      }

      // Combiner profiles + roles
      const usersWithRoles = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id)?.role || 'user';
        return {
          id: profile.id,
          email: profile.email || 'Email non disponible',
          full_name: profile.full_name || 'Sans nom',
          user_type: profile.user_type || 'individual',
          is_admin: userRole === 'admin' || userRole === 'super_admin',
          is_banned: profile.is_banned || false,
          role: userRole,
          created_at: profile.created_at || new Date().toISOString(),
          last_sign_in_at: undefined,
          email_confirmed_at: undefined,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('[ADMIN USERS] Error loading users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filterType) {
      case 'admin':
        filtered = filtered.filter((u) => u.is_admin);
        break;
      case 'banned':
        filtered = filtered.filter((u) => u.is_banned);
        break;
      case 'pro':
        filtered = filtered.filter((u) => u.user_type === 'professional');
        break;
    }

    setFilteredUsers(filtered);
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const { error } = await supabase.rpc('admin_reset_user_password', {
        user_id: selectedUser.id,
        new_password: newPassword,
      });

      if (error) throw error;

      Alert.alert('Succès', `Mot de passe réinitialisé pour ${selectedUser.email}`);
      setResetPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error: any) {
      console.error('[ADMIN] Error resetting password:', error);
      Alert.alert('Erreur', error.message || 'Impossible de réinitialiser le mot de passe');
    }
  };

  const handleChangeRole = async (user: UserProfile) => {
    Alert.alert(
      'Changer le rôle',
      `Email: ${user.email}\nRôle actuel: ${user.role || 'user'}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'User',
          onPress: async () => {
            try {
              const { data, error } = await supabase.rpc('assign_admin_role', {
                p_user_email: user.email,
                p_role: 'user'
              });
              if (error) throw error;
              if (data?.success) {
                Alert.alert('Succès', 'Rôle modifié en User');
                loadUsers();
              } else {
                Alert.alert('Erreur', data?.error || 'Impossible de modifier le rôle');
              }
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        },
        {
          text: 'Admin',
          onPress: async () => {
            try {
              const { data, error } = await supabase.rpc('assign_admin_role', {
                p_user_email: user.email,
                p_role: 'admin'
              });
              if (error) throw error;
              if (data?.success) {
                Alert.alert('Succès', 'Rôle modifié en Admin');
                loadUsers();
              } else {
                Alert.alert('Erreur', data?.error || 'Impossible de modifier le rôle');
              }
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        },
        {
          text: 'Super Admin',
          onPress: async () => {
            try {
              const { data, error } = await supabase.rpc('assign_admin_role', {
                p_user_email: user.email,
                p_role: 'super_admin'
              });
              if (error) throw error;
              if (data?.success) {
                Alert.alert('Succès', 'Rôle modifié en Super Admin');
                loadUsers();
              } else {
                Alert.alert('Erreur', data?.error || 'Impossible de modifier le rôle');
              }
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        },
      ]
    );
  };

  const handleToggleAdmin = async (user: UserProfile) => {
    // Utiliser la nouvelle fonction de changement de rôle
    handleChangeRole(user);
  };

  const handleToggleBan = async (user: UserProfile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !user.is_banned })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert(
        'Succès',
        `${user.email} a été ${!user.is_banned ? 'banni' : 'débanni'}`
      );
      loadUsers();
    } catch (error: any) {
      console.error('[ADMIN] Error toggling ban:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir supprimer ${user.email}?\n\nCette action est IRRÉVERSIBLE!`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data, error } = await supabase.rpc('admin_delete_user', {
                target_user_id: user.id,
              });

              if (error) throw error;

              Alert.alert('Succès', 'Utilisateur supprimé');
              loadUsers();
            } catch (error: any) {
              console.error('[ADMIN] Error deleting user:', error);
              Alert.alert('Erreur', error.message || 'Impossible de supprimer l\'utilisateur');
            }
          },
        },
      ]
    );
  };

  const handleSendPasswordReset = async (user: UserProfile) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);

      if (error) throw error;

      Alert.alert(
        'Email envoyé',
        `Un email de réinitialisation a été envoyé à ${user.email}`
      );
    } catch (error: any) {
      console.error('[ADMIN] Error sending reset email:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'email');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const UserCard = ({ user }: { user: UserProfile }) => (
    <TouchableOpacity
      style={[styles.userCard, user.is_banned && styles.bannedCard]}
      onPress={() => {
        setSelectedUser(user);
        setModalVisible(true);
      }}
    >
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.full_name}</Text>
            {user.is_admin && (
              <View style={styles.adminBadge}>
                <Crown size={12} color="#FFD700" />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
            {user.user_type === 'professional' && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>Pro</Text>
              </View>
            )}
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <View style={styles.userStatus}>
          {user.is_banned ? (
            <ShieldOff size={24} color="#EF4444" />
          ) : (
            <Shield size={24} color="#10B981" />
          )}
        </View>
      </View>

      <View style={styles.userMeta}>
        <View style={styles.metaItem}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.metaText}>Créé: {formatDate(user.created_at)}</Text>
        </View>
        {user.last_sign_in_at && (
          <View style={styles.metaItem}>
            <CheckCircle size={14} color="#10B981" />
            <Text style={styles.metaText}>Dernière connexion: {formatDate(user.last_sign_in_at)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestion des Comptes</Text>
          <Text style={styles.headerSubtitle}>{filteredUsers.length} utilisateurs</Text>
        </View>
        <TouchableOpacity onPress={loadUsers} style={styles.refreshButton}>
          <RefreshCw size={24} color="#F59E0B" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par email ou nom..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'admin' && styles.filterButtonActive]}
          onPress={() => setFilterType('admin')}
        >
          <Crown size={16} color={filterType === 'admin' ? '#F59E0B' : '#6B7280'} />
          <Text style={[styles.filterButtonText, filterType === 'admin' && styles.filterButtonTextActive]}>
            Admins
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'pro' && styles.filterButtonActive]}
          onPress={() => setFilterType('pro')}
        >
          <Text style={[styles.filterButtonText, filterType === 'pro' && styles.filterButtonTextActive]}>
            Pros
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'banned' && styles.filterButtonActive]}
          onPress={() => setFilterType('banned')}
        >
          <ShieldOff size={16} color={filterType === 'banned' ? '#F59E0B' : '#6B7280'} />
          <Text style={[styles.filterButtonText, filterType === 'banned' && styles.filterButtonTextActive]}>
            Bannis
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <User size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>Aucun utilisateur trouvé</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Gérer le compte</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <XCircle size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalUserInfo}>
                  <Text style={styles.modalUserName}>{selectedUser.full_name}</Text>
                  <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                  <View style={styles.modalBadges}>
                    {selectedUser.is_admin && (
                      <View style={styles.modalBadge}>
                        <Crown size={14} color="#FFD700" />
                        <Text style={styles.modalBadgeText}>Admin</Text>
                      </View>
                    )}
                    {selectedUser.is_banned && (
                      <View style={[styles.modalBadge, styles.modalBadgeDanger]}>
                        <ShieldOff size={14} color="#EF4444" />
                        <Text style={[styles.modalBadgeText, styles.modalBadgeTextDanger]}>Banni</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setModalVisible(false);
                      setResetPasswordModal(true);
                    }}
                  >
                    <Lock size={20} color="#3B82F6" />
                    <Text style={styles.actionButtonText}>Réinitialiser mot de passe</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSendPasswordReset(selectedUser)}
                  >
                    <Mail size={20} color="#8B5CF6" />
                    <Text style={styles.actionButtonText}>Envoyer email de réinitialisation</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      handleToggleAdmin(selectedUser);
                      setModalVisible(false);
                    }}
                  >
                    {selectedUser.is_admin ? (
                      <ShieldOff size={20} color="#F59E0B" />
                    ) : (
                      <Crown size={20} color="#F59E0B" />
                    )}
                    <Text style={styles.actionButtonText}>
                      {selectedUser.is_admin ? 'Retirer admin' : 'Promouvoir admin'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, selectedUser.is_banned && styles.actionButtonSuccess]}
                    onPress={() => {
                      handleToggleBan(selectedUser);
                      setModalVisible(false);
                    }}
                  >
                    {selectedUser.is_banned ? (
                      <Unlock size={20} color="#10B981" />
                    ) : (
                      <ShieldOff size={20} color="#EF4444" />
                    )}
                    <Text style={styles.actionButtonText}>
                      {selectedUser.is_banned ? 'Débannir' : 'Bannir'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    onPress={() => {
                      setModalVisible(false);
                      handleDeleteUser(selectedUser);
                    }}
                  >
                    <Trash2 size={20} color="#EF4444" />
                    <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                      Supprimer le compte
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={resetPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Réinitialiser le mot de passe</Text>
              <TouchableOpacity onPress={() => setResetPasswordModal(false)}>
                <XCircle size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <View style={styles.resetPasswordContent}>
                <Text style={styles.resetPasswordLabel}>Utilisateur:</Text>
                <Text style={styles.resetPasswordEmail}>{selectedUser.email}</Text>

                <Text style={styles.resetPasswordLabel}>Nouveau mot de passe:</Text>
                <TextInput
                  style={styles.resetPasswordInput}
                  placeholder="Minimum 6 caractères"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <View style={styles.resetPasswordButtons}>
                  <TouchableOpacity
                    style={styles.resetPasswordCancel}
                    onPress={() => {
                      setResetPasswordModal(false);
                      setNewPassword('');
                    }}
                  >
                    <Text style={styles.resetPasswordCancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.resetPasswordConfirm}
                    onPress={handleResetPassword}
                  >
                    <Text style={styles.resetPasswordConfirmText}>Confirmer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bannedCard: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  userStatus: {
    marginLeft: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  proBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  userMeta: {
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalUserInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  modalBadgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  modalBadgeTextDanger: {
    color: '#991B1B',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  actionButtonSuccess: {
    backgroundColor: '#ECFDF5',
  },
  actionButtonDanger: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  actionButtonTextDanger: {
    color: '#EF4444',
  },
  resetPasswordContent: {
    paddingVertical: 16,
  },
  resetPasswordLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  resetPasswordEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  resetPasswordInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 24,
  },
  resetPasswordButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetPasswordCancel: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  resetPasswordCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  resetPasswordConfirm: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    alignItems: 'center',
  },
  resetPasswordConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
