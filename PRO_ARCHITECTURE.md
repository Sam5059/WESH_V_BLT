# 🏗️ Architecture du Système PRO

## 📊 Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React Native Expo)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  /pro/index    │  │ /pro/packages  │  │ /pro/dashboard │   │
│  │                │  │                │  │                │   │
│  │ • Hero         │  │ • Liste packs  │  │ • Statut PRO   │   │
│  │ • Avantages    │  │ • Filtres      │  │ • Analytics    │   │
│  │ • Catégories   │  │ • Abonnement   │  │ • Historique   │   │
│  │ • FAQ          │  │ • Paiement     │  │ • Renouveler   │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                          │ Supabase Client
                          │ (@supabase/supabase-js)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   RPC FUNCTIONS                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  activate_pro_subscription()                             │   │
│  │  ├─ Crée subscription                                    │   │
│  │  ├─ Crée transaction                                     │   │
│  │  └─ Met à jour profile                                   │   │
│  │                                                           │   │
│  │  check_pro_status()                                      │   │
│  │  └─ Vérifie expiration et quotas                         │   │
│  │                                                           │   │
│  │  can_publish_listing()                                   │   │
│  │  ├─ Vérifie abonnement actif                             │   │
│  │  ├─ Vérifie catégorie                                    │   │
│  │  └─ Vérifie quotas                                       │   │
│  │                                                           │   │
│  │  get_pro_analytics()                                     │   │
│  │  └─ Récupère stats sur période                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    TABLES                                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  pro_packages                                            │   │
│  │  ├─ id, category_id, name, price                         │   │
│  │  ├─ duration_days, max_listings                          │   │
│  │  └─ featured_listings, priority_support                  │   │
│  │                                                           │   │
│  │  pro_subscriptions                                       │   │
│  │  ├─ id, user_id, package_id                              │   │
│  │  ├─ starts_at, expires_at, status                        │   │
│  │  ├─ listings_used, featured_used                         │   │
│  │  └─ paid_amount, payment_reference                       │   │
│  │                                                           │   │
│  │  pro_transactions                                        │   │
│  │  ├─ id, subscription_id, user_id                         │   │
│  │  ├─ transaction_type, amount                             │   │
│  │  └─ payment_method, payment_status                       │   │
│  │                                                           │   │
│  │  pro_analytics                                           │   │
│  │  ├─ id, user_id, listing_id, date                        │   │
│  │  └─ views, clicks, contacts, favorites                   │   │
│  │                                                           │   │
│  │  profiles (extended)                                     │   │
│  │  ├─ pro_package_id, pro_expires_at                       │   │
│  │  ├─ pro_listings_remaining                               │   │
│  │  └─ pro_featured_remaining                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   RLS POLICIES                           │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  pro_packages: SELECT (tous)                             │   │
│  │  pro_subscriptions: SELECT/INSERT/UPDATE (owner)         │   │
│  │  pro_transactions: SELECT/INSERT (owner)                 │   │
│  │  pro_analytics: SELECT/INSERT/UPDATE (owner)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données

### 1. Chargement des Packages

```
Frontend                        Supabase
   │                               │
   ├─── GET pro_packages ──────────▶
   │    WHERE is_active = true     │
   │                               │
   ◀────── Packages (JSON) ─────────┤
   │                               │
   └─ Affiche dans UI              │
```

### 2. Activation d'Abonnement

```
Frontend                        Supabase
   │                               │
   ├─ User clique "S'abonner"      │
   │                               │
   ├─ RPC activate_pro_            │
   │   subscription() ──────────────▶
   │   {                           │
   │     user_id,                  │
   │     package_id,               │
   │     payment_method            │
   │   }                           │
   │                               │
   │                        ┌──────┴──────┐
   │                        │ CREATE       │
   │                        │ subscription │
   │                        │ + transaction│
   │                        │ + UPDATE     │
   │                        │   profile    │
   │                        └──────┬──────┘
   │                               │
   ◀── Success response ────────────┤
   │   {                           │
   │     subscription_id,          │
   │     expires_at                │
   │   }                           │
   │                               │
   └─ Affiche confirmation         │
      + Redirige vers dashboard    │
```

### 3. Vérification avant Publication

```
Frontend                        Supabase
   │                               │
   ├─ User veut publier            │
   │                               │
   ├─ RPC can_publish_listing() ───▶
   │   {                           │
   │     user_id,                  │
   │     category_id               │
   │   }                           │
   │                               │
   │                        ┌──────┴──────┐
   │                        │ CHECK        │
   │                        │ • Abonnement │
   │                        │   actif?     │
   │                        │ • Catégorie  │
   │                        │   valide?    │
   │                        │ • Quotas OK? │
   │                        └──────┬──────┘
   │                               │
   ◀── Can publish? ────────────────┤
   │   {                           │
   │     can_publish: true/false,  │
   │     reason: "..."             │
   │   }                           │
   │                               │
   ├─ Si true: Allow publish       │
   └─ Si false: Show error         │
```

### 4. Consultation Analytics

