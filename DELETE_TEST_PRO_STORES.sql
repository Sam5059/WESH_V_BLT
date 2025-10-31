-- Supprimer tous les stores PRO de test
-- À exécuter dans l'éditeur SQL Supabase

-- 1. Vérifier les stores existants
SELECT id, name, slug, created_at FROM pro_stores ORDER BY created_at DESC;

-- 2. Supprimer tous les stores PRO
DELETE FROM pro_stores;

-- 3. Vérifier que tout est supprimé
SELECT COUNT(*) as remaining_stores FROM pro_stores;
