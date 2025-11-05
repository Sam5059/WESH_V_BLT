# Architecture des Profils Utilisateurs

## Décision d'architecture : UN SEUL profil unifié

### ✅ Solution retenue : Table `profiles` unique avec champ `user_type`

Au lieu de créer deux tables séparées (`individual_profiles` et `professional_profiles`), nous utilisons **une seule table `profiles`** avec des champs optionnels pour les professionnels.

---

## Structure de la table `profiles`

```sql
profiles
├── -- Champs communs (tous les utilisateurs)
├── id                              uuid (PK)
├── full_name                       text
├── phone_number                    text
├── avatar_url                      text
├── wilaya                          text
├── commune                         text
├── is_verified                     boolean
├── created_at                      timestamptz
├── updated_at                      timestamptz
│
├── -- Type d'utilisateur
├── user_type                       text ('individual' | 'professional')
│
├── -- Forfait PRO
├── has_active_pro_package          boolean
├── pro_package_expires_at          timestamptz
├── pro_package_type                text ('basic' | 'standard' | 'premium')
├── pro_slug                        text (URL personnalisée)
│
├── -- Informations légales (PRO uniquement)
├── company_name                    text
├── legal_form                      text (SARL, EURL, SNC, etc.)
├── trade_register_number           text (NRC/SIRET)
├── tax_id                          text (NIF)
├── professional_address            text
├── professional_wilaya             text
├── professional_commune            text
│
├── -- Contact professionnel (PRO uniquement)
├── professional_email              text
├── professional_phone              text
├── website_url                     text
├── facebook_url                    text
├── instagram_url                   text
│
├── -- Informations commerciales (PRO uniquement)
├── business_description            text
├── business_category               text
├── opening_hours                   jsonb
├── logo_url                        text
├── cover_image_url                 text
│
├── -- Statistiques (PRO uniquement)
├── average_rating                  numeric(3,2)
├── total_reviews                   integer
├── total_sales                     integer
├── response_rate                   numeric(5,2)
├── response_time_hours             integer
│
└── -- Vérification (PRO uniquement)
    ├── is_verified_professional    boolean
    ├── verification_documents_submitted  boolean
    └── verification_date           timestamptz
```

---

## Avantages de cette approche

### 1. **Simplicité** 🎯
- Un seul profil par utilisateur
- Pas de jointures complexes
- Code plus simple à maintenir

### 2. **Flexibilité** 🔄
- Un utilisateur peut passer de particulier à professionnel facilement
- Changement de type sans migration de données
- Conservation de l'historique (messages, favoris, etc.)

### 3. **Cohérence** ✅
- Un seul ID utilisateur pour tout le système
- Pas de duplication des données de base
- Relations simplifiées avec les autres tables (listings, messages, etc.)

### 4. **Performance** ⚡
- Pas de jointure supplémentaire pour récupérer les infos
- Index efficaces sur `user_type` et `has_active_pro_package`
- Moins de requêtes SQL

### 5. **Évolutivité** 📈
- Facile d'ajouter de nouveaux champs professionnels
- Possibilité d'ajouter d'autres types d'utilisateurs à l'avenir
- Structure extensible

---

## Pourquoi PAS deux tables séparées ?

### ❌ Problèmes avec `individual_profiles` + `professional_profiles` :

1. **Duplication des données**
   - Nom, téléphone, etc. dupliqués
   - Risque de désynchronisation

2. **Complexité des jointures**
   ```sql
   -- Mauvais exemple
   SELECT * FROM listings
   LEFT JOIN individual_profiles ON ...
   LEFT JOIN professional_profiles ON ...
   ```

3. **Migration complexe**
   - Difficile de passer de particulier à professionnel
   - Nécessite migration de données entre tables
   - Perte potentielle de données

4. **Relations compliquées**
   - Messages : lier à quel profil ?
   - Favoris : deux tables de favoris ?
   - Notifications : deux systèmes ?

5. **Code dupliqué**
   - Deux ensembles de fonctions similaires
   - Double maintenance
   - Plus de bugs potentiels

---

## Cas d'usage

### Utilisateur Particulier

