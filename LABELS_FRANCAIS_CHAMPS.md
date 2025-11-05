# 📝 Labels en Français pour les Champs

## 🎯 Problème

Les noms de colonnes techniques (`vehicle_brand`, `electronics_model`) ne sont pas compréhensibles pour l'utilisateur algérien.

**❌ MAUVAIS :**
```
vehicle_brand: _____________
vehicle_model: _____________
vehicle_year: _____________
```

**✅ BON :**
```
Marque: _____________
Modèle: _____________
Année: _____________
```

## 🗺️ Mapping Complet : Colonne DB → Label Français

### 🚗 VÉHICULES

| Colonne Database | Label Français | Label Arabe | Type | Exemple |
|------------------|----------------|-------------|------|---------|
| `vehicle_brand` | **Marque** | العلامة التجارية | text | Volkswagen |
| `vehicle_model` | **Modèle** | الموديل | text | Golf 7 GTI |
| `vehicle_year` | **Année** | السنة | number | 2020 |
| `vehicle_mileage` | **Kilométrage** | المسافة المقطوعة | number | 45000 |
| `vehicle_fuel_type` | **Carburant** | نوع الوقود | select | Essence |
| `vehicle_transmission` | **Boîte** | ناقل الحركة | select | Manuelle |
| `vehicle_color` | **Couleur** | اللون | text | Noir |
| `vehicle_doors` | **Portes** | الأبواب | number | 5 |
| `vehicle_seats` | **Places** | المقاعد | number | 5 |

**Options pour Carburant :**
```typescript
const fuelOptions = [
  { value: 'essence', label: 'Essence', label_ar: 'بنزين' },
  { value: 'diesel', label: 'Diesel', label_ar: 'ديزل' },
  { value: 'electrique', label: 'Électrique', label_ar: 'كهربائي' },
  { value: 'hybride', label: 'Hybride', label_ar: 'هجين' },
  { value: 'gpl', label: 'GPL', label_ar: 'غاز' }
];
```

**Options pour Boîte :**
```typescript
const transmissionOptions = [
  { value: 'manuelle', label: 'Manuelle', label_ar: 'يدوي' },
  { value: 'automatique', label: 'Automatique', label_ar: 'أوتوماتيك' },
  { value: 'semi-automatique', label: 'Semi-automatique', label_ar: 'نصف أوتوماتيك' }
];
```

### 🏠 IMMOBILIER

| Colonne Database | Label Français | Label Arabe | Type | Exemple |
|------------------|----------------|-------------|------|---------|
| `property_type` | **Type de bien** | نوع العقار | select | Appartement |
| `property_surface` | **Surface (m²)** | المساحة | number | 85 |
| `property_rooms` | **Pièces** | الغرف | number | 3 |
| `property_bedrooms` | **Chambres** | غرف النوم | number | 2 |
| `property_bathrooms` | **Salles de bain** | الحمامات | number | 1 |
| `property_floor` | **Étage** | الطابق | number | 3 |
| `property_total_floors` | **Nombre d'étages** | عدد الطوابق | number | 5 |
| `property_furnished` | **Meublé** | مفروش | checkbox | Oui/Non |
| `property_parking` | **Parking** | موقف سيارات | checkbox | Oui/Non |
| `property_elevator` | **Ascenseur** | مصعد | checkbox | Oui/Non |
| `property_balcony` | **Balcon** | شرفة | checkbox | Oui/Non |
| `property_garage` | **Garage** | كراج | checkbox | Oui/Non |

**Options pour Type de bien :**
```typescript
const propertyTypeOptions = [
  { value: 'appartement', label: 'Appartement', label_ar: 'شقة' },
  { value: 'maison', label: 'Maison', label_ar: 'منزل' },
  { value: 'villa', label: 'Villa', label_ar: 'فيلا' },
  { value: 'studio', label: 'Studio', label_ar: 'ستوديو' },
  { value: 'duplex', label: 'Duplex', label_ar: 'دوبلكس' },
  { value: 'terrain', label: 'Terrain', label_ar: 'أرض' },
  { value: 'local-commercial', label: 'Local commercial', label_ar: 'محل تجاري' },
  { value: 'bureau', label: 'Bureau', label_ar: 'مكتب' },
  { value: 'garage', label: 'Garage', label_ar: 'كراج' }
];
```

### 📱 ÉLECTRONIQUE

