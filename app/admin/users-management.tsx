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
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import { User, Shield, Trash2, RefreshCw, Search, X, UserPlus } from 'lucide-react-native';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  user_type: string;
  has_active_pro_package: boolean;
  created_at: string;
  role?: string;
}

export default function UsersManagementScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin' | 'super_admin'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin' | 'super_admin'>('user');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Charger tous les profils
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
        console.error('Error loading roles:', rolesError);
      }

      // Combiner les données
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.id)?.role || 'user'
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.email?.toLowerCase().includes(query) ||
        u.full_name?.toLowerCase().includes(query)
      );
    }

    // Filtrer par rôle
    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleAssignRole = async (userId: string, email: string, role: string) => {
    Alert.alert(
      'Changer le rôle',
      `Assigner le rôle "${role}" à ${email} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setActionLoading(true);
            try {
              const { data, error } = await supabase.rpc('assign_admin_role', {
                p_user_email: email,
                p_role: role
              });

              if (error) throw error;

              if (data?.success) {
                Alert.alert('Succès', 'Rôle assigné avec succès');
                loadUsers();
              } else {
                Alert.alert('Erreur', data?.error || 'Impossible d\'assigner le rôle');
              }
            } catch (error: any) {
              console.error('Error assigning role:', error);
              Alert.alert('Erreur', error.message || 'Impossible d\'assigner le rôle');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    Alert.alert(
      'Supprimer l\'utilisateur',
      `Êtes-vous sûr de vouloir supprimer ${email} ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              // Note: Suppression réelle nécessite une fonction admin
              // Pour l'instant, on peut juste désactiver le compte
              const { error } = await supabase
                .from('profiles')
                .update({ is_active: false })
                .eq('id', userId);

              if (error) throw error;

              Alert.alert('Succès', 'Utilisateur désactivé');
              loadUsers();
            } catch (error: any) {
              console.error('Error deleting user:', error);
              Alert.alert('Erreur', error.message || 'Impossible de supprimer l\'utilisateur');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCreateUser = async () => {
    if (!newUserEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un email');
      return;
    }

    setActionLoading(true);
    try {
      // Pour créer un utilisateur, il faut utiliser l'API Supabase Auth
      // Cela nécessite soit le Dashboard Supabase, soit une fonction Edge
      Alert.alert(
        'Créer un utilisateur',
        'Pour créer un nouvel utilisateur:\n\n' +
        '1. Allez sur le Dashboard Supabase\n' +
        '2. Section Authentication > Users\n' +
        '3. Cliquez "Add user"\n' +
        '4. Revenez ici et assignez le rôle\n\n' +
        `Email: ${newUserEmail}\n` +
        `Rôle souhaité: ${newUserRole}`,
        [{ text: 'OK' }]
      );
      setShowCreateModal(false);
      setNewUserEmail('');
      setNewUserRole('user');
    } catch (error: any) {
      console.error('Error creating user:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer l\'utilisateur');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return { bg: '#DC2626', text: '#FFFFFF' };
      case 'admin': return { bg: '#F59E0B', text: '#FFFFFF' };
      default: return { bg: '#E5E7EB', text: '#374151' };
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      default: return 'Utilisateur';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestion des utilisateurs</Text>
          <Text style={styles.subtitle}>{users.length} utilisateurs au total</Text>
        </View>

        {/* Filtres et recherche */}
        <View style={styles.filters}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par email ou nom..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleFilters}>
            {['all', 'user', 'admin', 'super_admin'].map(role => (
              <TouchableOpacity
                key={role}
                style={[styles.roleFilter, filterRole === role && styles.roleFilterActive]}
                onPress={() => setFilterRole(role as any)}
              >
                <Text style={[styles.roleFilterText, filterRole === role && styles.roleFilterTextActive]}>
                  {role === 'all' ? 'Tous' : getRoleLabel(role)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
            <UserPlus size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>

        {/* Liste des utilisateurs */}
        <View style={styles.usersList}>
          {filteredUsers.map(userProfile => {
            const roleColors = getRoleBadgeColor(userProfile.role || 'user');
            return (
              <View key={userProfile.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.userIconContainer}>
                    <User size={24} color="#2563EB" />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{userProfile.full_name || 'Sans nom'}</Text>
                    <Text style={styles.userEmail}>{userProfile.email}</Text>
                    <View style={styles.userMeta}>
                      <View style={[styles.roleBadge, { backgroundColor: roleColors.bg }]}>
                        <Shield size={12} color={roleColors.text} />
                        <Text style={[styles.roleBadgeText, { color: roleColors.text }]}>
                          {getRoleLabel(userProfile.role || 'user')}
                        </Text>
                      </View>
                      {userProfile.has_active_pro_package && (
                        <View style={styles.proBadge}>
                          <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert(
                        'Changer le rôle',
                        `Email: ${userProfile.email}\nRôle actuel: ${getRoleLabel(userProfile.role || 'user')}`,
                        [
                          { text: 'Annuler', style: 'cancel' },
                          { text: 'User', onPress: () => handleAssignRole(userProfile.id, userProfile.email, 'user') },
                          { text: 'Admin', onPress: () => handleAssignRole(userProfile.id, userProfile.email, 'admin') },
                          { text: 'Super Admin', onPress: () => handleAssignRole(userProfile.id, userProfile.email, 'super_admin') },
                        ]
                      );
                    }}
                  >
                    <RefreshCw size={18} color="#2563EB" />
                  </TouchableOpacity>

                  {userProfile.role !== 'super_admin' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteUser(userProfile.id, userProfile.email)}
                    >
                      <Trash2 size={18} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <User size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>Aucun utilisateur trouvé</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal création utilisateur */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreateModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Créer un utilisateur</Text>
            <Text style={styles.modalSubtitle}>
              L'utilisateur sera créé via le Dashboard Supabase
            </Text>

            <View style={styles.modalForm}>
              <Text style={styles.modalLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="email@exemple.com"
                value={newUserEmail}
                onChangeText={setNewUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.modalLabel}>Rôle</Text>
              <View style={styles.roleButtons}>
                {['user', 'admin', 'super_admin'].map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleButton, newUserRole === role && styles.roleButtonActive]}
                    onPress={() => setNewUserRole(role as any)}
                  >
                    <Text style={[styles.roleButtonText, newUserRole === role && styles.roleButtonTextActive]}>
                      {getRoleLabel(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleCreateUser}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Créer</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  filters: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  roleFilters: {
    marginBottom: 12,
  },
  roleFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  roleFilterActive: {
    backgroundColor: '#2563EB',
  },
  roleFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  roleFilterTextActive: {
    color: '#FFFFFF',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  usersList: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  proBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  modalForm: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2563EB',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  modalButtonConfirm: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
