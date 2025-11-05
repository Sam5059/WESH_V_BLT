# Guide d'Intégration Frontend - Système PRO

## 🎯 Vue d'ensemble

Ce guide explique comment intégrer le système PRO dans votre application React Native Expo.

## 📱 Pages et Navigation

### Structure des Routes

```
/pro/
  ├── index.tsx              → Page d'accueil PRO
  ├── packages.tsx           → Liste des forfaits
  └── dashboard.tsx          → Tableau de bord PRO
```

### Navigation depuis l'app

```typescript
import { router } from 'expo-router';

// Aller vers la page d'accueil PRO
router.push('/pro');

// Aller directement aux packages
router.push('/pro/packages');

// Aller au dashboard (si PRO)
router.push('/pro/dashboard');

// Filtrer par catégorie
router.push('/pro/packages?category=category-uuid');
```

## 🔧 Hooks et Contextes Utilisés

### AuthContext
```typescript
const { user, profile } = useAuth();

// Vérifier si l'utilisateur est PRO
const isPro = profile?.user_type === 'professional';
const hasActivePro = isPro && profile?.pro_expires_at && new Date(profile.pro_expires_at) > new Date();
```

### LanguageContext
```typescript
const { t, language, isRTL } = useLanguage();

// Traduire un texte
<Text>{t('pro.titleUpgrade')}</Text>

// Appliquer RTL
<Text style={[styles.text, isRTL && styles.textRTL]}>
  {t('pro.benefits')}
</Text>
```

## 📦 Composants Réutilisables

### Badge PRO

```typescript
import { Crown } from 'lucide-react-native';

const ProBadge = () => (
  <View style={styles.proBadge}>
    <Crown size={14} color="#FFD700" />
    <Text style={styles.proBadgeText}>PRO</Text>
  </View>
);

const styles = StyleSheet.create({
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
});
```

### Compteur de jours restants

```typescript
const DaysRemaining = ({ expiresAt }: { expiresAt: string }) => {
  const days = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View style={styles.daysContainer}>
      <Text style={styles.daysNumber}>{days}</Text>
      <Text style={styles.daysLabel}>jours restants</Text>
    </View>
  );
};
```

## 🔌 Appels API Supabase

### 1. Charger les packages PRO

```typescript
const loadProPackages = async (categoryId?: string) => {
  let query = supabase
    .from('pro_packages')
    .select('*, category:categories(id, name, name_ar, slug)')
    .eq('is_active', true)
    .order('order_position', { ascending: true });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading packages:', error);
    return [];
  }

  return data || [];
};
```

### 2. Activer un abonnement PRO

```typescript
const activateSubscription = async (
  userId: string,
  packageId: string,
  paymentMethod: string = 'pending'
) => {
  const { data, error } = await supabase.rpc('activate_pro_subscription', {
    p_user_id: userId,
    p_package_id: packageId,
    p_payment_method: paymentMethod,
    p_payment_reference: `REF-${Date.now()}`
  });

  if (error) {
    console.error('Error activating subscription:', error);
    return { success: false, error: error.message };
  }

  return data;
};
```

### 3. Vérifier le statut PRO

```typescript
const checkProStatus = async (userId: string) => {
  const { data, error } = await supabase.rpc('check_pro_status', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error checking PRO status:', error);
    return null;
  }

  return data;
};
```

### 4. Récupérer les analytics

```typescript
const getAnalytics = async (userId: string, days: number = 30) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase.rpc('get_pro_analytics', {
    p_user_id: userId,
    p_start_date: startDate,
    p_end_date: endDate
  });

  if (error) {
    console.error('Error loading analytics:', error);
    return null;
  }

  return data;
};
```

### 5. Charger l'historique des abonnements

```typescript
const loadSubscriptions = async (userId: string, limit: number = 10) => {
  const { data, error } = await supabase
    .from('pro_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error loading subscriptions:', error);
    return [];
  }

  return data || [];
};
```

## 🎨 Styles et Design

### Palette de couleurs PRO

```typescript
const ProColors = {
  // Primaires
  primary: '#2563EB',      // Bleu principal
  gold: '#FFD700',         // Or pour badges
  success: '#10B981',      // Vert pour succès
  warning: '#F59E0B',      // Orange pour avertissements
  error: '#EF4444',        // Rouge pour erreurs

  // Backgrounds
  primaryBg: '#EFF6FF',    // Fond bleu clair
  goldBg: '#FEF3C7',       // Fond doré
  successBg: '#D1FAE5',    // Fond vert
  warningBg: '#FEF3C7',    // Fond orange
  errorBg: '#FEE2E2',      // Fond rouge

  // Texte
  textPrimary: '#0F172A',  // Texte principal
  textSecondary: '#64748B', // Texte secondaire
  textLight: '#94A3B8',    // Texte léger
};
```

### Composants de style communs

```typescript
const ProStyles = StyleSheet.create({
  // Carte principale
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  // Badge populaire
  popularBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Bouton principal
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // Texte du bouton
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
```

