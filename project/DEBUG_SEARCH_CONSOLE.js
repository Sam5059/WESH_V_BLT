// SCRIPT DE DEBUG - À COPIER DANS LA CONSOLE DU NAVIGATEUR
// Ce script vérifie si la fonction search_listings fonctionne correctement

async function debugSearchFunction() {
  console.log('🔍 DEBUG: Test de la fonction search_listings');
  console.log('==========================================\n');

  // Importer supabase depuis le contexte
  const { supabase } = window.__SUPABASE__ || {};

  if (!supabase) {
    console.error('❌ Supabase client not found!');
    console.log('Trying to create client from env...');

    // Essayer de créer un client
    const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('❌ Cannot find Supabase credentials');
      return;
    }

    console.log('✅ Found credentials');
  }

  // 1. Récupérer une catégorie parente
  console.log('1️⃣ Récupération d\'une catégorie parente...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .is('parent_id', null)
    .neq('slug', 'stores-pro')
    .limit(1);

  if (catError) {
    console.error('❌ Erreur catégories:', catError);
    return;
  }

  if (!categories || categories.length === 0) {
    console.error('❌ Aucune catégorie trouvée');
    return;
  }

  const parentCategory = categories[0];
  console.log('✅ Catégorie trouvée:', parentCategory.name, '(' + parentCategory.id + ')');

  // 2. Récupérer les sous-catégories
  console.log('\n2️⃣ Récupération des sous-catégories...');
  const { data: subcategories, error: subError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('parent_id', parentCategory.id);

  if (subError) {
    console.error('❌ Erreur sous-catégories:', subError);
    return;
  }

  console.log('✅ Sous-catégories trouvées:', subcategories?.length || 0);
  if (subcategories) {
    subcategories.forEach(sub => {
      console.log('   -', sub.name, '(' + sub.id + ')');
    });
  }

  // 3. Compter les annonces dans chaque sous-catégorie
  console.log('\n3️⃣ Comptage des annonces par sous-catégorie...');
  if (subcategories && subcategories.length > 0) {
    let totalListings = 0;
    for (const sub of subcategories) {
      const { count, error: countError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', sub.id)
        .eq('status', 'active');

      if (countError) {
        console.error('❌ Erreur comptage pour', sub.name, ':', countError);
      } else {
        console.log('   -', sub.name + ':', count, 'annonces');
        totalListings += count || 0;
      }
    }
    console.log('✅ TOTAL:', totalListings, 'annonces dans toutes les sous-catégories');
  }

  // 4. Tester la fonction search_listings
  console.log('\n4️⃣ Test de la fonction search_listings...');
  console.log('Paramètres:', {
    search_term: '',
    category_filter: parentCategory.id,
    subcategory_filter: null,
    wilaya_filter: null,
    commune_filter: null,
    min_price_filter: null,
    max_price_filter: null,
    listing_type_filter: null
  });

  const { data: searchResults, error: searchError } = await supabase.rpc('search_listings', {
    search_term: '',
    category_filter: parentCategory.id,
    subcategory_filter: null,
    wilaya_filter: null,
    commune_filter: null,
    min_price_filter: null,
    max_price_filter: null,
    listing_type_filter: null
  });

  if (searchError) {
    console.error('❌ ERREUR search_listings:', searchError);
    console.error('Message:', searchError.message);
    console.error('Code:', searchError.code);
    console.error('Details:', searchError.details);
    console.error('Hint:', searchError.hint);
    console.log('\n⚠️ LA FONCTION search_listings A UNE ERREUR !');
    console.log('Solution: Appliquer la migration SQL dans Supabase Dashboard');
    return;
  }

  console.log('✅ search_listings a retourné:', searchResults?.length || 0, 'résultats');

  if (searchResults && searchResults.length > 0) {
    console.log('\n📋 Premiers résultats:');
    searchResults.slice(0, 5).forEach((listing, i) => {
      console.log(`   ${i + 1}.`, listing.title, '(' + listing.price + ' DA)');
    });
    console.log('\n✅ LA FONCTION FONCTIONNE CORRECTEMENT !');
  } else {
    console.log('\n⚠️ Aucun résultat retourné par search_listings');
    console.log('Causes possibles:');
    console.log('   1. La migration n\'a pas été appliquée');
    console.log('   2. La fonction ne gère pas les catégories parentes');
    console.log('   3. Les sous-catégories n\'ont pas d\'annonces actives');
  }

  console.log('\n==========================================');
  console.log('🏁 Debug terminé');
}

// Exécuter le debug
debugSearchFunction().catch(err => {
  console.error('💥 Erreur fatale:', err);
});
