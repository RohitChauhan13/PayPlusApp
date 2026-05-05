import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  isEditable?: boolean;
  rightElement?: React.ReactNode;
  labelColor?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize = 'none',
  isEditable = true,
  rightElement,
  labelColor,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, labelColor ? { color: labelColor } : null]}>
        {label}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="#9CA3AF"
          editable={isEditable}
          style={[
            styles.input,
            !isEditable ? styles.disabled : null,
            rightElement ? { paddingRight: 50 } : null,
          ]}
        />
        {rightElement && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7,
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  inputContainer: {
    justifyContent: 'center',
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 15,
    color: colors.ink,
    fontSize: 15,
  },
  disabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  rightElement: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
  },
});
