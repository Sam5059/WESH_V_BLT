# Système de Panier, Commandes et Paiement - BuyGo

## Vue d'ensemble

Le système de panier et de paiement de BuyGo a été entièrement configuré pour gérer les transactions entre acheteurs et vendeurs avec trois options de paiement distinctes.

## 🎯 Fonctionnalités Principales

### 1. Panier d'Achat
- ✅ Ajout/Retrait d'articles
- ✅ Modification des quantités
- ✅ Calcul automatique du total
- ✅ Panier persistant en base de données
- ✅ Organisation par vendeur (un acheteur peut acheter à plusieurs vendeurs)

### 2. Trois Modes de Paiement

#### A. **Paiement par Carte** (À venir)
```
Status: En développement
- Paiement sécurisé en ligne
- Intégration gateway de paiement
```

#### B. **Virement Bancaire**
```
Status: Opérationnel
- Le vendeur reçoit les informations de commande
- L'acheteur effectue un virement
- Le vendeur confirme la réception
- Communication via messagerie intégrée
```

#### C. **Réservation avec Acompte** ⭐ (NOUVEAU)
```
Status: Opérationnel
Fonctionnement:
1. Acompte de 30% calculé automatiquement
2. Montant restant (70%) à payer au vendeur
3. Communication directe acheteur-vendeur
4. Suivi du paiement de l'acompte et du solde
```

### 3. Messagerie Intégrée Vendeur-Acheteur

**Création Automatique:**
- Une conversation est créée automatiquement lors d'une commande
- Message système envoyé avec les détails de la commande
- Détails inclus: numéro de commande, articles, montants

**Fonctionnalités:**
- Chat en temps réel
- Historique des messages
- Notification des nouvelles commandes
- Lien direct depuis la commande vers la conversation

### 4. Gestion des Commandes

#### Pour les Acheteurs:
- Liste de tous leurs achats
- Statut de chaque commande en temps réel
- Détails complets (articles, montants, vendeur)
- Accès direct aux conversations avec vendeurs
- Historique des paiements (acompte/solde)

#### Pour les Vendeurs:
- Liste de toutes leurs ventes
- Informations détaillées des acheteurs
- Gestion du statut des commandes
- Suivi des paiements
- Communication avec les acheteurs

## 📊 Workflow d'une Commande

### Étape 1: Création de la Commande
```
Acheteur → Panier → Checkout
├── Choix du mode de paiement
├── Renseignement des informations de livraison
└── Validation de la commande
```

### Étape 2: Traitement Automatique
```
Système:
├── Génération du numéro de commande (Format: CMD-YYMM-0001)
├── Création de la conversation vendeur-acheteur
├── Calcul automatique acompte/solde (si réservation)
├── Envoi message automatique avec détails
└── Notification au vendeur
```

### Étape 3: Communication
```
Vendeur ← Conversation → Acheteur
├── Discussion des modalités
├── Confirmation du paiement
├── Organisation de la livraison
└── Finalisation de la transaction
```

### Étape 4: Statuts de Commande
```
pending → En attente initiale
confirmed_seller → Confirmée par le vendeur
deposit_paid → Acompte payé (réservations)
paid → Payé en totalité
preparing → En préparation
shipped → Expédié
delivered → Livré
completed → Transaction terminée
cancelled → Annulé
refunded → Remboursé
```

## 🗄️ Structure de Base de Données

### Tables Principales

#### `orders`
```sql
- id (uuid)
- order_number (text) - Numéro unique
- buyer_id (uuid) - ID de l'acheteur
- seller_id (uuid) - ID du vendeur
- status (enum) - Statut de la commande
- payment_method (enum) - Mode de paiement
- payment_status (enum) - Statut du paiement
- total_amount (numeric) - Montant total
- deposit_amount (numeric) - Montant acompte (30%)
- remaining_amount (numeric) - Montant restant (70%)
- conversation_id (uuid) - Lien vers la conversation
- delivery_address (jsonb) - Adresse de livraison
- notes (text) - Notes spéciales
- deposit_paid_at (timestamptz) - Date paiement acompte
- full_payment_at (timestamptz) - Date paiement complet
- seller_confirmed_at (timestamptz) - Date confirmation vendeur
- buyer_confirmed_at (timestamptz) - Date confirmation acheteur
- created_at, updated_at
```

#### `order_items`
```sql
- id (uuid)
- order_id (uuid) - Référence commande
- listing_id (uuid) - Référence annonce
- quantity (int) - Quantité
- unit_price (numeric) - Prix unitaire
- total_price (numeric) - Prix total ligne
```

#### `conversations`
```sql
- id (uuid)
- user_a_id (uuid) - Premier participant
- user_b_id (uuid) - Second participant
- listing_id (uuid) - Annonce concernée
- last_message_at (timestamptz) - Dernier message
- created_at
```

#### `messages`
```sql
- id (uuid)
- conversation_id (uuid) - Conversation
- sender_id (uuid) - Expéditeur
- content (text) - Contenu du message
- message_type (text) - Type: 'text', 'system'
- read_at (timestamptz) - Date de lecture
- created_at
```