| Colonne Database | Label Français | Label Arabe | Type | Exemple |
|------------------|----------------|-------------|------|---------|
| `electronics_brand` | **Marque** | العلامة التجارية | text | Samsung |
| `electronics_model` | **Modèle** | الموديل | text | Galaxy S24 |
| `electronics_storage` | **Stockage** | التخزين | text | 256GB |
| `electronics_ram` | **Mémoire RAM** | الذاكرة العشوائية | text | 12GB |
| `electronics_screen_size` | **Taille écran** | حجم الشاشة | text | 6.8" |
| `electronics_processor` | **Processeur** | المعالج | text | Snapdragon 8 Gen 3 |
| `electronics_battery` | **Batterie** | البطارية | text | 5000mAh |
| `electronics_camera` | **Caméra** | الكاميرا | text | 200MP |

### 💼 EMPLOI & SERVICES

| Colonne Database | Label Français | Label Arabe | Type | Exemple |
|------------------|----------------|-------------|------|---------|
| `job_type` | **Type d'emploi** | نوع الوظيفة | text | Développeur |
| `job_contract_type` | **Type de contrat** | نوع العقد | select | CDI |
| `job_experience` | **Expérience requise** | الخبرة المطلوبة | text | 3-5 ans |
| `job_education` | **Niveau d'études** | المستوى التعليمي | text | Licence |
| `job_salary_min` | **Salaire min (DA)** | الراتب الأدنى | number | 50000 |
| `job_salary_max` | **Salaire max (DA)** | الراتب الأقصى | number | 80000 |
| `service_type` | **Type de service** | نوع الخدمة | text | Réparation |
| `service_duration` | **Durée** | المدة | text | 2 heures |

**Options pour Type de contrat :**
```typescript
const contractTypeOptions = [
  { value: 'cdi', label: 'CDI', label_ar: 'عقد دائم' },
  { value: 'cdd', label: 'CDD', label_ar: 'عقد محدد' },
  { value: 'freelance', label: 'Freelance', label_ar: 'عمل حر' },
  { value: 'stage', label: 'Stage', label_ar: 'تدريب' },
  { value: 'interim', label: 'Intérim', label_ar: 'عمل مؤقت' }
];
```

### 🐾 ANIMAUX

| Colonne Database | Label Français | Label Arabe | Type | Exemple |
|------------------|----------------|-------------|------|---------|
| `animal_type` | **Type** | النوع | text | Chien |
| `animal_breed` | **Race** | السلالة | text | Berger Allemand |
| `animal_age` | **Âge** | العمر | text | 2 ans |
| `animal_gender` | **Sexe** | الجنس | select | Mâle |
| `animal_vaccinated` | **Vacciné** | ملقح | checkbox | Oui/Non |

**Options pour Sexe :**
```typescript
const genderOptions = [
  { value: 'male', label: 'Mâle', label_ar: 'ذكر' },
  { value: 'femelle', label: 'Femelle', label_ar: 'أنثى' }
];
```

### 👕 MODE & VÊTEMENTS

| Colonne Database | Label Français | Label Arabe | Type | Exemple |
|------------------|----------------|-------------|------|---------|
| `clothing_brand` | **Marque** | العلامة التجارية | text | Nike |
| `clothing_size` | **Taille** | المقاس | text | 42 |
| `clothing_gender` | **Pour** | للجنس | select | Homme |
| `clothing_material` | **Matière** | المادة | text | Coton |

**Options pour Genre :**
```typescript
const clothingGenderOptions = [
  { value: 'homme', label: 'Homme', label_ar: 'رجال' },
  { value: 'femme', label: 'Femme', label_ar: 'نساء' },
  { value: 'unisexe', label: 'Unisexe', label_ar: 'للجنسين' },
  { value: 'enfant', label: 'Enfant', label_ar: 'أطفال' }
];
```

## 💻 Implémentation React Native

### Composant FormField Amélioré

```typescript
interface FormFieldProps {
  dbColumn: string;
  label: string;
  labelAr?: string;
  type?: 'text' | 'number' | 'select' | 'checkbox';
  options?: { value: string; label: string; label_ar?: string }[];
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
}

function FormField({
  dbColumn,
  label,
  labelAr,
  type = 'text',
  options,
  value,
  onChange,
  placeholder,
  required
}: FormFieldProps) {
  const { language } = useLanguage();

  const displayLabel = language === 'ar' && labelAr ? labelAr : label;
  const displayPlaceholder = language === 'ar' && labelAr
    ? `أدخل ${labelAr}`
    : `Entrez ${label.toLowerCase()}`;

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {displayLabel}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {type === 'text' || type === 'number' ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder || displayPlaceholder}
          keyboardType={type === 'number' ? 'numeric' : 'default'}
        />
      ) : type === 'select' ? (
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={styles.picker}
        >
          <Picker.Item label={`Sélectionner ${label.toLowerCase()}`} value="" />
          {options?.map((option) => (
            <Picker.Item
              key={option.value}
              label={language === 'ar' && option.label_ar ? option.label_ar : option.label}
              value={option.value}
            />
          ))}
        </Picker>
      ) : type === 'checkbox' ? (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onChange(!value)}
        >
          <View style={[styles.checkbox, value && styles.checkboxChecked]}>
            {value && <Check size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>
            {language === 'ar' ? 'نعم' : 'Oui'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
```

