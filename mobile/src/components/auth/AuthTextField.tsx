import React from 'react';
import { View, Text, StyleSheet, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../../theme/tokens';

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  leftIcon: React.ComponentProps<typeof Ionicons>['name'];
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onPressRightIcon?: () => void;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
  label,
  leftIcon,
  rightIcon,
  onPressRightIcon,
  style,
  ...props
}) => {
  const Right = rightIcon ? (
    <TouchableOpacity onPress={onPressRightIcon} disabled={!onPressRightIcon}>
      <Ionicons name={rightIcon} size={20} color={tokens.colors.textSubtle} />
    </TouchableOpacity>
  ) : null;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={leftIcon} size={20} color={tokens.colors.textSubtle} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={tokens.colors.placeholder}
          {...props}
        />
        {Right}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: tokens.colors.textSubtle,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.14)',
    paddingHorizontal: 16,
    height: tokens.control.heightLg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.text,
  },
});
