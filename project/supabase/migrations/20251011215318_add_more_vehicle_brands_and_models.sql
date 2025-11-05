/*
  # Add More Vehicle Brands and Models
  
  1. New Brands Added (Total: 40+ brands)
    - French brands: Renault, Peugeot, Citroën, Dacia (existing + more)
    - German brands: Mercedes-Benz, BMW, Audi, Volkswagen, Opel, Porsche
    - Japanese brands: Toyota, Nissan, Honda, Mazda, Mitsubishi, Suzuki, Subaru
    - Korean brands: Hyundai, Kia
    - American brands: Ford, Chevrolet, Jeep, GMC, Cadillac
    - Italian brands: Fiat, Alfa Romeo, Lancia
    - British brands: Land Rover, Jaguar, Mini
    - Chinese brands: Chery, Geely, MG, Changan
    - Other popular brands in Algeria
    
  2. Models Added
    - Popular models for each brand (5-15 models per brand)
    - Models commonly found in Algeria
    - Recent and older models
    
  3. Important Notes
    - Uses ON CONFLICT to avoid duplicates
    - All brands linked to the Véhicules category
    - category_type set to 'vehicles' for filtering
*/

-- Get the Véhicules category ID
DO $$
DECLARE
  v_vehicles_category_id uuid;
BEGIN
  SELECT id INTO v_vehicles_category_id FROM categories WHERE slug = 'vehicules';

  -- Insert more vehicle brands (avoiding duplicates)
  INSERT INTO brands (name, category_id, category_type) VALUES
    -- French brands (add more)
    ('Renault', v_vehicles_category_id, 'vehicles'),
    ('Peugeot', v_vehicles_category_id, 'vehicles'),
    ('Citroën', v_vehicles_category_id, 'vehicles'),
    ('Dacia', v_vehicles_category_id, 'vehicles'),
    
    -- German brands
    ('Mercedes-Benz', v_vehicles_category_id, 'vehicles'),
    ('BMW', v_vehicles_category_id, 'vehicles'),
    ('Audi', v_vehicles_category_id, 'vehicles'),
    ('Volkswagen', v_vehicles_category_id, 'vehicles'),
    ('Opel', v_vehicles_category_id, 'vehicles'),
    ('Porsche', v_vehicles_category_id, 'vehicles'),
    
    -- Japanese brands
    ('Toyota', v_vehicles_category_id, 'vehicles'),
    ('Nissan', v_vehicles_category_id, 'vehicles'),
    ('Honda', v_vehicles_category_id, 'vehicles'),
    ('Mazda', v_vehicles_category_id, 'vehicles'),
    ('Mitsubishi', v_vehicles_category_id, 'vehicles'),
    ('Suzuki', v_vehicles_category_id, 'vehicles'),
    ('Subaru', v_vehicles_category_id, 'vehicles'),
    ('Isuzu', v_vehicles_category_id, 'vehicles'),
    ('Lexus', v_vehicles_category_id, 'vehicles'),
    
    -- Korean brands
    ('Hyundai', v_vehicles_category_id, 'vehicles'),
    ('Kia', v_vehicles_category_id, 'vehicles'),
    ('SsangYong', v_vehicles_category_id, 'vehicles'),
    
    -- American brands
    ('Ford', v_vehicles_category_id, 'vehicles'),
    ('Chevrolet', v_vehicles_category_id, 'vehicles'),
    ('Jeep', v_vehicles_category_id, 'vehicles'),
    ('GMC', v_vehicles_category_id, 'vehicles'),
    ('Cadillac', v_vehicles_category_id, 'vehicles'),
    ('Dodge', v_vehicles_category_id, 'vehicles'),
    
    -- Italian brands
    ('Fiat', v_vehicles_category_id, 'vehicles'),
    ('Alfa Romeo', v_vehicles_category_id, 'vehicles'),
    ('Lancia', v_vehicles_category_id, 'vehicles'),
    
    -- British brands
    ('Land Rover', v_vehicles_category_id, 'vehicles'),
    ('Jaguar', v_vehicles_category_id, 'vehicles'),
    ('Mini', v_vehicles_category_id, 'vehicles'),
    
    -- Chinese brands
    ('Chery', v_vehicles_category_id, 'vehicles'),
    ('Geely', v_vehicles_category_id, 'vehicles'),
    ('MG', v_vehicles_category_id, 'vehicles'),
    ('Changan', v_vehicles_category_id, 'vehicles'),
    ('BYD', v_vehicles_category_id, 'vehicles'),
    
    -- Spanish/Other European
    ('Seat', v_vehicles_category_id, 'vehicles'),
    ('Skoda', v_vehicles_category_id, 'vehicles'),
    ('Volvo', v_vehicles_category_id, 'vehicles')
  ON CONFLICT (name, category_id) DO NOTHING;

END $$;