import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../../theme/tokens';

interface AuthPrimaryButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const AuthPrimaryButton: React.FC<AuthPrimaryButtonProps> = ({ label, onPress, isLoading = false, disabled = false }) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity style={[styles.button, isDisabled && { opacity: 0.8 }]} onPress={onPress} disabled={isDisabled}>
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 8 }} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.colors.text,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.button,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: tokens.colors.surface,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
