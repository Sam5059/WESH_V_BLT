import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (Platform.OS !== 'web') {
    return children;
  }

  const childWithHandlers = React.cloneElement(children, {
    onMouseEnter: () => setIsVisible(true),
    onMouseLeave: () => setIsVisible(false),
  });

  return (
    <View style={styles.container}>
      {childWithHandlers}
      {isVisible && (
        <View style={[styles.tooltip, styles[position]]}>
          <Text style={styles.tooltipText}>{text}</Text>
          <View style={[styles.arrow, styles[`arrow${position.charAt(0).toUpperCase() + position.slice(1)}` as keyof typeof styles]]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    zIndex: 99999,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 999,
  },
  top: {
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: '-50%' }],
    marginBottom: 8,
  },
  bottom: {
    top: '100%',
    left: '50%',
    transform: [{ translateX: '-50%' }],
    marginTop: 8,
  },
  left: {
    right: '100%',
    top: '50%',
    transform: [{ translateY: '-50%' }],
    marginRight: 8,
  },
  right: {
    left: '100%',
    top: '50%',
    transform: [{ translateY: '-50%' }],
    marginLeft: 8,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  arrowTop: {
    top: '100%',
    left: '50%',
    transform: [{ translateX: '-50%' }],
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1E293B',
  },
  arrowBottom: {
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: '-50%' }],
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1E293B',
  },
  arrowLeft: {
    left: '100%',
    top: '50%',
    transform: [{ translateY: '-50%' }],
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#1E293B',
  },
  arrowRight: {
    right: '100%',
    top: '50%',
    transform: [{ translateY: '-50%' }],
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#1E293B',
  },
});
