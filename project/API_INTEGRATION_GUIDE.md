# 📡 Guide d'Intégration API - BuyGo

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [API BuyGo (Exposer vos données)](#api-buygo-exposer-vos-données)
3. [Intégration avec d'autres sites](#intégration-avec-dautres-sites)
4. [Webhooks et notifications](#webhooks-et-notifications)
5. [Scraping éthique](#scraping-éthique)
6. [Sécurité et bonnes pratiques](#sécurité-et-bonnes-pratiques)

---

## 🎯 Vue d'ensemble

Ce guide couvre **deux scénarios principaux** :

### **Scénario 1 : Exposer vos annonces BuyGo via API**
Permettre à d'autres sites algériens de petites annonces d'afficher vos annonces.

### **Scénario 2 : Importer des annonces depuis d'autres sites**
Récupérer et synchroniser des annonces depuis Ouedkniss, Avito.ma, etc.

---

## 📤 API BuyGo (Exposer vos données)

### Architecture

```
┌──────────────────────────────────────────────┐
│           Site Partenaire                    │
│  (Ouedkniss, Avito, Jumia, etc.)           │
└──────────────┬───────────────────────────────┘
               │
               │ HTTP GET/POST
               │ Authentication: API Key
               ↓
┌──────────────────────────────────────────────┐
│         BuyGo API Endpoints                  │
│  /api/listings, /api/categories, etc.       │
└──────────────┬───────────────────────────────┘
               │
               │ Supabase RPC
               ↓
┌──────────────────────────────────────────────┐
│         Supabase Database                    │
│  listings, categories, profiles, etc.       │
└──────────────────────────────────────────────┘
```

---

## 🔧 Créer une API REST pour BuyGo

### Étape 1: Créer les Edge Functions Supabase

Les Edge Functions Supabase permettent de créer des endpoints API sécurisés.

#### **1.1 Créer la fonction API listings**

Créez un fichier : `supabase/functions/api-listings/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    // Vérifier la clé API
    const apiKey = req.headers.get('X-API-Key')
    if (!apiKey || apiKey !== Deno.env.get('BUYGO_API_KEY')) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialiser Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parser l'URL pour les paramètres
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const category = url.searchParams.get('category')
    const wilaya = url.searchParams.get('wilaya')
    const offset = (page - 1) * limit

    // Construire la requête
    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles:user_id(full_name, phone_number, wilaya),
        categories:category_id(name, name_en, slug),
        pro_stores:pro_store_id(business_name, slug, phone, email)
      `, { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtres optionnels
    if (category) {
      query = query.eq('category_id', category)
    }
    if (wilaya) {
      query = query.eq('wilaya', wilaya)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Formater la réponse
    const response = {
      success: true,
      data: data,
      pagination: {
        page: page,
        limit: limit,
        total: count,
        total_pages: Math.ceil((count || 0) / limit)
      },
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
```

#### **1.2 Créer la fonction API single listing**

`supabase/functions/api-listing/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const apiKey = req.headers.get('X-API-Key')
    if (!apiKey || apiKey !== Deno.env.get('BUYGO_API_KEY')) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const listingId = url.searchParams.get('id')

    if (!listingId) {
      return new Response(
        JSON.stringify({ error: 'Listing ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles:user_id(full_name, phone_number, wilaya, commune),
        categories:category_id(name, name_en, slug),
        pro_stores:pro_store_id(business_name, slug, phone, email, logo_url)
      `)
      .eq('id', listingId)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Incrémenter les vues
    await supabase.rpc('increment_listing_views', { listing_id: listingId })

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
```

#### **1.3 Créer la fonction API categories**

`supabase/functions/api-categories/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const apiKey = req.headers.get('X-API-Key')
    if (!apiKey || apiKey !== Deno.env.get('BUYGO_API_KEY')) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer toutes les catégories avec leurs sous-catégories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('order_position')

    if (catError) throw catError

    const { data: subcategories, error: subError } = await supabase
      .from('categories')
      .select('*')
      .not('parent_id', 'is', null)
      .order('order_position')

    if (subError) throw subError

    // Organiser les catégories avec leurs sous-catégories
    const categoriesTree = categories.map(cat => ({
      ...cat,
      subcategories: subcategories.filter(sub => sub.parent_id === cat.id)
    }))

    return new Response(
      JSON.stringify({ success: true, data: categoriesTree }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
```

---

### Étape 2: Déployer les Edge Functions

Pour déployer les functions (via l'interface ou en local) :

```bash
# Via l'interface Supabase Dashboard:
# 1. Aller dans "Edge Functions"
# 2. Cliquer "New Function"
# 3. Copier-coller le code
# 4. Déployer
```

---

### Étape 3: Documentation API

#### **Endpoints disponibles**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api-listings` | GET | Liste des annonces avec pagination |
| `/api-listing` | GET | Détails d'une annonce |
| `/api-categories` | GET | Toutes les catégories |

#### **Authentication**

Toutes les requêtes doivent inclure :

```http
X-API-Key: votre_cle_api_ici
```

#### **Exemples de requêtes**

**1. Récupérer des annonces**

```bash
curl -X GET "https://votre-projet.supabase.co/functions/v1/api-listings?page=1&limit=20&wilaya=Alger" \
  -H "X-API-Key: votre_cle_api"
```

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Appartement F3 Alger",
      "description": "Belle appartement...",
      "price": 25000000,
      "wilaya": "Alger",
      "commune": "Bab Ezzouar",
      "images": ["url1", "url2"],
      "profiles": {
        "full_name": "Ahmed Benali",
        "phone_number": "+213 550 123 456"
      },
      "categories": {
        "name": "Immobilier",
        "slug": "immobilier"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

**2. Récupérer une annonce spécifique**

```bash
curl -X GET "https://votre-projet.supabase.co/functions/v1/api-listing?id=uuid-de-annonce" \
  -H "X-API-Key: votre_cle_api"
```

**3. Récupérer les catégories**

```bash
curl -X GET "https://votre-projet.supabase.co/functions/v1/api-categories" \
  -H "X-API-Key: votre_cle_api"
```

---

## 📥 Intégration avec d'autres sites algériens

### Scraper Ouedkniss, Avito, etc.

⚠️ **Avertissement légal** : Le scraping doit respecter les conditions d'utilisation des sites et les lois sur la protection des données.

#### **Approche éthique**

1. **Vérifier les CGU** du site cible
2. **Respecter le robots.txt**
3. **Limiter la fréquence** des requêtes (rate limiting)
4. **Ne pas surcharger** les serveurs
5. **Créditer la source** originale

#### **Architecture de scraping**

```
┌────────────────────────┐
│   Site Source          │
│  (Ouedkniss, Avito)    │
└───────────┬────────────┘
            │
            │ HTTP GET
            │ (respecter rate limit)
            ↓
┌────────────────────────┐
│   Scraper Service      │
│  (Puppeteer/Cheerio)   │
└───────────┬────────────┘
            │
            │ Parse & Transform
            ↓
┌────────────────────────┐
│   BuyGo Database       │
│  (nouvelles annonces)  │
└────────────────────────┘
```

#### **Exemple : Scraper simple avec Node.js**

```typescript
// scraper-ouedkniss.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface ScrapedListing {
  title: string;
  price: number;
  description: string;
  wilaya: string;
  images: string[];
  external_url: string;
  source: string;
}

async function scrapeOuedkniss(category: string, page: number = 1) {
  try {
    // Respecter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));

    const url = `https://www.ouedkniss.com/${category}?page=${page}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'BuyGo-Bot/1.0 (contact@buygo.dz)'
      }
    });

    const $ = cheerio.load(response.data);
    const listings: ScrapedListing[] = [];

    // Parser les annonces
    $('.listing-item').each((i, element) => {
      const title = $(element).find('.listing-title').text().trim();
      const priceText = $(element).find('.listing-price').text().trim();
      const price = parseInt(priceText.replace(/\D/g, ''));
      const wilaya = $(element).find('.listing-location').text().trim();
      const imageUrl = $(element).find('img').attr('src');
      const listingUrl = $(element).find('a').attr('href');

      if (title && price && wilaya) {
        listings.push({
          title,
          price,
          description: `Annonce importée depuis Ouedkniss`,
          wilaya,
          images: imageUrl ? [imageUrl] : [],
          external_url: listingUrl || '',
          source: 'ouedkniss'
        });
      }
    });

    return listings;

  } catch (error) {
    console.error('Erreur scraping:', error);
    return [];
  }
}

async function importListings(listings: ScrapedListing[]) {
  for (const listing of listings) {
    // Vérifier si l'annonce existe déjà
    const { data: existing } = await supabase
      .from('external_listings')
      .select('id')
      .eq('external_url', listing.external_url)
      .maybeSingle();

    if (existing) {
      console.log('Annonce déjà importée:', listing.title);
      continue;
    }

    // Mapper les données au format BuyGo
    const { error } = await supabase
      .from('external_listings')
      .insert({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        wilaya: listing.wilaya,
        images: listing.images,
        external_url: listing.external_url,
        source: listing.source,
        status: 'pending', // Nécessite validation
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur import:', error);
    } else {
      console.log('✓ Importé:', listing.title);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Exécution
(async () => {
  console.log('🚀 Démarrage scraper Ouedkniss...');

  const categories = ['vehicules', 'immobilier', 'electromenager'];

  for (const category of categories) {
    console.log(`📦 Scraping catégorie: ${category}`);
    const listings = await scrapeOuedkniss(category, 1);
    console.log(`✓ Trouvé ${listings.length} annonces`);

    await importListings(listings);
  }

  console.log('✅ Terminé !');
})();
```

#### **Créer une table pour les annonces externes**

```sql
-- Table pour stocker les annonces importées
CREATE TABLE IF NOT EXISTS external_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric,
  wilaya text,
  commune text,
  images text[],
  external_url text UNIQUE NOT NULL,
  source text NOT NULL, -- 'ouedkniss', 'avito', etc.
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  imported_at timestamptz DEFAULT NOW(),
  approved_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_external_listings_source ON external_listings(source);
CREATE INDEX idx_external_listings_status ON external_listings(status);
CREATE INDEX idx_external_listings_wilaya ON external_listings(wilaya);

-- RLS
ALTER TABLE external_listings ENABLE ROW LEVEL SECURITY;

-- Lecture publique des annonces approuvées
CREATE POLICY "Public can view approved external listings"
  ON external_listings FOR SELECT
  TO public
  USING (status = 'approved');

-- Admins peuvent tout gérer
CREATE POLICY "Admins can manage external listings"
  ON external_listings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## 🔔 Webhooks et Notifications

### Créer un système de webhooks

Les webhooks permettent de notifier d'autres sites lorsqu'une nouvelle annonce est publiée.

#### **1. Créer la table webhooks**

```sql
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name text NOT NULL,
  url text NOT NULL,
  api_key text NOT NULL,
  events text[] NOT NULL, -- ['listing.created', 'listing.updated', 'listing.deleted']
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- Table pour logger les envois
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb,
  status_code integer,
  response_body text,
  error text,
  created_at timestamptz DEFAULT NOW()
);
```

#### **2. Fonction pour déclencher les webhooks**

```sql
CREATE OR REPLACE FUNCTION trigger_webhooks()
RETURNS TRIGGER AS $$
DECLARE
  webhook_record RECORD;
  event_name text;
  payload jsonb;
BEGIN
  -- Déterminer l'événement
  IF TG_OP = 'INSERT' THEN
    event_name := 'listing.created';
    payload := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    event_name := 'listing.updated';
    payload := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    event_name := 'listing.deleted';
    payload := to_jsonb(OLD);
  END IF;

  -- Envoyer à tous les webhooks actifs
  FOR webhook_record IN
    SELECT * FROM webhooks
    WHERE is_active = true
    AND event_name = ANY(events)
  LOOP
    -- Appeler une Edge Function pour envoyer le webhook
    PERFORM http_post(
      webhook_record.url,
      payload,
      'application/json',
      jsonb_build_object(
        'X-Webhook-Signature', encode(hmac(payload::text, webhook_record.api_key, 'sha256'), 'hex')
      )
    );

    -- Logger l'envoi
    INSERT INTO webhook_logs (webhook_id, event, payload, created_at)
    VALUES (webhook_record.id, event_name, payload, NOW());
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attacher le trigger
CREATE TRIGGER listings_webhook_trigger
AFTER INSERT OR UPDATE OR DELETE ON listings
FOR EACH ROW
EXECUTE FUNCTION trigger_webhooks();
```

---

## 🔐 Sécurité et Bonnes Pratiques

### 1. **Authentication API**

```typescript
// Vérification sécurisée de la clé API
function verifyApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key');
  const validKeys = [
    process.env.PARTNER_1_KEY,
    process.env.PARTNER_2_KEY,
    // etc.
  ];

  return validKeys.includes(apiKey);
}
```

### 2. **Rate Limiting**

```typescript
// Rate limiting simple avec Redis ou KV store
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(apiKey: string, maxRequests: number = 100): boolean {
  const now = Date.now();
  const limit = rateLimit.get(apiKey);

  if (!limit || now > limit.resetAt) {
    rateLimit.set(apiKey, {
      count: 1,
      resetAt: now + 60000 // 1 minute
    });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}
```

### 3. **Validation des données**

```typescript
// Valider les données entrantes
function validateListing(data: any): boolean {
  return (
    typeof data.title === 'string' &&
    data.title.length > 0 &&
    data.title.length <= 200 &&
    typeof data.price === 'number' &&
    data.price > 0 &&
    Array.isArray(data.images) &&
    data.images.length <= 10
  );
}
```

### 4. **Logging et monitoring**

```typescript
// Logger toutes les requêtes API
async function logApiRequest(req: Request, response: any) {
  await supabase.from('api_logs').insert({
    endpoint: new URL(req.url).pathname,
    method: req.method,
    ip: req.headers.get('X-Forwarded-For'),
    api_key: req.headers.get('X-API-Key'),
    status: response.status,
    timestamp: new Date().toISOString()
  });
}
```

---

## 📊 Exemples d'utilisation complète

### Exemple 1: Site partenaire récupère vos annonces

```javascript
// Site partenaire (ex: AvitoAlgerie.com)
async function syncFromBuyGo() {
  const response = await fetch(
    'https://buygo.supabase.co/functions/v1/api-listings?wilaya=Alger&limit=50',
    {
      headers: {
        'X-API-Key': 'votre_cle_partenaire_buygo'
      }
    }
  );

  const { data, pagination } = await response.json();

  // Importer dans votre base de données
  for (const listing of data) {
    await importToDB({
      title: listing.title,
      price: listing.price,
      source: 'BuyGo',
      external_id: listing.id,
      external_url: `https://buygo.dz/listing/${listing.id}`
    });
  }

  console.log(`✓ Importé ${data.length} annonces depuis BuyGo`);
}
```

### Exemple 2: Synchronisation bidirectionnelle

```javascript
// Synchroniser les annonces dans les deux sens
async function bidirectionalSync() {
  // 1. Envoyer vos nouvelles annonces à BuyGo
  const myListings = await getMyNewListings();

  for (const listing of myListings) {
    await fetch('https://buygo.dz/api/import', {
      method: 'POST',
      headers: {
        'X-API-Key': 'ma_cle_api',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(listing)
    });
  }

  // 2. Récupérer les nouvelles de BuyGo
  const buygoListings = await fetch(
    'https://buygo.dz/api/listings?since=2025-10-18',
    {
      headers: { 'X-API-Key': 'ma_cle_api' }
    }
  );

  const { data } = await buygoListings.json();
  await importMultiple(data);
}
```

---

## ✅ Checklist de mise en production

- [ ] Créer les Edge Functions
- [ ] Configurer les clés API
- [ ] Tester tous les endpoints
- [ ] Implémenter le rate limiting
- [ ] Ajouter le logging
- [ ] Documenter l'API
- [ ] Partager la doc avec les partenaires
- [ ] Monitorer l'usage
- [ ] Mettre en place des alertes

---

## 📞 Support et Contact

Pour toute question sur l'intégration API :
- **Email** : api@buygo.dz
- **Documentation** : https://buygo.dz/docs/api
- **Status** : https://status.buygo.dz

---

**📅 Dernière mise à jour** : 18 Octobre 2025
**📝 Version** : 1.0.0
**👨‍💻 Équipe** : BuyGo Tech Team
