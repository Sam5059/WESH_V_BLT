# Debug - Problème Panier ne s'affiche pas

## Modifications apportées

### 1. Ajout de logs de débogage
- Ajouté des console.log dans `/app/cart.tsx` pour tracer l'exécution
- Les logs afficheront :
  - Si la page cart.tsx est chargée
  - Si l'utilisateur est connecté
  - Le nombre d'articles dans le panier
  - L'état de chargement

### 2. Simplification de l'affichage "non connecté"
- Utilisé le même layout que la page principale
- Ajouté un header avec bouton retour
- Messages en dur pour éviter les problèmes de traduction

## Pour tester

### Étape 1: Ouvrir la console du navigateur
1. F12 ou clic droit > Inspecter
2. Aller dans l'onglet "Console"

### Étape 2: Cliquer sur l'icône panier
Vous devriez voir dans la console :
```
[CART SCREEN] ===== CART PAGE LOADED =====
[CART SCREEN] User: <id ou undefined>
[CART SCREEN] Loading: true/false
[CART SCREEN] Cart items: 0
[CART SCREEN] Cart total: 0
```

### Étape 3: Analyser le résultat

#### Si aucun log n'apparaît:
- La route `/cart` n'est pas atteinte
- Problème de navigation
- **Solution**: Vérifier que le bouton panier pointe bien vers `/cart`

#### Si les logs apparaissent mais la page est blanche:
- Le composant se charge mais ne s'affiche pas
- Problème de style CSS ou erreur dans le rendu
- **Solution**: Vérifier les erreurs JavaScript dans la console

#### Si "No user" apparaît:
- L'utilisateur n'est pas connecté
- La page devrait afficher "Connexion requise"
- **Solution**: Se connecter d'abord

#### Si "User authenticated" apparaît:
- L'utilisateur est connecté
- La page devrait afficher le panier (vide ou avec articles)
- **Solution**: Vérifier le chargement des articles

## Checklist de vérification

- [ ] La page `/cart` est accessible (URL change dans le navigateur)
- [ ] Les logs de débogage apparaissent dans la console
- [ ] TopBar s'affiche en haut de la page
- [ ] Footer s'affiche en bas de la page
- [ ] Le header "Mon Panier" avec bouton retour est visible
- [ ] Le message approprié s'affiche (connexion requise / panier vide / articles)

## Actions correctives possibles

### Si la page ne se charge pas du tout:
```typescript
// Vérifier dans app/_layout.tsx que la route est bien déclarée
<Stack.Screen name="cart" options={{ headerShown: false }} />
```

### Si CartContext cause une erreur:
```typescript
// Dans contexts/CartContext.tsx, vérifier que le provider est bien configuré
// Et que les hooks ne causent pas d'erreur
```

### Si la politique RLS bloque:
```sql
-- Vérifier les politiques sur cart_items
SELECT * FROM cart_items WHERE user_id = '<votre_user_id>';
```

## Contact points de debug

1. **Navigation**: `components/CartIcon.tsx` ligne 16
2. **Route**: `app/_layout.tsx` ligne 48
3. **Rendu**: `app/cart.tsx` ligne 21-31
4. **Context**: `contexts/CartContext.tsx`
5. **Politiques**: Base de données Supabase > RLS policies > cart_items

## Prochaines étapes

Une fois le debug effectué avec les logs console, nous pourrons identifier précisément où se situe le problème et le corriger.
