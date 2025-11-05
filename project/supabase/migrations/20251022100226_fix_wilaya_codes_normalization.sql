/*
  # Normalisation des codes wilaya

  1. Modifications
    - Convertir tous les noms de wilayas en codes numériques
    - Assurer la cohérence des données pour le filtrage
    
  2. Mappings appliqués
    - Alger → 16
    - Oran → 31
    - Tizi Ouzou → 15
    - Béjaïa → 06
    - Tlemcen → 13
    - Constantine → 25
    - Annaba → 23
*/

-- Normaliser les wilayas avec des noms en codes
UPDATE listings SET wilaya = '16' WHERE wilaya = 'Alger';
UPDATE listings SET wilaya = '31' WHERE wilaya = 'Oran';
UPDATE listings SET wilaya = '15' WHERE wilaya = 'Tizi Ouzou';
UPDATE listings SET wilaya = '06' WHERE wilaya = 'Béjaïa';
UPDATE listings SET wilaya = '13' WHERE wilaya = 'Tlemcen';
UPDATE listings SET wilaya = '25' WHERE wilaya = 'Constantine';
UPDATE listings SET wilaya = '23' WHERE wilaya = 'Annaba';
UPDATE listings SET wilaya = '09' WHERE wilaya = 'Blida';
UPDATE listings SET wilaya = '10' WHERE wilaya = 'Bouira';
UPDATE listings SET wilaya = '35' WHERE wilaya = 'Boumerdès';

-- Vérifier qu'il n'y a plus de wilayas avec des noms
SELECT COUNT(*) as remaining_text_wilayas 
FROM listings 
WHERE wilaya !~ '^[0-9]+$';
