import React from 'react';
import { Alert, NativeModules, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { prettyDate } from '../utils/format';

type DatePickerModule = {
  show: (initialDate?: string) => Promise<string | null>;
};

type Props = {
  label: string;
  value: string;
  onChangeDate: (value: string) => void;
};

const nativeDatePicker = NativeModules.PayPlusDatePicker as DatePickerModule | undefined;

export function DateField({ label, value, onChangeDate }: Props) {
  const openPicker = async () => {
    if (Platform.OS !== 'android' || !nativeDatePicker) {
      Alert.alert('Date picker unavailable', 'Date picking is currently available on Android.');
      return;
    }

    try {
      const selectedDate = await nativeDatePicker.show(value);
      if (selectedDate) {
        onChangeDate(selectedDate);
      }
    } catch (error) {
      Alert.alert('Could not open date picker', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.input, pressed && styles.pressed]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? prettyDate(value) : 'Select date'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.blue} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800'
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  pressed: {
    borderColor: colors.blue,
    backgroundColor: '#EFF6FF'
  },
  value: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700'
  },
  placeholder: {
    color: '#9CA3AF'
  }
});
