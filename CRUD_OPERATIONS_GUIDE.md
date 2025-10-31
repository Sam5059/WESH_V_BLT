# 📝 Guide des Opérations CRUD pour les Annonces

Ce guide explique comment effectuer les opérations de **Création, Lecture, Mise à jour et Suppression** (CRUD) des annonces dans l'application Buy&Go.

## 📋 Table des matières

1. [Créer une annonce](#-1-créer-une-annonce-create)
2. [Lire/Afficher les annonces](#-2-lireafficher-les-annonces-read)
3. [Mettre à jour une annonce](#-3-mettre-à-jour-une-annonce-update)
4. [Supprimer une annonce](#-4-supprimer-une-annonce-delete)
5. [Opérations supplémentaires](#-5-opérations-supplémentaires)

---

## 🆕 1. Créer une annonce (CREATE)

### Page : `app/(tabs)/publish.tsx`

### Fonctionnement :

```typescript
const handlePublish = async () => {
  const { data, error } = await supabase
    .from('listings')
    .insert([{
      user_id: user.id,
      title: title,
      description: description,
      price: parseFloat(price),
      category_id: categoryId,
      wilaya: wilaya,
      commune: commune,
      condition: condition,
      is_negotiable: isNegotiable,
      listing_type: listingType,
      images: images,
      attributes: categoryAttributes,
      status: 'active',
    }])
    .select()
    .single();

  if (error) {
    // Gérer l'erreur
    Alert.alert(t('common.error'), t('publish.error'));
  } else {
    // Succès
    Alert.alert(t('common.success'), t('publish.success'));
    router.push(`/listing/${data.id}`);
  }
};
```

### Champs requis :
- ✅ `title` - Titre de l'annonce
- ✅ `description` - Description détaillée
- ✅ `price` - Prix (nombre)
- ✅ `category_id` - ID de la catégorie
- ✅ `wilaya` - Wilaya (localisation)
- ✅ `commune` - Commune
- ✅ `condition` - État du produit
- ✅ `images` - Tableau d'URLs d'images

---

## 👁️ 2. Lire/Afficher les annonces (READ)

### A. Afficher toutes les annonces

**Page : `app/(tabs)/index.tsx`**

```typescript
const loadListings = async () => {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20);

  if (data) setListings(data);
};
```

### B. Afficher les annonces de l'utilisateur

**Page : `app/my-listings.tsx`**

```typescript
const loadMyListings = async () => {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (data) setListings(data);
};
```

### C. Afficher une annonce spécifique

**Page : `app/listing/[id].tsx`**

```typescript
const loadListing = async () => {
  const { data } = await supabase
    .from('listings')
    .select('*, profiles(full_name, avatar_url, phone_number, user_type)')
    .eq('id', listingId)
    .single();

  if (data) setListing(data);
};
```

---

## ✏️ 3. Mettre à jour une annonce (UPDATE)

### A. Mise à jour complète (Édition)

**Page : `app/(tabs)/publish.tsx` avec paramètre `editId`**

```typescript
// Charger l'annonce à modifier
useEffect(() => {
  const editId = searchParams.get('editId');
  if (editId) {
    loadListingForEdit(editId);
  }
}, []);

const loadListingForEdit = async (id: string) => {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (data) {
    // Remplir le formulaire avec les données existantes
    setTitle(data.title);
    setDescription(data.description);
    setPrice(data.price.toString());
    // ... autres champs
  }
};

// Sauvegarder les modifications
const handleUpdate = async () => {
  const { error } = await supabase
    .from('listings')
    .update({
      title: title,
      description: description,
      price: parseFloat(price),
      category_id: categoryId,
      wilaya: wilaya,
      commune: commune,
      condition: condition,
      is_negotiable: isNegotiable,
      images: images,
      attributes: categoryAttributes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', editId)
    .eq('user_id', user.id);

  if (!error) {
    Alert.alert(t('common.success'), t('myListings.updateSuccess'));
    router.back();
  }
};
```

### B. Mise à jour du statut (Activer/Désactiver)

**Page : `app/my-listings.tsx`**

```typescript
const handleToggleStatus = async (listing: Listing) => {
  const newStatus = listing.status === 'active' ? 'inactive' : 'active';

  const { error } = await supabase
    .from('listings')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', listing.id)
    .eq('user_id', user.id);

  if (!error) {
    // Mettre à jour l'interface
    setListings(listings.map(l =>
      l.id === listing.id ? { ...l, status: newStatus } : l
    ));

    Alert.alert(
      t('common.success'),
      newStatus === 'active'
        ? t('myListings.activateSuccess')
        : t('myListings.deactivateSuccess')
    );
  }
};
```

### C. Marquer comme vendu

```typescript
const handleMarkAsSold = async (listing: Listing) => {
  const { error } = await supabase
    .from('listings')
    .update({
      status: 'sold',
      updated_at: new Date().toISOString()
    })
    .eq('id', listing.id)
    .eq('user_id', user.id);

  if (!error) {
    setListings(listings.map(l =>
      l.id === listing.id ? { ...l, status: 'sold' } : l
    ));

    Alert.alert(t('common.success'), t('myListings.soldSuccess'));
  }
};
```

---

## 🗑️ 4. Supprimer une annonce (DELETE)

**Page : `app/my-listings.tsx`**

### Fonctionnement avec confirmation :

```typescript
// 1. Afficher le modal de confirmation
const confirmDelete = (listing: Listing) => {
  setListingToDelete(listing);
  setShowDeleteModal(true);
};

// 2. Exécuter la suppression après confirmation
const handleDelete = async () => {
  if (!listingToDelete) return;

  setDeletingId(listingToDelete.id);

  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingToDelete.id)
      .eq('user_id', user.id);

    if (error) throw error;

    // Retirer l'annonce de la liste
    setListings(listings.filter(l => l.id !== listingToDelete.id));

    setShowDeleteModal(false);
    setListingToDelete(null);

    Alert.alert(
      t('common.success'),
      t('myListings.deleteSuccess')
    );
  } catch (error) {
    console.error('Error deleting listing:', error);
    Alert.alert(
      t('common.error'),
      t('myListings.deleteError')
    );
  } finally {
    setDeletingId(null);
  }
};
```

### Modal de confirmation :

```tsx
<Modal visible={showDeleteModal} transparent animationType="fade">
  <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
      <View style={styles.modalHeader}>
        <Trash2 size={32} color="#EF4444" />
        <Text style={styles.modalTitle}>
          {t('myListings.confirmDelete')}
        </Text>
      </View>

      {/* Aperçu de l'annonce à supprimer */}
      <View style={styles.listingPreview}>
        <Image source={{ uri: listingToDelete.images[0] }} />
        <Text>{listingToDelete.title}</Text>
        <Text>{formatPrice(listingToDelete.price)}</Text>
      </View>

      <Text style={styles.modalMessage}>
        {t('myListings.deleteWarning')}
      </Text>

      <View style={styles.modalActions}>
        <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
          <Text>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text>{t('myListings.delete')}</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  </Pressable>
</Modal>
```

---

## 🔧 5. Opérations supplémentaires

### A. Incrémenter les vues

```typescript
const incrementViews = async (listingId: string) => {
  await supabase.rpc('increment_listing_views', {
    listing_id_param: listingId
  });
};
```

### B. Recherche et filtrage

```typescript
const searchListings = async (query: string, filters: any) => {
  let queryBuilder = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');

  // Recherche par texte
  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  // Filtres
  if (filters.categoryId) {
    queryBuilder = queryBuilder.eq('category_id', filters.categoryId);
  }

  if (filters.wilaya) {
    queryBuilder = queryBuilder.eq('wilaya', filters.wilaya);
  }

  if (filters.minPrice) {
    queryBuilder = queryBuilder.gte('price', filters.minPrice);
  }

  if (filters.maxPrice) {
    queryBuilder = queryBuilder.lte('price', filters.maxPrice);
  }

  const { data } = await queryBuilder
    .order('created_at', { ascending: false })
    .limit(50);

  return data;
};
```

### C. Annonces similaires

```typescript
const loadSimilarListings = async (currentListing: Listing) => {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('category_id', currentListing.category_id)
    .eq('status', 'active')
    .neq('id', currentListing.id)
    .limit(6);

  return data;
};
```

---

## 🔒 Sécurité - Row Level Security (RLS)

Toutes les opérations sont protégées par les politiques RLS de Supabase :

### Politique de lecture (SELECT)
```sql
-- Tout le monde peut voir les annonces actives
CREATE POLICY "Public can view active listings"
ON listings FOR SELECT
TO authenticated, anon
USING (status = 'active');

-- Les utilisateurs peuvent voir leurs propres annonces
CREATE POLICY "Users can view own listings"
ON listings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### Politique de création (INSERT)
```sql
CREATE POLICY "Users can create own listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### Politique de mise à jour (UPDATE)
```sql
CREATE POLICY "Users can update own listings"
ON listings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Politique de suppression (DELETE)
```sql
CREATE POLICY "Users can delete own listings"
ON listings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

## 📱 Interface utilisateur

### Menu contextuel (3 points)

Dans `my-listings.tsx`, chaque annonce a un menu avec :

1. **✏️ Modifier** - Redirige vers le formulaire de publication en mode édition
2. **👁️ Activer / Désactiver** - Change le statut de l'annonce
3. **📦 Marquer comme vendu** - Passe le statut à "sold"
4. **🗑️ Supprimer** - Ouvre le modal de confirmation

### Statuts des annonces

- **🟢 Active** - Visible par tous
- **🟡 Inactive** - Non visible, peut être réactivée
- **🔴 Vendu** - Marquée comme vendue
- **📝 Brouillon** - Non publiée (fonctionnalité future)

---

## 🌍 Support multilingue

Toutes les opérations affichent des messages traduits en :
- 🇫🇷 Français
- 🇬🇧 English
- 🇸🇦 العربية (avec support RTL)

Exemples de clés de traduction :
```typescript
t('myListings.confirmDelete')
t('myListings.deleteSuccess')
t('myListings.deleteError')
t('myListings.activateSuccess')
t('myListings.deactivateSuccess')
t('myListings.soldSuccess')
```

---

## ✅ Checklist de sécurité

Lors de chaque opération, vérifier :

- [x] L'utilisateur est authentifié (`user` existe)
- [x] L'utilisateur est propriétaire de l'annonce (`eq('user_id', user.id)`)
- [x] Les données sont validées avant l'envoi
- [x] Les erreurs sont correctement gérées
- [x] Un feedback est fourni à l'utilisateur
- [x] Les états de chargement sont affichés
- [x] Les opérations destructives nécessitent une confirmation

---

## 🎯 Bonnes pratiques

1. **Toujours inclure `user_id` dans les requêtes de modification**
   ```typescript
   .eq('user_id', user.id)
   ```

2. **Mettre à jour `updated_at` lors des modifications**
   ```typescript
   updated_at: new Date().toISOString()
   ```

3. **Afficher un état de chargement**
   ```typescript
   const [loading, setLoading] = useState(false);
   ```

4. **Gérer les erreurs avec des messages traduits**
   ```typescript
   Alert.alert(t('common.error'), t('myListings.deleteError'));
   ```

5. **Demander confirmation pour les opérations destructives**
   ```typescript
   const confirmDelete = (listing) => {
     setShowDeleteModal(true);
   };
   ```

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

---

**✨ Votre application est maintenant équipée d'un système CRUD complet et sécurisé!**
