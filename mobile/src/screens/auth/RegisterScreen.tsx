import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { registerApi } from '../../api/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../../theme/tokens';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { AuthBranding } from '../../components/auth/AuthBranding';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { AuthPrimaryButton } from '../../components/auth/AuthPrimaryButton';


type Role = 'RESIDENT' | 'ADMIN' | 'DRIVER';

export const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('RESIDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const { showError, showSuccess } = useErrorHandler();

  const handleRegister = async () => {
    if (!fullName || !password || (!email && !mobile)) {
      showError('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName,
        email: email || undefined,
        mobile: mobile || undefined,
        password,
        role,
      };
      
      const response = await registerApi(payload);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        showSuccess('Account Created!', 'Welcome to Urban Waste Optimizer');
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const RoleOption = ({ selected, onSelect, title, icon }: { selected: boolean, onSelect: () => void, title: string, icon: any }) => (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.roleCard,
        selected && styles.activeRoleCard
      ]}
    >
      <View style={[styles.roleIconBox, { backgroundColor: selected ? '#10B98120' : '#F8FAFC' }]}>
        <Ionicons name={icon} size={20} color={selected ? '#10B981' : '#94A3B8'} />
      </View>
      <Text style={[styles.roleText, selected && styles.activeRoleText]}>{title}</Text>
      {selected && (
        <View style={styles.checkIcon}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <AuthScreen
      footer={
        <View>
          <AuthPrimaryButton label="CREATE ACCOUNT" onPress={handleRegister} isLoading={isLoading} />

          <View style={styles.stickyFooterRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
    >
      <AuthBranding />

      <View style={styles.formContainer}>
        <View style={styles.headerTextSection}>
          <Text style={styles.titleText}>Create Account</Text>
          <Text style={styles.subtitleText}>Join the movement for a cleaner world</Text>
        </View>

        <View style={styles.roleSelectionGroup}>
          <Text style={styles.inputLabel}>CHOOSE YOUR ROLE</Text>
          <View style={styles.roleRow}>
            <RoleOption selected={role === 'RESIDENT'} onSelect={() => setRole('RESIDENT')} title="Resident" icon="home-outline" />
            <RoleOption selected={role === 'DRIVER'} onSelect={() => setRole('DRIVER')} title="Driver" icon="car-outline" />
            <RoleOption selected={role === 'ADMIN'} onSelect={() => setRole('ADMIN')} title="Admin" icon="shield-outline" />
          </View>
        </View>

        <AuthTextField
          label="FULL NAME"
          leftIcon="person-outline"
          placeholder="e.g. John Doe"
          value={fullName}
          onChangeText={setFullName}
        />

        <View style={{ marginTop: 16 }}>
          <AuthTextField
            label="EMAIL ADDRESS (OPTIONAL)"
            leftIcon="mail-outline"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <AuthTextField
            label="MOBILE NUMBER (OPTIONAL)"
            leftIcon="call-outline"
            placeholder="+91 9876543210"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <AuthTextField
            label="SECURE PASSWORD"
            leftIcon="lock-closed-outline"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onPressRightIcon={() => setShowPassword(!showPassword)}
          />
        </View>

        <Text style={styles.helperText}>Email or mobile is optional, but at least one is required.</Text>
      </View>
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  headerTextSection: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: tokens.colors.text,
  },
  subtitleText: {
    fontSize: 13,
    color: tokens.colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: tokens.colors.textSubtle,
    fontWeight: '600',
    marginTop: 14,
    marginLeft: 4,
  },
  roleSelectionGroup: {
    marginBottom: 24,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  roleCard: {
    flex: 1,
    backgroundColor: tokens.colors.surfaceMuted,
    borderRadius: tokens.radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    position: 'relative',
  },
  activeRoleCard: {
    borderColor: tokens.colors.brand,
    backgroundColor: tokens.colors.brandSoft,
  },
  roleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.textMuted,
  },
  activeRoleText: {
    color: tokens.colors.brand,
  },
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: tokens.colors.textSubtle,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  footerText: {
    fontSize: 13,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  stickyFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  signInLink: {
    fontSize: 13,
    color: tokens.colors.brand,
    fontWeight: '800',
  },
});
