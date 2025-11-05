import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { TrendingUp, Plus } from 'lucide-react-native';
import Tooltip from './Tooltip';

interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  tooltip?: string;
}

export function ProButton({ onPress, title, disabled, loading, style, textStyle, tooltip }: ButtonProps) {
  const button = (
    <TouchableOpacity
      style={[styles.proButton, disabled && styles.proButtonDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <TrendingUp size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={[styles.proButtonText, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return tooltip ? <Tooltip text={tooltip}>{button}</Tooltip> : button;
}

export function PublishButton({ onPress, title, disabled, loading, style, textStyle, tooltip }: ButtonProps) {
  const button = (
    <TouchableOpacity
      style={[styles.publishButton, disabled && styles.publishButtonDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={[styles.publishButtonText, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return tooltip ? <Tooltip text={tooltip}>{button}</Tooltip> : button;
}

export function ProButtonLarge({ onPress, title, disabled, loading, style, textStyle, tooltip }: ButtonProps) {
  const button = (
    <TouchableOpacity
      style={[styles.proButtonLarge, disabled && styles.proButtonDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="large" />
      ) : (
        <>
          <Text style={styles.proButtonIcon}>✨</Text>
          <Text style={[styles.proButtonLargeText, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return tooltip ? <Tooltip text={tooltip}>{button}</Tooltip> : button;
}

const styles = StyleSheet.create({
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  proButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  proButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  proButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  proButtonIcon: {
    fontSize: 24,
  },
  proButtonLargeText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  publishButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
