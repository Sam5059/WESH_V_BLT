# 🚨 SOLUTION DE SECOURS : Rendu Web Natif

## Problème Identifié

React Native Web peut parfois avoir des problèmes avec :
- `flex: 1` sur Web
- `overflow: auto` en React Native
- CSS Grid avec StyleSheet.create()
- Conversion automatique de styles React Native → CSS

## Solution : Rendu Conditionnel Web Natif

Ajouter ce code dans `search.tsx` pour forcer le rendu HTML/CSS pur sur Web.

### 1. Ajouter l'import Platform

```typescript
import { Platform } from 'react-native';
```

### 2. Remplacer le Rendu par un Conditionnel

```typescript
export default function SearchPage() {
  // ... tout le code existant ...

  // NOUVEAU : Rendu Web natif
  if (Platform.OS === 'web') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#F8FAFC',
      }}>
        {/* TopBar */}
        <TopBar />

        {/* Container principal */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          overflow: 'hidden',
        }}>
          {/* Sidebar */}
          <div style={{
            width: 300,
            flexShrink: 0,
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            overflow: 'auto',
          }}>
            <CategoriesAndFilters
              onFiltersApply={handleFiltersApply}
              initialCategoryId={category_id as string}
              initialListingType={listing_type as any}
            />
          </div>

          {/* Contenu */}
          <div style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            overflow: 'auto',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 20,
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
            }}>
              <h1 style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#1E293B',
                margin: 0,
              }}>
                {language === 'ar'
                  ? `النتائج: ${listings.length} إعلان`
                  : language === 'en'
                  ? `Results: ${listings.length} listing(s)`
                  : `Résultats: ${listings.length} annonce(s)`}
              </h1>
            </div>

            {/* Grille des annonces */}
            {listings.length === 0 ? (
              <div style={{
                padding: 40,
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: 16,
                  color: '#64748B',
                  lineHeight: '24px',
                }}>
                  {language === 'ar'
                    ? 'لا توجد نتائج. حدد فئة وقم بتطبيق الفلاتر.'
                    : language === 'en'
                    ? 'No results. Select a category and apply filters.'
                    : 'Aucun résultat. Sélectionnez une catégorie et appliquez des filtres.'}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20,
                padding: 20,
              }}>
                {listings.map((listing, index) => {
                  if (index < 3) {
                    console.log(`[SearchPage] Rendering card ${index + 1}:`, listing.title);
                  }
                  return (
                    <div
                      key={listing.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#e0e0e0',
                        borderRadius: 8,
                        padding: 4,
                      }}
                    >
                      <ListingCard
                        listing={listing}
                        onPress={() => {
                          console.log('[SearchPage] Card clicked:', listing.id);
                          router.push(`/listing/${listing.id}`);
                        }}
                        isWeb={true}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rendu Mobile (React Native)
  return (
    <View style={styles.container}>
      {/* ... code React Native existant ... */}
    </View>
  );
}
```

## Avantages de cette Approche

1. ✅ **CSS Grid natif** - Pas de conversion React Native → CSS
2. ✅ **Flex natif** - Utilise directement CSS Flexbox
3. ✅ **Overflow natif** - `overflow: auto` fonctionne nativement
4. ✅ **Debugging facile** - Styles inline visibles dans l'inspecteur
5. ✅ **Performance** - Pas de conversion StyleSheet

## Comment Appliquer

1. Copier le code ci-dessus
2. Remplacer le `return` dans `search.tsx`
3. Garder le rendu React Native pour mobile (après le `if`)
4. Build et tester

## Résultat Attendu

Vous devriez voir immédiatement :
- Sidebar à gauche (300px)
- Annonces en grille à droite
- Fond gris alterné sur les wrappers
- Toutes les 95 cartes affichées

## Si ça Ne Marche TOUJOURS PAS

Le problème est alors dans `ListingCard.tsx` lui-même. Ajouter des logs :

```typescript
// Dans ListingCard.tsx, en haut du composant
console.log('[ListingCard] Rendering:', listing.title, 'has images:', listing.images?.length);

// Vérifier le return
return (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.card, isWeb && styles.cardWeb]}
  >
    <div style={{ backgroundColor: 'red', padding: 10 }}>
      <h3 style={{ color: 'white' }}>TEST: {listing.title}</h3>
    </div>
    {/* ... reste du code ... */}
  </TouchableOpacity>
);
```

Si vous voyez les rectangles rouges avec "TEST:", alors `ListingCard` s'affiche !
Le problème serait alors dans les styles internes de la carte.
