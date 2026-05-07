import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { loginApi } from '../../api/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import { AppToast } from '../../components/common/AppToast';

export const LoginScreen = ({ navigation }: any) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!identifier || !password) {
      AppToast.showError('Validation Error', 'Please enter both email/mobile and password');
      return;
    }

    setIsLoading(true);
    try {
      // Very basic check to determine if it's an email or mobile
      const isEmail = identifier.includes('@');
      const payload = isEmail ? { email: identifier, password } : { mobile: identifier, password };
      
      const response = await loginApi(payload);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        // Navigation will be handled automatically by RootNavigator based on auth state
        AppToast.showSuccess('Welcome back!', 'Login successful');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to login';
      AppToast.showError('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View className="mb-8">
            <Text className="text-4xl font-extrabold text-primary mb-2">Welcome Back</Text>
            <Text className="text-gray-500 text-base">Sign in to manage your waste sustainably.</Text>
          </View>

          <AppInput
            label="Email or Mobile"
            placeholder="Enter your email or mobile number"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="default"
            autoCapitalize="none"
          />

          <AppInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View className="mt-4">
            <AppButton
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
            />
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-primary font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