### Exemple d'utilisation : Formulaire Véhicule

```typescript
function VehicleForm() {
  const [formData, setFormData] = useState({
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_mileage: '',
    vehicle_fuel_type: '',
    vehicle_transmission: '',
    vehicle_color: '',
    vehicle_doors: '',
    vehicle_seats: ''
  });

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <ScrollView>
      <FormField
        dbColumn="vehicle_brand"
        label="Marque"
        labelAr="العلامة التجارية"
        type="text"
        value={formData.vehicle_brand}
        onChange={(v) => updateField('vehicle_brand', v)}
        required
      />

      <FormField
        dbColumn="vehicle_model"
        label="Modèle"
        labelAr="الموديل"
        type="text"
        value={formData.vehicle_model}
        onChange={(v) => updateField('vehicle_model', v)}
        required
      />

      <FormField
        dbColumn="vehicle_year"
        label="Année"
        labelAr="السنة"
        type="number"
        value={formData.vehicle_year}
        onChange={(v) => updateField('vehicle_year', v)}
        placeholder="2020"
        required
      />

      <FormField
        dbColumn="vehicle_mileage"
        label="Kilométrage"
        labelAr="المسافة المقطوعة"
        type="number"
        value={formData.vehicle_mileage}
        onChange={(v) => updateField('vehicle_mileage', v)}
        placeholder="45000"
      />

      <FormField
        dbColumn="vehicle_fuel_type"
        label="Carburant"
        labelAr="نوع الوقود"
        type="select"
        options={[
          { value: 'essence', label: 'Essence', label_ar: 'بنزين' },
          { value: 'diesel', label: 'Diesel', label_ar: 'ديزل' },
          { value: 'electrique', label: 'Électrique', label_ar: 'كهربائي' },
          { value: 'hybride', label: 'Hybride', label_ar: 'هجين' },
          { value: 'gpl', label: 'GPL', label_ar: 'غاز' }
        ]}
        value={formData.vehicle_fuel_type}
        onChange={(v) => updateField('vehicle_fuel_type', v)}
        required
      />

      <FormField
        dbColumn="vehicle_transmission"
        label="Boîte"
        labelAr="ناقل الحركة"
        type="select"
        options={[
          { value: 'manuelle', label: 'Manuelle', label_ar: 'يدوي' },
          { value: 'automatique', label: 'Automatique', label_ar: 'أوتوماتيك' },
          { value: 'semi-automatique', label: 'Semi-automatique', label_ar: 'نصف أوتوماتيك' }
        ]}
        value={formData.vehicle_transmission}
        onChange={(v) => updateField('vehicle_transmission', v)}
        required
      />

      <FormField
        dbColumn="vehicle_color"
        label="Couleur"
        labelAr="اللون"
        type="text"
        value={formData.vehicle_color}
        onChange={(v) => updateField('vehicle_color', v)}
        placeholder="Noir"
      />
    </ScrollView>
  );
}
```

## 📋 Résumé des Labels les Plus Importants

### Pour VÉHICULES (utilisateur algérien)
1. **Marque** (pas vehicle_brand)
2. **Modèle** (pas vehicle_model)
3. **Année** (pas vehicle_year)
4. **Kilométrage** (pas vehicle_mileage)
5. **Carburant** (pas vehicle_fuel_type)
6. **Boîte** (pas vehicle_transmission)

### Pour IMMOBILIER
1. **Type de bien** (pas property_type)
2. **Surface (m²)** (pas property_surface)
3. **Pièces** (pas property_rooms)
4. **Chambres** (pas property_bedrooms)
5. **Meublé** (pas property_furnished)

### Pour ÉLECTRONIQUE
1. **Marque** (pas electronics_brand)
2. **Modèle** (pas electronics_model)
3. **Stockage** (pas electronics_storage)
4. **Mémoire RAM** (pas electronics_ram)

---

**Les noms de colonnes restent techniques en base de données, mais l'utilisateur voit toujours des labels clairs en français !** 🇫🇷
