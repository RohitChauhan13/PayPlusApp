import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 28
};

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceSoft
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.navy,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
