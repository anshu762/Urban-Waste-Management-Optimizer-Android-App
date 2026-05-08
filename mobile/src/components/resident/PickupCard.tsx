import React from 'react';
import { View, Text } from 'react-native';
import CategoryBadge from '../common/CategoryBadge';
import { format, parseISO, differenceInDays } from 'date-fns';

interface PickupCardProps {
  date: string;
  category: string;
  timeWindow: string;
  showCountdown?: boolean;
}

const PickupCard: React.FC<PickupCardProps> = ({ date, category, timeWindow, showCountdown }) => {
  const pickupDate = parseISO(date);
  const daysUntil = differenceInDays(pickupDate, new Date());

  const getDayLabel = () => {
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return format(pickupDate, 'EEEE, MMM do');
  };

  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">
            {getDayLabel()}
          </Text>
          <Text className="text-lg font-bold text-gray-900 mt-0.5">
            {format(pickupDate, 'MMMM do')}
          </Text>
        </View>
        <CategoryBadge category={category} />
      </View>
      
      <View className="flex-row items-center mt-2">
        <Text className="text-gray-600 text-sm">🕒 {timeWindow}</Text>
      </View>

      {showCountdown && daysUntil >= 0 && (
        <View className="mt-3 pt-3 border-t border-gray-50">
          <Text className="text-green-600 font-bold text-xs uppercase">
            {daysUntil === 0 ? 'Happening Today' : `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PickupCard;