```
Frontend                        Supabase
   │                               │
   ├─ User ouvre dashboard         │
   │                               │
   ├─ RPC get_pro_analytics() ─────▶
   │   {                           │
   │     user_id,                  │
   │     start_date,               │
   │     end_date                  │
   │   }                           │
   │                               │
   │                        ┌──────┴──────┐
   │                        │ AGGREGATE    │
   │                        │ analytics    │
   │                        │ data         │
   │                        └──────┬──────┘
   │                               │
   ◀── Analytics (JSON) ────────────┤
   │   {                           │
   │     totals: {...},            │
   │     daily_data: [...]         │
   │   }                           │
   │                               │
   └─ Affiche graphiques           │
```

## 🗂️ Structure des Données

### Package PRO

```json
{
  "id": "uuid",
  "category_id": "uuid",
  "name": "Pack Véhicules Illimité",
  "name_ar": "باقة المركبات غير محدودة",
  "name_en": "Vehicles Unlimited Pack",
  "description": "Annonces illimitées...",
  "price": 24900.00,
  "duration_days": 30,
  "max_listings": null,
  "featured_listings": 10,
  "priority_support": true,
  "analytics": true,
  "is_active": true,
  "order_position": 1
}
```

### Subscription Active

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "package_id": "uuid",
  "category_id": "uuid",
  "starts_at": "2024-10-15T10:00:00Z",
  "expires_at": "2024-11-15T10:00:00Z",
  "status": "active",
  "listings_used": 5,
  "featured_used": 2,
  "paid_amount": 24900.00,
  "payment_method": "CCP",
  "payment_reference": "REF-123456"
}
```

### Analytics Data

```json
{
  "period": {
    "start_date": "2024-10-15",
    "end_date": "2024-11-15"
  },
  "totals": {
    "views": 1250,
    "clicks": 340,
    "contacts": 85,
    "favorites": 120
  },
  "daily_data": [
    {
      "date": "2024-10-15",
      "views": 45,
      "clicks": 12,
      "contacts": 3,
      "favorites": 5
    }
  ]
}
```

## 🔐 Sécurité - Niveaux de Protection

### Niveau 1: RLS (Row Level Security)

```sql
-- Exemple: pro_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON pro_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

✅ **Protection:** Utilisateur A ne peut pas voir les données de B

### Niveau 2: Fonctions SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION activate_pro_subscription(...)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- S'exécute avec privilèges du propriétaire
AS $$
BEGIN
  -- Validation des données
  -- Création sécurisée
END;
$$;
```

✅ **Protection:** Transactions atomiques, validation stricte

### Niveau 3: Contraintes de Base

```sql
-- Contraintes CHECK
CONSTRAINT valid_dates CHECK (expires_at > starts_at)
CONSTRAINT non_negative_counters CHECK (listings_used >= 0)

-- Contraintes FK
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
```

✅ **Protection:** Intégrité des données garantie

## 📈 Évolution et Scalabilité

### Aujourd'hui

```
Users: <10,000
Subscriptions/jour: <100
Analytics records/jour: <10,000
```

### Performance Optimisée Pour

```
Users: <1,000,000
Subscriptions/jour: <10,000
Analytics records/jour: <1,000,000
```

### Indexes Créés

- `idx_pro_subscriptions_user_id`
- `idx_pro_subscriptions_status`
- `idx_pro_subscriptions_expires_at`
- `idx_pro_transactions_user_id`
- `idx_pro_analytics_user_id`
- `idx_pro_analytics_date`

### Partitionnement Futur (si nécessaire)

```sql
-- Exemple pour pro_analytics
CREATE TABLE pro_analytics_2024_10 PARTITION OF pro_analytics
  FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
```

## 🔄 États et Transitions

### Statut d'Abonnement

```
     pending ──┐
        │      │
        ▼      │
     active ───┤
        │      │
        ▼      │
     expired ──┘
        │
        ▼
    cancelled
```

### Statut de Transaction

```
     pending
        │
        ├───▶ completed
        │
        ├───▶ failed
        │
        └───▶ refunded
```

## 🎯 Points Clés d'Architecture

### ✅ Avantages

1. **Séparation claire**
   - Backend: Logique métier dans Supabase
   - Frontend: UI/UX dans React Native

2. **Sécurité multicouche**
   - RLS pour l'accès aux données
   - Fonctions sécurisées pour les opérations
   - Contraintes pour l'intégrité

3. **Performance**
   - Indexes sur toutes les colonnes fréquentes
   - Queries optimisées
   - Pas de N+1 queries

4. **Évolutivité**
   - Structure prête pour millions d'utilisateurs
   - Partitionnement possible
   - Caching stratégique

### ⚠️ Points d'Attention

1. **Analytics volumineuses**
   - Prévoir archivage après 12 mois
   - Ou partitionnement par mois

2. **Transactions concurrentes**
   - Gérées par PostgreSQL
   - Pas de deadlocks grâce au design

3. **Quotas utilisateurs**
   - Décrémentation atomique
   - Pas de conditions de course

## 📞 Support Architecture

Questions techniques:
📧 tech@buyandgo.dz