```typescript
const profile = {
  id: "user-123",
  full_name: "Ahmed Bensalem",
  user_type: "individual",
  has_active_pro_package: false,
  // Tous les champs PRO sont NULL
  company_name: null,
  professional_email: null,
  // ...
}
```

### Utilisateur Professionnel

```typescript
const profile = {
  id: "user-456",
  full_name: "Mohamed Cherif",
  user_type: "professional",
  has_active_pro_package: true,
  pro_package_type: "premium",
  pro_slug: "cherif-electronics",

  // Champs professionnels remplis
  company_name: "Cherif Electronics SARL",
  legal_form: "SARL",
  trade_register_number: "12345678",
  professional_email: "contact@cherif-electronics.dz",
  professional_phone: "+213 21 123 456",
  business_description: "Vente d'électronique et électroménager",
  business_category: "Électronique",

  // Statistiques
  average_rating: 4.8,
  total_reviews: 145,
  total_sales: 320,
  is_verified_professional: true,
}
```

---

## Migration vers PRO

### Très simple avec un seul profil :

```typescript
// 1. L'utilisateur achète un forfait PRO
await supabase
  .from('profiles')
  .update({
    user_type: 'professional',
    has_active_pro_package: true,
    pro_package_type: 'standard',
    pro_package_expires_at: thirtyDaysFromNow,
  })
  .eq('id', userId);

// 2. L'utilisateur complète son profil professionnel
await supabase
  .from('profiles')
  .update({
    company_name: 'Ma Société SARL',
    professional_email: 'contact@masociete.dz',
    business_description: 'Description de mon activité',
    // ...
  })
  .eq('id', userId);

// Aucune migration de données nécessaire !
// Tous les messages, favoris, listings existants restent liés au même ID
```

---

## Requêtes typiques

### Récupérer un profil

```typescript
// Simple : une seule requête pour tous les types d'utilisateurs
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();

// Les champs PRO sont NULL pour les particuliers, remplis pour les pros
```

### Lister les professionnels vérifiés

```typescript
const { data: professionals } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_type', 'professional')
  .eq('is_verified_professional', true)
  .order('average_rating', { ascending: false });
```

### Lister les annonces avec info vendeur

```typescript
// Très simple : une seule jointure
const { data: listings } = await supabase
  .from('listings')
  .select(`
    *,
    profile:profiles(
      id,
      full_name,
      user_type,
      company_name,
      is_verified_professional,
      average_rating
    )
  `);

// Pas besoin de jointure conditionnelle !
```

---

## Indexation

```sql
-- Index sur les champs les plus utilisés
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_has_active_pro ON profiles(has_active_pro_package);
CREATE INDEX idx_profiles_verified_professional ON profiles(is_verified_professional);
CREATE INDEX idx_profiles_average_rating ON profiles(average_rating DESC);
CREATE INDEX idx_profiles_company_name ON profiles(company_name);
```

---

## Validation des données

### Règles métier :

1. **Tous les utilisateurs** : `full_name` obligatoire
2. **Professionnels avec forfait actif** :
   - `company_name` obligatoire
   - `professional_email` ou `professional_phone` obligatoire
   - `business_description` recommandée
3. **Vérification professionnelle** :
   - Nécessite `verification_documents_submitted = true`
   - Validé manuellement par un admin
   - Active le badge "Professionnel vérifié"

---

## Conclusion

Cette architecture à **table unique** est :
- ✅ Plus simple à développer
- ✅ Plus facile à maintenir
- ✅ Plus performante
- ✅ Plus flexible pour l'évolution
- ✅ Standard dans l'industrie (utilisé par Airbnb, Uber, etc.)

Les champs professionnels restent simplement NULL pour les utilisateurs particuliers, ce qui n'a aucun impact sur les performances ou le stockage.

---

## Fichiers de migration associés

1. `20251006070608_create_buygo_schema.sql` - Création initiale de `profiles`
2. `20251007132755_add_pro_user_type_to_profiles.sql` - Ajout du champ `user_type`
3. `20251010075000_add_pro_package_fields_to_profiles.sql` - Ajout des champs de forfait PRO
4. `20251013144347_add_professional_slug_to_profiles.sql` - Ajout du slug professionnel
5. `20251014140000_add_professional_profile_fields.sql` - **NOUVEAU** : Ajout des champs professionnels complets
