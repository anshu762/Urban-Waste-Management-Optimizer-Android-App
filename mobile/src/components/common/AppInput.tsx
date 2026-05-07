import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AppInput: React.FC<AppInputProps> = ({ label, error, className, ...props }) => {
  return (
    <View className={`mb-4 ${className || ''}`}>
      <Text className="text-gray-700 font-medium mb-1">{label}</Text>
      <TextInput
        className={`border rounded-xl px-4 py-3 bg-gray-50 ${error ? 'border-danger' : 'border-gray-200'} focus:border-primary`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error ? <Text className="text-danger text-sm mt-1">{error}</Text> : null}
    </View>
  );
};
