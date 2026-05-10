import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { registerApi } from '../../api/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import { useErrorHandler } from '../../hooks/useErrorHandler';

type Role = 'RESIDENT' | 'ADMIN' | 'DRIVER';

export const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('RESIDENT');
  const [isLoading, setIsLoading] = useState(false);
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

  const RoleSelector = ({ selected, onSelect, title }: { selected: boolean, onSelect: () => void, title: string }) => (
    <TouchableOpacity
      onPress={onSelect}
      className={`px-4 py-2 rounded-full border mr-2 ${selected ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
    >
      <Text className={`${selected ? 'text-white' : 'text-gray-600'} font-medium`}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          <View className="mb-6 mt-4">
            <Text className="text-4xl font-extrabold text-primary mb-2">Create Account</Text>
            <Text className="text-gray-500 text-base">Join the sustainable waste movement.</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">I am a:</Text>
            <View className="flex-row">
              <RoleSelector selected={role === 'RESIDENT'} onSelect={() => setRole('RESIDENT')} title="Resident" />
              <RoleSelector selected={role === 'DRIVER'} onSelect={() => setRole('DRIVER')} title="Driver" />
              <RoleSelector selected={role === 'ADMIN'} onSelect={() => setRole('ADMIN')} title="Admin" />
            </View>
          </View>

          <AppInput label="Full Name" placeholder="Enter your full name" value={fullName} onChangeText={setFullName} />
          <AppInput label="Email Address (Optional)" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <AppInput label="Mobile Number (Optional)" placeholder="Enter your mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
          <AppInput label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry />

          <View className="mt-4">
            <AppButton title="Sign Up" onPress={handleRegister} isLoading={isLoading} />
          </View>

          <View className="flex-row justify-center mt-6 mb-8">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
