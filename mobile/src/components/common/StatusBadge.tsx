import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
}

const statusConfig = {
  OPEN: { label: 'Open', bg: 'bg-orange-100', text: 'text-orange-800' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-800' },
  RESOLVED: { label: 'Resolved', bg: 'bg-green-100', text: 'text-green-800' },
  REJECTED: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.OPEN;

  return (
    <View className={`px-2 py-1 rounded-full self-start ${config.bg}`}>
      <Text className={`text-xs font-semibold ${config.text}`} numberOfLines={1}>
        {config.label}
      </Text>
    </View>
  );
};
