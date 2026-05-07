import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  const baseClasses = 'py-3 px-4 rounded-xl flex-row justify-center items-center';
  
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    danger: 'bg-danger',
  };

  const textClasses = {
    primary: 'text-white font-bold',
    secondary: 'text-white font-bold',
    danger: 'text-white font-bold',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
