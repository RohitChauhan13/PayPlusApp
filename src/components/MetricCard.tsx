import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  value: string;
  tone: 'blue' | 'green' | 'amber' | 'indigo';
  icon: keyof typeof Ionicons.glyphMap;
};

const tones = {
  blue: ['#DBEAFE', colors.blue],
  green: ['#DCFCE7', colors.green],
  amber: ['#FEF3C7', colors.amber],
  indigo: ['#E0E7FF', colors.indigo]
} as const;

export function MetricCard({ label, value, tone, icon }: Props) {
  const [bg, fg] = tones[tone];
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={fg} />
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 122,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    justifyContent: 'space-between'
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  value: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900'
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700'
  }
});