## 🔔 Gestion des Notifications

### Afficher une notification de succès

```typescript
import { Alert } from 'react-native';

const showSuccessMessage = (title: string, message: string) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'OK',
        style: 'default',
        onPress: () => router.push('/pro/dashboard')
      }
    ]
  );
};

// Usage
showSuccessMessage(
  'Félicitations !',
  'Votre compte PRO est maintenant actif.'
);
```

### Afficher une erreur

```typescript
const showErrorMessage = (message: string) => {
  Alert.alert(
    'Erreur',
    message,
    [{ text: 'OK', style: 'cancel' }]
  );
};
```

## 🔐 Vérifications de Sécurité

### Vérifier avant de publier une annonce

```typescript
const canUserPublish = async (userId: string, categoryId: string) => {
  const { data, error } = await supabase.rpc('can_publish_listing', {
    p_user_id: userId,
    p_category_id: categoryId
  });

  if (error || !data) {
    return {
      canPublish: false,
      reason: 'Error checking permissions'
    };
  }

  if (!data.can_publish) {
    // Afficher un message approprié
    if (data.reason === 'PRO subscription expired') {
      Alert.alert(
        'Abonnement expiré',
        'Votre abonnement PRO a expiré. Renouvelez-le pour continuer à publier.',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Renouveler', onPress: () => router.push('/pro/packages') }
        ]
      );
    } else if (data.reason === 'Listings quota reached') {
      Alert.alert(
        'Quota atteint',
        'Vous avez atteint votre limite d\'annonces. Passez à un pack supérieur.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Voir les packs', onPress: () => router.push('/pro/packages') }
        ]
      );
    }
  }

  return data;
};
```

## 📊 Affichage des Statistiques

### Graphique simple de vues

```typescript
const ViewsChart = ({ dailyData }: { dailyData: any[] }) => {
  const maxViews = Math.max(...dailyData.map(d => d.views));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Vues quotidiennes</Text>
      <View style={styles.barsContainer}>
        {dailyData.slice(-7).map((day, index) => {
          const height = (day.views / maxViews) * 100;
          return (
            <View key={index} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  { height: `${height}%`, backgroundColor: '#2563EB' }
                ]}
              />
              <Text style={styles.barLabel}>
                {new Date(day.date).getDate()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
});
```

## 🔄 Refresh et Rechargement

### Pull to refresh

```typescript
import { RefreshControl } from 'react-native';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await Promise.all([
    loadProStatus(),
    loadAnalytics(),
    loadSubscriptions()
  ]);
  setRefreshing(false);
};

// Dans ScrollView
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#2563EB']}
      tintColor="#2563EB"
    />
  }
>
  {/* Contenu */}
</ScrollView>
```

## 🌐 Internationalisation

### Clés de traduction nécessaires

```typescript
// locales/translations.ts
export const translations = {
  fr: {
    pro: {
      titleUpgrade: 'Passer au PRO',
      benefits: 'Avantages PRO',
      unlimitedListings: 'Annonces illimitées',
      proBadgeVisible: 'Badge PRO visible',
      topResults: 'Apparaît en haut des résultats',
      detailedStats: 'Statistiques détaillées',
      prioritySupport: 'Support prioritaire',
      morePhotos: "Jusqu'à 10 photos par annonce",
      selectCategory: 'Choisissez votre catégorie',
      allCategories: 'Toutes les catégories',
      // ... autres clés
    }
  },
  ar: {
    pro: {
      titleUpgrade: 'الترقية إلى محترف',
      benefits: 'مزايا المحترفين',
      // ... autres clés
    }
  }
};
```

## 🐛 Debugging

### Logs utiles

```typescript
// Activer les logs détaillés
const DEBUG = __DEV__;

const debugLog = (context: string, data: any) => {
  if (DEBUG) {
    console.log(`[PRO][${context}]`, JSON.stringify(data, null, 2));
  }
};

// Usage
debugLog('Subscription', { packageId, userId });
debugLog('Status Check', proStatus);
```

## ✅ Checklist d'Intégration

- [ ] Pages créées (`/pro/index`, `/pro/packages`, `/pro/dashboard`)
- [ ] Navigation configurée
- [ ] Appels API Supabase fonctionnels
- [ ] Gestion des erreurs implémentée
- [ ] Styles appliqués selon la charte
- [ ] Traductions ajoutées
- [ ] Tests effectués (connexion, abonnement, dashboard)
- [ ] RLS vérifié (accès sécurisé aux données)
- [ ] Badge PRO affiché sur les profils
- [ ] Analytics fonctionnels
- [ ] Refresh implémenté

## 📞 Support Technique

En cas de problème, vérifier:
1. Les migrations sont appliquées
2. Les RLS policies sont actives
3. L'utilisateur est authentifié
4. Les fonctions Supabase retournent des données
5. Les erreurs sont loggées dans la console
