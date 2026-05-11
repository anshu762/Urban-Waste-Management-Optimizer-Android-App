import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../../theme/tokens';

interface AuthScreenProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ children, footer }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.blobTop} />
      <View pointerEvents="none" style={styles.blobBottom} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.body}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, footer ? styles.scrollContentWithFooter : undefined]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  body: {
    flex: 1,
  },
  blobTop: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: tokens.colors.brandSoft,
    opacity: 0.65,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -140,
    left: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#EFF6FF',
    opacity: 0.55,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 42,
    paddingBottom: 42,
  },
  scrollContentWithFooter: {
    paddingBottom: 140,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
});
