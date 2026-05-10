import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../../theme/tokens';

interface AuthBrandingProps {
  title?: string;
  subtitle?: string;
}

export const AuthBranding: React.FC<AuthBrandingProps> = ({
  title = 'WasteOptimizer',
  subtitle = 'Clean City • Smart Living',
}) => {
  return (
    <View style={styles.brandingSection}>
      <View style={styles.logoBadge}>
        <Ionicons name="leaf" size={30} color={tokens.colors.brand} />
      </View>
      <Text style={styles.brandTitle}>{title}</Text>
      <Text style={styles.brandSubtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  brandingSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: tokens.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: tokens.colors.brandBorder,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
});