#### `payments`
```sql
- id (uuid)
- order_id (uuid) - Référence commande
- amount (numeric) - Montant
- method (enum) - Méthode
- status (enum) - Statut
- created_at
```

## 🔒 Sécurité (RLS)

### Politiques Implémentées:

**Orders:**
- Acheteurs: Peuvent voir et modifier leurs commandes
- Vendeurs: Peuvent voir et mettre à jour leurs ventes
- Isolation complète entre utilisateurs

**Order Items:**
- Visibles uniquement par acheteur et vendeur de la commande

**Conversations:**
- Accessibles uniquement par les 2 participants

**Messages:**
- Lecture/Écriture par les participants de la conversation

## 🔧 Fonctions SQL Automatiques

### `generate_order_number()`
Génère un numéro unique: `CMD-YYMM-0001`

### `calculate_order_amounts()`
Calcule automatiquement:
- Acompte (30% si réservation)
- Montant restant (70%)

### `create_conversation_for_order()`
Crée automatiquement une conversation lors d'une nouvelle commande

### `send_order_notification()`
Envoie un message système dans la conversation avec les détails de la commande

## 📱 Interface Utilisateur

### Page Panier (`/cart`)
- Liste des articles
- Modification quantités
- Calcul total en temps réel
- Bouton "Passer à la caisse"

### Page Checkout (`/checkout`)
- Formulaire de livraison
- Sélection mode de paiement
- Affichage acompte si réservation
- Récapitulatif de commande
- Validation finale

### Onglet Commandes (`/profile?tab=orders`)
- Toggle Achats/Ventes
- Liste des commandes
- Statuts colorés
- Bouton messagerie
- Détails complets

### Page Messages (`/messages`)
- Liste des conversations
- Accès direct depuis commandes
- Chat en temps réel
- Messages système automatiques

## 💡 Exemples d'Utilisation

### Exemple 1: Achat Simple
```
1. Acheteur ajoute article au panier
2. Va au checkout
3. Choisit "Virement bancaire"
4. Valide la commande
5. Conversation créée automatiquement
6. Vendeur reçoit notification
7. Discussion pour organiser paiement/livraison
```

### Exemple 2: Réservation avec Acompte
```
1. Acheteur ajoute article au panier (ex: 100,000 DA)
2. Va au checkout
3. Choisit "Réservation avec acompte"
4. Voit: Acompte = 30,000 DA, Reste = 70,000 DA
5. Valide la commande
6. Message auto: détails + montants
7. Vendeur confirme réception acompte
8. Acheteur paie le solde à la livraison
```

### Exemple 3: Multi-Vendeurs
```
1. Acheteur ajoute articles de 3 vendeurs différents
2. Au checkout, validation unique
3. Système crée 3 commandes séparées
4. 3 conversations créées automatiquement
5. Chaque vendeur gère sa commande indépendamment
```

## 🚀 Prochaines Améliorations

### Court Terme:
- [ ] Page détails de commande complète
- [ ] Notifications push pour nouveaux messages
- [ ] Système de notation vendeur/acheteur
- [ ] Upload de preuve de paiement

### Moyen Terme:
- [ ] Intégration gateway de paiement en ligne
- [ ] Système de suivi de colis
- [ ] Génération de factures PDF
- [ ] Tableau de bord vendeur avancé

### Long Terme:
- [ ] Programme de protection acheteur
- [ ] Système d'assurance
- [ ] API pour vendeurs professionnels
- [ ] Application mobile native

## 📝 Notes Techniques

### Triggers Automatiques:
1. **Avant insertion commande**: Calcul des montants + création conversation
2. **Après insertion commande**: Envoi message système

### Calculs Automatiques:
- Acompte = 30% du total (réservations)
- Solde = 70% du total (réservations)
- Total panier = Σ (prix × quantité)

### Format Numéro Commande:
`CMD-YYMM-XXXX`
- CMD: Préfixe commande
- YY: Année (2 chiffres)
- MM: Mois (2 chiffres)
- XXXX: Séquence (4 chiffres)

## ✅ Checklist de Test

### Tests Acheteur:
- [ ] Ajouter articles au panier
- [ ] Modifier quantités
- [ ] Valider commande (chaque mode paiement)
- [ ] Vérifier création conversation
- [ ] Envoyer messages au vendeur
- [ ] Consulter historique commandes

### Tests Vendeur:
- [ ] Recevoir notification commande
- [ ] Voir détails acheteur
- [ ] Répondre dans conversation
- [ ] Mettre à jour statut commande
- [ ] Consulter historique ventes

### Tests Système:
- [ ] Numéros commandes uniques
- [ ] Calculs montants corrects
- [ ] Messages système envoyés
- [ ] Conversations créées
- [ ] RLS fonctionnel

## 🎓 Guide Démarrage Rapide

### Pour Tester:
1. Créer 2 comptes (acheteur + vendeur)
2. Créer une annonce avec compte vendeur
3. Avec compte acheteur: ajouter au panier
4. Aller au checkout, choisir "Réservation"
5. Valider la commande
6. Vérifier la conversation créée
7. Tester la messagerie entre les deux comptes

---

**Date de mise à jour:** 23 octobre 2025
**Version:** 1.0
**Statut:** Opérationnel ✅
