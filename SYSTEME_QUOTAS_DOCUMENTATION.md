# 📚 Documentation - Système de Quotas d'Annonces

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture technique](#architecture-technique)
3. [Fonctionnement des quotas](#fonctionnement-des-quotas)
4. [Guide utilisateur](#guide-utilisateur)
5. [Guide développeur](#guide-développeur)
6. [Sécurité et performances](#sécurité-et-performances)
7. [FAQ](#faq)

---

## 🎯 Vue d'ensemble

### Qu'est-ce que le système de quotas ?

Le système de quotas permet de **limiter le nombre d'annonces actives** qu'un utilisateur peut publier simultanément sur la plateforme. Cette limitation varie selon le type d'utilisateur et son forfait actif.

### Objectifs

| Objectif | Description |
|----------|-------------|
| **🔒 Contrôle qualité** | Éviter le spam et maintenir la qualité des annonces |
| **💰 Monétisation** | Inciter les utilisateurs à passer aux forfaits Pro |
| **⚖️ Équité** | Assurer une distribution équitable de la visibilité |
| **📊 Gestion** | Faciliter la gestion des annonces pour les utilisateurs |

---

## 🏗️ Architecture technique

### Composants du système

```
┌─────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                       │
├─────────────────────────────────────────────────────────┤
│  Fonctions SQL:                                         │
│  • get_user_active_listings_count()                     │
│  • get_user_package_max_listings()                      │
│  • can_user_publish_listing()                           │
│  • get_user_listings_quota()                            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      COMPOSANT UI                        │
├─────────────────────────────────────────────────────────┤
│  ListingsQuotaCard.tsx                                  │
│  • Affichage visuel du quota                            │
│  • Barre de progression                                 │
│  • Messages contextuels                                 │
│  • Bouton d'upgrade                                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   PAGES UTILISATEUR                      │
├─────────────────────────────────────────────────────────┤
│  publish.tsx          my-listings.tsx                   │
│  • Vérification avant  • Affichage du quota            │
│    publication         • Gestion des annonces          │
│  • Blocage si limite   • Libération de places          │
└─────────────────────────────────────────────────────────┘
```

### Fichiers créés/modifiés

#### Nouveaux fichiers

1. **`supabase/migrations/20251018090000_add_listing_limits_functions.sql`**
   - Fonctions SQL de gestion des quotas
   - Sécurité DEFINER avec permissions
   - Documentation inline

2. **`components/ListingsQuotaCard.tsx`**
   - Composant React Native réutilisable
   - Support multilingue (FR/EN/AR)
   - Interface responsive

3. **`SYSTEME_QUOTAS_DOCUMENTATION.md`** (ce fichier)
   - Documentation complète
   - Guides utilisateur et développeur

#### Fichiers modifiés

1. **`app/(tabs)/publish.tsx`**
   - Ajout du chargement du quota
   - Vérification avant publication
   - Rechargement après publication
   - Affichage de la carte de quota

2. **`app/my-listings.tsx`**
   - Affichage du quota en haut de page
   - Rechargement après suppression
   - Rechargement après changement de statut

---

## ⚙️ Fonctionnement des quotas

### Règles de limitation

#### 👤 Utilisateurs Individuels (Gratuit)

```
┌────────────────────────────────────┐
│  Type d'utilisateur: Individual    │
├────────────────────────────────────┤
│  Annonces actives max:  3          │
│  Annonces inactives:    ∞          │
│  Annonces vendues:      ∞          │
│  Coût:                  Gratuit    │
└────────────────────────────────────┘
```

#### 💼 Utilisateurs Professionnels

**Avec forfait actif:**

| Forfait | Annonces actives | Prix | Durée |
|---------|------------------|------|-------|
| **Basic** | 10-20 | 3 000 DA | 30 jours |
| **Standard** | 50-100 | 8 000 DA | 30 jours |
| **Premium** | Illimité | 15 000 DA | 30 jours |

**Sans forfait actif:**
- Limite: **3 annonces** (comme utilisateur individuel)
- Message: *"Activez un forfait Pro pour publier plus d'annonces"*

### Comptage des annonces

#### Annonces comptées dans le quota

```sql
SELECT COUNT(*) FROM listings
WHERE user_id = ?
  AND status = 'active'
```

✅ **Comptées:**
- Annonces avec `status = 'active'`

❌ **Non comptées:**
- Annonces avec `status = 'inactive'`
- Annonces avec `status = 'sold'`
- Annonces avec `status = 'expired'`
- Annonces avec `status = 'suspended'`

### Logique de vérification

```typescript
// 1. Compter les annonces actives
const activeCount = await get_user_active_listings_count(userId);

// 2. Récupérer la limite max
const maxListings = await get_user_package_max_listings(userId);

// 3. Vérifier si publication possible
const canPublish = activeCount < maxListings;
```

---

## 👥 Guide utilisateur

### Pour les utilisateurs individuels

#### Étape 1: Comprendre votre quota

Lorsque vous créez un compte, vous disposez de **3 annonces actives gratuites**.

```
📊 Votre quota gratuit:
┌──────────────────────┐
│ ✅ 3 / 3 disponibles │
│ ████████████ 0%      │
└──────────────────────┘
```

#### Étape 2: Publier vos premières annonces

1. Allez sur **"Publier une annonce"**
2. Vous verrez votre quota en haut de la page
3. Remplissez le formulaire
4. Cliquez sur **"Publier"**
5. Votre quota se met à jour: **2 / 3 disponibles**

#### Étape 3: Gérer vos annonces

Quand vous atteignez la limite (3/3):

**Option A: Désactiver une annonce**
1. Allez sur **"Mes annonces"**
2. Cliquez sur les **3 points** d'une annonce
3. Sélectionnez **"Désactiver"**
4. Vous libérez une place: **2 / 3 actives**

**Option B: Supprimer une annonce**
1. Allez sur **"Mes annonces"**
2. Cliquez sur les **3 points** d'une annonce
3. Sélectionnez **"Supprimer"**
4. Confirmez la suppression
5. Vous libérez une place: **2 / 3 actives**

**Option C: Passer en Pro**
1. Cliquez sur **"Devenir Pro"** dans la carte de quota
2. Choisissez un forfait (10, 50 ou illimité)
3. Effectuez le paiement
4. Votre quota est augmenté immédiatement

#### Étape 4: Comprendre les messages

**Message vert ✅ (Quota OK)**
```
Quota disponible
2 annonces disponibles sur 3
```
→ Vous pouvez publier normalement

**Message orange ⚠️ (Attention)**
```
Dernière annonce disponible
Il vous reste 1 annonce sur 3
```
→ Préparez-vous à gérer vos annonces ou passer Pro

**Message rouge 🔴 (Limite atteinte)**
```
Limite atteinte
Vous avez atteint votre limite de 3 annonces actives
```
→ Vous devez désactiver/supprimer ou passer Pro

---

### Pour les utilisateurs professionnels

#### Étape 1: Choisir un forfait

1. Allez sur **"Espace Pro"**
2. Consultez les forfaits disponibles
3. Comparez les limites d'annonces

**Exemple de forfaits par catégorie:**

| Catégorie | Basic | Standard | Premium |
|-----------|-------|----------|---------|
| **Véhicules** | 10 | 50 | Illimité |
| **Immobilier** | 20 | 100 | Illimité |
| **Services** | 15 | 75 | Illimité |

#### Étape 2: Activer votre forfait

1. Sélectionnez le forfait désiré
2. Cliquez sur **"Acheter"**
3. Effectuez le paiement (CCP, Baridi, etc.)
4. Forfait activé instantanément

#### Étape 3: Publier en masse

**Méthode 1: Publication unitaire**
```
1. "Publier une annonce"
   → Remplir le formulaire
   → Publier
   → Répéter
```

**Méthode 2: Gestion efficace**
```
1. Préparer toutes vos annonces dans un fichier
2. Publier une par une en copiant-collant
3. Utiliser des templates pour les descriptions
4. Réutiliser les mêmes photos pour des produits similaires
```

#### Étape 4: Optimiser votre quota

**Stratégie de rotation:**
```
Semaine 1: Activer annonces A, B, C
Semaine 2: Désactiver A, B, C → Activer D, E, F
Semaine 3: Désactiver D, E, F → Activer A, B, C (mise à jour)
```

**Gestion saisonnière:**
```
Été: Activez les annonces estivales (climatiseurs, piscines)
Hiver: Désactivez l'été → Activez hiver (chauffage, vêtements chauds)
```

#### Étape 5: Suivre votre quota

Sur **"Mes annonces"**, vous voyez:

```
┌───────────────────────────────────────┐
│ 📦 Forfait actuel: Standard           │
│    Expire le 15/11/2025               │
│                                       │
│ ████████████░░░░ 60%                  │
│ 30 / 50 annonces actives              │
│                                       │
│ ✅ 20 annonces disponibles            │
└───────────────────────────────────────┘
```

#### Étape 6: Renouveler votre forfait

**7 jours avant expiration:**
- Notification email
- Bannière sur le tableau de bord
- Message dans la carte de quota

**À l'expiration:**
- Forfait désactivé
- Limite réduite à 3 annonces
- Annonces excédentaires désactivées automatiquement

**Renouvellement:**
1. Allez sur **"Espace Pro"**
2. Cliquez sur **"Renouveler"**
3. Effectuez le paiement
4. Forfait réactivé pour 30 jours

---

## 💻 Guide développeur

### Utilisation des fonctions SQL

#### 1. Compter les annonces actives

```typescript
const { data, error } = await supabase.rpc('get_user_active_listings_count', {
  p_user_id: userId
});

console.log(`Annonces actives: ${data}`);
// Output: Annonces actives: 2
```

#### 2. Récupérer la limite maximale

```typescript
const { data, error } = await supabase.rpc('get_user_package_max_listings', {
  p_user_id: userId
});

console.log(`Limite: ${data}`);
// Output: Limite: 50
```

#### 3. Vérifier si l'utilisateur peut publier

```typescript
const { data, error } = await supabase.rpc('can_user_publish_listing', {
  p_user_id: userId
});

if (data) {
  console.log('✅ Peut publier');
} else {
  console.log('❌ Limite atteinte');
}
```

#### 4. Récupérer le quota complet

```typescript
const { data, error } = await supabase.rpc('get_user_listings_quota', {
  p_user_id: userId
});

console.log(data);
/*
{
  active_count: 30,
  max_listings: 50,
  remaining: 20,
  can_publish: true,
  user_type: 'professional',
  package_name: 'Standard',
  package_expires_at: '2025-11-15T00:00:00Z'
}
*/
```

### Utilisation du composant ListingsQuotaCard

#### Import

```typescript
import ListingsQuotaCard from '@/components/ListingsQuotaCard';
```

#### Utilisation basique

```tsx
<ListingsQuotaCard
  quota={listingsQuota}
  showUpgradeButton={true}
/>
```

#### Props

| Prop | Type | Description | Défaut |
|------|------|-------------|--------|
| `quota` | `ListingsQuota` | Objet quota retourné par la fonction SQL | **Requis** |
| `showUpgradeButton` | `boolean` | Afficher le bouton d'upgrade | `true` |

#### Interface ListingsQuota

```typescript
interface ListingsQuota {
  active_count: number;           // Nombre d'annonces actives
  max_listings: number;           // Limite maximale
  remaining: number;              // Annonces restantes
  can_publish: boolean;           // Peut publier ou non
  user_type: 'individual' | 'professional';
  package_name?: string;          // Nom du forfait (si Pro)
  package_expires_at?: string;    // Date d'expiration (si Pro)
}
```

#### Exemple complet

```tsx
function PublishScreen() {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadQuota();
  }, []);

  const loadQuota = async () => {
    if (!user) return;

    const { data, error } = await supabase.rpc('get_user_listings_quota', {
      p_user_id: user.id
    });

    if (data) setQuota(data);
    setLoading(false);
  };

  const handlePublish = async () => {
    // Vérifier le quota avant publication
    if (quota && !quota.can_publish) {
      Alert.alert(
        'Limite atteinte',
        `Vous avez atteint votre limite de ${quota.max_listings} annonces.`
      );
      return;
    }

    // ... logique de publication ...

    // Recharger le quota après publication
    loadQuota();
  };

  return (
    <ScrollView>
      {quota && !loading && (
        <ListingsQuotaCard quota={quota} showUpgradeButton={true} />
      )}

      {/* Formulaire de publication */}
      <Button onPress={handlePublish} title="Publier" />
    </ScrollView>
  );
}
```

### Personnalisation du composant

#### Modifier les couleurs

```tsx
// Dans ListingsQuotaCard.tsx
const getQuotaColor = () => {
  const percentage = (quota.active_count / quota.max_listings) * 100;
  if (percentage >= 90) return '#EF4444'; // Rouge
  if (percentage >= 70) return '#F59E0B'; // Orange
  return '#10B981'; // Vert - Modifier ici
};
```

#### Modifier les seuils d'alerte

```tsx
const getQuotaMessage = () => {
  if (!quota.can_publish) {
    return { /* Limite atteinte */ };
  }

  // Modifier le seuil ici (actuellement 1)
  if (quota.remaining <= 1) {
    return { /* Dernière annonce */ };
  }

  return { /* Quota OK */ };
};
```

### Hooks personnalisés

Créez un hook réutilisable:

```typescript
// hooks/useListingsQuota.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useListingsQuota() {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadQuota = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: rpcError } = await supabase.rpc(
        'get_user_listings_quota',
        { p_user_id: user.id }
      );

      if (rpcError) throw rpcError;
      setQuota(data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('[useListingsQuota]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuota();
  }, [user]);

  return { quota, loading, error, reload: loadQuota };
}
```

**Utilisation:**

```tsx
function MyComponent() {
  const { quota, loading, error, reload } = useListingsQuota();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      <ListingsQuotaCard quota={quota} />
      <Button onPress={reload} title="Rafraîchir" />
    </View>
  );
}
```

---

## 🔒 Sécurité et performances

### Sécurité

#### Fonctions SECURITY DEFINER

Les fonctions SQL utilisent `SECURITY DEFINER` pour:
- Exécuter avec les privilèges du créateur
- Accéder aux tables sans exposer directement les données
- Contrôler précisément les permissions

```sql
CREATE OR REPLACE FUNCTION get_user_listings_quota(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER  -- ← Sécurité renforcée
AS $$
```

#### Permissions strictes

```sql
-- Seuls les utilisateurs authentifiés peuvent appeler les fonctions
GRANT EXECUTE ON FUNCTION get_user_listings_quota(uuid) TO authenticated;
```

#### Validation côté serveur

```typescript
// ❌ Mauvais: Vérifier seulement côté client
if (activeCount < maxListings) {
  await supabase.from('listings').insert(data);
}

// ✅ Bon: Utiliser la fonction SQL qui vérifie
const { data: canPublish } = await supabase.rpc('can_user_publish_listing', {
  p_user_id: userId
});

if (canPublish) {
  await supabase.from('listings').insert(data);
}
```

### Performances

#### Index de base de données

Assurez-vous que ces index existent:

```sql
-- Accélérer le comptage des annonces actives
CREATE INDEX IF NOT EXISTS idx_listings_user_status
ON listings(user_id, status);

-- Accélérer les requêtes sur les forfaits
CREATE INDEX IF NOT EXISTS idx_profiles_package
ON profiles(pro_package_id, pro_package_expires_at);
```

#### Mise en cache

Implémentez un cache pour réduire les appels:

```typescript
const QUOTA_CACHE_DURATION = 60000; // 1 minute

class QuotaCache {
  private cache = new Map();

  get(userId: string) {
    const cached = this.cache.get(userId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > QUOTA_CACHE_DURATION) {
      this.cache.delete(userId);
      return null;
    }

    return cached.data;
  }

  set(userId: string, data: any) {
    this.cache.set(userId, {
      data,
      timestamp: Date.now()
    });
  }

  invalidate(userId: string) {
    this.cache.delete(userId);
  }
}

const quotaCache = new QuotaCache();
```

#### Optimisation des requêtes

```typescript
// ❌ Mauvais: Appeler 3 fonctions séparément
const activeCount = await supabase.rpc('get_user_active_listings_count');
const maxListings = await supabase.rpc('get_user_package_max_listings');
const canPublish = await supabase.rpc('can_user_publish_listing');

// ✅ Bon: Appeler une seule fonction qui retourne tout
const { data: quota } = await supabase.rpc('get_user_listings_quota', {
  p_user_id: userId
});
// quota contient: active_count, max_listings, can_publish, etc.
```

---

## ❓ FAQ

### Questions générales

#### Q: Pourquoi ma limite est de 3 annonces ?

**R:** Vous êtes un utilisateur individuel gratuit. Pour publier plus d'annonces, vous devez passer à un compte professionnel et acheter un forfait.

#### Q: Les annonces désactivées comptent-elles dans le quota ?

**R:** Non. Seules les annonces avec le statut `active` sont comptées. Vous pouvez avoir un nombre illimité d'annonces désactivées.

#### Q: Que se passe-t-il si mon forfait expire ?

**R:**
1. Votre limite repasse à 3 annonces
2. Les annonces excédentaires sont automatiquement désactivées (pas supprimées)
3. Vous pouvez les réactiver en renouvelant votre forfait

#### Q: Puis-je transférer mon forfait à un autre compte ?

**R:** Non. Les forfaits sont liés au compte et non transférables.

### Questions techniques

#### Q: Comment puis-je tester le système en développement ?

**R:**

```sql
-- Créer un utilisateur de test avec forfait Pro
UPDATE profiles
SET
  user_type = 'professional',
  has_active_pro_package = true,
  pro_package_id = (SELECT id FROM pro_packages WHERE name = 'Standard' LIMIT 1),
  pro_package_expires_at = NOW() + INTERVAL '30 days'
WHERE id = 'USER_ID_HERE';
```

#### Q: Comment déboguer les problèmes de quota ?

**R:**

```typescript
// Afficher toutes les infos de quota
const { data } = await supabase.rpc('get_user_listings_quota', {
  p_user_id: userId
});

console.log('DEBUG QUOTA:', {
  activeCount: data.active_count,
  maxListings: data.max_listings,
  remaining: data.remaining,
  canPublish: data.can_publish,
  userType: data.user_type,
  packageName: data.package_name,
  expiresAt: data.package_expires_at
});
```

#### Q: Comment modifier les limites par défaut ?

**R:**

```sql
-- Dans la fonction get_user_package_max_listings
-- Modifier cette ligne:
RETURN 3;  -- Limite par défaut

-- En:
RETURN 5;  -- Nouvelle limite par défaut
```

#### Q: Le quota se met-il à jour en temps réel ?

**R:** Non. Vous devez appeler manuellement `loadQuota()` après chaque action (publication, suppression, changement de statut). C'est déjà implémenté dans les pages `publish.tsx` et `my-listings.tsx`.

### Questions sur les forfaits

#### Q: Quels sont les forfaits disponibles ?

**R:** Les forfaits varient selon la catégorie. Exemple pour **Véhicules**:

- **Basic**: 10 annonces - 3 000 DA/mois
- **Standard**: 50 annonces - 8 000 DA/mois
- **Premium**: Illimité - 15 000 DA/mois

#### Q: Puis-je changer de forfait en cours de mois ?

**R:** Oui. Vous pouvez upgrader à tout moment. Le nouveau forfait remplace l'ancien et la durée repart à 30 jours.

#### Q: Comment créer un nouveau forfait ?

**R:**

```sql
INSERT INTO pro_packages (
  name, name_en, name_ar,
  category_id,
  price, duration_days,
  max_listings,
  featured_listings,
  is_active
) VALUES (
  'Enterprise',
  'Enterprise',
  'مؤسسة',
  (SELECT id FROM categories WHERE slug = 'vehicules'),
  25000,
  30,
  200,  -- 200 annonces
  50,   -- 50 mises en avant
  true
);
```

---

## 📞 Support

### Besoin d'aide ?

- **Documentation**: Ce fichier
- **Code source**: Voir les fichiers mentionnés dans "Architecture technique"
- **Logs**: Activez `console.log('[QUOTA]', ...)` pour déboguer

### Contact développeur

Pour toute question technique sur l'implémentation:
1. Consultez d'abord cette documentation
2. Vérifiez les logs dans la console
3. Testez avec les commandes SQL de débogage
4. Contactez l'équipe de développement

---

## 🎓 Ressources supplémentaires

### Fichiers à consulter

| Fichier | Description |
|---------|-------------|
| `supabase/migrations/20251018090000_add_listing_limits_functions.sql` | Fonctions SQL |
| `components/ListingsQuotaCard.tsx` | Composant d'affichage |
| `app/(tabs)/publish.tsx` | Intégration publication |
| `app/my-listings.tsx` | Intégration gestion |

### Concepts clés

- **Quota**: Limite d'annonces actives
- **Annonce active**: Statut = 'active'
- **Forfait**: Package Pro donnant une limite supérieure
- **Expiration**: Date limite du forfait Pro

---

## ✅ Checklist d'implémentation

Pour implémenter le système dans un nouveau projet:

- [ ] Appliquer la migration SQL
- [ ] Créer le composant `ListingsQuotaCard`
- [ ] Modifier le formulaire de publication
- [ ] Modifier la page "Mes annonces"
- [ ] Tester avec différents types d'utilisateurs
- [ ] Vérifier les permissions SQL
- [ ] Créer les index de performance
- [ ] Documenter les endpoints

---

**📅 Dernière mise à jour**: 18 Octobre 2025
**📝 Version**: 1.0.0
**👨‍💻 Auteur**: Équipe BuyGo
