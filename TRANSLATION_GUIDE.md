# Guide de traduction Buy&Go

## Langues disponibles

L'application Buy&Go prend en charge trois langues:
- **Français** (par défaut)
- **English**
- **العربية (Arabe)** avec support RTL (Right-to-Left)

## Changement de langue

### Pour l'utilisateur final

1. Cliquez sur le bouton de langue dans la barre bleue en haut de l'écran
2. Sélectionnez votre langue préférée parmi les options disponibles
3. L'application changera immédiatement de langue et enregistrera votre préférence

### Pour les développeurs

Le système de traduction est géré par le contexte `LanguageContext` qui fournit:
- `language`: La langue actuelle ('fr' | 'en' | 'ar')
- `setLanguage(lang)`: Fonction pour changer la langue
- `t(key)`: Fonction pour traduire une clé
- `isRTL`: Booléen indiquant si la langue actuelle est RTL (arabe)

## Ajouter de nouvelles traductions

### 1. Éditer le fichier de traductions

Ouvrez `/locales/translations.ts` et ajoutez vos nouvelles clés dans les trois langues:

```typescript
export const translations = {
  fr: {
    mySection: {
      myKey: 'Mon texte en français',
    },
  },
  en: {
    mySection: {
      myKey: 'My text in English',
    },
  },
  ar: {
    mySection: {
      myKey: 'النص الخاص بي بالعربية',
    },
  },
};
```

### 2. Utiliser la traduction dans un composant

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function MyComponent() {
  const { t, isRTL } = useLanguage();

  return (
    <Text style={[styles.text, isRTL && styles.textRTL]}>
      {t('mySection.myKey')}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
```

## Support RTL (Right-to-Left)

Pour les langues qui se lisent de droite à gauche comme l'arabe:

1. **Utilisez toujours `isRTL`** pour appliquer les styles appropriés
2. **Ajoutez le style `textRTL`** aux textes qui doivent s'aligner à droite
3. **Testez l'interface** pour vous assurer que les éléments sont bien positionnés

## Structure des traductions

Les traductions sont organisées par sections:
- `common`: Éléments communs (recherche, annuler, enregistrer, etc.)
- `topBar`: Barre supérieure (compte, publier, langue, etc.)
- `home`: Page d'accueil (logo, recherche, annonces, etc.)
- `categories`: Catégories de produits
- `language`: Menu de sélection de langue
- `pro`: Forfait PRO
- `tabs`: Navigation par onglets
- `auth`: Authentification (connexion, inscription)
- `publish`: Publication d'annonces
- `search`: Recherche et filtres
- `messages`: Messagerie
- `profile`: Profil utilisateur

## Traduction des catégories

Les noms de catégories venant de la base de données sont traduits dynamiquement via la fonction `getCategoryTranslation()`:

```typescript
const getCategoryTranslation = (categoryName: string): string => {
  const categoryMap: { [key: string]: string } = {
    'VÉHICULES': t('categories.vehicles'),
    'IMMOBILIER': t('categories.realEstate'),
    'ÉLECTRONIQUE': t('categories.electronics'),
    'MAISON & JARDIN': t('categories.homeGarden'),
    'MODE & BEAUTÉ': t('categories.fashion'),
    'EMPLOI': t('categories.jobs'),
    'SERVICES': t('categories.services'),
    'LOISIRS & HOBBIES': t('categories.leisure'),
  };
  return categoryMap[categoryName.toUpperCase()] || categoryName;
};
```

## Bonnes pratiques

1. **Toujours utiliser `t()` pour les textes visibles** par l'utilisateur
2. **Ne pas coder en dur les textes** dans les composants
3. **Tester dans les trois langues** avant de déployer
4. **Utiliser des clés descriptives** pour faciliter la maintenance
5. **Appliquer les styles RTL** pour toutes les langues qui en ont besoin

## Dépannage

### La traduction ne s'affiche pas
- Vérifiez que la clé existe dans les trois langues
- Assurez-vous d'utiliser la syntaxe correcte: `t('section.key')`
- Vérifiez que le composant importe `useLanguage`
- Ouvrez la console du navigateur pour voir les logs de débogage

### Le texte arabe ne s'affiche pas correctement
- Assurez-vous d'appliquer le style `textRTL`
- Vérifiez que la police utilisée supporte les caractères arabes

### La langue ne change pas
- Vérifiez que le `LanguageProvider` est bien dans le layout racine
- Ouvrez la console du navigateur et cherchez les logs "Setting language to:"
- Sur web, la préférence est sauvegardée dans `localStorage`
- Rafraîchissez la page si nécessaire
