import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

interface LogoProps {
  language: 'ar' | 'fr' | 'en';
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ language, size = 'medium' }: LogoProps) {
  const sizeStyles = {
    small: {
      container: { height: 28 },
      text: { fontSize: 20, letterSpacing: -0.8 }
    },
    medium: {
      container: { height: 35 },
      text: { fontSize: 24, letterSpacing: -1 }
    },
    large: {
      container: { height: 40 },
      text: { fontSize: 28, letterSpacing: -1.2 }
    },
  };

  const currentSize = sizeStyles[size];

  if (language === 'ar') {
    return (
      <View style={[styles.arabicContainer, currentSize.container]}>
        <Text style={[styles.letterGreen, currentSize.text]}>DZ</Text>
        <Text style={[currentSize.text, { width: 4 }]}> </Text>
        <Text style={[styles.letterGreen, currentSize.text]}>ش</Text>
        <Text style={[styles.letterOrange, currentSize.text]}>ا</Text>
        <Text style={[styles.letterRed, currentSize.text]}>و</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, currentSize.container]}>
      <Text style={[styles.letterRed, currentSize.text]}>O</Text>
      <Text style={[styles.letterBlue, currentSize.text]}>u</Text>
      <Text style={[styles.letterYellow, currentSize.text]}>e</Text>
      <Text style={[styles.letterGreen, currentSize.text]}>c</Text>
      <Text style={[styles.letterPurple, currentSize.text]}>h</Text>
      <Text style={[styles.letterOrange, currentSize.text]}>DZ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterRed: {
    fontWeight: '900',
    color: '#E53238',
  },
  letterBlue: {
    fontWeight: '900',
    color: '#0064D2',
  },
  letterYellow: {
    fontWeight: '900',
    color: '#F5AF02',
  },
  letterGreen: {
    fontWeight: '900',
    color: '#86B817',
  },
  letterPurple: {
    fontWeight: '900',
    color: '#8B5CF6',
  },
  letterOrange: {
    fontWeight: '900',
    color: '#F5AF02',
  },
});
