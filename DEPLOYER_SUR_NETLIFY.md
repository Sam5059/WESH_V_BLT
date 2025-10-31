# 🚀 Guide Rapide : Déployer BuyGo sur Netlify (GRATUIT)

## Pourquoi Bolt.host ne fonctionne pas sur mobile ?

Bolt.host est un **environnement de développement**, pas un hébergement de production. Il redémarre fréquemment et n'est pas optimisé pour les appareils mobiles.

## Solution : Netlify (100% GRATUIT)

### Méthode 1 : Glisser-Déposer (La plus simple) ✨

1. **Allez sur** : https://app.netlify.com/drop
2. **Glissez le dossier `dist/`** de votre projet
3. **C'est tout !** Vous obtenez un lien HTTPS fonctionnel instantanément

### Méthode 2 : Via Git (Recommandé pour mises à jour)

1. **Créer un compte Netlify** : https://app.netlify.com/signup
2. **Connecter votre repo Git** (GitHub, GitLab, etc.)
3. **Configuration du build** :
   - Build command: `npm run build:web`
   - Publish directory: `dist`
4. **Déployer** : Automatique à chaque commit !

### Méthode 3 : Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer (depuis ce dossier)
netlify deploy --prod --dir=dist
```

## Variables d'environnement

N'oubliez pas d'ajouter vos variables d'environnement dans Netlify :

1. Allez dans **Site settings** > **Environment variables**
2. Ajoutez :
   - `EXPO_PUBLIC_SUPABASE_URL` = votre URL Supabase
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = votre clé anonyme Supabase

## Vérification

Après déploiement, testez sur mobile :
- ✅ L'app se charge correctement
- ✅ Pas de page blanche
- ✅ Pas de crash
- ✅ Les inputs ne zooment pas automatiquement
- ✅ Le scroll fonctionne normalement

## Fichiers inclus dans dist/

- `index.html` - Page principale
- `_expo/` - Bundles JavaScript et CSS
- `assets/` - Images et ressources
- `_redirects` - Configuration routing SPA pour Netlify
- `metadata.json` - Métadonnées Expo

## Support

Une fois déployé, votre URL Netlify ressemblera à :
`https://votre-app.netlify.app`

Vous pourrez la personnaliser avec votre propre domaine si nécessaire.
