import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ParsedError } from '../../lib/error-parser';

interface ErrorCardProps {
  error: ParsedError;
  onRetry?: () => void;
  onAction?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  error,
  onRetry,
  onAction,
  style,
  compact = false,
}) => {
  const navigation = useNavigation<any>();

  const handleAction = () => {
    if (onAction) {
      onAction();
      return;
    }

    switch (error.actionType) {
      case 'RETRY':
        onRetry?.();
        break;
      case 'GO_LOGIN':
        // Reset to Login screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        break;
      case 'GO_HOME':
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Home');
        }
        break;
      case 'CONTACT_ADMIN':
        navigation.navigate('ReportMissedPickup'); // Or specific complaint screen
        break;
      default:
        break;
    }
  };

  if (compact) {
    return (
      <View className="flex-row items-center bg-red-50 border border-red-200 rounded-lg p-3" style={style}>
        <Text className="text-xl mr-2">{error.emoji}</Text>
        <Text className="text-xs text-red-600 flex-1">{error.message}</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl shadow-md mx-4 p-6" style={style}>
      <Text className="text-5xl text-center mb-3">{error.emoji}</Text>
      <Text className="text-lg font-bold text-gray-800 text-center mb-1">
        {error.title}
      </Text>
      <Text className="text-sm text-gray-500 text-center leading-5 mb-5">
        {error.message}
      </Text>

      {error.actionLabel && (
        <TouchableOpacity
          onPress={handleAction}
          className="bg-green-600 rounded-xl py-3 px-6 self-center"
        >
          <Text className="text-white font-semibold text-sm">
            {error.actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
