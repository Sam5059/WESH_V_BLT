# 🔧 GUIDE: Comment Restaurer la Base de Données

## ⚠️ PROBLÈME IDENTIFIÉ

Vous avez utilisé le **Table Editor** au lieu du **SQL Editor**. C'est pour ça qu'une table vide a été créée.

---

## ✅ SOLUTION EN 3 ÉTAPES

### ÉTAPE 1: Nettoyer la table incorrecte

Dans Supabase Dashboard:
1. Allez dans **Table Editor** (menu gauche)
2. Trouvez la table `restauration_complete_base`
3. Cliquez sur les **3 points** (⋮) à droite
4. Cliquez sur **Delete table**
5. Confirmez la suppression

---

### ÉTAPE 2: Utiliser SQL Editor (IMPORTANT!)

1. Dans le menu de gauche, cliquez sur **"SQL Editor"** (icône </> code)
2. Cliquez sur le bouton **"+ New query"** en haut
3. Vous verrez un éditeur de code vide

**❌ NE PAS utiliser:**
- Table Editor
- Database → Tables
- Import data

**✅ UTILISEZ SEULEMENT:**
- SQL Editor → New query

---

### ÉTAPE 3: Exécuter le script de restauration

1. **Ouvrez le fichier** `RESTAURATION_COMPLETE_BASE.sql` sur votre ordinateur
2. **Sélectionnez TOUT** (Ctrl+A ou Cmd+A)
3. **Copiez** (Ctrl+C ou Cmd+C)
4. **Retournez dans SQL Editor** (dans Supabase Dashboard)
5. **Collez dans l'éditeur** (Ctrl+V ou Cmd+V)
6. **Cliquez sur le bouton RUN** ▶️ (en haut à droite, bouton vert)
7. **Attendez** 30-60 secondes

---

## 📸 CAPTURE D'ÉCRAN - Où cliquer

```
┌─────────────────────────────────────────┐
│ Supabase Dashboard                      │
├─────────────────────────────────────────┤
│                                         │
│  📊 Table Editor        ← ❌ PAS ICI   │
│  </> SQL Editor         ← ✅ CLIQUEZ ICI│
│  🗄️  Database                           │
│                                         │
└─────────────────────────────────────────┘
```

Une fois dans SQL Editor:

```
┌─────────────────────────────────────────┐
│ SQL Editor              [+ New query]   │ ← Cliquez ici
├─────────────────────────────────────────┤
│                                         │
│  [Zone vide pour coller le code SQL]    │
│                                         │
│                                         │
│                     [RUN ▶️]            │ ← Puis cliquez ici
└─────────────────────────────────────────┘
```

---

## ✅ RÉSULTAT ATTENDU

Après avoir cliqué sur RUN, vous devriez voir dans la console:

```
✅ BASE DE DONNÉES RESTAURÉE !

✓ Toutes les tables créées
✓ 58 wilayas insérées
✓ Système de modération activé
✓ Compte admin restauré

📧 Email: samouaaz@gmail.com
🔑 Mot de passe: Admin@2025
```

Et dans **Table Editor**, vous devriez maintenant voir:
- ✅ profiles
- ✅ listings
- ✅ categories
- ✅ favorites
- ✅ conversations
- ✅ messages
- ✅ wilayas
- ✅ communes
- ✅ brands
- ✅ models
- ✅ listing_reports
- ✅ user_ratings

---

## 🆘 EN CAS DE PROBLÈME

### Si vous voyez une erreur:
1. Vérifiez que vous êtes bien dans **SQL Editor**
2. Vérifiez que vous avez collé **TOUT** le contenu du fichier
3. Lisez le message d'erreur et partagez-le avec moi

### Si rien ne se passe:
1. Attendez 1-2 minutes
2. Rafraîchissez la page
3. Retournez dans Table Editor pour voir les nouvelles tables

### Si vous ne trouvez pas SQL Editor:
1. Vérifiez que vous êtes sur le bon projet (jchywwamhmzzvhgbywkj)
2. SQL Editor est dans le menu de gauche, icône </>
3. Si vous ne le voyez pas, vous n'avez peut-être pas les droits d'accès

---

## 📝 CHECKLIST FINALE

Avant de commencer:
- [ ] J'ai ouvert Supabase Dashboard
- [ ] Je suis connecté avec mon compte Supabase
- [ ] J'ai ouvert le projet jchywwamhmzzvhgbywkj
- [ ] J'ai cliqué sur "SQL Editor" (icône </>) dans le menu gauche
- [ ] J'ai cliqué sur "+ New query"
- [ ] J'ai le fichier RESTAURATION_COMPLETE_BASE.sql ouvert

Pendant l'exécution:
- [ ] J'ai copié TOUT le contenu du fichier SQL
- [ ] J'ai collé dans l'éditeur SQL
- [ ] J'ai cliqué sur le bouton RUN ▶️
- [ ] J'attends la fin de l'exécution

Après l'exécution:
- [ ] Je vois un message de succès
- [ ] Dans Table Editor, je vois toutes les nouvelles tables
- [ ] Je peux me connecter à l'application avec samouaaz@gmail.com
- [ ] J'ai accès au dashboard admin

---

## 🎯 PROCHAINES ÉTAPES

Une fois la base restaurée:
1. Allez sur votre application Buy&Go
2. Connectez-vous avec:
   - Email: samouaaz@gmail.com
   - Mot de passe: Admin@2025
3. Vérifiez que tout fonctionne
4. Accédez au Dashboard Admin

---

**Besoin d'aide?** Envoyez-moi une capture d'écran de ce que vous voyez!
