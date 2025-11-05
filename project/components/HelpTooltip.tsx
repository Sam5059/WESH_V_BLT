import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet, Platform } from 'react-native';
import { HelpCircle, X } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface HelpTooltipProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: number;
  color?: string;
}

export default function HelpTooltip({
  title,
  content,
  position = 'bottom',
  size = 18,
  color = '#64748B'
}: HelpTooltipProps) {
  const [showHelp, setShowHelp] = useState(false);
  const { isRTL } = useLanguage();

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowHelp(true)}
        style={styles.helpButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <HelpCircle size={size} color={color} />
      </TouchableOpacity>

      <Modal
        visible={showHelp}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelp(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setShowHelp(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.tooltipContainer}>
              <View style={styles.tooltipHeader}>
                <HelpCircle size={20} color="#2563EB" />
                <Text style={[styles.tooltipTitle, isRTL && styles.textRTL]}>{title}</Text>
                <TouchableOpacity onPress={() => setShowHelp(false)} style={styles.closeButton}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.tooltipContent, isRTL && styles.textRTL]}>{content}</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  helpButton: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tooltipTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  tooltipContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
