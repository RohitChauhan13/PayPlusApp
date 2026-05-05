import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

export function BrandedSplash() {
  return (
    <LinearGradient colors={[colors.navy, '#1D4ED8', colors.teal]} style={styles.screen}>
      <View style={styles.logoRing}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>P+</Text>
        </View>
      </View>
      <Text style={styles.brand}>PayPlus</Text>
      <Text style={styles.copy}>Work. Rates. Commission.</Text>
      <View style={styles.pill}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
        <Text style={styles.pillText}>Secure ledger ready</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28
  },
  logoRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 26,
    elevation: 10
  },
  logoText: {
    color: colors.blue,
    fontSize: 42,
    fontWeight: '900'
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    marginTop: 28
  },
  copy: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8
  },
  pill: {
    marginTop: 26,
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
