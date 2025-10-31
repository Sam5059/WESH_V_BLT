import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';

interface DateRangePickerProps {
  label: string;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  isFlexible: boolean;
  onFlexibleChange: (flexible: boolean) => void;
  isRTL?: boolean;
  singleDate?: boolean;
  error?: boolean;
}

export function DateRangePicker({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isFlexible,
  onFlexibleChange,
  isRTL = false,
  singleDate = false,
  error = false,
}: DateRangePickerProps) {
  // Date minimale: aujourd'hui
  const today = new Date().toISOString().split('T')[0];

  // Format des valeurs pour les inputs
  const startDateValue = startDate ? startDate.toISOString().split('T')[0] : '';
  const endDateValue = endDate ? endDate.toISOString().split('T')[0] : '';

  // Handlers pour les changements de date
  const handleStartDateChange = (dateString: string) => {
    if (dateString) {
      const selectedDate = new Date(dateString + 'T12:00:00');
      onStartDateChange(selectedDate);
    } else {
      onStartDateChange(null);
    }
  };

  const handleEndDateChange = (dateString: string) => {
    if (dateString) {
      const selectedDate = new Date(dateString + 'T12:00:00');
      onEndDateChange(selectedDate);
    } else {
      onEndDateChange(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isRTL && styles.textRTL]}>{label}</Text>

      {Platform.OS === 'web' ? (
        <View style={styles.dateRow}>
          <View style={[styles.dateInputWrapper, error && styles.dateInputWrapperError]}>
            <Text style={styles.dateInputLabel}>
              {singleDate ? 'Date' : 'Du'}
            </Text>
            <input
              type="date"
              value={startDateValue}
              onChange={(e: any) => handleStartDateChange(e.target.value)}
              min={today}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                color: '#1E293B',
                fontFamily: 'inherit',
                cursor: 'pointer',
                outline: 'none',
                fontWeight: '500',
              }}
            />
          </View>

          {!singleDate && (
            <View style={[styles.dateInputWrapper, error && styles.dateInputWrapperError]}>
              <Text style={styles.dateInputLabel}>Au</Text>
              <input
                type="date"
                value={endDateValue}
                onChange={(e: any) => handleEndDateChange(e.target.value)}
                min={startDateValue || today}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  color: '#1E293B',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  outline: 'none',
                  fontWeight: '500',
                }}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.dateRow}>
          <View style={[styles.dateInputWrapper, error && styles.dateInputWrapperError]}>
            <Text style={styles.dateInputLabel}>
              {singleDate ? 'Date' : 'Du'}
            </Text>
            <TextInput
              style={styles.nativeDateInput}
              value={startDateValue}
              onChangeText={handleStartDateChange}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor="#94A3B8"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {!singleDate && (
            <View style={[styles.dateInputWrapper, error && styles.dateInputWrapperError]}>
              <Text style={styles.dateInputLabel}>Au</Text>
              <TextInput
                style={styles.nativeDateInput}
                value={endDateValue}
                onChangeText={handleEndDateChange}
                placeholder="AAAA-MM-JJ"
                placeholderTextColor="#94A3B8"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.flexibleButton}
        onPress={() => onFlexibleChange(!isFlexible)}
      >
        <View style={[styles.checkbox, isFlexible && styles.checkboxChecked]}>
          {isFlexible && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.flexibleText}>
          Dates flexibles {singleDate ? '(±2 jours)' : '(±1 semaine)'}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>
          {singleDate ? 'Veuillez sélectionner une date' : 'Veuillez sélectionner les dates'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  textRTL: {
    textAlign: 'right',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateInputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateInputWrapperError: {
    borderColor: '#EF4444',
  },
  dateInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nativeDateInput: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  flexibleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  flexibleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
});
