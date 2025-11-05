// Script pour appliquer la migration de recherche
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://jchywwamhmzzvhgbywkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaHl3d2FtaG16enZoZ2J5d2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODczMzcsImV4cCI6MjA3NjA2MzMzN30.FNHwnk5OR-USBcJKHfLZdc9c4EzGKVFOE4R7QMtXvuk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Lire le fichier SQL
const sqlFile = path.join(__dirname, 'supabase', 'migrations', '20251020_fix_search_all_attributes.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Note: Cette approche nécessite un service role key pour exécuter du SQL brut
// Pour l'instant, nous allons copier-coller le SQL dans l'interface Supabase

console.log('Migration SQL à appliquer:');
console.log('=====================================');
console.log(sql);
console.log('=====================================');
console.log('\nPour appliquer cette migration:');
console.log('1. Aller sur https://jchywwamhmzzvhgbywkj.supabase.co');
console.log('2. Ouvrir SQL Editor');
console.log('3. Copier-coller le SQL ci-dessus');
console.log('4. Exécuter la requête');
