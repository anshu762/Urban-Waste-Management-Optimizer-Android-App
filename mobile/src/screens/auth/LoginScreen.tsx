import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { loginApi } from '../../api/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { tokens } from '../../theme/tokens';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { AuthBranding } from '../../components/auth/AuthBranding';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { AuthPrimaryButton } from '../../components/auth/AuthPrimaryButton';

export const LoginScreen = ({ navigation }: any) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const { showError, showSuccess } = useErrorHandler();

  const handleLogin = async () => {
    if (!identifier || !password) {
      showError('Please enter both email/mobile and password');
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail ? { email: identifier, password } : { mobile: identifier, password };
      
      const response = await loginApi(payload);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        showSuccess('Welcome back!', 'Login successful');
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScreen>
      <AuthBranding />

      <View style={styles.formContainer}>
        <View style={styles.headerTextSection}>
          <Text style={styles.titleText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to continue to your dashboard</Text>
        </View>

        <AuthTextField
          label="IDENTIFIER (EMAIL OR MOBILE)"
          leftIcon="mail-outline"
          placeholder="Enter email or mobile"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />

        <View style={{ marginTop: 20 }}>
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

        <Text style={styles.helperText}>Use your email or mobile number to log in.</Text>

        <View style={{ marginTop: 16 }}>
          <AuthPrimaryButton label="SIGN IN" onPress={handleLogin} isLoading={isLoading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthScreen>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  headerTextSection: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: tokens.colors.text,
  },
  subtitleText: {
    fontSize: 14,
    color: tokens.colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: tokens.colors.textSubtle,
    fontWeight: '600',
    marginTop: 14,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 26,
  },
  footerText: {
    fontSize: 14,
    color: tokens.colors.textMuted,
    fontWeight: '500',
  },
  signUpLink: {
    fontSize: 14,
    color: tokens.colors.brand,
    fontWeight: '800',
  },
});
